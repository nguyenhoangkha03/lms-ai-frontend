import { jwtDecode } from 'jwt-decode';
import { LOCAL_STORAGE_KEYS } from '@/lib/constants';

interface JWTPayload {
  sub: string; // User ID
  email: string;
  userType: 'student' | 'teacher' | 'admin';
  permissions: string[];
  iat: number; // Issued at
  exp: number; // Expiration time
  aud: string; // Audience
  iss: string; // Issuer
  jti: string; // JWT ID
  sessionId?: string;
  deviceId?: string;
  mfaVerified?: boolean;
  lastActivity?: number;
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

interface TokenValidationResult {
  isValid: boolean;
  isExpired: boolean;
  needsRefresh: boolean;
  payload?: JWTPayload;
  error?: string;
}

export class AdvancedTokenManager {
  private static readonly ACCESS_TOKEN_KEY = LOCAL_STORAGE_KEYS.AUTH_TOKEN;
  private static readonly REFRESH_TOKEN_KEY = LOCAL_STORAGE_KEYS.REFRESH_TOKEN;
  private static readonly TOKEN_EXPIRY_BUFFER = 5 * 60 * 1000; // 5 minutes buffer

  // Token refresh management
  private static refreshPromise: Promise<boolean> | null = null;
  private static refreshCallbacks: Array<(success: boolean) => void> = [];

  /**
   * Store token pair securely
   */
  static setTokens(tokens: TokenPair): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(this.ACCESS_TOKEN_KEY, tokens.accessToken);
      localStorage.setItem(this.REFRESH_TOKEN_KEY, tokens.refreshToken);

      // Set expiry time with buffer
      const expiryTime =
        Date.now() + tokens.expiresIn * 1000 - this.TOKEN_EXPIRY_BUFFER;
      localStorage.setItem('token_expiry', expiryTime.toString());

      this.scheduleTokenRefresh(
        tokens.expiresIn * 1000 - this.TOKEN_EXPIRY_BUFFER
      );
    } catch (error) {
      console.error('Failed to store tokens:', error);
    }
  }

  /**
   * Get access token
   */
  static getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  /**
   * Get refresh token
   */
  static getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Validate current access token
   */
  static validateAccessToken(): TokenValidationResult {
    const token = this.getAccessToken();

    if (!token) {
      return {
        isValid: false,
        isExpired: false,
        needsRefresh: false,
        error: 'No token found',
      };
    }

    try {
      const payload = jwtDecode<JWTPayload>(token);
      const currentTime = Math.floor(Date.now() / 1000);
      const isExpired = payload.exp <= currentTime;
      const needsRefresh = payload.exp <= currentTime + 300; // 5 minutes

      return {
        isValid: !isExpired,
        isExpired,
        needsRefresh,
        payload: isExpired ? undefined : payload,
      };
    } catch (error) {
      return {
        isValid: false,
        isExpired: true,
        needsRefresh: true,
        error: 'Invalid token format',
      };
    }
  }

  /**
   * Decode token payload without validation
   */
  static decodeToken(token?: string): JWTPayload | null {
    const tokenToDecoded = token || this.getAccessToken();
    if (!tokenToDecoded) return null;

    try {
      return jwtDecode<JWTPayload>(tokenToDecoded);
    } catch (error) {
      console.error('Token decode failed:', error);
      return null;
    }
  }

  /**
   * Check if token needs refresh
   */
  static needsRefresh(): boolean {
    const validation = this.validateAccessToken();
    return validation.needsRefresh || validation.isExpired;
  }

  /**
   * Get time until token expiry
   */
  static getTimeUntilExpiry(): number {
    const payload = this.decodeToken();
    if (!payload) return 0;

    const currentTime = Math.floor(Date.now() / 1000);
    return Math.max(0, payload.exp - currentTime);
  }

  /**
   * Schedule automatic token refresh
   */
  private static scheduleTokenRefresh(delayMs: number): void {
    if (typeof window === 'undefined') return;

    // Clear existing timeout
    const existingTimeout = (window as any).__tokenRefreshTimeout;
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Schedule new refresh
    const timeout = setTimeout(
      async () => {
        try {
          await this.refreshTokenSilently();
        } catch (error) {
          console.error('Scheduled token refresh failed:', error);
        }
      },
      Math.max(0, delayMs)
    );

    (window as any).__tokenRefreshTimeout = timeout;
  }

  /**
   * Refresh token silently
   */
  static async refreshTokenSilently(): Promise<boolean> {
    // Prevent multiple concurrent refresh attempts
    if (this.refreshPromise) {
      return new Promise(resolve => {
        this.refreshCallbacks.push(resolve);
      });
    }

    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.clearTokens();
      return false;
    }

    this.refreshPromise = this.performTokenRefresh(refreshToken);

    try {
      const success = await this.refreshPromise;

      // Notify all waiting callbacks
      this.refreshCallbacks.forEach(callback => callback(success));
      this.refreshCallbacks = [];

      return success;
    } finally {
      this.refreshPromise = null;
    }
  }

  /**
   * Perform actual token refresh API call
   */
  private static async performTokenRefresh(
    refreshToken: string
  ): Promise<boolean> {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken }),
        }
      );

      if (!response.ok) {
        throw new Error(`Refresh failed: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.data) {
        this.setTokens({
          accessToken: data.data.accessToken,
          refreshToken: data.data.refreshToken || refreshToken,
          expiresIn: data.data.expiresIn || 900, // 15 minutes default
          tokenType: 'Bearer',
        });

        return true;
      }

      throw new Error('Invalid refresh response');
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.clearTokens();
      return false;
    }
  }

  /**
   * Clear all tokens
   */
  static clearTokens(): void {
    if (typeof window === 'undefined') return;

    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem('token_expiry');
    localStorage.removeItem(LOCAL_STORAGE_KEYS.USER_DATA);

    // Clear refresh timeout
    const timeout = (window as any).__tokenRefreshTimeout;
    if (timeout) {
      clearTimeout(timeout);
      (window as any).__tokenRefreshTimeout = null;
    }
  }

  /**
   * Get user permissions from token
   */
  static getUserPermissions(): string[] {
    const payload = this.decodeToken();
    return payload?.permissions || [];
  }

  /**
   * Get user role from token
   */
  static getUserRole(): string | null {
    const payload = this.decodeToken();
    return payload?.userType || null;
  }

  /**
   * Get user ID from token
   */
  static getUserId(): string | null {
    const payload = this.decodeToken();
    return payload?.sub || null;
  }

  /**
   * Check if user has specific permission
   */
  static hasPermission(permission: string): boolean {
    const permissions = this.getUserPermissions();
    return permissions.includes(permission);
  }

  /**
   * Check if user has any of the specified permissions
   */
  static hasAnyPermission(permissions: string[]): boolean {
    const userPermissions = this.getUserPermissions();
    return permissions.some(permission => userPermissions.includes(permission));
  }

  /**
   * Check if user has specific role
   */
  static hasRole(role: string): boolean {
    return this.getUserRole() === role;
  }

  /**
   * Get token metadata for debugging
   */
  static getTokenMetadata(): Record<string, any> | null {
    const payload = this.decodeToken();
    if (!payload) return null;

    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.userType,
      permissions: payload.permissions,
      issuedAt: new Date(payload.iat * 1000).toISOString(),
      expiresAt: new Date(payload.exp * 1000).toISOString(),
      audience: payload.aud,
      issuer: payload.iss,
      sessionId: payload.sessionId,
      mfaVerified: payload.mfaVerified,
      timeUntilExpiry: this.getTimeUntilExpiry(),
    };
  }

  /**
   * Initialize token manager
   */
  static initialize(): void {
    if (typeof window === 'undefined') return;

    // Check for existing valid tokens and schedule refresh
    const validation = this.validateAccessToken();
    if (validation.isValid && !validation.needsRefresh) {
      const timeUntilExpiry = this.getTimeUntilExpiry();
      const refreshTime = Math.max(0, (timeUntilExpiry - 300) * 1000); // 5 minutes before expiry
      this.scheduleTokenRefresh(refreshTime);
    } else if (validation.needsRefresh) {
      // Token needs refresh immediately
      this.refreshTokenSilently();
    }

    // Listen for storage changes (multiple tabs)
    window.addEventListener('storage', event => {
      if (
        event.key === this.ACCESS_TOKEN_KEY ||
        event.key === this.REFRESH_TOKEN_KEY
      ) {
        // Token changed in another tab, update current tab
        window.location.reload();
      }
    });

    // Clear tokens on page unload if needed
    window.addEventListener('beforeunload', () => {
      // Optionally clear tokens for extra security
      // this.clearTokens();
    });
  }
}

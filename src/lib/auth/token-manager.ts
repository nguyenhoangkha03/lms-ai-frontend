import { jwtDecode } from 'jwt-decode';
import { LOCAL_STORAGE_KEYS } from '@/lib/constants/constants';

interface JWTPayload {
  sub: string;
  email: string;
  userType: 'student' | 'teacher' | 'admin';
  permissions: string[];
  iat: number;
  exp: number;
  aud: string;
  iss: string;
  jti: string;
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
  private static readonly TOKEN_EXPIRY_BUFFER = 5 * 60 * 1000;

  private static refreshPromise: Promise<boolean> | null = null;
  private static refreshCallbacks: Array<(success: boolean) => void> = [];

  static setTokens(tokens: TokenPair): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(this.ACCESS_TOKEN_KEY, tokens.accessToken);
      localStorage.setItem(this.REFRESH_TOKEN_KEY, tokens.refreshToken);

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

  static getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;

    // Try localStorage first for consistency
    const localToken = localStorage.getItem(this.ACCESS_TOKEN_KEY);
    if (localToken) return localToken;

    // Fallback to cookies (set by backend during email verification)
    const cookieToken = this.getCookie('access-token');
    if (cookieToken) {
      // If found in cookies but not localStorage, sync it
      localStorage.setItem(this.ACCESS_TOKEN_KEY, cookieToken);
      return cookieToken;
    }

    return null;
  }

  static getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;

    const localToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);
    if (localToken) return localToken;

    const cookieToken = this.getCookie('refresh-token');
    if (cookieToken) {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, cookieToken);
      return cookieToken;
    }

    return null;
  }

  private static getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;

    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  }

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
      const needsRefresh = payload.exp <= currentTime + 300;

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

  static needsRefresh(): boolean {
    const validation = this.validateAccessToken();
    return validation.needsRefresh || validation.isExpired;
  }

  static getTimeUntilExpiry(): number {
    const payload = this.decodeToken();
    if (!payload) return 0;

    const currentTime = Math.floor(Date.now() / 1000);
    return Math.max(0, payload.exp - currentTime);
  }

  private static scheduleTokenRefresh(delayMs: number): void {
    if (typeof window === 'undefined') return;

    const existingTimeout = (window as any).__tokenRefreshTimeout;
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

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

  static async refreshTokenSilently(): Promise<boolean> {
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

      this.refreshCallbacks.forEach(callback => callback(success));
      this.refreshCallbacks = [];

      return success;
    } finally {
      this.refreshPromise = null;
    }
  }

  private static async performTokenRefresh(
    refreshToken: string
  ): Promise<boolean> {
    try {
      console.log('🔄 Starting token refresh process...');
      console.log(
        '🔍 Refresh token preview:',
        refreshToken.substring(0, 20) + '...'
      );
      console.log('🌐 API URL:', process.env.NEXT_PUBLIC_API_URL);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${refreshToken}`,
          },
          credentials: 'include',
          body: JSON.stringify({ refreshToken }),
        }
      );

      console.log('📡 Refresh response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          '❌ Refresh failed with status:',
          response.status,
          'Body:',
          errorText
        );
        throw new Error(`Refresh failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('📦 Refresh response data:', {
        message: data.message,
        hasAccessToken: !!data.accessToken,
        hasRefreshToken: !!data.refreshToken,
        expiresIn: data.expiresIn,
        tokenType: data.tokenType,
      });

      if (data.accessToken) {
        this.setTokens({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken || refreshToken,
          expiresIn: data.expiresIn || 900,
          tokenType: data.tokenType || 'Bearer',
        });

        console.log('✅ Token refresh successful');
        return true;
      }

      throw new Error('Invalid refresh response');
    } catch (error) {
      console.error('Token refresh failed:', error);

      if (
        (error as Error).message?.includes('401') ||
        (error as Error).message?.includes('403')
      ) {
        console.log('🚫 Refresh token is invalid, clearing all auth state');
        this.clearTokens();

        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('auth:session-expired', {
              detail: { reason: 'refresh_token_invalid' },
            })
          );
        }
      } else {
        console.warn(
          '🔄 Token refresh failed due to network/server issue, retrying later'
        );
      }

      return false;
    }
  }

  static clearTokens(): void {
    if (typeof window === 'undefined') return;

    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem('token_expiry');
    localStorage.removeItem(LOCAL_STORAGE_KEYS.USER_DATA);

    this.clearCookie('access-token');
    this.clearCookie('refresh-token');
    this.clearCookie('session-id');

    const timeout = (window as any).__tokenRefreshTimeout;
    if (timeout) {
      clearTimeout(timeout);
      (window as any).__tokenRefreshTimeout = null;
    }
  }

  private static clearCookie(name: string): void {
    if (typeof document === 'undefined') return;

    // Clear cookie with various combinations to ensure removal
    const expiry = 'expires=Thu, 01 Jan 1970 00:00:00 GMT';
    
    // Clear without domain
    document.cookie = `${name}=; ${expiry}; path=/;`;
    
    // Clear with current hostname
    document.cookie = `${name}=; ${expiry}; path=/; domain=${window.location.hostname};`;
    
    // Clear with dot-prefixed domain (for subdomain cookies)
    if (window.location.hostname !== 'localhost') {
      const domain = window.location.hostname.split('.').slice(-2).join('.');
      document.cookie = `${name}=; ${expiry}; path=/; domain=.${domain};`;
    }
    
    // Additional clearing for localhost
    if (window.location.hostname === 'localhost') {
      document.cookie = `${name}=; ${expiry}; path=/; domain=localhost;`;
    }
    
    console.log(`🍪 Cleared cookie: ${name}`);
  }

  static getUserPermissions(): string[] {
    const payload = this.decodeToken();
    return payload?.permissions || [];
  }

  static getUserRole(): string | null {
    const payload = this.decodeToken();
    return payload?.userType || null;
  }

  static getUserId(): string | null {
    const payload = this.decodeToken();
    return payload?.sub || null;
  }

  static hasPermission(permission: string): boolean {
    const permissions = this.getUserPermissions();
    return permissions.includes(permission);
  }

  static hasAnyPermission(permissions: string[]): boolean {
    const userPermissions = this.getUserPermissions();
    return permissions.some(permission => userPermissions.includes(permission));
  }

  static hasRole(role: string): boolean {
    return this.getUserRole() === role;
  }

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

  static initialize(): void {
    if (typeof window === 'undefined') return;

    const validation = this.validateAccessToken();
    if (validation.isValid && !validation.needsRefresh) {
      const timeUntilExpiry = this.getTimeUntilExpiry();
      const refreshTime = Math.max(0, (timeUntilExpiry - 300) * 1000);
      this.scheduleTokenRefresh(refreshTime);
    } else if (validation.needsRefresh) {
      this.refreshTokenSilently();
    }

    const validationInterval = setInterval(
      () => {
        const currentValidation = this.validateAccessToken();
        const refreshToken = this.getRefreshToken();

        if (currentValidation.isExpired && refreshToken) {
          console.log('🔄 Token expired, attempting automatic refresh...');
          this.refreshTokenSilently().catch(error => {
            console.error('Automatic token refresh failed:', error);
          });
        } else if (currentValidation.needsRefresh && refreshToken) {
          console.log('🔄 Token needs refresh, refreshing proactively...');
          this.refreshTokenSilently().catch(error => {
            console.warn('Proactive token refresh failed:', error);
          });
        }
      },
      3 * 60 * 1000
    );

    (window as any).__tokenValidationInterval = validationInterval;

    window.addEventListener('storage', event => {
      if (
        event.key === this.ACCESS_TOKEN_KEY ||
        event.key === this.REFRESH_TOKEN_KEY
      ) {
        window.location.reload();
      }
    });

    window.addEventListener('beforeunload', () => {
      const interval = (window as any).__tokenValidationInterval;
      if (interval) {
        clearInterval(interval);
      }
    });
  }
}

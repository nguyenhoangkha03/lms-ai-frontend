import { AUTH_CONFIG } from '@/constants';

export class TokenManager {
  private static instance: TokenManager;
  private refreshPromise: Promise<string> | null = null;

  static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }
    return TokenManager.instance;
  }

  // Get token from storage
  getToken(): string | null {
    if (typeof window === 'undefined') return null; // Kiểm tra xem có đang chạy trên server không
    return localStorage.getItem(AUTH_CONFIG.tokenKey);
  }

  // Get refresh token from storage
  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(AUTH_CONFIG.refreshTokenKey);
  }

  // Set tokens in storage
  setTokens(token: string, refreshToken: string): void {
    if (typeof window === 'undefined') return;

    localStorage.setItem(AUTH_CONFIG.tokenKey, token);
    localStorage.setItem(AUTH_CONFIG.refreshTokenKey, refreshToken);

    // Also set in cookies for SSR
    this.setCookie(AUTH_CONFIG.tokenKey, token);
  }

  // Clear tokens from storage
  clearTokens(): void {
    if (typeof window === 'undefined') return;

    localStorage.removeItem(AUTH_CONFIG.tokenKey);
    localStorage.removeItem(AUTH_CONFIG.refreshTokenKey);
    localStorage.removeItem(AUTH_CONFIG.userKey);

    // Clear cookies
    this.setCookie(AUTH_CONFIG.tokenKey, '', 0);
    this.setCookie('user_role', '', 0);
  }

  // Check if token is expired
  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch {
      return true;
    }
  }

  // Get token payload
  getTokenPayload(token: string): any {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch {
      return null;
    }
  }

  // Refresh token with promise deduplication
  async refreshToken(): Promise<string> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.performTokenRefresh();

    try {
      const newToken = await this.refreshPromise;
      return newToken;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async performTokenRefresh(): Promise<string> {
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      this.clearTokens();
      throw new Error('Token refresh failed');
    }

    const data = await response.json();
    this.setTokens(data.token, data.refreshToken);

    return data.token;
  }

  // Set cookie helper
  private setCookie(name: string, value: string, maxAge?: number): void {
    const age = maxAge !== undefined ? maxAge : AUTH_CONFIG.cookieMaxAge;
    document.cookie = `${name}=${value}; path=/; max-age=${age}; secure; samesite=strict`;
  }

  // Schedule token refresh before expiry
  scheduleTokenRefresh(token: string): void {
    const payload = this.getTokenPayload(token);

    if (payload && payload.exp) {
      const expiryTime = payload.exp * 1000;
      const currentTime = Date.now();
      const timeUntilExpiry = expiryTime - currentTime;

      // Refresh 5 minutes before expiry
      const refreshTime = Math.max(timeUntilExpiry - 5 * 60 * 1000, 0);

      setTimeout(() => {
        this.refreshToken().catch(() => {
          // Handle refresh failure
          this.clearTokens();
          window.location.href = '/login';
        });
      }, refreshTime);
    }
  }
}

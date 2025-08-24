// ============================================================================
// TOKEN SERVICE
// ============================================================================
// Handles JWT token management, storage, and automatic refresh

import * as SecureStore from "expo-secure-store";

export interface TokenData {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds
  tokenType: string; // "Bearer"
  expiresAt?: number; // timestamp when token expires
}

const STORAGE_KEYS = {
  ACCESS_TOKEN: "accessToken",
  REFRESH_TOKEN: "refreshToken",
  TOKEN_DATA: "tokenData",
};

class TokenService {
  private tokenData: TokenData | null = null;
  private refreshPromise: Promise<boolean> | null = null;

  // ============================================================================
  // TOKEN STORAGE
  // ============================================================================

  /**
   * Store tokens after successful login/registration
   */
  async storeTokens(tokenData: TokenData): Promise<void> {
    try {
      // Calculate expiration timestamp
      const expiresAt = Date.now() + tokenData.expiresIn * 1000;
      const tokenWithExpiry = { ...tokenData, expiresAt };

      // Store in memory
      this.tokenData = tokenWithExpiry;

      // Store in SecureStore
      await SecureStore.setItemAsync(
        STORAGE_KEYS.TOKEN_DATA,
        JSON.stringify(tokenWithExpiry)
      );
      await SecureStore.setItemAsync(
        STORAGE_KEYS.ACCESS_TOKEN,
        tokenData.accessToken
      );
      await SecureStore.setItemAsync(
        STORAGE_KEYS.REFRESH_TOKEN,
        tokenData.refreshToken
      );

      console.log("✅ [TOKEN] Tokens stored successfully");
    } catch (error) {
      console.error("❌ [TOKEN] Error storing tokens:", error);
      throw error;
    }
  }
  /**
   * Load tokens from storage on app start
   */
  async loadTokens(): Promise<TokenData | null> {
    try {
      const tokenDataString = await SecureStore.getItemAsync(
        STORAGE_KEYS.TOKEN_DATA
      );
      if (tokenDataString) {
        const tokenData = JSON.parse(tokenDataString) as TokenData;
        this.tokenData = tokenData;
        console.log("✅ [TOKEN] Tokens loaded from storage");
        return tokenData;
      }
      return null;
    } catch (error) {
      console.error("❌ [TOKEN] Error loading tokens:", error);
      return null;
    }
  }

  /**
   * Clear all tokens (logout)
   */
  async clearTokens(): Promise<void> {
    try {
      this.tokenData = null;
      this.refreshPromise = null;
      await SecureStore.deleteItemAsync(STORAGE_KEYS.TOKEN_DATA);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
      console.log("✅ [TOKEN] Tokens cleared");
    } catch (error) {
      console.error("❌ [TOKEN] Error clearing tokens:", error);
    }
  }

  // ============================================================================
  // TOKEN VALIDATION & REFRESH
  // ============================================================================

  /**
   * Check if access token is valid (not expired)
   */
  isTokenValid(): boolean {
    if (!this.tokenData || !this.tokenData.expiresAt) {
      return false;
    }

    // Check if token expires in next 60 seconds (buffer time)
    const bufferTime = 60 * 1000; // 60 seconds
    return Date.now() < this.tokenData.expiresAt - bufferTime;
  }

  /**
   * Check if token is still usable (even if close to expiry)
   * Used when refresh endpoint is not available
   */
  isTokenUsable(): boolean {
    if (!this.tokenData || !this.tokenData.expiresAt) {
      return false;
    }

    // Allow tokens that haven't actually expired yet
    return Date.now() < this.tokenData.expiresAt;
  }

  /**
   * Get current access token (with automatic refresh if needed)
   */
  async getAccessToken(): Promise<string | null> {
    // Load tokens if not in memory
    if (!this.tokenData) {
      await this.loadTokens();
    }

    // Return null if no tokens
    if (!this.tokenData) {
      return null;
    }

    // Return token if still valid
    if (this.isTokenValid()) {
      return this.tokenData.accessToken;
    }

    // Try to refresh token
    const refreshed = await this.refreshAccessToken();

    if (refreshed) {
      return this.tokenData?.accessToken || null;
    }

    // If refresh failed but token is still usable, return it
    if (this.isTokenUsable()) {
      console.log(
        "⚠️ [TOKEN] Using expired token (refresh endpoint not available)"
      );
      return this.tokenData.accessToken;
    }

    return null;
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(): Promise<boolean> {
    // Prevent multiple simultaneous refresh attempts
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    if (!this.tokenData?.refreshToken) {
      console.log("❌ [TOKEN] No refresh token available");
      return false;
    }

    this.refreshPromise = this.performTokenRefresh();
    const result = await this.refreshPromise;
    this.refreshPromise = null;

    return result;
  }

  /**
   * Perform the actual token refresh API call
   */
  async validateToken(): Promise<boolean> {
    try {
      if (!this.tokenData?.accessToken) {
        return false;
      }

      const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
      const response = await fetch(
        `${API_BASE_URL}/api/auth/validate/provider`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify({
            token: this.tokenData.accessToken,
          }),
        }
      );

      return response.ok;
    } catch (error) {
      console.error("❌ [TOKEN] Error validating token:", error);
      return false;
    }
  }

  private async performTokenRefresh(): Promise<boolean> {
    try {
      console.log("🔄 [TOKEN] Refreshing access token...");

      const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

      const response = await fetch(
        `${API_BASE_URL}/api/auth/provider/refresh`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify({
            refreshToken: this.tokenData?.refreshToken,
          }),
        }
      );

      if (!response.ok) {
        console.log("❌ [TOKEN] Token refresh failed:", response.status);

        // If refresh endpoint is not ready (404), don't clear tokens
        // Just return false and continue using current token
        if (response.status === 404) {
          console.log(
            "ℹ️ [TOKEN] Refresh endpoint not available, keeping current tokens"
          );
          return false;
        }

        // For other errors, clear invalid tokens
        await this.clearTokens();
        return false;
      }

      const data = await response.json();

      if (data.success && data.data) {
        await this.storeTokens(data.data);
        console.log("✅ [TOKEN] Access token refreshed successfully");
        return true;
      }

      console.log("❌ [TOKEN] Invalid refresh response");
      await this.clearTokens();
      return false;
    } catch (error) {
      console.error("❌ [TOKEN] Error refreshing token:", error);
      await this.clearTokens();
      return false;
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Get authorization header for API calls
   */
  async getAuthHeader(): Promise<{ Authorization: string } | {}> {
    const token = await this.getAccessToken();

    if (token && this.tokenData?.tokenType) {
      return {
        Authorization: `${this.tokenData.tokenType} ${token}`,
      };
    }

    return {};
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    // Load tokens if not in memory
    if (!this.tokenData) {
      await this.loadTokens();
    }

    // If no tokens at all, user is not authenticated
    if (!this.tokenData) {
      return false;
    }

    // If token is still usable (even if close to expiry), consider authenticated
    if (this.isTokenUsable()) {
      return true;
    }

    // Try to get access token (which will attempt refresh)
    const token = await this.getAccessToken();
    return !!token;
  }

  /**
   * Get token expiration info
   */
  getTokenInfo(): { isValid: boolean; expiresAt?: Date; expiresIn?: number } {
    if (!this.tokenData || !this.tokenData.expiresAt) {
      return { isValid: false };
    }

    const expiresAt = new Date(this.tokenData.expiresAt);
    const expiresIn = Math.max(
      0,
      Math.floor((this.tokenData.expiresAt - Date.now()) / 1000)
    );

    return {
      isValid: this.isTokenValid(),
      expiresAt,
      expiresIn,
    };
  }
}

// Export singleton instance
export const tokenService = new TokenService();

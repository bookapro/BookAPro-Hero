// ============================================================================
// AUTHENTICATION SERVICE
// ============================================================================
// This service handles all authentication-related API calls

import { tokenService } from "./tokenService";

import { TokenData } from "./tokenService";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export interface LoginOTPRequest {
  phone: string;
}

export interface VerifyLoginOTPRequest {
  phone: string;
  otp: string;
}

export interface RegisterOTPRequest {
  phone: string;
}

export interface VerifyRegisterOTPRequest {
  phone: string;
  otp: string;
  email?: string;
  firstName: string;
  lastName: string;
}

export interface APIResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface AuthTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
  isNewUser?: boolean;
  user?: {
    id: number;
    phone: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    accountStatus?: string;
    isPhoneVerified?: boolean;
    userType?: string;
  };
}

class AuthService {
  private async makeRequest<T>(
    endpoint: string,
    method: "GET" | "POST" | "PUT" | "DELETE" = "POST",
    body?: any
  ): Promise<APIResponse<T>> {
    try {
      console.log(`🔧 [AUTH API] ${method} ${API_BASE_URL}${endpoint}`);
      console.log(`🔧 [AUTH API] Request body:`, body);

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true", // Skip ngrok browser warning
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      const responseText = await response.text();
      console.log(`🔧 [AUTH API] Response status:`, response.status);
      console.log(`🔧 [AUTH API] Response text:`, responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("❌ [AUTH API] Failed to parse JSON:", parseError);
        return {
          success: false,
          message: "Invalid response format",
          error: "Failed to parse server response",
        };
      }

      if (!response.ok) {
        return {
          success: false,
          message: data.message || `HTTP ${response.status}`,
          error: data.error || "Request failed",
        };
      }

      return {
        success: true,
        message: data.message || "Success",
        data: data.data || data,
      };
    } catch (error) {
      console.error("❌ [AUTH API] Network error:", error);
      return {
        success: false,
        message: "Network error",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // ============================================================================
  // LOGIN FLOW
  // ============================================================================

  /**
   * Send OTP for customer login
   */
  async sendLoginOTP(phone: string): Promise<APIResponse> {
    const formattedPhone = this.formatPhoneForAPI(phone);
    console.log(`🔧 [AUTH] Sending login OTP to: ${formattedPhone}`);
    return this.makeRequest("/api/auth/provider/login/send-otp", "POST", {
      phone: formattedPhone,
    });
  }

  /**
   * Verify OTP for customer login
   */
  async verifyLoginOTP(
    phone: string,
    otp: string
  ): Promise<APIResponse<AuthTokenResponse>> {
    const formattedPhone = this.formatPhoneForAPI(phone);
    console.log(`🔧 [AUTH] Verifying login OTP for: ${formattedPhone}`);
    const response = await this.makeRequest<AuthTokenResponse>(
      "/api/auth/provider/login/verify-otp",
      "POST",
      {
        phone: formattedPhone,
        otp,
      }
    );

    // Store tokens if login successful
    if (response.success && response.data) {
      const tokenData: TokenData = {
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken,
        expiresIn: response.data.expiresIn,
        tokenType: response.data.tokenType,
      };

      await tokenService.storeTokens(tokenData);
      console.log("✅ [AUTH] Login tokens stored");
    }

    return response;
  }

  // ============================================================================
  // REGISTRATION FLOW
  // ============================================================================

  /**
   * Send OTP for customer registration
   */
  async sendRegisterOTP(phone: string): Promise<APIResponse> {
    const formattedPhone = this.formatPhoneForAPI(phone);
    console.log(`🔧 [AUTH] Sending register OTP to: ${formattedPhone}`);
    return this.makeRequest("/api/auth/provider/register/send-otp", "POST", {
      phone: formattedPhone,
    });
  }

  /**
   * Verify OTP for customer registration
   */
  async verifyRegisterOTP(
    phone: string,
    otp: string,
    firstName: string,
    lastName: string,
    email?: string
  ): Promise<APIResponse<AuthTokenResponse>> {
    const formattedPhone = this.formatPhoneForAPI(phone);
    console.log(`🔧 [AUTH] Verifying register OTP for: ${formattedPhone}`);
    const response = await this.makeRequest<AuthTokenResponse>(
      "/api/auth/register/verify-otp",
      "POST",
      {
        phone: formattedPhone,
        otp,
        firstName,
        lastName,
        email,
      }
    );

    // Store tokens if registration successful
    if (response.success && response.data) {
      const tokenData: TokenData = {
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken,
        expiresIn: response.data.expiresIn,
        tokenType: response.data.tokenType,
      };

      await tokenService.storeTokens(tokenData);
      console.log("✅ [AUTH] Registration tokens stored");
    }

    return response;
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  /**
   * Check if user exists (by attempting to send login OTP)
   */
  async checkUserExists(phone: string): Promise<boolean> {
    try {
      const response = await this.sendLoginOTP(phone);
      // If login OTP is sent successfully, user exists
      return response.success;
    } catch (error) {
      // If login OTP fails, user might not exist
      return false;
    }
  }

  /**
   * Format phone number for API calls
   */
  formatPhoneForAPI(phone: string): string {
    // Remove any spaces, dashes, or other formatting
    const cleaned = phone.replace(/\D/g, "");

    // If it starts with country code (91), remove it to get 10 digits
    if (cleaned.startsWith("91") && cleaned.length === 12) {
      return cleaned.substring(2); // Remove "91" prefix
    }

    // If it's already 10 digits, return as is
    if (cleaned.length === 10) {
      return cleaned;
    }

    // If it has country code with +, remove + and 91
    if (phone.startsWith("+91")) {
      return phone.substring(3);
    }

    return cleaned; // Return cleaned digits
  }

  /**
   * Validate phone number format
   */
  isValidPhoneNumber(phone: string): boolean {
    const cleaned = phone.replace(/\D/g, "");
    return (
      cleaned.length === 10 ||
      (cleaned.length === 12 && cleaned.startsWith("91"))
    );
  }
}

// Export singleton instance
export const authService = new AuthService();

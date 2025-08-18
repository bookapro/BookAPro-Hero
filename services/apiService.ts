// ============================================================================
// API SERVICE
// ============================================================================
// Centralized API service with automatic token management

import { tokenService } from "./tokenService";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export interface APIResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

class APIService {
  /**
   * Make authenticated API request with automatic token handling
   */
  async makeAuthenticatedRequest<T>(
    endpoint: string,
    method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
    body?: any,
    additionalHeaders?: Record<string, string>
  ): Promise<APIResponse<T>> {
    try {
      // Get authentication header
      const authHeader = await tokenService.getAuthHeader();

      console.log(`🔧 [API] ${method} ${API_BASE_URL}${endpoint}`);
      if (body) console.log(`🔧 [API] Request body:`, body);

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
          ...authHeader,
          ...additionalHeaders,
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      const responseText = await response.text();
      console.log(`🔧 [API] Response status:`, response.status);
      console.log(`🔧 [API] Response text:`, responseText);

      // Handle 401 Unauthorized - token might be expired
      if (response.status === 401) {
        console.log("🔄 [API] Unauthorized - attempting token refresh");

        const refreshed = await tokenService.refreshAccessToken();
        if (refreshed) {
          // Retry the request with new token
          console.log("🔄 [API] Retrying request with refreshed token");
          return this.makeAuthenticatedRequest(
            endpoint,
            method,
            body,
            additionalHeaders
          );
        } else {
          // Refresh failed - user needs to login again
          await tokenService.clearTokens();
          return {
            success: false,
            message: "Authentication expired. Please login again.",
            error: "TOKEN_EXPIRED",
          };
        }
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("❌ [API] Failed to parse JSON:", parseError);
        return {
          success: false,
          message: "Invalid response format",
          error: "PARSE_ERROR",
        };
      }

      if (!response.ok) {
        return {
          success: false,
          message: data.message || `HTTP ${response.status}`,
          error: data.error || "REQUEST_FAILED",
        };
      }

      return {
        success: true,
        message: data.message || "Success",
        data: data.data || data,
      };
    } catch (error) {
      console.error("❌ [API] Network error:", error);
      return {
        success: false,
        message: "Network error",
        error: error instanceof Error ? error.message : "NETWORK_ERROR",
      };
    }
  }

  /**
   * Make public API request (no authentication required)
   */
  async makePublicRequest<T>(
    endpoint: string,
    method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
    body?: any,
    additionalHeaders?: Record<string, string>
  ): Promise<APIResponse<T>> {
    try {
      console.log(`🔧 [API] ${method} ${API_BASE_URL}${endpoint}`);
      if (body) console.log(`🔧 [API] Request body:`, body);

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
          ...additionalHeaders,
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      const responseText = await response.text();
      console.log(`🔧 [API] Response status:`, response.status);
      console.log(`🔧 [API] Response text:`, responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("❌ [API] Failed to parse JSON:", parseError);
        return {
          success: false,
          message: "Invalid response format",
          error: "PARSE_ERROR",
        };
      }

      if (!response.ok) {
        return {
          success: false,
          message: data.message || `HTTP ${response.status}`,
          error: data.error || "REQUEST_FAILED",
        };
      }

      return {
        success: true,
        message: data.message || "Success",
        data: data.data || data,
      };
    } catch (error) {
      console.error("❌ [API] Network error:", error);
      return {
        success: false,
        message: "Network error",
        error: error instanceof Error ? error.message : "NETWORK_ERROR",
      };
    }
  }

  // ============================================================================
  // CONVENIENCE METHODS
  // ============================================================================

  async get<T>(
    endpoint: string,
    authenticated = true
  ): Promise<APIResponse<T>> {
    return authenticated
      ? this.makeAuthenticatedRequest<T>(endpoint, "GET")
      : this.makePublicRequest<T>(endpoint, "GET");
  }

  async post<T>(
    endpoint: string,
    body?: any,
    authenticated = true
  ): Promise<APIResponse<T>> {
    return authenticated
      ? this.makeAuthenticatedRequest<T>(endpoint, "POST", body)
      : this.makePublicRequest<T>(endpoint, "POST", body);
  }

  async put<T>(
    endpoint: string,
    body?: any,
    authenticated = true
  ): Promise<APIResponse<T>> {
    return authenticated
      ? this.makeAuthenticatedRequest<T>(endpoint, "PUT", body)
      : this.makePublicRequest<T>(endpoint, "PUT", body);
  }

  async delete<T>(
    endpoint: string,
    authenticated = true
  ): Promise<APIResponse<T>> {
    return authenticated
      ? this.makeAuthenticatedRequest<T>(endpoint, "DELETE")
      : this.makePublicRequest<T>(endpoint, "DELETE");
  }
}

// Export singleton instance
export const apiService = new APIService();

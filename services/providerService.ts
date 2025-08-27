// ============================================================================
// PROVIDER SERVICE
// ============================================================================
// Service for provider-specific API calls including duty status management

import { APIResponse, apiService } from "./apiService";

export interface ProviderStatus {
  onDuty: boolean;
  lastStatusChange?: string;
}

export interface UpdateDutyStatusRequest {
  onDuty: boolean;
}

class ProviderService {
  /**
   * Get current provider duty status (authenticated)
   */
  async getStatus(): Promise<APIResponse<ProviderStatus>> {
    return apiService.get<ProviderStatus>("/api/providers/me/status");
  }

  /**
   * Update provider duty status (authenticated)
   */
  async updateDutyStatus(
    onDuty: boolean
  ): Promise<APIResponse<ProviderStatus>> {
    return apiService.patch<ProviderStatus>("/api/providers/me/duty", {
      onDuty,
    });
  }
}

// Export singleton instance
export const providerService = new ProviderService();

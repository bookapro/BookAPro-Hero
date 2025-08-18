// ============================================================================
// USER SERVICE
// ============================================================================
// Example service showing how to use authenticated API calls

import { APIResponse, apiService } from "./apiService";

export interface UserProfile {
  id: string;
  phone: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
}

class UserService {
  /**
   * Get user profile (authenticated)
   */
  async getProfile(): Promise<APIResponse<UserProfile>> {
    return apiService.get<UserProfile>("/api/user/profile");
  }

  /**
   * Update user profile (authenticated)
   */
  async updateProfile(
    data: UpdateProfileRequest
  ): Promise<APIResponse<UserProfile>> {
    return apiService.put<UserProfile>("/api/user/profile", data);
  }

  /**
   * Get user bookings (authenticated)
   */
  async getBookings(): Promise<APIResponse<any[]>> {
    return apiService.get<any[]>("/api/user/bookings");
  }

  /**
   * Delete user account (authenticated)
   */
  async deleteAccount(): Promise<APIResponse<void>> {
    return apiService.delete<void>("/api/user/account");
  }
}

// Export singleton instance
export const userService = new UserService();

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/*
// Get user profile
const profileResponse = await userService.getProfile();
if (profileResponse.success) {
  console.log('User profile:', profileResponse.data);
} else {
  console.error('Failed to get profile:', profileResponse.message);
}

// Update profile
const updateResponse = await userService.updateProfile({
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com'
});

// Get bookings
const bookingsResponse = await userService.getBookings();
if (bookingsResponse.success) {
  console.log('User bookings:', bookingsResponse.data);
}
*/

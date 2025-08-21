import { tokenService } from "@/services/tokenService";
import { userService } from "@/services/userService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import React, { createContext, useContext, useEffect, useState } from "react";

export interface User {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  phoneNumber: string;
  email?: string;
  avatar?: string;
  createdAt: string;
  isVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isOnDuty: boolean;
  toggleDutyStatus: () => void;
  logout: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<boolean>;
  refreshAuthState: () => Promise<void>;
  fetchUserProfile: () => Promise<void>;
}

export interface RegisterData {
  name: string;
  phoneNumber: string;
  email?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER: "user",
  AUTH_TOKEN: "authToken",
  DUTY_STATUS: "dutyStatus",
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasRealTokens, setHasRealTokens] = useState(false);
  const [isOnDuty, setIsOnDuty] = useState(false);

  useEffect(() => {
    loadUserData();
    loadDutyStatus();
  }, []);

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      const tokenData = await tokenService.loadTokens();
      if (tokenData) {
        const isTokenValid = await tokenService.validateToken();
        if (isTokenValid) {
          setHasRealTokens(true);
          const savedUser = await SecureStore.getItemAsync(STORAGE_KEYS.USER);
          if (savedUser) {
            const userData = JSON.parse(savedUser);
            setUser(userData);
            console.log("✅ [AUTH] Loaded user from storage:", userData.name);
          } else {
            await fetchUserProfile();
          }
        } else {
          const refreshed = await tokenService.refreshAccessToken();
          if (refreshed) {
            setHasRealTokens(true);
            await fetchUserProfile();
          } else {
            await tokenService.clearTokens();
            await SecureStore.deleteItemAsync(STORAGE_KEYS.USER);
            setUser(null);
            setHasRealTokens(false);
          }
        }
      } else {
        setUser(null);
        setHasRealTokens(false);
      }
    } catch (error) {
      console.error("❌ [AUTH] Error loading user data:", error);
      setUser(null);
      setHasRealTokens(false);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (userData: Partial<User>): Promise<boolean> => {
    try {
      if (!user) return false;
      setIsLoading(true);
      // TODO: Implement real profile update API call
      return true;
    } catch (error) {
      console.error("Error updating profile:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      console.log("🔄 [AUTH] Logging out user...");
      await tokenService.clearTokens();
      await SecureStore.deleteItemAsync(STORAGE_KEYS.USER);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.AUTH_TOKEN);
      await AsyncStorage.removeItem(STORAGE_KEYS.DUTY_STATUS);
      setUser(null);
      setHasRealTokens(false);
      setIsOnDuty(false);
      console.log("✅ [AUTH] User logged out successfully");
    } catch (error) {
      console.error("❌ [AUTH] Error logging out:", error);
    }
  };

  const refreshAuthState = async (): Promise<void> => {
    await loadUserData();
  };

  const loadDutyStatus = async (): Promise<void> => {
    try {
      const savedDutyStatus = await AsyncStorage.getItem(
        STORAGE_KEYS.DUTY_STATUS
      );
      if (savedDutyStatus !== null) {
        setIsOnDuty(JSON.parse(savedDutyStatus));
      }
    } catch (error) {
      console.error("❌ [AUTH] Error loading duty status:", error);
    }
  };

  const toggleDutyStatus = async (): Promise<void> => {
    try {
      const newDutyStatus = !isOnDuty;
      setIsOnDuty(newDutyStatus);
      await AsyncStorage.setItem(
        STORAGE_KEYS.DUTY_STATUS,
        JSON.stringify(newDutyStatus)
      );
      console.log(
        `✅ [AUTH] Duty status changed to: ${
          newDutyStatus ? "ON DUTY" : "OFF DUTY"
        }`
      );
    } catch (error) {
      console.error("❌ [AUTH] Error toggling duty status:", error);
    }
  };

  const fetchUserProfile = async (): Promise<void> => {
    try {
      const isAuth = await tokenService.isAuthenticated();
      if (!isAuth) return;
      console.log("🔄 [AUTH] Fetching latest user profile...");
      const profileResponse = await userService.getProfile();
      if (profileResponse.success && profileResponse.data) {
        const apiUser = profileResponse.data;
        const updatedUser: User = {
          id: apiUser.id,
          name:
            `${apiUser.firstName || ""} ${apiUser.lastName || ""}`.trim() ||
            "User",
          phoneNumber: apiUser.phone,
          email: apiUser.email,
          createdAt: apiUser.createdAt,
          isVerified: true,
        };
        await SecureStore.setItemAsync(
          STORAGE_KEYS.USER,
          JSON.stringify(updatedUser)
        );
        setUser(updatedUser);
        console.log("✅ [AUTH] User profile updated:", updatedUser.name);
      }
    } catch (error) {
      console.error("❌ [AUTH] Error fetching user profile:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user || hasRealTokens,
        isOnDuty,
        toggleDutyStatus,
        logout,
        updateProfile,
        refreshAuthState,
        fetchUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

import { ThemedView } from "@/components/common/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Config } from "@/constants/Config";
import { Colors, FontFamily, Spacing } from "@/constants/Styles";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/services/authService";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function LoginScreen() {
  const router = useRouter();
  const { isLoading, refreshAuthState } = useAuth();
  const { returnTo, returnParams } = useLocalSearchParams();

  const [step, setStep] = useState<"phone" | "register" | "otp">("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [fullName, setFullName] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isUserRegistered, setIsUserRegistered] = useState<boolean | null>(
    null
  );
  const [countdown, setCountdown] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const otpRefs = useRef<TextInput[]>([]);

  // Handle device back button - prevent navigation, only allow UI back arrows
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        // Prevent default back navigation
        // User must use the UI back arrows to navigate
        console.log(
          "🔒 [LOGIN] Device back button blocked - use UI navigation"
        );
        return true; // Prevent default back behavior
      }
    );

    return () => backHandler.remove();
  }, []);

  const formatPhoneNumber = (text: string) => {
    // Remove all non-digits and limit to configured length
    const cleaned = text
      .replace(/\D/g, "")
      .slice(0, Config.PHONE_NUMBER_LENGTH);

    // Format as XXXXX XXXXX (just the digits with space)
    if (cleaned.length >= 5) {
      return `${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
    }
    return cleaned;
  };

  const getFullPhoneNumber = (digits: string) => {
    // Remove spaces and combine with country code
    const cleanDigits = digits.replace(/\s/g, "");
    return `${Config.COUNTRY_CODE}${cleanDigits}`;
  };

  const checkUserRegistration = async (phoneNumber: string) => {
    try {
      const fullPhoneNumber = getFullPhoneNumber(phoneNumber);
      const formattedPhone = authService.formatPhoneForAPI(fullPhoneNumber);

      console.log("🔧 [LOGIN] Checking if user exists:", formattedPhone);

      // First try to send registration OTP to see if user already exists
      const registerResponse = await authService.sendRegisterOTP(
        formattedPhone
      );

      console.log("🔧 [LOGIN] Register OTP response:", registerResponse);

      if (registerResponse.success) {
        // Registration OTP sent successfully - user doesn't exist
        console.log("ℹ️ [LOGIN] User doesn't exist, registration OTP sent");
        return false;
      } else {
        // Check if error indicates user already exists
        if (
          registerResponse.message &&
          (registerResponse.message
            .toLowerCase()
            .includes("already registered") ||
            registerResponse.message.toLowerCase().includes("already exists"))
        ) {
          // User already exists - try login OTP
          console.log("ℹ️ [LOGIN] User already exists, trying login OTP");
          const loginResponse = await authService.sendLoginOTP(formattedPhone);

          if (loginResponse.success) {
            console.log("✅ [LOGIN] Login OTP sent successfully");
            return true;
          } else {
            console.log("⚠️ [LOGIN] Login OTP failed:", loginResponse.message);
            // Still assume user exists since register said they're already registered
            return true;
          }
        } else {
          // Other registration error - try login as fallback
          console.log(
            "⚠️ [LOGIN] Registration failed with other error, trying login"
          );
          const loginResponse = await authService.sendLoginOTP(formattedPhone);
          return loginResponse.success;
        }
      }
    } catch (error) {
      console.error("❌ [LOGIN] Error checking user registration:", error);
      // On network error, default to login attempt
      return true;
    }
  };

  const handlePhoneSubmit = async () => {
    // Check for exactly configured length
    const cleaned = phoneNumber.replace(/\D/g, "");
    if (cleaned.length !== Config.PHONE_NUMBER_LENGTH) {
      Alert.alert(
        "Invalid Phone",
        `Please enter a valid ${Config.PHONE_NUMBER_LENGTH}-digit mobile number.`
      );
      return;
    }

    // Check if user is registered and handle OTP sending
    const isRegistered = await checkUserRegistration(phoneNumber);
    setIsUserRegistered(isRegistered);

    if (isRegistered) {
      // Existing user - OTP already sent in checkUserRegistration
      console.log("✅ [LOGIN] User exists, proceeding to OTP verification");
      setStep("otp");
      startCountdown();
    } else {
      // New user - show registration fields first, OTP will be sent after name entry
      console.log("ℹ️ [LOGIN] New user, showing registration form");
      setStep("register");
    }
  };

  const validateName = (
    name: string
  ): { isValid: boolean; message?: string } => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      return { isValid: false, message: "Please enter your full name." };
    }

    if (trimmedName.length < 2) {
      return {
        isValid: false,
        message: "Name must be at least 2 characters long.",
      };
    }

    if (trimmedName.length > 50) {
      return {
        isValid: false,
        message: "Name must be less than 50 characters.",
      };
    }

    // Check for valid characters (letters, spaces, common name characters)
    const nameRegex = /^[a-zA-Z\s\-\.\']+$/;
    if (!nameRegex.test(trimmedName)) {
      return {
        isValid: false,
        message:
          "Name can only contain letters, spaces, hyphens, dots, and apostrophes.",
      };
    }

    // Check for reasonable word count (2-4 names)
    const nameParts = trimmedName
      .split(/\s+/)
      .filter((part) => part.length > 0);
    if (nameParts.length > 4) {
      return {
        isValid: false,
        message: "Please enter a shorter name (maximum 4 words).",
      };
    }

    return { isValid: true };
  };

  const handleRegisterSubmit = async () => {
    const validation = validateName(fullName);

    if (!validation.isValid) {
      Alert.alert("Invalid Name", validation.message);
      return;
    }

    // Registration OTP was already sent in checkUserRegistration
    // Just proceed to OTP verification step
    console.log(
      "✅ [REGISTER] Proceeding to OTP verification with name:",
      fullName.trim()
    );
    setStep("otp");
    startCountdown();
  };

  const startCountdown = () => {
    setCountdown(Config.OTP_TIMEOUT);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleOTPChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Auto-focus next input
    if (text && index < Config.OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits are entered
    if (
      newOtp.every((digit) => digit !== "") &&
      newOtp.join("").length === Config.OTP_LENGTH
    ) {
      handleLogin(newOtp.join(""));
    }
  };

  const handleOTPKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  // utils/navigationHelpers.ts (or inside same file above handleLogin if small project)
  const navigateHandler = (router: any, returnTo?: any, returnParams?: any) => {
    if (returnTo && returnParams) {
      console.log("✅ [AUTH] Redirecting back to service page");

      const params = JSON.parse(returnParams);

      router.replace({
        pathname: "/offline-service/[id]",
        params: {
          id: params.serviceId,
          returnParams,
          fromLogin: "true",
        },
      });
    } else {
      router.replace("/(tabs)");
      console.log("✅ [AUTH] Navigated to main app");
    }
  };

  const handleLogin = async (otpCode?: string) => {
    if (isSubmitting) {
      console.log("⚠️ [LOGIN] Already submitting, ignoring duplicate call");
      return;
    }

    const otpToUse = otpCode || otp.join("");
    if (otpToUse.length !== Config.OTP_LENGTH) {
      Alert.alert(
        "Invalid OTP",
        `Please enter the complete ${Config.OTP_LENGTH}-digit OTP.`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const fullPhoneNumber = getFullPhoneNumber(phoneNumber);
      const formattedPhone = authService.formatPhoneForAPI(fullPhoneNumber);

      let response;
      if (isUserRegistered) {
        console.log("🔧 [LOGIN] Verifying login OTP:", formattedPhone);
        response = await authService.verifyLoginOTP(formattedPhone, otpToUse);
      } else {
        console.log(
          "🔧 [REGISTER] Verifying registration OTP:",
          formattedPhone
        );
        const nameParts = fullName.trim().split(/\s+/).filter(Boolean);
        const firstName = nameParts[0] || "";
        const lastName =
          nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

        console.log(
          `🔧 [REGISTER] Name split - First: "${firstName}", Last: "${lastName}"`
        );

        response = await authService.verifyRegisterOTP(
          formattedPhone,
          otpToUse,
          firstName,
          lastName
        );
      }

      if (response.success && response.data?.user) {
        const userData = {
          id: response.data.user.id.toString(),
          name:
            `${response.data.user.firstName || ""} ${
              response.data.user.lastName || ""
            }`.trim() || "User",
          firstName: response.data.user.firstName || "",
          lastName: response.data.user.lastName || "",
          phoneNumber: response.data.user.phone,
          email: response.data.user.email || "",
          createdAt: new Date().toISOString(),
          isVerified: response.data.user.isPhoneVerified || true,
        };

        // Store user data in SecureStore
        await SecureStore.setItemAsync("user", JSON.stringify(userData));

        // Refresh auth state to update context
        await refreshAuthState();

        navigateHandler(router, returnTo, returnParams);
      } else {
        Alert.alert("Verification Failed", response.message || "Invalid OTP");
      }
    } catch (error) {
      console.error("❌ [AUTH] Error verifying OTP:", error);
      Alert.alert("Error", "Failed to verify OTP. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;

    try {
      const fullPhoneNumber = getFullPhoneNumber(phoneNumber);
      const formattedPhone = authService.formatPhoneForAPI(fullPhoneNumber);

      let response;

      if (isUserRegistered) {
        // Resend login OTP
        console.log("🔧 [LOGIN] Resending login OTP:", formattedPhone);
        response = await authService.sendLoginOTP(formattedPhone);
      } else {
        // Resend registration OTP
        console.log(
          "🔧 [REGISTER] Resending registration OTP:",
          formattedPhone
        );
        response = await authService.sendRegisterOTP(formattedPhone);
      }

      if (response.success) {
        setOtp(["", "", "", "", "", ""]);
        startCountdown();
      } else {
        Alert.alert("Error", response.message || "Failed to resend OTP");
      }
    } catch (error) {
      console.error("❌ [AUTH] Error resending OTP:", error);
      Alert.alert("Error", "Failed to resend OTP. Please try again.");
    }
  };

  const handleBackToPhone = () => {
    setStep("phone");
    setFullName("");
    setIsUserRegistered(null);
  };

  // Device back button is handled by useEffect above

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ThemedView style={styles.container}>
        {/* Top Image */}
        <View style={styles.imageContainer}>
          <Image
            source={require("@/assets/images/loginPic.png")}
            style={styles.loginImage}
            resizeMode="cover"
          />
        </View>

        {/* Content */}
        <View style={styles.content}>
          {step === "phone" ? (
            <View>
              <TouchableOpacity
                onPress={() => navigateHandler(router, returnTo, returnParams)}
                style={styles.backButton}
              >
                <IconSymbol
                  size={20}
                  name="arrow-back"
                  color={Colors.primary}
                />
              </TouchableOpacity>

              <Text style={styles.title}>Welcome</Text>
              <Text style={styles.subtitle}>
                Enter your mobile number to continue
              </Text>

              <View style={styles.inputContainer}>
                <View style={styles.phoneInputWrapper}>
                  <Text style={styles.countryCode}>{Config.COUNTRY_CODE}</Text>
                  <TextInput
                    style={styles.phoneInput}
                    placeholder={`10 digit number`}
                    value={phoneNumber}
                    onChangeText={(text) =>
                      setPhoneNumber(formatPhoneNumber(text))
                    }
                    keyboardType="phone-pad"
                    maxLength={11}
                    placeholderTextColor={Colors.text + "60"}
                    autoFocus
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  (!phoneNumber || isLoading) && styles.disabledButton,
                ]}
                onPress={handlePhoneSubmit}
                disabled={!phoneNumber || isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Text style={styles.primaryButtonText}>Continue</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          ) : step === "register" ? (
            <View>
              <TouchableOpacity
                onPress={handleBackToPhone}
                style={styles.backButton}
              >
                <IconSymbol
                  size={20}
                  name="arrow-back"
                  color={Colors.primary}
                />
              </TouchableOpacity>

              <Text style={styles.title}>What should we call you?</Text>
              <Text style={styles.subtitle}>Please enter your full name</Text>

              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Full name (e.g., Mr Wonderful)"
                  value={fullName}
                  onChangeText={(text) => {
                    // Limit to 50 characters and prevent multiple consecutive spaces
                    const cleanedText = text
                      .slice(0, 50)
                      .replace(/\s{2,}/g, " ");
                    setFullName(cleanedText);
                  }}
                  placeholderTextColor={Colors.text + "60"}
                  autoCapitalize="words"
                  autoFocus
                  maxLength={50}
                />
              </View>

              <View style={styles.phoneDisplayContainer}>
                <Text style={styles.phoneDisplayLabel}>Mobile Number:</Text>
                <Text style={styles.phoneDisplayText}>
                  {Config.COUNTRY_CODE} {phoneNumber}
                </Text>
              </View>

              {/* Show OTP fields if OTP has been sent */}
              {countdown > 0 && (
                <>
                  <Text style={styles.otpTitle}>Enter Verification Code</Text>
                  <Text style={styles.otpSubtitle}>
                    Enter the {Config.OTP_LENGTH}-digit code sent to your number
                  </Text>

                  <View style={styles.otpContainer}>
                    {otp.map((digit, index) => (
                      <TextInput
                        key={index}
                        ref={(ref) => {
                          if (ref) otpRefs.current[index] = ref;
                        }}
                        style={[
                          styles.otpInputFilled,
                          digit ? styles.otpInputWithValue : null,
                        ]}
                        value={digit}
                        onChangeText={(text) =>
                          handleOTPChange(text.replace(/[^0-9]/g, ""), index)
                        }
                        onKeyPress={({ nativeEvent }) =>
                          handleOTPKeyPress(nativeEvent.key, index)
                        }
                        keyboardType="number-pad"
                        maxLength={1}
                        textAlign="center"
                      />
                    ))}
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.primaryButton,
                      (isLoading || isSubmitting) && styles.disabledButton,
                    ]}
                    onPress={() => handleLogin()}
                    disabled={isLoading || isSubmitting}
                  >
                    {isLoading || isSubmitting ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.primaryButtonText}>
                        Verify & Create Account
                      </Text>
                    )}
                  </TouchableOpacity>

                  <View style={styles.resendContainer}>
                    <Text style={styles.resendText}>
                      Didn't receive the code?
                    </Text>
                    <TouchableOpacity
                      onPress={handleResendOTP}
                      disabled={countdown > 0}
                      style={styles.resendButton}
                    >
                      <Text
                        style={[
                          styles.resendButtonText,
                          countdown > 0 && styles.disabledText,
                        ]}
                      >
                        {countdown > 0
                          ? `Resend in ${countdown}s`
                          : "Resend OTP"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}

              {/* Show Continue button only if OTP hasn't been sent yet */}
              {countdown === 0 && (
                <TouchableOpacity
                  style={[
                    styles.primaryButton,
                    (!fullName.trim() || isLoading) && styles.disabledButton,
                  ]}
                  onPress={handleRegisterSubmit}
                  disabled={!fullName.trim() || isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Text style={styles.primaryButtonText}>Continue</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View>
              <TouchableOpacity
                onPress={handleBackToPhone}
                style={styles.backButton}
              >
                <IconSymbol
                  size={20}
                  name="arrow-back"
                  color={Colors.primary}
                />
              </TouchableOpacity>

              <Text style={styles.title}>Verify Your Number</Text>
              <Text style={styles.subtitle}>
                Enter the {Config.OTP_LENGTH}-digit code sent to{"\n"}
                <Text style={styles.phoneHighlight}>
                  {Config.COUNTRY_CODE} {phoneNumber}
                </Text>
              </Text>

              {!isUserRegistered && (
                <View style={styles.newUserInfo}>
                  <Text style={styles.newUserText}>
                    Creating account for: {fullName}
                  </Text>
                </View>
              )}

              <View style={styles.otpContainer}>
                {otp.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => {
                      if (ref) otpRefs.current[index] = ref;
                    }}
                    style={[
                      styles.otpInputFilled,
                      digit ? styles.otpInputWithValue : null,
                    ]}
                    value={digit}
                    onChangeText={(text) =>
                      handleOTPChange(text.replace(/[^0-9]/g, ""), index)
                    }
                    onKeyPress={({ nativeEvent }) =>
                      handleOTPKeyPress(nativeEvent.key, index)
                    }
                    keyboardType="number-pad"
                    maxLength={1}
                    textAlign="center"
                  />
                ))}
              </View>

              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  (isLoading || isSubmitting) && styles.disabledButton,
                ]}
                onPress={() => handleLogin()}
                disabled={isLoading || isSubmitting}
              >
                {isLoading || isSubmitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.primaryButtonText}>
                    {isUserRegistered
                      ? "Verify & Login"
                      : "Verify & Create Account"}
                  </Text>
                )}
              </TouchableOpacity>

              <View style={styles.resendContainer}>
                <Text style={styles.resendText}>Didn't receive the code?</Text>
                <TouchableOpacity
                  onPress={handleResendOTP}
                  disabled={countdown > 0}
                  style={styles.resendButton}
                >
                  <Text
                    style={[
                      styles.resendButtonText,
                      countdown > 0 && styles.disabledText,
                    ]}
                  >
                    {countdown > 0 ? `Resend in ${countdown}s` : "Resend OTP"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  imageContainer: {
    height: "40%",
    width: "100%",
  },
  loginImage: {
    width: "100%",
    height: "100%",
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    justifyContent: "flex-start",
  },
  backButton: {
    alignSelf: "flex-start",
    padding: 8,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    textAlign: "center",
    marginBottom: Spacing.sm,
    fontFamily: FontFamily.MontserratBold,
    color: Colors.primary,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: "center",
    marginBottom: Spacing.lg,
    lineHeight: 22,
    fontFamily: FontFamily.Montserrat,
    color: Colors.text,
  },
  phoneHighlight: {
    fontFamily: FontFamily.Montserrat,
  },
  inputContainer: {
    marginBottom: Spacing.md,
  },
  textInput: {
    fontSize: 16,
    color: Colors.text,
    fontFamily: FontFamily.Montserrat,
    padding: Spacing.md,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "transparent",
  },
  phoneDisplayContainer: {
    backgroundColor: Colors.primary + "10",
    padding: Spacing.md,
    borderRadius: 12,
    marginBottom: Spacing.lg,
    alignItems: "center",
  },
  phoneDisplayLabel: {
    fontSize: 14,
    fontFamily: FontFamily.Montserrat,
    color: Colors.primary,
    marginBottom: 4,
  },
  phoneDisplayText: {
    fontSize: 16,
    fontFamily: FontFamily.MontserratBold,
    color: Colors.primary,
  },
  newUserInfo: {
    backgroundColor: Colors.primary + "10",
    padding: Spacing.md,
    borderRadius: 12,
    marginBottom: Spacing.lg,
    alignItems: "center",
  },
  newUserText: {
    fontSize: 14,
    fontFamily: FontFamily.MontserratMedium,
    color: Colors.primary,
  },
  phoneInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.md,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "transparent",
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    fontFamily: FontFamily.Montserrat,
  },
  countryCode: {
    fontSize: 16,
    marginRight: Spacing.sm,
    fontFamily: FontFamily.MontserratBold,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
    marginTop: Spacing.md,
  },

  otpInputFilled: {
    width: 50,
    height: 60,
    borderWidth: 2,
    borderColor: Colors.primary + "40",
    backgroundColor: Colors.primary + "08",
    borderRadius: 12,
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.primary,
    fontFamily: FontFamily.MontserratBold,
    textAlign: "center",
  },
  otpInputWithValue: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + "15",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
  },
  disabledButton: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: FontFamily.MontserratBold,
  },
  resendContainer: {
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
    marginTop: Spacing.md,
  },
  resendText: {
    fontSize: 14,
    opacity: 0.7,
    fontFamily: FontFamily.Montserrat,
    color: Colors.text,
  },
  resendButton: {
    paddingVertical: Spacing.xs,
  },
  resendButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontFamily: FontFamily.MontserratBold,
  },
  disabledText: {
    opacity: 0.5,
  },
  otpTitle: {
    fontSize: 20,
    textAlign: "center",
    marginTop: Spacing.lg,
    marginBottom: Spacing.xs,
    fontFamily: FontFamily.OrbitronBold,
    color: Colors.primary,
  },
  otpSubtitle: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: "center",
    marginBottom: Spacing.md,
    lineHeight: 20,
    fontFamily: FontFamily.Montserrat,
    color: Colors.text,
  },
});

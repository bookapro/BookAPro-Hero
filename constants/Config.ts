// App Configuration Constants
export const Config = {
  // App Identity
  APP_NAME: "Book A Pro Hero",
  APP_TAGLINE: "Be A Hero",

  // API Configuration (for future use)
  API_BASE_URL: process.env.EXPO_PUBLIC_API_URL || "https://api.bookapro.com",

  // OTP Configuration
  OTP_LENGTH: 6,
  OTP_TIMEOUT: 30, // seconds

  // Phone Configuration
  COUNTRY_CODE: "+91",
  PHONE_NUMBER_LENGTH: 10,
} as const;

export default Config;

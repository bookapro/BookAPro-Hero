// ============================================================================
// NOTIFICATIONS SERVICE - FUTURE API INTEGRATION
// ============================================================================
// This service will handle fetching ongoing and scheduled bookings for notifications
// Currently using mock data, but ready for real API integration

export interface NotificationBooking {
  id: string;
  bookingId: string;
  serviceName: string;
  serviceType: "offline" | "pickup";
  status: "ongoing" | "scheduled" | "completed" | "cancelled";
  scheduledTime?: string;
  estimatedArrival?: string;
  providerName?: string;
  providerPhone?: string;
  location: string;
  amount: number;
  paymentStatus: "paid" | "pending" | "cash_on_delivery";
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// MOCK DATA FOR DEVELOPMENT
// ============================================================================
const mockNotificationBookings: NotificationBooking[] = [
  {
    id: "1",
    bookingId: "BK1753249751406",
    serviceName: "Chef",
    serviceType: "offline",
    status: "ongoing",
    estimatedArrival: "15 mins",
    providerName: "Rajesh Kumar",
    providerPhone: "+91 98765 43210",
    location: "Hyderabad, Telangana, 500032",
    amount: 1500,
    paymentStatus: "cash_on_delivery",
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 mins ago
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    bookingId: "SCH1753249751407",
    serviceName: "House Cleaning",
    serviceType: "offline",
    status: "scheduled",
    scheduledTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
    location: "Hyderabad, Telangana, 500032",
    amount: 3000,
    paymentStatus: "pending",
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 hour ago
    updatedAt: new Date().toISOString(),
  },
];

// ============================================================================
// MOCK API FUNCTIONS (Replace with real API calls)
// ============================================================================

/**
 * Fetch ongoing and scheduled bookings for notifications
 * 🔧 FUTURE API: Replace with actual backend endpoint
 *
 * Real Implementation:
 * - GET /api/v1/bookings/notifications
 * - Include user authentication
 * - Filter by status (ongoing, scheduled)
 * - Sort by priority/time
 */
export const fetchNotificationBookings = async (): Promise<
  NotificationBooking[]
> => {
  console.log("🔔 [MOCK API] Fetching notification bookings:", {
    endpoint: "GET /api/v1/bookings/notifications",
    method: "GET",
  });

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Filter for active bookings only
  const activeBookings = mockNotificationBookings.filter(
    (booking) => booking.status === "ongoing" || booking.status === "scheduled"
  );

  console.log(
    "✅ [MOCK API] Notification bookings fetched:",
    activeBookings.length
  );
  return activeBookings;
};

/**
 * Fetch specific booking details for notification tap
 * 🔧 FUTURE API: Replace with actual backend endpoint
 *
 * Real Implementation:
 * - GET /api/v1/bookings/{bookingId}
 * - Return full booking details
 * - Include real-time status updates
 */
export const fetchBookingDetails = async (bookingId: string): Promise<any> => {
  console.log("🔔 [MOCK API] Fetching booking details:", {
    endpoint: `GET /api/v1/bookings/${bookingId}`,
    method: "GET",
    bookingId,
  });

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  // Find booking in mock data
  const booking = mockNotificationBookings.find(
    (b) => b.bookingId === bookingId
  );

  if (!booking) {
    throw new Error("Booking not found");
  }

  // Convert to booking confirmation format
  const bookingDetails = {
    id: booking.id,
    service: {
      id: booking.id,
      name: booking.serviceName,
      type: booking.serviceType,
    },
    pricing: {
      totalAmount: booking.amount,
      duration: "2 Hours", // Mock duration
    },
    userInfo: {
      name: "Current User", // Would come from auth context
      phoneNumber: "+919876543210", // Would come from auth context
      isAuthenticated: true,
      isVerified: true,
    },
    paymentMethod: {
      id:
        booking.paymentStatus === "cash_on_delivery"
          ? "cash_on_delivery"
          : "online_payment",
      name:
        booking.paymentStatus === "cash_on_delivery"
          ? "Cash/UPI on Delivery"
          : "Pay Online",
    },
    paymentFlow: {
      requiresOnlinePayment: booking.paymentStatus !== "cash_on_delivery",
      paymentStatus:
        booking.paymentStatus === "paid" ? "completed" : "confirmed",
      showPaymentButton: booking.paymentStatus === "pending",
    },
    location: {
      address: booking.location,
    },
    ...(booking.status === "scheduled" &&
      booking.scheduledTime && {
        scheduling: {
          isScheduled: true,
          date: new Date(booking.scheduledTime).toLocaleDateString(),
          timeSlot: new Date(booking.scheduledTime).toLocaleTimeString(),
          scheduledDateTime: booking.scheduledTime,
        },
      }),
    timestamp: booking.createdAt,
  };

  console.log("✅ [MOCK API] Booking details fetched for:", bookingId);
  return bookingDetails;
};

/**
 * Update booking status (for real-time updates)
 * 🔧 FUTURE API: Replace with actual backend endpoint
 */
export const updateBookingStatus = async (
  bookingId: string,
  status: NotificationBooking["status"]
): Promise<boolean> => {
  console.log("🔔 [MOCK API] Updating booking status:", {
    endpoint: `PUT /api/v1/bookings/${bookingId}/status`,
    method: "PUT",
    bookingId,
    status,
  });

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Update mock data
  const bookingIndex = mockNotificationBookings.findIndex(
    (b) => b.bookingId === bookingId
  );
  if (bookingIndex !== -1) {
    mockNotificationBookings[bookingIndex].status = status;
    mockNotificationBookings[bookingIndex].updatedAt = new Date().toISOString();
  }

  console.log("✅ [MOCK API] Booking status updated:", { bookingId, status });
  return true;
};

// ============================================================================
// NOTIFICATION HELPERS
// ============================================================================

/**
 * Get notification count for badge
 */
export const getNotificationCount = async (): Promise<number> => {
  const bookings = await fetchNotificationBookings();
  return bookings.length;
};

/**
 * Format notification message
 */
export const formatNotificationMessage = (
  booking: NotificationBooking
): string => {
  switch (booking.status) {
    case "ongoing":
      return `${booking.serviceName} service is on the way! ETA: ${booking.estimatedArrival}`;
    case "scheduled":
      const scheduledTime = booking.scheduledTime
        ? new Date(booking.scheduledTime)
        : null;
      if (scheduledTime) {
        const timeString = scheduledTime.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
        return `${booking.serviceName} scheduled for ${timeString}`;
      }
      return `${booking.serviceName} service scheduled`;
    default:
      return `${booking.serviceName} service update`;
  }
};

/**
 * Check if booking can be accessed from notifications
 */
export const canAccessBookingFromNotification = (
  booking: NotificationBooking
): boolean => {
  return booking.status === "ongoing" || booking.status === "scheduled";
};

// ============================================================================
// PRODUCTION MIGRATION GUIDE
// ============================================================================

/*
🚀 PRODUCTION MIGRATION CHECKLIST:

1. API ENDPOINTS:
   ✅ Replace fetchNotificationBookings with GET /api/v1/bookings/notifications
   ✅ Replace fetchBookingDetails with GET /api/v1/bookings/{bookingId}
   ✅ Replace updateBookingStatus with PUT /api/v1/bookings/{bookingId}/status
   ✅ Add proper authentication headers
   ✅ Handle API errors and network issues

2. REAL-TIME UPDATES:
   ✅ Implement WebSocket connection for live booking updates
   ✅ Add push notifications for booking status changes
   ✅ Set up background sync for offline scenarios

3. NOTIFICATION INTEGRATION:
   ✅ Integrate with React Native push notifications
   ✅ Handle notification taps to open booking details
   ✅ Add notification badges and counts

4. DATA MANAGEMENT:
   ✅ Implement proper caching strategy
   ✅ Add offline support with local storage
   ✅ Sync data when app comes back online

5. TESTING:
   ✅ Test notification flow end-to-end
   ✅ Test booking access from notifications
   ✅ Test real-time updates and status changes

Example Production Implementation:

// Real API call
export const fetchNotificationBookings = async (): Promise<NotificationBooking[]> => {
  const response = await fetch('/api/v1/bookings/notifications', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${getAuthToken()}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch notifications');
  }
  
  return await response.json();
};

// WebSocket for real-time updates
const setupBookingUpdates = (bookingId: string) => {
  const ws = new WebSocket(`wss://api.example.com/bookings/${bookingId}/updates`);
  
  ws.onmessage = (event) => {
    const update = JSON.parse(event.data);
    // Update booking status in real-time
    updateBookingStatus(bookingId, update.status);
  };
};
*/

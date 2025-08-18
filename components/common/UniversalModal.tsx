import { ThemedText } from "@/components/common/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors, FontFamily, Spacing } from "@/constants/Styles";
import React, { useState } from "react";
import {
  Alert,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Calendar } from "react-native-calendars";

const { width } = Dimensions.get("window");

// ============================================================================
// TYPES AND INTERFACES - SCHEDULE ONLY
// ============================================================================

export interface ScheduleData {
  date: string;
  timeSlot: string;
  scheduledDateTime: Date;
}

interface ScheduleModalProps {
  visible: boolean;
  onClose: () => void;
  serviceName: string;
  onSchedule: (scheduleData: ScheduleData) => void;
}

// ============================================================================
// TIME SLOTS FOR SCHEDULING
// ============================================================================

const timeSlots = [
  { label: "9:00 AM - 11:00 AM", value: "09:00-11:00", hour: 9 },
  { label: "11:00 AM - 1:00 PM", value: "11:00-13:00", hour: 11 },
  { label: "1:00 PM - 3:00 PM", value: "13:00-15:00", hour: 13 },
  { label: "3:00 PM - 5:00 PM", value: "15:00-17:00", hour: 15 },
  { label: "5:00 PM - 7:00 PM", value: "17:00-19:00", hour: 17 },
  { label: "7:00 PM - 9:00 PM", value: "19:00-21:00", hour: 19 },
];

// ============================================================================
// SCHEDULE MODAL COMPONENT - SCHEDULE ONLY
// ============================================================================

export function ScheduleModal(props: ScheduleModalProps) {
  // Schedule state
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("");

  // ============================================================================
  // SCHEDULE MODAL LOGIC
  // ============================================================================

  const handleSchedule = () => {
    if (!selectedDate || !selectedTimeSlot) {
      Alert.alert(
        "Incomplete Selection",
        "Please select both date and time slot."
      );
      return;
    }

    const selectedTime = timeSlots.find((t) => t.value === selectedTimeSlot);

    if (!selectedTime) {
      Alert.alert("Error", "Invalid time selection.");
      return;
    }

    // Create scheduled datetime
    const scheduledDateTime = new Date(selectedDate);
    scheduledDateTime.setHours(selectedTime.hour, 0, 0, 0);

    // Check if scheduled time is in the past
    const now = new Date();
    if (scheduledDateTime <= now) {
      Alert.alert("Invalid Time", "Please select a future date and time.");
      return;
    }

    // Format date for display
    const formattedDate = scheduledDateTime.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const scheduleData: ScheduleData = {
      date: formattedDate,
      timeSlot: selectedTime.label,
      scheduledDateTime,
    };

    props.onSchedule(scheduleData);
  };

  const resetScheduleSelection = () => {
    setSelectedDate("");
    setSelectedTimeSlot("");
  };

  const handleClose = () => {
    resetScheduleSelection();
    props.onClose();
  };

  // ============================================================================
  // RENDER SCHEDULE CONTENT
  // ============================================================================

  const today = new Date().toISOString().split("T")[0];
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30); // 30 days from today
  const maxDateString = maxDate.toISOString().split("T")[0];

  return (
    <Modal
      visible={props.visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <IconSymbol size={24} name="close" color={Colors.primary} />
          </TouchableOpacity>
          <ThemedText style={styles.title}>Schedule Service</ThemedText>
          <View style={styles.placeholder} />
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Date Selection with Calendar */}
          <View style={styles.section}>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              Select Date
            </ThemedText>
            <Calendar
              current={today}
              minDate={today}
              maxDate={maxDateString}
              onDayPress={(day: any) => {
                setSelectedDate(day.dateString);
              }}
              markedDates={{
                [selectedDate]: {
                  selected: true,
                  selectedColor: Colors.primary,
                },
              }}
              theme={{
                selectedDayBackgroundColor: Colors.primary,
                selectedDayTextColor: "#FFFFFF",
                todayTextColor: Colors.primary,
                dayTextColor: "#2d4150",
                textDisabledColor: "#d9e1e8",
                arrowColor: Colors.primary,
                monthTextColor: Colors.primary,
                textDayFontFamily: FontFamily.Montserrat,
                textMonthFontFamily: FontFamily.MontserratMedium,
                textDayHeaderFontFamily: FontFamily.Montserrat,
              }}
              style={styles.calendar}
            />
          </View>

          {/* Time Slot Selection */}
          <View style={styles.section}>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              Select Time Slot
            </ThemedText>
            <View style={styles.timeGrid}>
              {timeSlots.map((slot) => (
                <TouchableOpacity
                  key={slot.value}
                  style={[
                    styles.timeOption,
                    selectedTimeSlot === slot.value && styles.selectedOption,
                  ]}
                  onPress={() => setSelectedTimeSlot(slot.value)}
                >
                  <ThemedText
                    style={[
                      styles.timeText,
                      selectedTimeSlot === slot.value && styles.selectedText,
                    ]}
                  >
                    {slot.label}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Selected Summary */}
          {selectedDate && selectedTimeSlot && (
            <View style={styles.summary}>
              <ThemedText type="defaultSemiBold" style={styles.summaryTitle}>
                Scheduled For:
              </ThemedText>
              <View style={styles.summaryContent}>
                <View style={styles.summaryRow}>
                  <IconSymbol
                    size={16}
                    name="calendar-today"
                    color={Colors.primary}
                  />
                  <ThemedText style={styles.summaryText}>
                    {new Date(selectedDate).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}
                  </ThemedText>
                </View>
                <View style={styles.summaryRow}>
                  <IconSymbol
                    size={16}
                    name="access-time"
                    color={Colors.primary}
                  />
                  <ThemedText style={styles.summaryText}>
                    {timeSlots.find((t) => t.value === selectedTimeSlot)?.label}
                  </ThemedText>
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Bottom Actions */}
        <View style={styles.bottomActions}>
          <TouchableOpacity
            style={[
              styles.primaryButton,
              (!selectedDate || !selectedTimeSlot) && styles.disabledButton,
            ]}
            onPress={handleSchedule}
            disabled={!selectedDate || !selectedTimeSlot}
          >
            <ThemedText style={styles.primaryButtonText}>
              Schedule Service
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  closeButton: {
    padding: 8,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontFamily: FontFamily.MontserratBold,
    textAlign: "center",
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },

  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    marginBottom: 16,
    fontFamily: FontFamily.MontserratMedium,
  },
  calendar: {
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  timeGrid: {
    gap: 12,
  },
  timeOption: {
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
    borderRadius: 12,
    alignItems: "center",
  },
  selectedOption: {
    borderColor: Colors.primary,
    backgroundColor: `${Colors.primary}15`,
  },
  timeText: {
    fontSize: 14,
    fontFamily: FontFamily.Montserrat,
  },
  selectedText: {
    color: Colors.primary,
    fontFamily: FontFamily.MontserratMedium,
  },
  summary: {
    backgroundColor: `${Colors.primary}08`,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  summaryTitle: {
    marginBottom: 12,
    color: Colors.primary,
  },
  summaryContent: {
    gap: 8,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  summaryText: {
    fontSize: 14,
    fontFamily: FontFamily.Montserrat,
  },
  bottomActions: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.1)",
  },
  primaryButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 12,
  },
  disabledButton: {
    backgroundColor: "#CCCCCC",
  },
  primaryButtonText: {
    color: Colors.whiteColor,
    fontFamily: FontFamily.MontserratBold,
    fontSize: 16,
  },
});

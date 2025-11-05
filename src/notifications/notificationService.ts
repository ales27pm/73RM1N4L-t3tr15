import { Platform } from "react-native";
import { logDebug, logInfo } from "../utils/logger";
import type * as NotificationsType from "expo-notifications";

// Type imports don't cause runtime initialization
type Notifications = typeof NotificationsType;

let notificationHandlerConfigured = false;
let notificationsModule: Notifications | null = null;

/**
 * Lazy load expo-notifications to avoid NativeEventEmitter initialization errors
 * This ensures the module is only loaded after native modules are ready
 */
async function getNotifications(): Promise<Notifications> {
  if (notificationsModule) return notificationsModule;

  // Dynamic import to defer loading until first use
  notificationsModule = await import("expo-notifications");
  return notificationsModule;
}

/**
 * Initialize notification handler. This must be called after the app is mounted
 * to avoid NativeEventEmitter initialization errors.
 */
export const initializeNotificationHandler = async () => {
  if (notificationHandlerConfigured) return;

  const Notifications = await getNotifications();

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldShowBanner: true,
      shouldShowList: false,
      shouldPlaySound: false,
      shouldSetBadge: false,
      priority: Notifications.AndroidNotificationPriority.DEFAULT,
    }),
  });

  notificationHandlerConfigured = true;
};

export type NotificationSchedule = {
  hour: number;
  minute: number;
};

const REMINDER_IDENTIFIER = "daily_engagement_reminder";

export const requestNotificationPermissions = async () => {
  const Notifications = await getNotifications();

  const settings = await Notifications.getPermissionsAsync();
  if (settings.granted || settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) {
    logDebug("Notification permissions already granted", { context: "notifications" });
    return true;
  }

  const response = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowSound: true,
      allowBadge: false,
    },
  });

  const granted = response.granted || response.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
  logInfo(`Notification permission result: ${granted ? "granted" : "denied"}`, { context: "notifications" });
  return granted;
};

export const cancelScheduledReminders = async () => {
  const Notifications = await getNotifications();

  const schedules = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    schedules
      .filter((notification) => {
        const reminderTag = (notification.content as NotificationsType.NotificationContent | undefined)?.data?.reminderTag;
        return reminderTag === REMINDER_IDENTIFIER;
      })
      .map((notification) => Notifications.cancelScheduledNotificationAsync(notification.identifier)),
  );
  logDebug("Cleared scheduled reminders", { context: "notifications" });
};

const configureTrigger = async (schedule: NotificationSchedule): Promise<NotificationsType.DailyTriggerInput> => {
  const Notifications = await getNotifications();
  const hour = Math.min(23, Math.max(0, schedule.hour | 0));
  const minute = Math.min(59, Math.max(0, schedule.minute | 0));
  return {
    type: Notifications.SchedulableTriggerInputTypes.DAILY,
    hour,
    minute,
  };
};

export const scheduleDailyReminder = async (schedule: NotificationSchedule) => {
  const Notifications = await getNotifications();

  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) {
    throw new Error("Notification permission not granted");
  }

  await cancelScheduledReminders();

  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: "Time to drop blocks!",
      body: "Keep your streak alive by finishing a round today.",
      sound: Platform.OS === "ios" ? undefined : "default",
      data: { reminderTag: REMINDER_IDENTIFIER },
    },
    trigger: await configureTrigger(schedule),
  });

  logInfo(`Scheduled reminder ${identifier}`, { context: "notifications" });

  return identifier;
};

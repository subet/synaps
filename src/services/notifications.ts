import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#4361EE',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
}

export async function scheduleDailyReminder(hour: number, minute: number): Promise<string> {
  await cancelDailyReminder();

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Time to study! 📚',
      body: "Your cards are waiting for review. Keep your streak alive!",
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });

  return id;
}

export async function cancelDailyReminder(): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const notification of scheduled) {
    if (notification.content.title === 'Time to study! 📚') {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }
  }
}

export async function scheduleStreakAtRiskNotification(streakDays: number): Promise<void> {
  const today = new Date();
  const trigger = new Date(today);
  trigger.setHours(20, 0, 0, 0); // 8 PM

  if (trigger <= today) {
    // Already past 8 PM, skip
    return;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: `Don't break your ${streakDays}-day streak! 🔥`,
      body: 'Just a few cards — it only takes 2 minutes.',
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: trigger,
    },
  });
}

export async function scheduleWeeklyProgress(cardsThisWeek: number, sessionsThisWeek: number): Promise<void> {
  const nextSunday = new Date();
  const dayOfWeek = nextSunday.getDay();
  const daysUntilSunday = (7 - dayOfWeek) % 7 || 7;
  nextSunday.setDate(nextSunday.getDate() + daysUntilSunday);
  nextSunday.setHours(10, 0, 0, 0);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Your weekly recap 📊',
      body: `You studied ${cardsThisWeek} cards this week across ${sessionsThisWeek} sessions!`,
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: nextSunday,
    },
  });
}

export async function scheduleInactivityNudge(): Promise<void> {
  const threeDaysFromNow = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
  threeDaysFromNow.setHours(10, 0, 0, 0);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'We miss you! 👋',
      body: 'Your cards are piling up. Come back for a quick session.',
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: threeDaysFromNow,
    },
  });
}

export async function scheduleProExpiredWinBack(): Promise<void> {
  // 3 days after expiry: gentle nudge
  const threeDays = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
  threeDays.setHours(11, 0, 0, 0);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Your PRO access has ended',
      body: 'You still have your decks, but unlimited downloads and sync are paused. Come back to PRO!',
      sound: true,
      data: { type: 'win_back' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: threeDays,
    },
  });

  // 7 days after expiry: stronger nudge
  const sevenDays = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  sevenDays.setHours(11, 0, 0, 0);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'We saved your progress',
      body: 'All your study data is safe. Resubscribe to unlock unlimited access and pick up where you left off.',
      sound: true,
      data: { type: 'win_back_discount' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: sevenDays,
    },
  });
}

export async function cancelWinBackNotifications(): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const notification of scheduled) {
    const type = notification.content.data?.type;
    if (type === 'win_back' || type === 'win_back_discount') {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }
  }
}

export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function getBadgeCount(): Promise<number> {
  return await Notifications.getBadgeCountAsync();
}

export async function setBadgeCount(count: number): Promise<void> {
  await Notifications.setBadgeCountAsync(count);
}

import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { borderRadius, colors, spacing, typography } from '../../constants';
import { useTranslation } from '../../i18n';
import { logEvent } from '../../services/analytics';
import {
  requestNotificationPermissions,
  scheduleDailyReminder,
  scheduleInactivityNudge,
} from '../../services/notifications';
import { useAppStore } from '../../stores/useAppStore';

/** Current time rounded down to :00 or :30, as "HH:MM" — "tomorrow at this time". */
function reminderTimeNow(): string {
  const d = new Date();
  const h = d.getHours().toString().padStart(2, '0');
  return `${h}:${d.getMinutes() < 30 ? '00' : '30'}`;
}

/**
 * Asks for notification permission on the session-complete screen, once the
 * learner has actually studied — replaces the old onboarding permission step.
 * Shown until answered; never again after "Remind me" or "Maybe later".
 */
export function ReminderPrompt() {
  const { t } = useTranslation();
  const { notifications, reminderPromptDismissed, setNotificationTime, setNotificationsEnabled, dismissReminderPrompt } =
    useAppStore();
  const [time] = useState(reminderTimeNow);
  const [outcome, setOutcome] = useState<'ask' | 'enabled' | 'denied' | 'hidden'>('ask');
  const logged = useRef(false);

  const shouldAsk = outcome === 'ask' && !notifications.enabled && !reminderPromptDismissed;

  useEffect(() => {
    if (shouldAsk && !logged.current) {
      logged.current = true;
      logEvent('reminder_prompt_shown');
    }
  }, [shouldAsk]);

  if (outcome === 'hidden' || (outcome === 'ask' && !shouldAsk)) return null;

  const handleRemind = async () => {
    const granted = await requestNotificationPermissions();
    logEvent('reminder_prompt_choice', { choice: 'remind', granted });
    await dismissReminderPrompt();
    if (!granted) {
      setOutcome('denied');
      return;
    }
    await setNotificationTime(time);
    await setNotificationsEnabled(true);
    const [h, m] = time.split(':').map(Number);
    scheduleDailyReminder(h, m).catch(() => {});
    scheduleInactivityNudge().catch(() => {});
    setOutcome('enabled');
  };

  const handleLater = async () => {
    logEvent('reminder_prompt_choice', { choice: 'later', granted: false });
    await dismissReminderPrompt();
    setOutcome('hidden');
  };

  if (outcome !== 'ask') {
    return (
      <View style={styles.card}>
        {/* Row, not the card's column: `flex: 1` text in a column collapses to 0 height */}
        <View style={[styles.row, styles.center]}>
          <Ionicons
            name={outcome === 'enabled' ? 'checkmark-circle-outline' : 'notifications-off-outline'}
            size={22}
            color={outcome === 'enabled' ? colors.primary : colors.textSecondary}
          />
          <Text style={[styles.body, styles.flex, styles.noTopMargin]}>
            {outcome === 'enabled' ? t('reminder_prompt_enabled', { time }) : t('reminder_prompt_denied')}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.iconWrap}>
          <Ionicons name="notifications-outline" size={20} color={colors.primary} />
        </View>
        <View style={styles.flex}>
          <Text style={styles.title}>{t('reminder_prompt_title')}</Text>
          <Text style={styles.body}>{t('reminder_prompt_body', { time })}</Text>
        </View>
      </View>
      <View style={styles.actions}>
        <Pressable onPress={handleLater} style={styles.laterBtn} hitSlop={8}>
          <Text style={styles.laterText}>{t('maybe_later')}</Text>
        </Pressable>
        <Pressable onPress={handleRemind} style={styles.remindBtn}>
          <Text style={styles.remindText}>{t('reminder_prompt_yes')}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignSelf: 'stretch',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginTop: spacing.lg,
    flexDirection: 'column',
    gap: spacing.sm,
  },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex: { flex: 1 },
  center: { alignItems: 'center' },
  noTopMargin: { marginTop: 0 },
  title: { ...typography.bodyBold, color: colors.textPrimary },
  body: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: spacing.md },
  laterBtn: { paddingVertical: spacing.sm, paddingHorizontal: spacing.xs },
  laterText: { ...typography.bodyBold, color: colors.textSecondary },
  remindBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  remindText: { ...typography.bodyBold, color: colors.white },
});

import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { borderRadius, colors, spacing, typography } from '../../constants';
import { useTranslation } from '../../i18n';
import { logEvent } from '../../services/analytics';
import { useAppStore } from '../../stores/useAppStore';

/**
 * First-run tip ids. Each tip's text lives in i18n as `tip_<id>_title` /
 * `tip_<id>_body`; once dismissed it never shows again (AppSettings.seenTips).
 */
export type TipId = 'library_pick' | 'home_open_deck' | 'study_how' | 'study_rate' | 'leaderboard_how';

interface TipProps {
  id: TipId;
  /** Extra condition from the screen (e.g. "user has a deck"). */
  when?: boolean;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  style?: ViewStyle;
}

/** An inline, dismissible tip box. Opaque background — no elevation (Android). */
export function Tip({ id, when = true, icon = 'bulb-outline', style }: TipProps) {
  const { t } = useTranslation();
  const seen = useAppStore((s) => s.seenTips?.includes(id) ?? false);
  const markTipSeen = useAppStore((s) => s.markTipSeen);
  const visible = when && !seen;
  const logged = useRef(false);

  useEffect(() => {
    if (visible && !logged.current) {
      logged.current = true;
      logEvent('tip_shown', { tip: id });
    }
  }, [visible, id]);

  if (!visible) return null;

  const dismiss = () => {
    logEvent('tip_dismissed', { tip: id });
    markTipSeen(id);
  };

  return (
    <View style={[styles.box, style]} accessibilityRole="summary">
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={18} color={colors.primary} />
      </View>
      <View style={styles.text}>
        <Text style={styles.title}>{t(`tip_${id}_title`)}</Text>
        <Text style={styles.body}>{t(`tip_${id}_body`)}</Text>
        <Pressable onPress={dismiss} hitSlop={8} style={styles.okBtn}>
          <Text style={styles.okText}>{t('tip_got_it')}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1 },
  title: { ...typography.bodyBold, color: colors.textPrimary },
  body: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  okBtn: { alignSelf: 'flex-end', marginTop: spacing.sm, paddingVertical: 2 },
  okText: { ...typography.bodyBold, color: colors.primary },
});

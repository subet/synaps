import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { borderRadius, colors, spacing, typography } from '../../constants';
import { useTranslation } from '../../i18n';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function ScoreRulesModal({ visible, onClose }: Props) {
  const { t } = useTranslation();
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        {/* Handle */}
        <View style={styles.handle} />

        <View style={styles.header}>
          <Text style={styles.title}>{t('score_rules_title')}</Text>
          <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={8}>
            <Ionicons name="close" size={22} color={colors.textSecondary} />
          </Pressable>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <Text style={styles.intro}>{t('score_rules_intro')}</Text>

          <SectionTitle title={t('score_rules_per_card_section')} />
          <RuleRow icon="layers-outline" label="+1" description={t('score_rules_per_card_1')} />
          <RuleRow icon="checkmark-circle-outline" label="+2" description={t('score_rules_per_card_2')} color={colors.goodText} />

          <SectionTitle title={t('score_rules_daily_section')} />
          <RuleRow icon="flag-outline" label="+10" description={t('score_rules_daily_goal')} color="#7C3AED" />
          <RuleRow icon="flame-outline" label="+5" description={t('score_rules_streak_bonus')} color={colors.streakText} />

          <SectionTitle title={t('score_rules_milestone_section')} />
          <RuleRow icon="star-outline" label="+20" description={t('score_rules_milestone')} color={colors.streakGold} />

          <SectionTitle title={t('score_rules_cap_section')} />
          <Text style={styles.capNote}>{t('score_rules_cap_note')}</Text>
          <CapRow label={t('score_rules_cap_first')} multiplier={`1× ${t('score_rules_cap_points')}`} />
          <CapRow label={t('score_rules_cap_next')} multiplier={`½× ${t('score_rules_cap_points')}`} />
          <CapRow label={t('score_rules_cap_after')} multiplier={`¼× ${t('score_rules_cap_points')}`} />

          <SectionTitle title={t('score_rules_tie_section')} />
          <Text style={styles.capNote}>{t('score_rules_tie_note')}</Text>
          <View style={styles.tieList}>
            <Text style={styles.tieItem}>{t('score_rules_tie_1')}</Text>
            <Text style={styles.tieItem}>{t('score_rules_tie_2')}</Text>
            <Text style={styles.tieItem}>{t('score_rules_tie_3')}</Text>
          </View>

          <View style={styles.footer}>
            <Ionicons name="lock-closed-outline" size={14} color={colors.textMuted} />
            <Text style={styles.footerText}>{t('score_rules_private_note')}</Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

function RuleRow({
  icon,
  label,
  description,
  color,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  description: string;
  color?: string;
}) {
  return (
    <View style={styles.ruleRow}>
      <Ionicons name={icon} size={18} color={color ?? colors.primary} style={styles.ruleIcon} />
      <Text style={[styles.ruleLabel, color ? { color } : null]}>{label}</Text>
      <Text style={styles.ruleDesc}>{description}</Text>
    </View>
  );
}

function CapRow({ label, multiplier }: { label: string; multiplier: string }) {
  return (
    <View style={styles.capRow}>
      <Text style={styles.capLabel}>{label}</Text>
      <View style={styles.capBadge}>
        <Text style={styles.capBadgeText}>{multiplier}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '80%',
    paddingBottom: spacing.xxl,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
    flex: 1,
  },
  closeBtn: {
    padding: 4,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  intro: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 22,
  },
  sectionTitle: {
    ...typography.captionBold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  ruleIcon: {
    width: 24,
  },
  ruleLabel: {
    ...typography.bodyBold,
    color: colors.primary,
    width: 36,
  },
  ruleDesc: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
  capNote: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  capRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  capLabel: {
    ...typography.caption,
    color: colors.textPrimary,
  },
  capBadge: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  capBadgeText: {
    ...typography.smallBold,
    color: colors.textSecondary,
  },
  tieList: {
    gap: 4,
    marginTop: 2,
  },
  tieItem: {
    ...typography.caption,
    color: colors.textPrimary,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: spacing.lg,
    backgroundColor: colors.surfaceAlt,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  footerText: {
    ...typography.small,
    color: colors.textMuted,
    flex: 1,
    lineHeight: 18,
  },
});

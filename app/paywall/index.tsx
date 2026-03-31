import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Stack } from 'expo-router';
import { borderRadius, colors, spacing, typography } from '../../src/constants';
import { useTranslation } from '../../src/i18n';
import { useAppStore } from '../../src/stores/useAppStore';
import { useSubscriptionStore } from '../../src/stores/useSubscriptionStore';

const PRO_FEATURE_KEYS = [
  'unlimited_downloads',
  'unlimited_cards',
  'cloud_sync',
  'audio_cards',
  'advanced_insights',
  'no_ads',
  'priority_support',
  'offline_study',
  'custom_styling',
] as const;

const PLANS = [
  { key: 'weekly',   labelKey: 'weekly',   price: '$1.99',  periodKey: 'per_week',         savingsPercent: null, popular: false, bestValue: false },
  { key: 'monthly',  labelKey: 'monthly',  price: '$4.99',  periodKey: 'per_month',        savingsPercent: null, popular: true,  bestValue: false },
  { key: 'annual',   labelKey: 'annual',   price: '$29.99', periodKey: 'per_year',         savingsPercent: 50,   popular: false, bestValue: true  },
  { key: 'lifetime', labelKey: 'lifetime', price: '$49.99', periodKey: 'one_time_payment', savingsPercent: null, popular: false, bestValue: false },
];

export default function PaywallScreen() {
  const { t } = useTranslation();
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const { offerings, loadOfferings, purchase, restore, isLoading, isPro } = useSubscriptionStore();
  const { hasSeenOnboarding } = useAppStore();
  const inOnboarding = !hasSeenOnboarding;

  useEffect(() => {
    loadOfferings();
  }, []);

  useEffect(() => {
    if (isPro && !inOnboarding) router.back();
    if (isPro && inOnboarding) router.replace('/auth/register');
  }, [isPro]);

  const goNext = () => router.replace(inOnboarding ? '/auth/register' : '/(tabs)');

  const handleSubscribe = async () => {
    if (!offerings) {
      Alert.alert(t('error'), t('offers_load_failed'));
      return;
    }
    try {
      const pkg = offerings.availablePackages?.find((p: any) =>
        p.product.identifier.includes(selectedPlan)
      );
      if (!pkg) {
        Alert.alert(t('error'), t('plan_unavailable'));
        return;
      }
      const success = await purchase(pkg);
      if (success) {
        Alert.alert(t('welcome_pro_title'), t('welcome_pro_message'), [
          { text: t('get_started'), onPress: goNext },
        ]);
      }
    } catch (e: any) {
      if (!e.message?.includes('cancelled')) {
        Alert.alert(t('purchase_failed'), t('please_try_again') ?? 'Please try again.');
      }
    }
  };

  const handleRestore = async () => {
    const success = await restore();
    if (success) {
      Alert.alert(t('restored_title'), t('restored_message'), [
        { text: t('done'), onPress: goNext },
      ]);
    } else {
      Alert.alert(t('no_purchases_title'), t('no_purchases_message'));
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      {inOnboarding && <Stack.Screen options={{ gestureEnabled: false }} />}
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Close button — hidden during onboarding */}
        {!inOnboarding && (
          <Pressable style={styles.closeBtn} onPress={() => router.back()}>
            <Ionicons name="close" size={22} color={colors.textSecondary} />
          </Pressable>
        )}

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerEmoji}>⚡</Text>
          <Text style={styles.title}>{t('unlock_pro')}</Text>
          <Text style={styles.subtitle}>{t('paywall_subtitle')}</Text>
        </View>

        {/* Features */}
        <View style={styles.featuresCard}>
          {PRO_FEATURE_KEYS.map((key) => (
            <View key={key} style={styles.featureRow}>
              <Text style={styles.checkmark}>✅</Text>
              <Text style={styles.featureText}>{t(`pro_features.${key}`)}</Text>
            </View>
          ))}
        </View>

        {/* Plans */}
        <View style={styles.plansContainer}>
          {PLANS.map((plan) => (
            <Pressable
              key={plan.key}
              style={[styles.planCard, selectedPlan === plan.key && styles.planCardSelected]}
              onPress={() => setSelectedPlan(plan.key)}
            >
              <View style={styles.planLeft}>
                <View style={styles.radioOuter}>
                  {selectedPlan === plan.key && <View style={styles.radioInner} />}
                </View>
                <View>
                  <Text style={[styles.planLabel, selectedPlan === plan.key && styles.planLabelSelected]}>
                    {t(plan.labelKey)}
                  </Text>
                  {plan.popular && (
                    <View style={styles.popularBadge}>
                      <Text style={styles.popularBadgeText}>{t('most_popular')}</Text>
                    </View>
                  )}
                  {plan.bestValue && (
                    <View style={[styles.popularBadge, styles.bestValueBadge]}>
                      <Text style={styles.popularBadgeText}>{t('best_value')}</Text>
                    </View>
                  )}
                </View>
              </View>
              <View style={styles.planRight}>
                {plan.savingsPercent !== null && (
                  <View style={styles.savingsBadge}>
                    <Text style={styles.savingsBadgeText}>{t('save_badge', { percent: plan.savingsPercent })}</Text>
                  </View>
                )}
                <Text style={[styles.planPrice, selectedPlan === plan.key && styles.planPriceSelected]}>
                  {plan.price}
                </Text>
                <Text style={styles.planPeriod}>{t(plan.periodKey)}</Text>
              </View>
            </Pressable>
          ))}
        </View>

        {/* Subscribe button */}
        <Pressable
          style={[styles.subscribeBtn, isLoading && styles.subscribeBtnDisabled]}
          onPress={handleSubscribe}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.subscribeBtnText}>
              {selectedPlan === 'lifetime' ? t('buy_lifetime') : t('start_free_trial')}
            </Text>
          )}
        </Pressable>

        {/* Restore */}
        <Pressable onPress={handleRestore} style={styles.restoreBtn}>
          <Text style={styles.restoreText}>{t('restore_purchases')}</Text>
        </Pressable>

        <Text style={styles.finePrint}>{t('paywall_fine_print')}</Text>

        {inOnboarding && (
          <Pressable onPress={goNext} style={styles.restoreBtn}>
            <Text style={styles.restoreText}>{t('paywall_skip')}</Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: 40 },
  closeBtn: { alignSelf: 'flex-start', padding: spacing.sm, marginBottom: spacing.sm },
  header: { alignItems: 'center', marginBottom: spacing.xl },
  headerEmoji: { fontSize: 56, marginBottom: spacing.md },
  title: { ...typography.h1, color: colors.textPrimary, textAlign: 'center', marginBottom: spacing.sm },
  subtitle: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
  featuresCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  featureRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  checkmark: { fontSize: 16, marginRight: spacing.sm },
  featureText: { ...typography.body, color: colors.textPrimary, flex: 1 },
  plansContainer: { gap: spacing.sm, marginBottom: spacing.lg },
  planCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
  },
  planCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  planLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.primary },
  planLabel: { ...typography.bodyBold, color: colors.textPrimary },
  planLabelSelected: { color: colors.primary },
  popularBadge: { backgroundColor: colors.primary, borderRadius: borderRadius.full, paddingHorizontal: spacing.xs, paddingVertical: 1, alignSelf: 'flex-start', marginTop: 2 },
  bestValueBadge: { backgroundColor: colors.learning },
  popularBadgeText: { ...typography.small, color: colors.white, fontWeight: '600' },
  planRight: { alignItems: 'flex-end' },
  savingsBadge: { backgroundColor: '#E8FFE8', borderRadius: borderRadius.full, paddingHorizontal: spacing.sm, paddingVertical: 2, marginBottom: 2 },
  savingsBadgeText: { ...typography.small, color: colors.goodText, fontWeight: '600' },
  planPrice: { ...typography.h3, color: colors.textPrimary },
  planPriceSelected: { color: colors.primary },
  planPeriod: { ...typography.small, color: colors.textMuted },
  subscribeBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  subscribeBtnDisabled: { opacity: 0.6 },
  subscribeBtnText: { ...typography.button, color: colors.white, fontSize: 18 },
  restoreBtn: { alignItems: 'center', paddingVertical: spacing.sm, marginBottom: spacing.md },
  restoreText: { ...typography.body, color: colors.primary },
  finePrint: { ...typography.small, color: colors.textMuted, textAlign: 'center', lineHeight: 18 },
});

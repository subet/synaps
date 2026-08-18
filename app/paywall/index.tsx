import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useRef, useState } from 'react';
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
import { PACKAGE_TYPE, PurchasesPackage } from 'react-native-purchases';
import { borderRadius, colors, spacing, typography } from '../../src/constants';
import { useTranslation } from '../../src/i18n';
import { logEvent } from '../../src/services/analytics';
import { useAppStore } from '../../src/stores/useAppStore';
import { useSubscriptionStore } from '../../src/stores/useSubscriptionStore';
import {
  computeAnnualSavingsPercent,
  getTrialDays,
  getTrialEligibilityIOS,
} from '../../src/utils/paywallPricing';

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

// Static plan config: labels & badges only. All pricing/trial data comes from the SDK.
const PLAN_CONFIG = [
  { key: 'weekly',   packageType: PACKAGE_TYPE.WEEKLY,   titleKey: 'plan_title_weekly',   periodKey: 'per_week',         popular: false, bestValue: false },
  { key: 'monthly',  packageType: PACKAGE_TYPE.MONTHLY,  titleKey: 'plan_title_monthly',  periodKey: 'per_month',        popular: true,  bestValue: false },
  { key: 'annual',   packageType: PACKAGE_TYPE.ANNUAL,   titleKey: 'plan_title_annual',   periodKey: 'per_year',         popular: false, bestValue: true  },
  { key: 'lifetime', packageType: PACKAGE_TYPE.LIFETIME, titleKey: 'plan_title_lifetime', periodKey: 'one_time_payment', popular: false, bestValue: false },
] as const;

type PlanKey = (typeof PLAN_CONFIG)[number]['key'];

interface PlanViewModel {
  key: PlanKey;
  titleKey: string;
  periodKey: string;
  popular: boolean;
  bestValue: boolean;
  pkg: PurchasesPackage | null;
  priceString: string | null;
  trialDays: number | null;
  savingsPercent: number | null;
}

export default function PaywallScreen() {
  const { t } = useTranslation();
  const [selectedPlan, setSelectedPlan] = useState<PlanKey>('monthly');
  const [iosEligibleIds, setIosEligibleIds] = useState<Set<string> | null>(null);
  const { offerings, loadOfferings, purchase, restore, isLoading, isPro, wasPro } = useSubscriptionStore();
  const { hasSeenOnboarding } = useAppStore();
  const { onboarding, source } = useLocalSearchParams<{ onboarding?: string; source?: string }>();
  const inOnboarding = !hasSeenOnboarding || onboarding === '1';
  const isWinback = wasPro && !inOnboarding;
  const viewLogged = useRef(false);

  useEffect(() => {
    loadOfferings();
  }, []);

  useEffect(() => {
    // During onboarding, always show paywall even if already PRO
    if (inOnboarding) return;
    if (isPro) router.back();
  }, [isPro]);

  // iOS: trial wording is gated on store eligibility (previous subscribers are
  // ineligible). Android needs no check — Play omits the free-trial option itself.
  useEffect(() => {
    if (!offerings) return;
    const productIds = (offerings.availablePackages ?? []).map(
      (p: PurchasesPackage) => p.product.identifier
    );
    getTrialEligibilityIOS(productIds).then(setIosEligibleIds);
  }, [offerings]);

  const plans: PlanViewModel[] = useMemo(() => {
    const packages: PurchasesPackage[] = offerings?.availablePackages ?? [];
    const byKey = (cfg: (typeof PLAN_CONFIG)[number]): PurchasesPackage | undefined =>
      packages.find((p) => p.packageType === cfg.packageType) ??
      packages.find((p) => p.product.identifier.includes(cfg.key));

    const annualPkg = byKey(PLAN_CONFIG[2]);
    const monthlyPkg = byKey(PLAN_CONFIG[1]);
    const savings = computeAnnualSavingsPercent(annualPkg, monthlyPkg);

    return PLAN_CONFIG.map((cfg) => {
      const pkg = byKey(cfg) ?? null;
      let trialDays: number | null = null;
      if (pkg) {
        trialDays = getTrialDays(pkg);
        // iosEligibleIds is null on Android (no gating needed) and a Set on iOS.
        if (trialDays !== null && iosEligibleIds && !iosEligibleIds.has(pkg.product.identifier)) {
          trialDays = null;
        }
      }
      return {
        key: cfg.key,
        titleKey: cfg.titleKey,
        periodKey: cfg.periodKey,
        popular: cfg.popular,
        bestValue: cfg.bestValue,
        pkg,
        priceString: pkg?.product.priceString ?? null,
        trialDays,
        savingsPercent: cfg.key === 'annual' ? savings : null,
      };
    });
  }, [offerings, iosEligibleIds]);

  // Fire paywall_view once per presentation, after trial data has resolved.
  useEffect(() => {
    if (viewLogged.current || !offerings) return;
    viewLogged.current = true;
    logEvent('paywall_view', {
      source: source ?? 'unknown',
      variant: isWinback ? 'winback' : 'normal',
      trial_available: plans.some((p) => p.trialDays !== null),
    });
  }, [offerings, plans]);

  const selected = plans.find((p) => p.key === selectedPlan);

  const goNext = () => router.replace(inOnboarding ? '/auth/register' : '/(tabs)');

  const handleSubscribe = async () => {
    if (!offerings) {
      Alert.alert(t('error'), t('offers_load_failed'));
      return;
    }
    const pkg = selected?.pkg;
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

  const ctaLabel = () => {
    if (selectedPlan === 'lifetime') return t('buy_lifetime');
    if (selected?.trialDays) return t('cta_start_trial', { n: selected.trialDays });
    return t('subscribe_now');
  };

  return (
    <SafeAreaView style={styles.safe}>
      {inOnboarding && <Stack.Screen options={{ gestureEnabled: false }} />}
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Close button — skips to next step during onboarding, goes back otherwise */}
        <Pressable style={styles.closeBtn} onPress={() => inOnboarding ? goNext() : router.back()}>
          <Ionicons name="close" size={22} color={colors.textSecondary} />
        </Pressable>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerEmoji}>{isWinback ? '👋' : '⚡'}</Text>
          <Text style={styles.title}>{isWinback ? t('winback_title') : t('unlock_pro')}</Text>
          <Text style={styles.subtitle}>{isWinback ? t('winback_subtitle') : t('paywall_subtitle')}</Text>
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
          {plans.map((plan) => (
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
                    {t(plan.titleKey)}
                  </Text>
                  {plan.trialDays !== null && (
                    <View style={styles.trialBadge}>
                      <Text style={styles.trialBadgeText}>{t('trial_badge', { n: plan.trialDays })}</Text>
                    </View>
                  )}
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
                  {plan.priceString ?? '—'}
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
            <Text style={styles.subscribeBtnText}>{ctaLabel()}</Text>
          )}
        </Pressable>

        {/* Trial summary under CTA, e.g. "7 days free, then ¥3,000/year" */}
        {selected?.trialDays != null && selected.priceString && (
          <Text style={styles.trialCaption}>
            {t('trial_then_price', {
              n: selected.trialDays,
              price: selected.priceString,
              period: t(selected.periodKey),
            })}
          </Text>
        )}

        {/* Restore */}
        <Pressable onPress={handleRestore} style={styles.restoreBtn}>
          <Text style={styles.restoreText}>{t('restore_purchases')}</Text>
        </Pressable>

        <Text style={styles.finePrint}>
          {selected?.trialDays != null
            ? t('footer_renewal_with_trial', { n: selected.trialDays })
            : t('paywall_fine_print')}
        </Text>

        <View style={styles.legalLinks}>
          <Pressable onPress={() => router.push('/legal/terms')}>
            <Text style={styles.legalLinkText}>{t('terms_of_use')}</Text>
          </Pressable>
          <Text style={styles.legalSeparator}>|</Text>
          <Pressable onPress={() => router.push('/legal/privacy')}>
            <Text style={styles.legalLinkText}>{t('privacy')}</Text>
          </Pressable>
        </View>

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
  trialBadge: { backgroundColor: '#E8FFE8', borderRadius: borderRadius.full, paddingHorizontal: spacing.xs, paddingVertical: 1, alignSelf: 'flex-start', marginTop: 2 },
  trialBadgeText: { ...typography.small, color: colors.goodText, fontWeight: '600' },
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
  trialCaption: { ...typography.small, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.sm },
  restoreBtn: { alignItems: 'center', paddingVertical: spacing.sm, marginBottom: spacing.md },
  restoreText: { ...typography.body, color: colors.primary },
  finePrint: { ...typography.small, color: colors.textMuted, textAlign: 'center', lineHeight: 18 },
  legalLinks: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: spacing.sm, marginBottom: spacing.md, gap: spacing.sm },
  legalLinkText: { ...typography.small, color: colors.primary, fontWeight: '600' },
  legalSeparator: { ...typography.small, color: colors.textMuted },
});

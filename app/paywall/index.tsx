import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
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
import { borderRadius, colors, spacing, typography } from '../../src/constants';
import { useSubscriptionStore } from '../../src/stores/useSubscriptionStore';

const PRO_FEATURES = [
  'Unlimited deck downloads from Library',
  'Unlimited cards per deck',
  'Cloud sync across devices',
  'Audio on cards',
  'Advanced insights',
  'No ads',
  'Priority support',
  'Offline study mode',
  'Custom card styling',
];

const PLANS = [
  { key: 'weekly', label: 'Weekly', price: '$1.99', period: '/week', savings: null },
  { key: 'monthly', label: 'Monthly', price: '$4.99', period: '/month', savings: null, popular: true },
  { key: 'annual', label: 'Annual', price: '$29.99', period: '/year', savings: 'Save 50%', bestValue: true },
  { key: 'lifetime', label: 'Lifetime', price: '$49.99', period: ' one-time', savings: null },
];

export default function PaywallScreen() {
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const { offerings, loadOfferings, purchase, restore, isLoading, isPro } = useSubscriptionStore();

  useEffect(() => {
    loadOfferings();
  }, []);

  useEffect(() => {
    if (isPro) {
      router.back();
    }
  }, [isPro]);

  const handleSubscribe = async () => {
    if (!offerings) {
      Alert.alert('Error', 'Could not load subscription options. Please try again.');
      return;
    }

    try {
      const pkg = offerings.availablePackages?.find((p: any) =>
        p.product.identifier.includes(selectedPlan)
      );

      if (!pkg) {
        Alert.alert('Error', 'Selected plan is not available.');
        return;
      }

      const success = await purchase(pkg);
      if (success) {
        Alert.alert('Welcome to PRO! 🎉', 'You now have access to all features.', [
          { text: 'Get Started', onPress: () => router.back() },
        ]);
      }
    } catch (e: any) {
      if (!e.message?.includes('cancelled')) {
        Alert.alert('Purchase Failed', 'Please try again.');
      }
    }
  };

  const handleRestore = async () => {
    const success = await restore();
    if (success) {
      Alert.alert('Restored!', 'Your PRO subscription has been restored.');
    } else {
      Alert.alert('No Purchases Found', 'We could not find any previous purchases.');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Close button */}
        <Pressable style={styles.closeBtn} onPress={() => router.back()}>
          <Text style={styles.closeText}>✕</Text>
        </Pressable>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerEmoji}>⚡</Text>
          <Text style={styles.title}>Unlock Synaps PRO</Text>
          <Text style={styles.subtitle}>Supercharge your learning with unlimited access</Text>
        </View>

        {/* Features */}
        <View style={styles.featuresCard}>
          {PRO_FEATURES.map((feature) => (
            <View key={feature} style={styles.featureRow}>
              <Text style={styles.checkmark}>✅</Text>
              <Text style={styles.featureText}>{feature}</Text>
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
                    {plan.label}
                  </Text>
                  {plan.popular && (
                    <View style={styles.popularBadge}>
                      <Text style={styles.popularBadgeText}>Most Popular</Text>
                    </View>
                  )}
                  {plan.bestValue && (
                    <View style={[styles.popularBadge, styles.bestValueBadge]}>
                      <Text style={styles.popularBadgeText}>Best Value</Text>
                    </View>
                  )}
                </View>
              </View>
              <View style={styles.planRight}>
                {plan.savings && (
                  <View style={styles.savingsBadge}>
                    <Text style={styles.savingsBadgeText}>{plan.savings}</Text>
                  </View>
                )}
                <Text style={[styles.planPrice, selectedPlan === plan.key && styles.planPriceSelected]}>
                  {plan.price}
                </Text>
                <Text style={styles.planPeriod}>{plan.period}</Text>
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
              {selectedPlan === 'lifetime' ? 'Buy Lifetime Access' : 'Start Free Trial'}
            </Text>
          )}
        </Pressable>

        {/* Restore */}
        <Pressable onPress={handleRestore} style={styles.restoreBtn}>
          <Text style={styles.restoreText}>Restore Purchases</Text>
        </Pressable>

        <Text style={styles.finePrint}>
          Cancel anytime. Subscription auto-renews unless cancelled at least 24 hours before the end of the current period.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: 40 },
  closeBtn: { alignSelf: 'flex-start', padding: spacing.sm, marginBottom: spacing.sm },
  closeText: { fontSize: 20, color: colors.textSecondary },
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

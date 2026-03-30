import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { borderRadius, colors, spacing, typography } from '../../src/constants';

const LAST_UPDATED = '30 March 2026';

const SECTIONS = [
  {
    title: '1. Who We Are',
    body: `This Privacy Policy is provided by Mudimedia Ltd, a company registered in England and Wales, London, United Kingdom ("we", "us", "our"). We are the data controller for personal data collected through the Synaps application.\n\nContact: synaps@mudimedia.co.uk`,
  },
  {
    title: '2. What Data We Collect',
    body: `We collect the minimum data necessary to provide the service:\n\n• Account data: email address, when you choose to create an account.\n• Usage data: study session counts, streak data, and card review history — stored locally on your device.\n• Device data: device type and OS version, collected anonymously for crash reporting.\n• Purchase data: subscription status, processed by Apple or Google. We do not receive your payment card details.`,
  },
  {
    title: '3. How We Use Your Data',
    body: `We use your data to:\n• Provide and improve the Synaps service.\n• Restore your account and study progress when you sign in on a new device (PRO).\n• Send study reminder notifications (only if you enable this feature).\n• Diagnose crashes and fix bugs.\n\nWe do not use your data for advertising or sell it to third parties.`,
  },
  {
    title: '4. Data Storage & Security',
    body: `Your flashcards, decks, and study history are stored locally on your device using SQLite. This data does not leave your device unless you enable cloud sync (PRO), in which case it is encrypted in transit using TLS and stored in Supabase infrastructure located in the EU.\n\nWe implement appropriate technical and organisational measures to protect your data against unauthorised access, loss, or disclosure.`,
  },
  {
    title: '5. Third-Party Services',
    body: `We use the following third-party services:\n\n• Supabase — authentication and cloud storage (EU region)\n• RevenueCat — subscription management (does not receive card details)\n• Apple / Google — payment processing for subscriptions\n\nEach third party has its own privacy policy. We recommend reviewing them if you have concerns.`,
  },
  {
    title: '6. Your Rights',
    body: `Under UK GDPR and the Data Protection Act 2018, you have the right to:\n• Access the personal data we hold about you.\n• Correct inaccurate data.\n• Request deletion of your data ("right to be forgotten").\n• Object to or restrict certain processing.\n• Data portability.\n\nTo exercise any of these rights, contact us at synaps@mudimedia.co.uk. We will respond within 30 days.`,
  },
  {
    title: '7. Data Retention',
    body: `We retain your account data for as long as your account is active. If you delete your account, all associated data is removed within 30 days.\n\nLocal data stored on your device is under your control and can be deleted at any time via Settings → Delete all data.`,
  },
  {
    title: '8. Children\'s Privacy',
    body: `Synaps is not directed at children under the age of 13. We do not knowingly collect personal data from children under 13. If you believe a child has provided us with personal data, please contact us and we will delete it promptly.`,
  },
  {
    title: '9. Cookies & Tracking',
    body: `The Synaps mobile app does not use cookies. We do not track your activity across third-party apps or websites.`,
  },
  {
    title: '10. Changes to This Policy',
    body: `We may update this Privacy Policy from time to time. Material changes will be communicated within the App. Continued use of the App after such notification constitutes acceptance of the updated policy.`,
  },
  {
    title: '11. Contact & Complaints',
    body: `For privacy-related enquiries, contact:\n\nMudimedia Ltd\nLondon, United Kingdom\nsynaps@mudimedia.co.uk\n\nIf you are not satisfied with our response, you have the right to lodge a complaint with the Information Commissioner's Office (ICO) at ico.org.uk.`,
  },
];

export default function PrivacyScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Privacy Policy</Text>
        <Pressable onPress={() => router.back()} style={styles.closeBtn}>
          <Ionicons name="close" size={22} color={colors.textSecondary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.meta}>Mudimedia Ltd · Last updated {LAST_UPDATED}</Text>

        {SECTIONS.map((s) => (
          <View key={s.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{s.title}</Text>
            <Text style={styles.body}>{s.body}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: { ...typography.h2, color: colors.textPrimary, flex: 1 },
  closeBtn: { padding: spacing.sm },
  content: { padding: spacing.md, paddingBottom: 48 },
  meta: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  section: { marginBottom: spacing.lg },
  sectionTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  body: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
});

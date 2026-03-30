import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import React from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { borderRadius, colors, spacing, typography } from '../../src/constants';
import { tap } from '../../src/utils/haptics';
import { useAppStore } from '../../src/stores/useAppStore';

const SUPPORT_EMAIL = 'synaps@mudimedia.co.uk';

const FAQS_EN = [
  {
    q: 'How does spaced repetition work?',
    a: 'Synaps uses the SM-2 algorithm. Cards you find difficult appear more often; cards you know well appear less frequently. Over time, this schedules reviews just before you are likely to forget, making learning far more efficient than re-reading.',
  },
  {
    q: 'Why is my streak showing 0?',
    a: 'Your streak increments once you complete a full study session. Streaks carry a one-day grace period — if you studied yesterday but not yet today, your streak is preserved until the end of today.',
  },
  {
    q: 'Can I use Synaps offline?',
    a: 'Yes. All your decks and study sessions are stored locally on your device. An internet connection is only required for account sign-in, cloud sync (PRO), and downloading library decks.',
  },
  {
    q: 'How do I restore my PRO subscription?',
    a: 'Go to Settings → Manage Subscription and tap "Restore Purchases". Your subscription will be restored if it was purchased with the same App Store or Google Play account.',
  },
  {
    q: 'How do I delete my data?',
    a: 'Go to Settings → Delete all data. This removes all local decks, cards, and study history from your device. If you have cloud sync enabled, contact support to remove server-side data.',
  },
  {
    q: 'I found a bug — how do I report it?',
    a: `Email us at ${SUPPORT_EMAIL} with a description of what happened, your device model, and iOS/Android version. Screenshots are always helpful.`,
  },
];

const FAQS_TR = [
  {
    q: 'Aralıklı tekrar nasıl çalışır?',
    a: 'Synaps, SM-2 algoritmasını kullanır. Zor bulduğunuz kartlar daha sık görünür; iyi bildiğiniz kartlar daha seyrek çıkar. Zamanla bu sistem, unutmak üzere olduğunuz anda tekrarları planlar ve öğrenmeyi yeniden okumaktan çok daha verimli kılar.',
  },
  {
    q: 'Serim neden 0 gösteriyor?',
    a: 'Seriniz tam bir çalışma oturumu tamamladığınızda artar. Serilerde bir günlük tolerans süresi vardır — dün çalıştıysanız ancak bugün henüz çalışmadıysanız, seriniz günün sonuna kadar korunur.',
  },
  {
    q: 'Synaps\'ı çevrimdışı kullanabilir miyim?',
    a: 'Evet. Tüm desteleriniz ve çalışma oturumlarınız cihazınızda yerel olarak depolanır. İnternet bağlantısı yalnızca hesaba giriş, bulut senkronizasyonu (PRO) ve kütüphane destelerini indirmek için gereklidir.',
  },
  {
    q: 'PRO aboneliğimi nasıl geri yüklerim?',
    a: 'Ayarlar → Aboneliği Yönet\'e gidin ve "Satın Alımları Geri Yükle"ye dokunun. Aynı App Store veya Google Play hesabıyla satın alındıysa aboneliğiniz geri yüklenecektir.',
  },
  {
    q: 'Verilerimi nasıl silerim?',
    a: 'Ayarlar → Tüm verileri sil\'e gidin. Bu, cihazdaki tüm yerel desteleri, kartları ve çalışma geçmişini kaldırır. Bulut senkronizasyonu etkinse sunucu tarafındaki verileri kaldırmak için destek ekibiyle iletişime geçin.',
  },
  {
    q: 'Bir hata buldum — nasıl bildiririm?',
    a: `${SUPPORT_EMAIL} adresine ne olduğuna dair bir açıklama, cihaz modeliniz ve iOS/Android sürümünüzle birlikte e-posta gönderin. Ekran görüntüleri her zaman yardımcı olur.`,
  },
];

function ContactCard({
  icon,
  label,
  value,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.contactCard, pressed && styles.cardPressed]}
      onPress={() => { tap(); onPress(); }}
    >
      <View style={styles.contactIcon}>
        <Ionicons name={icon} size={20} color={colors.primary} />
      </View>
      <View style={styles.contactInfo}>
        <Text style={styles.contactLabel}>{label}</Text>
        <Text style={styles.contactValue}>{value}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
    </Pressable>
  );
}

export default function SupportScreen() {
  const language = useAppStore((s) => s.language);
  const isTR = language === 'tr';
  const FAQS = isTR ? FAQS_TR : FAQS_EN;

  const handleEmail = () => {
    Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=Synaps Support`).catch(() => {
      Alert.alert(
        isTR ? 'E-posta açılamıyor' : 'Cannot open email',
        isTR ? `Lütfen bize şu adresten e-posta gönderin: ${SUPPORT_EMAIL}` : `Please email us at ${SUPPORT_EMAIL}`
      );
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>{isTR ? 'Destek ile İletişim' : 'Contact Support'}</Text>
        <Pressable onPress={() => router.back()} style={styles.closeBtn}>
          <Ionicons name="close" size={22} color={colors.textSecondary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Contact options */}
        <Text style={styles.sectionLabel}>{isTR ? 'İLETİŞİME GEÇİN' : 'GET IN TOUCH'}</Text>
        <View style={styles.card}>
          <ContactCard
            icon="mail-outline"
            label={isTR ? 'E-posta Desteği' : 'Email Support'}
            value={SUPPORT_EMAIL}
            onPress={handleEmail}
          />
        </View>

        <Text style={styles.note}>
          {isTR
            ? "Mudimedia Ltd, Londra'da küçük bir ekibiz. 1-2 iş günü içinde yanıt vermeyi hedefliyoruz."
            : "We're a small team at Mudimedia Ltd, London. We aim to respond within 1–2 business days."}
        </Text>

        {/* FAQ */}
        <Text style={styles.sectionLabel}>{isTR ? 'SIK SORULAN SORULAR' : 'FREQUENTLY ASKED QUESTIONS'}</Text>
        <View style={styles.card}>
          {FAQS.map((faq, i) => (
            <View key={i} style={[styles.faqItem, i < FAQS.length - 1 && styles.faqBorder]}>
              <Text style={styles.faqQ}>{faq.q}</Text>
              <Text style={styles.faqA}>{faq.a}</Text>
            </View>
          ))}
        </View>

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
  sectionLabel: {
    ...typography.small,
    color: colors.textMuted,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  note: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    paddingHorizontal: 4,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  cardPressed: { opacity: 0.7 },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactInfo: { flex: 1 },
  contactLabel: { ...typography.bodyBold, color: colors.textPrimary },
  contactValue: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  faqItem: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  faqBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  faqQ: { ...typography.bodyBold, color: colors.textPrimary },
  faqA: { ...typography.body, color: colors.textSecondary, lineHeight: 20 },
});

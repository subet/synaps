import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { borderRadius, colors, spacing, typography } from '../../src/constants';
import { useAppStore } from '../../src/stores/useAppStore';

const LAST_UPDATED_EN = '30 March 2026';
const LAST_UPDATED_TR = '30 Mart 2026';

const SECTIONS_EN = [
  {
    title: '1. Acceptance of Terms',
    body: `By downloading, installing, or using Synaps ("the App"), you agree to be bound by these Terms and Conditions. If you do not agree, please do not use the App.\n\nThese Terms constitute a legally binding agreement between you and Mudimedia Ltd, a company registered in England and Wales ("we", "us", or "our").`,
  },
  {
    title: '2. Description of Service',
    body: `Synaps is a spaced-repetition flashcard application designed to help users memorise and retain information. The App operates primarily offline; an internet connection is only required for account creation, cloud sync (PRO), and library downloads.`,
  },
  {
    title: '3. User Accounts',
    body: `You may use Synaps without an account. If you choose to create one, you are responsible for maintaining the confidentiality of your credentials. You must provide accurate information and notify us immediately of any unauthorised access.\n\nYou must be at least 13 years old to create an account.`,
  },
  {
    title: '4. Subscriptions & Payments',
    body: `Synaps offers a free tier and a PRO subscription. PRO subscriptions are billed through Apple App Store or Google Play Store. Prices are displayed before purchase and may vary by region.\n\nSubscriptions auto-renew unless cancelled at least 24 hours before the end of the current period. You can manage or cancel your subscription in your device's account settings. No refunds are issued for partial subscription periods, except where required by applicable law.`,
  },
  {
    title: '5. User Content',
    body: `You retain ownership of any flashcard content you create. By using the App, you grant us a limited, non-exclusive licence to store and display your content solely for the purpose of providing the service to you.\n\nYou agree not to create content that is unlawful, harmful, defamatory, or infringing of third-party intellectual property rights.`,
  },
  {
    title: '6. Intellectual Property',
    body: `All App design, code, graphics, and pre-built library decks are the property of Mudimedia Ltd or its licensors and are protected by intellectual property laws. You may not copy, modify, distribute, or create derivative works without our prior written consent.`,
  },
  {
    title: '7. Disclaimer of Warranties',
    body: `The App is provided "as is" and "as available" without warranties of any kind, express or implied. We do not warrant that the App will be uninterrupted, error-free, or free of viruses or other harmful components.`,
  },
  {
    title: '8. Limitation of Liability',
    body: `To the fullest extent permitted by law, Mudimedia Ltd shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of or inability to use the App, even if we have been advised of the possibility of such damages.\n\nOur total liability to you for any claim shall not exceed the amount you paid us in the 12 months preceding the claim.`,
  },
  {
    title: '9. Governing Law',
    body: `These Terms are governed by the laws of England and Wales. Any disputes shall be subject to the exclusive jurisdiction of the courts of England and Wales.`,
  },
  {
    title: '10. Changes to Terms',
    body: `We may update these Terms from time to time. Material changes will be notified within the App. Continued use after notification constitutes acceptance of the updated Terms.`,
  },
  {
    title: '11. Contact',
    body: `For questions about these Terms, please contact:\n\nMudimedia Ltd\nLondon, United Kingdom\nsynaps@mudimedia.co.uk`,
  },
];

const SECTIONS_TR = [
  {
    title: '1. Koşulların Kabulü',
    body: `Synaps'ı ("Uygulama") indirerek, yükleyerek veya kullanarak bu Kullanım Koşullarına uymayı kabul etmiş olursunuz. Kabul etmiyorsanız lütfen Uygulamayı kullanmayın.\n\nBu Koşullar, siz ile İngiltere ve Galler'de kayıtlı bir şirket olan Mudimedia Ltd ("biz", "bize" veya "bizim") arasında hukuken bağlayıcı bir anlaşma oluşturmaktadır.`,
  },
  {
    title: '2. Hizmetin Tanımı',
    body: `Synaps, kullanıcıların bilgi ezberlemesine ve hatırlamasına yardımcı olmak için tasarlanmış aralıklı tekrar tabanlı bir flash kart uygulamasıdır. Uygulama esas olarak çevrimdışı çalışır; internet bağlantısı yalnızca hesap oluşturma, bulut senkronizasyonu (PRO) ve kütüphane indirmeleri için gereklidir.`,
  },
  {
    title: '3. Kullanıcı Hesapları',
    body: `Synaps'ı hesap olmadan kullanabilirsiniz. Hesap oluşturmayı tercih ederseniz, kimlik bilgilerinizin gizliliğini korumaktan sorumlusunuz. Doğru bilgi vermeniz ve yetkisiz erişim durumunda bizi derhal bilgilendirmeniz gerekmektedir.\n\nHesap oluşturmak için en az 13 yaşında olmanız gerekmektedir.`,
  },
  {
    title: '4. Abonelikler ve Ödemeler',
    body: `Synaps, ücretsiz bir plan ve PRO aboneliği sunmaktadır. PRO abonelikleri Apple App Store veya Google Play Store üzerinden faturalandırılır. Fiyatlar satın alma öncesinde gösterilir ve bölgeye göre değişebilir.\n\nAbonelikler, mevcut dönemin sona ermesinden en az 24 saat önce iptal edilmediği sürece otomatik olarak yenilenir. Aboneliğinizi cihazınızın hesap ayarlarından yönetebilir veya iptal edebilirsiniz. Yürürlükteki mevzuatın gerektirdiği durumlar dışında kısmi abonelik dönemleri için iade yapılmaz.`,
  },
  {
    title: '5. Kullanıcı İçeriği',
    body: `Oluşturduğunuz flash kart içeriğinin mülkiyeti size aittir. Uygulamayı kullanarak, içeriğinizi yalnızca size hizmet sunma amacıyla depolamamız ve görüntülememiz için bize sınırlı, münhasır olmayan bir lisans vermiş olursunuz.\n\nYasadışı, zararlı, iftira niteliğinde veya üçüncü tarafların fikri mülkiyet haklarını ihlal eden içerik oluşturmamayı kabul edersiniz.`,
  },
  {
    title: '6. Fikri Mülkiyet',
    body: `Tüm Uygulama tasarımı, kodu, grafikleri ve önceden hazırlanmış kütüphane desteleri, Mudimedia Ltd veya lisans verenlerinin mülkiyetinde olup fikri mülkiyet yasalarıyla korunmaktadır. Önceden yazılı iznimiz olmadan kopyalayamazsınız, değiştiremezsiniz, dağıtamazsınız veya türev eserler oluşturamazsınız.`,
  },
  {
    title: '7. Garanti Reddi',
    body: `Uygulama, açık veya zımni herhangi bir garanti olmaksızın "olduğu gibi" ve "mevcut olduğu şekilde" sunulmaktadır. Uygulamanın kesintisiz, hatasız veya virüs ya da zararlı bileşenlerden arınmış olacağını garanti etmiyoruz.`,
  },
  {
    title: '8. Sorumluluk Sınırlaması',
    body: `Yürürlükteki yasaların izin verdiği azami ölçüde, Mudimedia Ltd; Uygulamayı kullanmanızdan veya kullanamamanızdan kaynaklanan dolaylı, arızi, özel, sonuç doğurucu veya cezai zararlardan, bu tür zararların olasılığı hakkında bilgilendirilmiş olsa dahi sorumlu tutulamaz.\n\nHerhangi bir talep için size karşı toplam sorumluluğumuz, talepten önceki 12 ay içinde bize ödediğiniz tutarı aşmayacaktır.`,
  },
  {
    title: '9. Geçerli Hukuk',
    body: `Bu Koşullar, İngiltere ve Galler hukukuna tabidir. Tüm anlaşmazlıklar, İngiltere ve Galler mahkemelerinin münhasır yargı yetkisine tabi olacaktır.`,
  },
  {
    title: '10. Koşullardaki Değişiklikler',
    body: `Bu Koşulları zaman zaman güncelleyebiliriz. Önemli değişiklikler Uygulama içinden bildirilecektir. Bildirimden sonra Uygulamayı kullanmaya devam etmeniz, güncellenmiş Koşulları kabul ettiğiniz anlamına gelir.`,
  },
  {
    title: '11. İletişim',
    body: `Bu Koşullar hakkındaki sorularınız için lütfen iletişime geçin:\n\nMudimedia Ltd\nLondra, Birleşik Krallık\nsynaps@mudimedia.co.uk`,
  },
];

export default function TermsScreen() {
  const language = useAppStore((s) => s.language);
  const isTR = language === 'tr';
  const SECTIONS = isTR ? SECTIONS_TR : SECTIONS_EN;
  const lastUpdated = isTR ? LAST_UPDATED_TR : LAST_UPDATED_EN;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>{isTR ? 'Kullanım Koşulları' : 'Terms & Conditions'}</Text>
        <Pressable onPress={() => router.back()} style={styles.closeBtn}>
          <Ionicons name="close" size={22} color={colors.textSecondary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.meta}>Mudimedia Ltd · {isTR ? 'Son güncelleme' : 'Last updated'} {lastUpdated}</Text>

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

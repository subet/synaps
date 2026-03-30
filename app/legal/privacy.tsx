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
    title: "8. Children's Privacy",
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

const SECTIONS_TR = [
  {
    title: '1. Biz Kimiz',
    body: `Bu Gizlilik Politikası, İngiltere ve Galler'de kayıtlı bir şirket olan Mudimedia Ltd, Londra, Birleşik Krallık ("biz", "bize", "bizim") tarafından sunulmaktadır. Synaps uygulaması aracılığıyla toplanan kişisel veriler için veri sorumlusuyuz.\n\nİletişim: synaps@mudimedia.co.uk`,
  },
  {
    title: '2. Hangi Verileri Topluyoruz',
    body: `Hizmet sunmak için gerekli minimum veriyi topluyoruz:\n\n• Hesap verileri: Hesap oluşturmayı tercih ettiğinizde e-posta adresiniz.\n• Kullanım verileri: Çalışma oturumu sayıları, seri verileri ve kart tekrar geçmişi — cihazınızda yerel olarak depolanır.\n• Cihaz verileri: Cihaz türü ve işletim sistemi sürümü, çökme raporları için anonim olarak toplanır.\n• Satın alma verileri: Apple veya Google tarafından işlenen abonelik durumu. Ödeme kartı bilgilerinizi almıyoruz.`,
  },
  {
    title: '3. Verilerinizi Nasıl Kullanıyoruz',
    body: `Verilerinizi şu amaçlarla kullanıyoruz:\n• Synaps hizmetini sunmak ve geliştirmek.\n• Yeni bir cihazda oturum açtığınızda hesabınızı ve çalışma ilerlemenizi geri yüklemek (PRO).\n• Çalışma hatırlatıcı bildirimleri göndermek (yalnızca bu özelliği etkinleştirirseniz).\n• Çökmeleri tespit etmek ve hataları düzeltmek.\n\nVerilerinizi reklam amaçlı kullanmıyor veya üçüncü taraflara satmıyoruz.`,
  },
  {
    title: '4. Veri Depolama ve Güvenlik',
    body: `Flash kartlarınız, desteleriniz ve çalışma geçmişiniz cihazınızda SQLite kullanılarak yerel olarak depolanır. Bulut senkronizasyonunu (PRO) etkinleştirmedikçe bu veriler cihazınızdan ayrılmaz; etkinleştirirseniz, TLS ile şifrelenmiş olarak AB'de bulunan Supabase altyapısında depolanır.\n\nVerilerinizi yetkisiz erişim, kayıp veya ifşaya karşı korumak için uygun teknik ve organizasyonel önlemleri uyguluyoruz.`,
  },
  {
    title: '5. Üçüncü Taraf Hizmetler',
    body: `Aşağıdaki üçüncü taraf hizmetleri kullanıyoruz:\n\n• Supabase — kimlik doğrulama ve bulut depolama (AB bölgesi)\n• RevenueCat — abonelik yönetimi (kart bilgilerini almaz)\n• Apple / Google — abonelikler için ödeme işleme\n\nHer üçüncü tarafın kendi gizlilik politikası vardır. Endişeleriniz varsa incelemenizi öneririz.`,
  },
  {
    title: '6. Haklarınız',
    body: `UK GDPR ve 2018 Veri Koruma Yasası kapsamında şu haklara sahipsiniz:\n• Hakkınızda tuttuğumuz kişisel verilere erişim.\n• Hatalı verileri düzeltme.\n• Verilerinizin silinmesini talep etme ("unutulma hakkı").\n• Belirli işlemelere itiraz etme veya kısıtlama.\n• Veri taşınabilirliği.\n\nBu haklardan herhangi birini kullanmak için synaps@mudimedia.co.uk adresinden bize ulaşın. 30 gün içinde yanıt vereceğiz.`,
  },
  {
    title: '7. Veri Saklama',
    body: `Hesap verilerinizi hesabınız aktif olduğu sürece saklarız. Hesabınızı silerseniz, ilişkili tüm veriler 30 gün içinde kaldırılır.\n\nCihazınızda depolanan yerel veriler sizin kontrolünüzdedir ve Ayarlar → Tüm verileri sil yoluyla istediğiniz zaman silinebilir.`,
  },
  {
    title: '8. Çocukların Gizliliği',
    body: `Synaps, 13 yaşın altındaki çocuklara yönelik değildir. 13 yaşın altındaki çocuklardan bilerek kişisel veri toplamıyoruz. Bir çocuğun bize kişisel veri sağladığına inanıyorsanız, lütfen bizimle iletişime geçin; derhal sileceğiz.`,
  },
  {
    title: '9. Çerezler ve İzleme',
    body: `Synaps mobil uygulaması çerez kullanmaz. Etkinliğinizi üçüncü taraf uygulamalar veya web siteleri genelinde izlemiyoruz.`,
  },
  {
    title: '10. Bu Politikadaki Değişiklikler',
    body: `Bu Gizlilik Politikasını zaman zaman güncelleyebiliriz. Önemli değişiklikler Uygulama içinden iletilecektir. Bu tür bir bildirimden sonra Uygulamayı kullanmaya devam etmeniz, güncellenmiş politikayı kabul ettiğiniz anlamına gelir.`,
  },
  {
    title: '11. İletişim ve Şikayetler',
    body: `Gizlilikle ilgili sorgular için iletişime geçin:\n\nMudimedia Ltd\nLondra, Birleşik Krallık\nsynaps@mudimedia.co.uk\n\nYanıtımızdan memnun kalmazsanız, ico.org.uk adresindeki Bilgi Komiseri Ofisi'ne (ICO) şikayette bulunma hakkınız vardır.`,
  },
];

export default function PrivacyScreen() {
  const language = useAppStore((s) => s.language);
  const isTR = language === 'tr';
  const SECTIONS = isTR ? SECTIONS_TR : SECTIONS_EN;
  const lastUpdated = isTR ? LAST_UPDATED_TR : LAST_UPDATED_EN;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>{isTR ? 'Gizlilik Politikası' : 'Privacy Policy'}</Text>
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

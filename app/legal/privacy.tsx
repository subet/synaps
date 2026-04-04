import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { borderRadius, colors, spacing, typography } from '../../src/constants';
import { useAppStore } from '../../src/stores/useAppStore';

type Section = { title: string; body: string };

const LAST_UPDATED: Record<string, string> = {
  en: '30 March 2026',
  es: '30 de marzo de 2026',
  it: '30 marzo 2026',
  tr: '30 Mart 2026',
  de: '30. März 2026',
  fr: '30 mars 2026',
  nl: '30 maart 2026',
  ru: '30 марта 2026',
  zh: '2026年3月30日',
  pt_BR: '30 de março de 2026',
  pt_PT: '30 de março de 2026',
};

const SCREEN_TITLE: Record<string, string> = {
  en: 'Privacy Policy',
  es: 'Política de Privacidad',
  it: 'Informativa sulla Privacy',
  tr: 'Gizlilik Politikası',
  de: 'Datenschutzrichtlinie',
  fr: 'Politique de Confidentialité',
  nl: 'Privacybeleid',
  ru: 'Политика конфиденциальности',
  zh: '隐私政策',
  pt_BR: 'Política de Privacidade',
  pt_PT: 'Política de Privacidade',
};

const UPDATED_LABEL: Record<string, string> = {
  en: 'Last updated',
  es: 'Última actualización',
  it: 'Ultimo aggiornamento',
  tr: 'Son güncelleme',
  de: 'Zuletzt aktualisiert',
  fr: 'Dernière mise à jour',
  nl: 'Laatst bijgewerkt',
  ru: 'Последнее обновление',
  zh: '最后更新',
  pt_BR: 'Última atualização',
  pt_PT: 'Última atualização',
};

const SECTIONS: Record<string, Section[]> = {
  en: [
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
  ],

  tr: [
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
  ],

  es: [
    {
      title: '1. Quiénes somos',
      body: `Esta Política de Privacidad es proporcionada por Mudimedia Ltd, una empresa registrada en Inglaterra y Gales, Londres, Reino Unido ("nosotros", "nos", "nuestro"). Somos el responsable del tratamiento de los datos personales recogidos a través de la aplicación Synaps.\n\nContacto: synaps@mudimedia.co.uk`,
    },
    {
      title: '2. Qué datos recopilamos',
      body: `Recopilamos los datos mínimos necesarios para prestar el servicio:\n\n• Datos de cuenta: dirección de correo electrónico, cuando decides crear una cuenta.\n• Datos de uso: número de sesiones de estudio, datos de rachas y historial de repaso de tarjetas — almacenados localmente en tu dispositivo.\n• Datos del dispositivo: tipo de dispositivo y versión del sistema operativo, recopilados de forma anónima para informes de fallos.\n• Datos de compra: estado de la suscripción, procesado por Apple o Google. No recibimos los datos de tu tarjeta de pago.`,
    },
    {
      title: '3. Cómo usamos tus datos',
      body: `Usamos tus datos para:\n• Proporcionar y mejorar el servicio Synaps.\n• Restaurar tu cuenta y tu progreso de estudio cuando inicias sesión en un nuevo dispositivo (PRO).\n• Enviar notificaciones de recordatorio de estudio (solo si activas esta función).\n• Diagnosticar fallos y corregir errores.\n\nNo utilizamos tus datos con fines publicitarios ni los vendemos a terceros.`,
    },
    {
      title: '4. Almacenamiento y seguridad de datos',
      body: `Tus tarjetas, mazos e historial de estudio se almacenan localmente en tu dispositivo mediante SQLite. Estos datos no salen de tu dispositivo a menos que actives la sincronización en la nube (PRO), en cuyo caso se cifran en tránsito mediante TLS y se almacenan en la infraestructura de Supabase ubicada en la UE.\n\nImplementamos medidas técnicas y organizativas adecuadas para proteger tus datos contra el acceso no autorizado, la pérdida o la divulgación.`,
    },
    {
      title: '5. Servicios de terceros',
      body: `Utilizamos los siguientes servicios de terceros:\n\n• Supabase — autenticación y almacenamiento en la nube (región UE)\n• RevenueCat — gestión de suscripciones (no recibe datos de tarjetas)\n• Apple / Google — procesamiento de pagos para suscripciones\n\nCada tercero tiene su propia política de privacidad. Te recomendamos revisarlas si tienes alguna duda.`,
    },
    {
      title: '6. Tus derechos',
      body: `En virtud del RGPD del Reino Unido y la Ley de Protección de Datos de 2018, tienes derecho a:\n• Acceder a los datos personales que tenemos sobre ti.\n• Corregir datos inexactos.\n• Solicitar la eliminación de tus datos ("derecho al olvido").\n• Oponerte o restringir determinados tratamientos.\n• Portabilidad de datos.\n\nPara ejercer cualquiera de estos derechos, contacta con nosotros en synaps@mudimedia.co.uk. Responderemos en un plazo de 30 días.`,
    },
    {
      title: '7. Conservación de datos',
      body: `Conservamos los datos de tu cuenta mientras esta permanezca activa. Si eliminas tu cuenta, todos los datos asociados se borran en un plazo de 30 días.\n\nLos datos locales almacenados en tu dispositivo están bajo tu control y pueden eliminarse en cualquier momento a través de Ajustes → Eliminar todos los datos.`,
    },
    {
      title: '8. Privacidad de los menores',
      body: `Synaps no está dirigido a menores de 13 años. No recopilamos deliberadamente datos personales de menores de 13 años. Si crees que un menor nos ha proporcionado datos personales, contacta con nosotros y los eliminaremos de inmediato.`,
    },
    {
      title: '9. Cookies y seguimiento',
      body: `La aplicación móvil Synaps no utiliza cookies. No rastreamos tu actividad en aplicaciones o sitios web de terceros.`,
    },
    {
      title: '10. Cambios en esta política',
      body: `Podemos actualizar esta Política de Privacidad periódicamente. Los cambios importantes se comunicarán dentro de la Aplicación. El uso continuado de la Aplicación tras dicha notificación constituye la aceptación de la política actualizada.`,
    },
    {
      title: '11. Contacto y reclamaciones',
      body: `Para consultas relacionadas con la privacidad, contacta con:\n\nMudimedia Ltd\nLondres, Reino Unido\nsynaps@mudimedia.co.uk\n\nSi no estás satisfecho con nuestra respuesta, tienes derecho a presentar una reclamación ante la Oficina del Comisionado de Información (ICO) en ico.org.uk.`,
    },
  ],

  it: [
    {
      title: '1. Chi siamo',
      body: `La presente Informativa sulla Privacy è fornita da Mudimedia Ltd, una società registrata in Inghilterra e Galles, Londra, Regno Unito ("noi", "ci", "nostro"). Siamo il titolare del trattamento dei dati personali raccolti tramite l'applicazione Synaps.\n\nContatto: synaps@mudimedia.co.uk`,
    },
    {
      title: '2. Quali dati raccogliamo',
      body: `Raccogliamo i dati minimi necessari per fornire il servizio:\n\n• Dati dell'account: indirizzo e-mail, quando scegli di creare un account.\n• Dati di utilizzo: numero di sessioni di studio, dati sulle serie e cronologia delle revisioni delle carte — memorizzati localmente sul tuo dispositivo.\n• Dati del dispositivo: tipo di dispositivo e versione del sistema operativo, raccolti in forma anonima per la segnalazione di arresti anomali.\n• Dati di acquisto: stato dell'abbonamento, elaborato da Apple o Google. Non riceviamo i dati della tua carta di pagamento.`,
    },
    {
      title: '3. Come utilizziamo i tuoi dati',
      body: `Utilizziamo i tuoi dati per:\n• Fornire e migliorare il servizio Synaps.\n• Ripristinare il tuo account e i tuoi progressi di studio quando accedi su un nuovo dispositivo (PRO).\n• Inviare notifiche di promemoria per lo studio (solo se abiliti questa funzione).\n• Diagnosticare arresti anomali e correggere errori.\n\nNon utilizziamo i tuoi dati per scopi pubblicitari né li vendiamo a terzi.`,
    },
    {
      title: '4. Conservazione e sicurezza dei dati',
      body: `Le tue flashcard, i mazzi e la cronologia di studio sono memorizzati localmente sul tuo dispositivo tramite SQLite. Questi dati non lasciano il tuo dispositivo a meno che tu non abiliti la sincronizzazione cloud (PRO), nel qual caso vengono crittografati in transito tramite TLS e memorizzati nell'infrastruttura Supabase situata nell'UE.\n\nAdottiamo misure tecniche e organizzative appropriate per proteggere i tuoi dati da accessi non autorizzati, perdita o divulgazione.`,
    },
    {
      title: '5. Servizi di terze parti',
      body: `Utilizziamo i seguenti servizi di terze parti:\n\n• Supabase — autenticazione e archiviazione cloud (regione UE)\n• RevenueCat — gestione degli abbonamenti (non riceve dati delle carte)\n• Apple / Google — elaborazione dei pagamenti per gli abbonamenti\n\nOgni terza parte ha la propria informativa sulla privacy. Ti consigliamo di consultarle in caso di dubbi.`,
    },
    {
      title: '6. I tuoi diritti',
      body: `Ai sensi del GDPR del Regno Unito e del Data Protection Act 2018, hai il diritto di:\n• Accedere ai dati personali che deteniamo su di te.\n• Rettificare dati inesatti.\n• Richiedere la cancellazione dei tuoi dati ("diritto all'oblio").\n• Opporti o limitare determinati trattamenti.\n• Portabilità dei dati.\n\nPer esercitare uno qualsiasi di questi diritti, contattaci all'indirizzo synaps@mudimedia.co.uk. Risponderemo entro 30 giorni.`,
    },
    {
      title: '7. Conservazione dei dati',
      body: `Conserviamo i dati del tuo account finché il tuo account è attivo. Se elimini il tuo account, tutti i dati associati vengono rimossi entro 30 giorni.\n\nI dati locali memorizzati sul tuo dispositivo sono sotto il tuo controllo e possono essere eliminati in qualsiasi momento tramite Impostazioni → Elimina tutti i dati.`,
    },
    {
      title: '8. Privacy dei minori',
      body: `Synaps non è destinato a minori di 13 anni. Non raccogliamo consapevolmente dati personali di minori di 13 anni. Se ritieni che un minore ci abbia fornito dati personali, contattaci e li elimineremo tempestivamente.`,
    },
    {
      title: '9. Cookie e tracciamento',
      body: `L'applicazione mobile Synaps non utilizza cookie. Non tracciamo la tua attività su app o siti web di terze parti.`,
    },
    {
      title: '10. Modifiche alla presente informativa',
      body: `Potremmo aggiornare periodicamente la presente Informativa sulla Privacy. Le modifiche sostanziali saranno comunicate all'interno dell'App. L'uso continuato dell'App dopo tale notifica costituisce accettazione dell'informativa aggiornata.`,
    },
    {
      title: '11. Contatti e reclami',
      body: `Per richieste relative alla privacy, contatta:\n\nMudimedia Ltd\nLondra, Regno Unito\nsynaps@mudimedia.co.uk\n\nSe non sei soddisfatto della nostra risposta, hai il diritto di presentare un reclamo all'Information Commissioner's Office (ICO) su ico.org.uk.`,
    },
  ],

  de: [
    {
      title: '1. Wer wir sind',
      body: `Diese Datenschutzrichtlinie wird von Mudimedia Ltd bereitgestellt, einem in England und Wales registrierten Unternehmen mit Sitz in London, Vereinigtes Königreich („wir", „uns", „unser"). Wir sind der Verantwortliche für personenbezogene Daten, die über die Synaps-Anwendung erhoben werden.\n\nKontakt: synaps@mudimedia.co.uk`,
    },
    {
      title: '2. Welche Daten wir erheben',
      body: `Wir erheben nur die für die Bereitstellung des Dienstes erforderlichen Mindestdaten:\n\n• Kontodaten: E-Mail-Adresse, wenn Sie ein Konto erstellen.\n• Nutzungsdaten: Anzahl der Lernsitzungen, Streak-Daten und Kartenwiederholungsverlauf — lokal auf Ihrem Gerät gespeichert.\n• Gerätedaten: Gerätetyp und Betriebssystemversion, anonymisiert für Absturzberichte erhoben.\n• Kaufdaten: Abonnementstatus, verarbeitet durch Apple oder Google. Wir erhalten keine Zahlungskartendaten.`,
    },
    {
      title: '3. Wie wir Ihre Daten verwenden',
      body: `Wir verwenden Ihre Daten, um:\n• Den Synaps-Dienst bereitzustellen und zu verbessern.\n• Ihr Konto und Ihren Lernfortschritt wiederherzustellen, wenn Sie sich auf einem neuen Gerät anmelden (PRO).\n• Lernerinnerungen zu senden (nur wenn Sie diese Funktion aktivieren).\n• Abstürze zu diagnostizieren und Fehler zu beheben.\n\nWir verwenden Ihre Daten nicht für Werbezwecke und verkaufen sie nicht an Dritte.`,
    },
    {
      title: '4. Datenspeicherung und Sicherheit',
      body: `Ihre Karteikarten, Stapel und Ihr Lernverlauf werden lokal auf Ihrem Gerät mittels SQLite gespeichert. Diese Daten verlassen Ihr Gerät nicht, es sei denn, Sie aktivieren die Cloud-Synchronisierung (PRO). In diesem Fall werden sie während der Übertragung mit TLS verschlüsselt und in der Supabase-Infrastruktur in der EU gespeichert.\n\nWir setzen angemessene technische und organisatorische Maßnahmen ein, um Ihre Daten vor unbefugtem Zugriff, Verlust oder Offenlegung zu schützen.`,
    },
    {
      title: '5. Drittanbieterdienste',
      body: `Wir nutzen folgende Drittanbieterdienste:\n\n• Supabase — Authentifizierung und Cloud-Speicher (EU-Region)\n• RevenueCat — Abonnementverwaltung (erhält keine Kartendaten)\n• Apple / Google — Zahlungsabwicklung für Abonnements\n\nJeder Drittanbieter hat eine eigene Datenschutzrichtlinie. Wir empfehlen, diese bei Bedenken zu lesen.`,
    },
    {
      title: '6. Ihre Rechte',
      body: `Gemäß der UK-DSGVO und dem Data Protection Act 2018 haben Sie das Recht:\n• Auf Auskunft über die von uns gespeicherten personenbezogenen Daten.\n• Auf Berichtigung unrichtiger Daten.\n• Auf Löschung Ihrer Daten („Recht auf Vergessenwerden").\n• Auf Widerspruch gegen oder Einschränkung bestimmter Verarbeitungen.\n• Auf Datenübertragbarkeit.\n\nUm eines dieser Rechte auszuüben, kontaktieren Sie uns unter synaps@mudimedia.co.uk. Wir antworten innerhalb von 30 Tagen.`,
    },
    {
      title: '7. Datenspeicherung',
      body: `Wir bewahren Ihre Kontodaten auf, solange Ihr Konto aktiv ist. Wenn Sie Ihr Konto löschen, werden alle zugehörigen Daten innerhalb von 30 Tagen entfernt.\n\nLokal auf Ihrem Gerät gespeicherte Daten unterliegen Ihrer Kontrolle und können jederzeit über Einstellungen → Alle Daten löschen entfernt werden.`,
    },
    {
      title: '8. Datenschutz für Kinder',
      body: `Synaps richtet sich nicht an Kinder unter 13 Jahren. Wir erheben wissentlich keine personenbezogenen Daten von Kindern unter 13 Jahren. Wenn Sie der Meinung sind, dass ein Kind uns personenbezogene Daten übermittelt hat, kontaktieren Sie uns bitte, und wir werden diese umgehend löschen.`,
    },
    {
      title: '9. Cookies und Tracking',
      body: `Die mobile Synaps-App verwendet keine Cookies. Wir verfolgen Ihre Aktivitäten nicht über Drittanbieter-Apps oder Websites hinweg.`,
    },
    {
      title: '10. Änderungen dieser Richtlinie',
      body: `Wir können diese Datenschutzrichtlinie von Zeit zu Zeit aktualisieren. Wesentliche Änderungen werden innerhalb der App mitgeteilt. Die fortgesetzte Nutzung der App nach einer solchen Benachrichtigung gilt als Zustimmung zur aktualisierten Richtlinie.`,
    },
    {
      title: '11. Kontakt und Beschwerden',
      body: `Für datenschutzbezogene Anfragen kontaktieren Sie:\n\nMudimedia Ltd\nLondon, Vereinigtes Königreich\nsynaps@mudimedia.co.uk\n\nWenn Sie mit unserer Antwort nicht zufrieden sind, haben Sie das Recht, eine Beschwerde beim Information Commissioner's Office (ICO) unter ico.org.uk einzureichen.`,
    },
  ],

  fr: [
    {
      title: '1. Qui sommes-nous',
      body: `La présente Politique de Confidentialité est fournie par Mudimedia Ltd, une société immatriculée en Angleterre et au Pays de Galles, Londres, Royaume-Uni (« nous », « notre »). Nous sommes le responsable du traitement des données personnelles collectées via l'application Synaps.\n\nContact : synaps@mudimedia.co.uk`,
    },
    {
      title: '2. Quelles données nous collectons',
      body: `Nous collectons le minimum de données nécessaires à la fourniture du service :\n\n• Données de compte : adresse e-mail, lorsque vous choisissez de créer un compte.\n• Données d'utilisation : nombre de sessions d'étude, données de séries et historique de révision des cartes — stockées localement sur votre appareil.\n• Données de l'appareil : type d'appareil et version du système d'exploitation, collectées de manière anonyme pour les rapports de plantages.\n• Données d'achat : statut de l'abonnement, traité par Apple ou Google. Nous ne recevons pas les détails de votre carte de paiement.`,
    },
    {
      title: '3. Comment nous utilisons vos données',
      body: `Nous utilisons vos données pour :\n• Fournir et améliorer le service Synaps.\n• Restaurer votre compte et votre progression d'étude lorsque vous vous connectez sur un nouvel appareil (PRO).\n• Envoyer des notifications de rappel d'étude (uniquement si vous activez cette fonctionnalité).\n• Diagnostiquer les plantages et corriger les bugs.\n\nNous n'utilisons pas vos données à des fins publicitaires et ne les vendons pas à des tiers.`,
    },
    {
      title: '4. Stockage et sécurité des données',
      body: `Vos flashcards, paquets et historique d'étude sont stockés localement sur votre appareil via SQLite. Ces données ne quittent pas votre appareil, sauf si vous activez la synchronisation cloud (PRO), auquel cas elles sont chiffrées en transit via TLS et stockées dans l'infrastructure Supabase située dans l'UE.\n\nNous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données contre tout accès non autorisé, perte ou divulgation.`,
    },
    {
      title: '5. Services tiers',
      body: `Nous utilisons les services tiers suivants :\n\n• Supabase — authentification et stockage cloud (région UE)\n• RevenueCat — gestion des abonnements (ne reçoit pas les détails des cartes)\n• Apple / Google — traitement des paiements pour les abonnements\n\nChaque tiers dispose de sa propre politique de confidentialité. Nous vous recommandons de les consulter si vous avez des préoccupations.`,
    },
    {
      title: '6. Vos droits',
      body: `En vertu du RGPD britannique et du Data Protection Act 2018, vous avez le droit de :\n• Accéder aux données personnelles que nous détenons à votre sujet.\n• Rectifier les données inexactes.\n• Demander la suppression de vos données (« droit à l'oubli »).\n• Vous opposer à certains traitements ou les limiter.\n• La portabilité des données.\n\nPour exercer l'un de ces droits, contactez-nous à synaps@mudimedia.co.uk. Nous répondrons dans un délai de 30 jours.`,
    },
    {
      title: '7. Conservation des données',
      body: `Nous conservons les données de votre compte tant que celui-ci est actif. Si vous supprimez votre compte, toutes les données associées sont supprimées dans un délai de 30 jours.\n\nLes données locales stockées sur votre appareil sont sous votre contrôle et peuvent être supprimées à tout moment via Paramètres → Supprimer toutes les données.`,
    },
    {
      title: '8. Vie privée des enfants',
      body: `Synaps ne s'adresse pas aux enfants de moins de 13 ans. Nous ne collectons pas sciemment de données personnelles auprès d'enfants de moins de 13 ans. Si vous pensez qu'un enfant nous a fourni des données personnelles, veuillez nous contacter et nous les supprimerons rapidement.`,
    },
    {
      title: '9. Cookies et suivi',
      body: `L'application mobile Synaps n'utilise pas de cookies. Nous ne suivons pas votre activité sur des applications ou des sites web tiers.`,
    },
    {
      title: '10. Modifications de cette politique',
      body: `Nous pouvons mettre à jour cette Politique de Confidentialité de temps à autre. Les modifications importantes seront communiquées au sein de l'Application. L'utilisation continue de l'Application après une telle notification vaut acceptation de la politique mise à jour.`,
    },
    {
      title: '11. Contact et réclamations',
      body: `Pour toute demande relative à la vie privée, contactez :\n\nMudimedia Ltd\nLondres, Royaume-Uni\nsynaps@mudimedia.co.uk\n\nSi vous n'êtes pas satisfait de notre réponse, vous avez le droit de déposer une plainte auprès de l'Information Commissioner's Office (ICO) sur ico.org.uk.`,
    },
  ],

  nl: [
    {
      title: '1. Wie wij zijn',
      body: `Dit Privacybeleid wordt verstrekt door Mudimedia Ltd, een bedrijf geregistreerd in Engeland en Wales, Londen, Verenigd Koninkrijk ("wij", "ons", "onze"). Wij zijn de verwerkingsverantwoordelijke voor persoonsgegevens die via de Synaps-applicatie worden verzameld.\n\nContact: synaps@mudimedia.co.uk`,
    },
    {
      title: '2. Welke gegevens wij verzamelen',
      body: `Wij verzamelen het minimum aan gegevens dat nodig is om de dienst te leveren:\n\n• Accountgegevens: e-mailadres, wanneer u een account aanmaakt.\n• Gebruiksgegevens: aantal studiesessies, streak-gegevens en kaartherhalingsgeschiedenis — lokaal op uw apparaat opgeslagen.\n• Apparaatgegevens: apparaattype en besturingssysteemversie, anoniem verzameld voor crashrapporten.\n• Aankoopgegevens: abonnementsstatus, verwerkt door Apple of Google. Wij ontvangen uw betaalkaartgegevens niet.`,
    },
    {
      title: '3. Hoe wij uw gegevens gebruiken',
      body: `Wij gebruiken uw gegevens om:\n• De Synaps-dienst te leveren en te verbeteren.\n• Uw account en studievoortgang te herstellen wanneer u zich op een nieuw apparaat aanmeldt (PRO).\n• Studieherinneringen te sturen (alleen als u deze functie inschakelt).\n• Crashes te diagnosticeren en bugs op te lossen.\n\nWij gebruiken uw gegevens niet voor reclame en verkopen deze niet aan derden.`,
    },
    {
      title: '4. Gegevensopslag en beveiliging',
      body: `Uw flashcards, stapels en studiegeschiedenis worden lokaal op uw apparaat opgeslagen met behulp van SQLite. Deze gegevens verlaten uw apparaat niet, tenzij u cloudsynchronisatie inschakelt (PRO). In dat geval worden ze tijdens overdracht versleuteld met TLS en opgeslagen in de Supabase-infrastructuur in de EU.\n\nWij treffen passende technische en organisatorische maatregelen om uw gegevens te beschermen tegen ongeautoriseerde toegang, verlies of openbaarmaking.`,
    },
    {
      title: '5. Diensten van derden',
      body: `Wij maken gebruik van de volgende diensten van derden:\n\n• Supabase — authenticatie en cloudopslag (EU-regio)\n• RevenueCat — abonnementsbeheer (ontvangt geen kaartgegevens)\n• Apple / Google — betalingsverwerking voor abonnementen\n\nElke derde partij heeft een eigen privacybeleid. Wij raden u aan deze te raadplegen als u vragen heeft.`,
    },
    {
      title: '6. Uw rechten',
      body: `Op grond van de UK AVG en de Data Protection Act 2018 heeft u het recht om:\n• Inzage te krijgen in de persoonsgegevens die wij over u bewaren.\n• Onjuiste gegevens te corrigeren.\n• Verwijdering van uw gegevens te verzoeken ("recht op vergetelheid").\n• Bezwaar te maken tegen of beperking te vragen van bepaalde verwerkingen.\n• Gegevensoverdraagbaarheid.\n\nOm een van deze rechten uit te oefenen, neemt u contact met ons op via synaps@mudimedia.co.uk. Wij reageren binnen 30 dagen.`,
    },
    {
      title: '7. Bewaring van gegevens',
      body: `Wij bewaren uw accountgegevens zolang uw account actief is. Als u uw account verwijdert, worden alle bijbehorende gegevens binnen 30 dagen verwijderd.\n\nLokaal op uw apparaat opgeslagen gegevens staan onder uw controle en kunnen op elk moment worden verwijderd via Instellingen → Alle gegevens verwijderen.`,
    },
    {
      title: '8. Privacy van kinderen',
      body: `Synaps is niet gericht op kinderen jonger dan 13 jaar. Wij verzamelen niet bewust persoonsgegevens van kinderen jonger dan 13 jaar. Als u van mening bent dat een kind ons persoonsgegevens heeft verstrekt, neem dan contact met ons op en wij zullen deze onmiddellijk verwijderen.`,
    },
    {
      title: '9. Cookies en tracking',
      body: `De mobiele Synaps-app maakt geen gebruik van cookies. Wij volgen uw activiteit niet op apps of websites van derden.`,
    },
    {
      title: '10. Wijzigingen in dit beleid',
      body: `Wij kunnen dit Privacybeleid van tijd tot tijd bijwerken. Belangrijke wijzigingen worden binnen de App gecommuniceerd. Voortgezet gebruik van de App na een dergelijke melding betekent aanvaarding van het bijgewerkte beleid.`,
    },
    {
      title: '11. Contact en klachten',
      body: `Voor privacygerelateerde vragen kunt u contact opnemen met:\n\nMudimedia Ltd\nLonden, Verenigd Koninkrijk\nsynaps@mudimedia.co.uk\n\nAls u niet tevreden bent met ons antwoord, heeft u het recht een klacht in te dienen bij het Information Commissioner's Office (ICO) op ico.org.uk.`,
    },
  ],

  ru: [
    {
      title: '1. Кто мы',
      body: `Настоящая Политика конфиденциальности предоставлена компанией Mudimedia Ltd, зарегистрированной в Англии и Уэльсе, Лондон, Великобритания («мы», «нас», «наш»). Мы являемся контролёром персональных данных, собираемых через приложение Synaps.\n\nКонтакт: synaps@mudimedia.co.uk`,
    },
    {
      title: '2. Какие данные мы собираем',
      body: `Мы собираем минимально необходимые данные для предоставления сервиса:\n\n• Данные учётной записи: адрес электронной почты при создании учётной записи.\n• Данные об использовании: количество учебных сессий, данные о сериях и история повторения карточек — хранятся локально на вашем устройстве.\n• Данные устройства: тип устройства и версия операционной системы, собираемые анонимно для отчётов о сбоях.\n• Данные о покупках: статус подписки, обрабатываемый Apple или Google. Мы не получаем данные вашей платёжной карты.`,
    },
    {
      title: '3. Как мы используем ваши данные',
      body: `Мы используем ваши данные для:\n• Предоставления и улучшения сервиса Synaps.\n• Восстановления вашей учётной записи и прогресса обучения при входе на новом устройстве (PRO).\n• Отправки напоминаний об обучении (только если вы включили эту функцию).\n• Диагностики сбоев и исправления ошибок.\n\nМы не используем ваши данные в рекламных целях и не продаём их третьим лицам.`,
    },
    {
      title: '4. Хранение и безопасность данных',
      body: `Ваши карточки, колоды и история обучения хранятся локально на вашем устройстве с помощью SQLite. Эти данные не покидают ваше устройство, если вы не включите облачную синхронизацию (PRO). В этом случае данные шифруются при передаче с помощью TLS и хранятся в инфраструктуре Supabase, расположенной в ЕС.\n\nМы применяем надлежащие технические и организационные меры для защиты ваших данных от несанкционированного доступа, утраты или раскрытия.`,
    },
    {
      title: '5. Сторонние сервисы',
      body: `Мы используем следующие сторонние сервисы:\n\n• Supabase — аутентификация и облачное хранилище (регион ЕС)\n• RevenueCat — управление подписками (не получает данные карт)\n• Apple / Google — обработка платежей за подписки\n\nКаждый сторонний сервис имеет собственную политику конфиденциальности. Мы рекомендуем ознакомиться с ними при возникновении вопросов.`,
    },
    {
      title: '6. Ваши права',
      body: `В соответствии с GDPR Великобритании и Законом о защите данных 2018 года вы имеете право:\n• Получить доступ к персональным данным, которые мы храним о вас.\n• Исправить неточные данные.\n• Запросить удаление ваших данных («право на забвение»).\n• Возразить против определённой обработки или ограничить её.\n• На переносимость данных.\n\nДля реализации любого из этих прав свяжитесь с нами по адресу synaps@mudimedia.co.uk. Мы ответим в течение 30 дней.`,
    },
    {
      title: '7. Срок хранения данных',
      body: `Мы храним данные вашей учётной записи, пока она активна. При удалении учётной записи все связанные данные удаляются в течение 30 дней.\n\nЛокальные данные, хранящиеся на вашем устройстве, находятся под вашим контролем и могут быть удалены в любое время через Настройки → Удалить все данные.`,
    },
    {
      title: '8. Конфиденциальность детей',
      body: `Synaps не предназначен для детей младше 13 лет. Мы сознательно не собираем персональные данные детей младше 13 лет. Если вы считаете, что ребёнок предоставил нам персональные данные, свяжитесь с нами, и мы незамедлительно их удалим.`,
    },
    {
      title: '9. Файлы cookie и отслеживание',
      body: `Мобильное приложение Synaps не использует файлы cookie. Мы не отслеживаем вашу активность в сторонних приложениях или на сторонних веб-сайтах.`,
    },
    {
      title: '10. Изменения в настоящей политике',
      body: `Мы можем время от времени обновлять настоящую Политику конфиденциальности. О существенных изменениях будет сообщено в Приложении. Продолжение использования Приложения после такого уведомления означает принятие обновлённой политики.`,
    },
    {
      title: '11. Контакты и жалобы',
      body: `По вопросам, связанным с конфиденциальностью, обращайтесь:\n\nMudimedia Ltd\nЛондон, Великобритания\nsynaps@mudimedia.co.uk\n\nЕсли вас не устроил наш ответ, вы имеете право подать жалобу в Офис Комиссара по информации (ICO) на сайте ico.org.uk.`,
    },
  ],

  zh: [
    {
      title: '1. 我们是谁',
      body: `本隐私政策由 Mudimedia Ltd 提供，该公司注册于英格兰和威尔士，位于英国伦敦（以下简称"我们"）。我们是通过 Synaps 应用程序收集的个人数据的数据控制者。\n\n联系方式：synaps@mudimedia.co.uk`,
    },
    {
      title: '2. 我们收集哪些数据',
      body: `我们仅收集提供服务所需的最少数据：\n\n• 账户数据：当您选择创建账户时的电子邮件地址。\n• 使用数据：学习会话次数、连续学习天数和卡片复习历史——存储在您设备的本地。\n• 设备数据：设备类型和操作系统版本，匿名收集用于崩溃报告。\n• 购买数据：订阅状态，由 Apple 或 Google 处理。我们不会收到您的支付卡详细信息。`,
    },
    {
      title: '3. 我们如何使用您的数据',
      body: `我们使用您的数据来：\n• 提供和改进 Synaps 服务。\n• 当您在新设备上登录时恢复您的账户和学习进度（PRO）。\n• 发送学习提醒通知（仅在您启用此功能时）。\n• 诊断崩溃和修复错误。\n\n我们不会将您的数据用于广告目的，也不会将其出售给第三方。`,
    },
    {
      title: '4. 数据存储与安全',
      body: `您的闪卡、卡组和学习历史使用 SQLite 存储在您设备的本地。除非您启用云同步（PRO），否则这些数据不会离开您的设备。启用后，数据将通过 TLS 加密传输，并存储在位于欧盟的 Supabase 基础设施中。\n\n我们采取适当的技术和组织措施，保护您的数据免受未经授权的访问、丢失或泄露。`,
    },
    {
      title: '5. 第三方服务',
      body: `我们使用以下第三方服务：\n\n• Supabase——身份验证和云存储（欧盟区域）\n• RevenueCat——订阅管理（不接收银行卡信息）\n• Apple / Google——订阅支付处理\n\n每个第三方都有各自的隐私政策。如果您有疑虑，建议您查阅相关政策。`,
    },
    {
      title: '6. 您的权利',
      body: `根据英国 GDPR 和 2018 年数据保护法，您有权：\n• 访问我们持有的关于您的个人数据。\n• 更正不准确的数据。\n• 请求删除您的数据（"被遗忘权"）。\n• 反对或限制某些处理。\n• 数据可携带性。\n\n如需行使上述任何权利，请通过 synaps@mudimedia.co.uk 联系我们。我们将在 30 天内回复。`,
    },
    {
      title: '7. 数据保留',
      body: `只要您的账户处于活跃状态，我们就会保留您的账户数据。如果您删除账户，所有相关数据将在 30 天内被移除。\n\n存储在您设备上的本地数据由您控制，您可以随时通过"设置 → 删除所有数据"将其删除。`,
    },
    {
      title: '8. 儿童隐私',
      body: `Synaps 不面向 13 岁以下的儿童。我们不会故意收集 13 岁以下儿童的个人数据。如果您认为某位儿童向我们提供了个人数据，请联系我们，我们将立即予以删除。`,
    },
    {
      title: '9. Cookie 与跟踪',
      body: `Synaps 移动应用不使用 Cookie。我们不会跨第三方应用或网站跟踪您的活动。`,
    },
    {
      title: '10. 本政策的变更',
      body: `我们可能会不时更新本隐私政策。重大变更将在应用内通知。在收到此类通知后继续使用应用即表示您接受更新后的政策。`,
    },
    {
      title: '11. 联系方式与投诉',
      body: `如有隐私相关问题，请联系：\n\nMudimedia Ltd\n英国伦敦\nsynaps@mudimedia.co.uk\n\n如果您对我们的回复不满意，您有权向信息专员办公室（ICO）提出投诉，网址为 ico.org.uk。`,
    },
  ],

  pt_BR: [
    {
      title: '1. Quem somos',
      body: `Esta Política de Privacidade é fornecida pela Mudimedia Ltd, uma empresa registrada na Inglaterra e no País de Gales, Londres, Reino Unido ("nós", "nos", "nosso"). Somos o controlador dos dados pessoais coletados por meio do aplicativo Synaps.\n\nContato: synaps@mudimedia.co.uk`,
    },
    {
      title: '2. Quais dados coletamos',
      body: `Coletamos o mínimo de dados necessários para fornecer o serviço:\n\n• Dados da conta: endereço de e-mail, quando você opta por criar uma conta.\n• Dados de uso: contagem de sessões de estudo, dados de sequências e histórico de revisão de cartões — armazenados localmente no seu dispositivo.\n• Dados do dispositivo: tipo de dispositivo e versão do sistema operacional, coletados anonimamente para relatórios de falhas.\n• Dados de compra: status da assinatura, processado pela Apple ou Google. Não recebemos os dados do seu cartão de pagamento.`,
    },
    {
      title: '3. Como usamos seus dados',
      body: `Usamos seus dados para:\n• Fornecer e melhorar o serviço Synaps.\n• Restaurar sua conta e progresso de estudo quando você faz login em um novo dispositivo (PRO).\n• Enviar notificações de lembrete de estudo (somente se você ativar esse recurso).\n• Diagnosticar falhas e corrigir bugs.\n\nNão usamos seus dados para publicidade nem os vendemos a terceiros.`,
    },
    {
      title: '4. Armazenamento e segurança de dados',
      body: `Seus flashcards, baralhos e histórico de estudo são armazenados localmente no seu dispositivo usando SQLite. Esses dados não saem do seu dispositivo, a menos que você ative a sincronização na nuvem (PRO), caso em que são criptografados em trânsito usando TLS e armazenados na infraestrutura do Supabase localizada na UE.\n\nImplementamos medidas técnicas e organizacionais adequadas para proteger seus dados contra acesso não autorizado, perda ou divulgação.`,
    },
    {
      title: '5. Serviços de terceiros',
      body: `Utilizamos os seguintes serviços de terceiros:\n\n• Supabase — autenticação e armazenamento em nuvem (região da UE)\n• RevenueCat — gerenciamento de assinaturas (não recebe dados de cartão)\n• Apple / Google — processamento de pagamentos para assinaturas\n\nCada terceiro possui sua própria política de privacidade. Recomendamos que você as consulte caso tenha dúvidas.`,
    },
    {
      title: '6. Seus direitos',
      body: `De acordo com o GDPR do Reino Unido e a Lei de Proteção de Dados de 2018, você tem o direito de:\n• Acessar os dados pessoais que mantemos sobre você.\n• Corrigir dados imprecisos.\n• Solicitar a exclusão dos seus dados ("direito ao esquecimento").\n• Se opor ou restringir determinados processamentos.\n• Portabilidade de dados.\n\nPara exercer qualquer um desses direitos, entre em contato conosco em synaps@mudimedia.co.uk. Responderemos em até 30 dias.`,
    },
    {
      title: '7. Retenção de dados',
      body: `Mantemos os dados da sua conta enquanto ela estiver ativa. Se você excluir sua conta, todos os dados associados serão removidos em até 30 dias.\n\nOs dados locais armazenados no seu dispositivo estão sob seu controle e podem ser excluídos a qualquer momento em Configurações → Excluir todos os dados.`,
    },
    {
      title: '8. Privacidade de crianças',
      body: `O Synaps não é direcionado a crianças menores de 13 anos. Não coletamos intencionalmente dados pessoais de crianças menores de 13 anos. Se você acredita que uma criança nos forneceu dados pessoais, entre em contato conosco e nós os excluiremos prontamente.`,
    },
    {
      title: '9. Cookies e rastreamento',
      body: `O aplicativo móvel Synaps não utiliza cookies. Não rastreamos sua atividade em aplicativos ou sites de terceiros.`,
    },
    {
      title: '10. Alterações nesta política',
      body: `Podemos atualizar esta Política de Privacidade periodicamente. Alterações significativas serão comunicadas dentro do Aplicativo. O uso continuado do Aplicativo após tal notificação constitui aceitação da política atualizada.`,
    },
    {
      title: '11. Contato e reclamações',
      body: `Para consultas relacionadas à privacidade, entre em contato com:\n\nMudimedia Ltd\nLondres, Reino Unido\nsynaps@mudimedia.co.uk\n\nSe você não estiver satisfeito com nossa resposta, você tem o direito de registrar uma reclamação junto ao Information Commissioner's Office (ICO) em ico.org.uk.`,
    },
  ],

  pt_PT: [
    {
      title: '1. Quem somos',
      body: `A presente Política de Privacidade é disponibilizada pela Mudimedia Ltd, uma empresa registada em Inglaterra e País de Gales, Londres, Reino Unido ("nós", "nos", "nosso"). Somos o responsável pelo tratamento dos dados pessoais recolhidos através da aplicação Synaps.\n\nContacto: synaps@mudimedia.co.uk`,
    },
    {
      title: '2. Que dados recolhemos',
      body: `Recolhemos o mínimo de dados necessários para prestar o serviço:\n\n• Dados da conta: endereço de e-mail, quando opta por criar uma conta.\n• Dados de utilização: número de sessões de estudo, dados de sequências e histórico de revisão de cartões — armazenados localmente no seu dispositivo.\n• Dados do dispositivo: tipo de dispositivo e versão do sistema operativo, recolhidos de forma anónima para relatórios de falhas.\n• Dados de compra: estado da subscrição, processado pela Apple ou Google. Não recebemos os dados do seu cartão de pagamento.`,
    },
    {
      title: '3. Como utilizamos os seus dados',
      body: `Utilizamos os seus dados para:\n• Fornecer e melhorar o serviço Synaps.\n• Restaurar a sua conta e o progresso de estudo quando inicia sessão num novo dispositivo (PRO).\n• Enviar notificações de lembrete de estudo (apenas se ativar esta funcionalidade).\n• Diagnosticar falhas e corrigir erros.\n\nNão utilizamos os seus dados para publicidade nem os vendemos a terceiros.`,
    },
    {
      title: '4. Armazenamento e segurança de dados',
      body: `Os seus cartões, baralhos e histórico de estudo são armazenados localmente no seu dispositivo utilizando SQLite. Estes dados não saem do seu dispositivo, exceto se ativar a sincronização na nuvem (PRO), caso em que são encriptados em trânsito utilizando TLS e armazenados na infraestrutura Supabase localizada na UE.\n\nImplementamos medidas técnicas e organizativas adequadas para proteger os seus dados contra acesso não autorizado, perda ou divulgação.`,
    },
    {
      title: '5. Serviços de terceiros',
      body: `Utilizamos os seguintes serviços de terceiros:\n\n• Supabase — autenticação e armazenamento na nuvem (região da UE)\n• RevenueCat — gestão de subscrições (não recebe dados de cartões)\n• Apple / Google — processamento de pagamentos para subscrições\n\nCada terceiro possui a sua própria política de privacidade. Recomendamos a sua consulta caso tenha preocupações.`,
    },
    {
      title: '6. Os seus direitos',
      body: `Ao abrigo do RGPD do Reino Unido e da Lei de Proteção de Dados de 2018, tem o direito de:\n• Aceder aos dados pessoais que detemos sobre si.\n• Retificar dados inexatos.\n• Solicitar a eliminação dos seus dados ("direito ao apagamento").\n• Opor-se ou restringir determinados tratamentos.\n• Portabilidade dos dados.\n\nPara exercer qualquer um destes direitos, contacte-nos em synaps@mudimedia.co.uk. Responderemos no prazo de 30 dias.`,
    },
    {
      title: '7. Retenção de dados',
      body: `Conservamos os dados da sua conta enquanto esta estiver ativa. Se eliminar a sua conta, todos os dados associados serão removidos no prazo de 30 dias.\n\nOs dados locais armazenados no seu dispositivo estão sob o seu controlo e podem ser eliminados a qualquer momento em Definições → Eliminar todos os dados.`,
    },
    {
      title: '8. Privacidade de menores',
      body: `O Synaps não se destina a crianças com menos de 13 anos. Não recolhemos intencionalmente dados pessoais de crianças com menos de 13 anos. Se considerar que uma criança nos forneceu dados pessoais, contacte-nos e eliminá-los-emos prontamente.`,
    },
    {
      title: '9. Cookies e rastreamento',
      body: `A aplicação móvel Synaps não utiliza cookies. Não rastreamos a sua atividade em aplicações ou sítios web de terceiros.`,
    },
    {
      title: '10. Alterações a esta política',
      body: `Poderemos atualizar esta Política de Privacidade periodicamente. Alterações significativas serão comunicadas dentro da Aplicação. A utilização continuada da Aplicação após tal notificação constitui aceitação da política atualizada.`,
    },
    {
      title: '11. Contacto e reclamações',
      body: `Para questões relacionadas com privacidade, contacte:\n\nMudimedia Ltd\nLondres, Reino Unido\nsynaps@mudimedia.co.uk\n\nSe não estiver satisfeito com a nossa resposta, tem o direito de apresentar uma reclamação junto do Information Commissioner's Office (ICO) em ico.org.uk.`,
    },
  ],
};

export default function PrivacyScreen() {
  const language = useAppStore((s) => s.language);
  const sections = SECTIONS[language] ?? SECTIONS.en;
  const lastUpdated = LAST_UPDATED[language] ?? LAST_UPDATED.en;
  const screenTitle = SCREEN_TITLE[language] ?? SCREEN_TITLE.en;
  const updatedLabel = UPDATED_LABEL[language] ?? UPDATED_LABEL.en;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>{screenTitle}</Text>
        <Pressable onPress={() => router.back()} style={styles.closeBtn}>
          <Ionicons name="close" size={22} color={colors.textSecondary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.meta}>Mudimedia Ltd · {updatedLabel} {lastUpdated}</Text>

        {sections.map((s) => (
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

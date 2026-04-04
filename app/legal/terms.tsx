import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { borderRadius, colors, spacing, typography } from '../../src/constants';
import { useAppStore } from '../../src/stores/useAppStore';

const SCREEN_TITLE: Record<string, string> = {
  en: 'Terms & Conditions',
  es: 'Términos y Condiciones',
  it: 'Termini e Condizioni',
  tr: 'Kullanım Koşulları',
  de: 'Allgemeine Geschäftsbedingungen',
  fr: 'Conditions Générales',
  nl: 'Algemene Voorwaarden',
  ru: 'Условия использования',
  zh: '条款与条件',
  pt_BR: 'Termos e Condições',
  pt_PT: 'Termos e Condições',
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

const LAST_UPDATED: Record<string, string> = {
  en: '30 March 2026',
  es: '30 de marzo de 2026',
  it: '30 marzo 2026',
  tr: '30 Mart 2026',
  de: '30. März 2026',
  fr: '30 mars 2026',
  nl: '30 maart 2026',
  ru: '30 марта 2026 г.',
  zh: '2026年3月30日',
  pt_BR: '30 de março de 2026',
  pt_PT: '30 de março de 2026',
};

const SECTIONS: Record<string, { title: string; body: string }[]> = {
  en: [
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
  ],

  tr: [
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
  ],

  es: [
    {
      title: '1. Aceptación de los Términos',
      body: `Al descargar, instalar o utilizar Synaps ("la Aplicación"), usted acepta quedar vinculado por estos Términos y Condiciones. Si no está de acuerdo, le rogamos que no utilice la Aplicación.\n\nEstos Términos constituyen un acuerdo legalmente vinculante entre usted y Mudimedia Ltd, una sociedad registrada en Inglaterra y Gales ("nosotros", "nos" o "nuestro").`,
    },
    {
      title: '2. Descripción del Servicio',
      body: `Synaps es una aplicación de tarjetas de memoria basada en la repetición espaciada, diseñada para ayudar a los usuarios a memorizar y retener información. La Aplicación funciona principalmente sin conexión; solo se requiere conexión a internet para la creación de cuentas, la sincronización en la nube (PRO) y la descarga de bibliotecas.`,
    },
    {
      title: '3. Cuentas de Usuario',
      body: `Puede utilizar Synaps sin necesidad de crear una cuenta. Si decide crear una, usted es responsable de mantener la confidencialidad de sus credenciales. Debe proporcionar información veraz y notificarnos de inmediato cualquier acceso no autorizado.\n\nDebe tener al menos 13 años de edad para crear una cuenta.`,
    },
    {
      title: '4. Suscripciones y Pagos',
      body: `Synaps ofrece un plan gratuito y una suscripción PRO. Las suscripciones PRO se facturan a través de Apple App Store o Google Play Store. Los precios se muestran antes de la compra y pueden variar según la región.\n\nLas suscripciones se renuevan automáticamente a menos que se cancelen con al menos 24 horas de antelación antes del final del período vigente. Puede gestionar o cancelar su suscripción en los ajustes de cuenta de su dispositivo. No se realizarán reembolsos por períodos de suscripción parciales, salvo cuando lo exija la legislación aplicable.`,
    },
    {
      title: '5. Contenido del Usuario',
      body: `Usted conserva la titularidad de todo el contenido de tarjetas que cree. Al utilizar la Aplicación, nos otorga una licencia limitada y no exclusiva para almacenar y mostrar su contenido con el único fin de prestarle el servicio.\n\nUsted se compromete a no crear contenido que sea ilícito, perjudicial, difamatorio o que infrinja los derechos de propiedad intelectual de terceros.`,
    },
    {
      title: '6. Propiedad Intelectual',
      body: `Todo el diseño, código, gráficos y mazos de biblioteca prediseñados de la Aplicación son propiedad de Mudimedia Ltd o de sus licenciantes y están protegidos por la legislación en materia de propiedad intelectual. Queda prohibido copiar, modificar, distribuir o crear obras derivadas sin nuestro consentimiento previo por escrito.`,
    },
    {
      title: '7. Exclusión de Garantías',
      body: `La Aplicación se proporciona "tal cual" y "según disponibilidad", sin garantías de ningún tipo, ya sean expresas o implícitas. No garantizamos que la Aplicación funcione de forma ininterrumpida, sin errores, ni que esté libre de virus u otros componentes dañinos.`,
    },
    {
      title: '8. Limitación de Responsabilidad',
      body: `En la máxima medida permitida por la ley, Mudimedia Ltd no será responsable de ningún daño indirecto, incidental, especial, consecuente o punitivo derivado del uso o la imposibilidad de uso de la Aplicación, incluso si se nos hubiera advertido de la posibilidad de dichos daños.\n\nNuestra responsabilidad total frente a usted por cualquier reclamación no superará el importe que nos haya abonado en los 12 meses anteriores a dicha reclamación.`,
    },
    {
      title: '9. Legislación Aplicable',
      body: `Estos Términos se rigen por las leyes de Inglaterra y Gales. Cualquier controversia quedará sometida a la jurisdicción exclusiva de los tribunales de Inglaterra y Gales.`,
    },
    {
      title: '10. Modificaciones de los Términos',
      body: `Podemos actualizar estos Términos periódicamente. Los cambios sustanciales se notificarán a través de la Aplicación. El uso continuado tras la notificación constituye la aceptación de los Términos actualizados.`,
    },
    {
      title: '11. Contacto',
      body: `Para consultas sobre estos Términos, póngase en contacto con:\n\nMudimedia Ltd\nLondres, Reino Unido\nsynaps@mudimedia.co.uk`,
    },
  ],

  it: [
    {
      title: '1. Accettazione dei Termini',
      body: `Scaricando, installando o utilizzando Synaps ("l'Applicazione"), l'utente accetta di essere vincolato dai presenti Termini e Condizioni. Qualora non si accettino tali condizioni, si prega di non utilizzare l'Applicazione.\n\nI presenti Termini costituiscono un accordo giuridicamente vincolante tra l'utente e Mudimedia Ltd, una società registrata in Inghilterra e Galles ("noi", "ci" o "nostro").`,
    },
    {
      title: '2. Descrizione del Servizio',
      body: `Synaps è un'applicazione di flashcard basata sulla ripetizione dilazionata, progettata per aiutare gli utenti a memorizzare e conservare le informazioni. L'Applicazione funziona prevalentemente offline; la connessione a internet è necessaria esclusivamente per la creazione dell'account, la sincronizzazione cloud (PRO) e il download delle librerie.`,
    },
    {
      title: '3. Account Utente',
      body: `È possibile utilizzare Synaps senza un account. Qualora si scelga di crearne uno, l'utente è responsabile del mantenimento della riservatezza delle proprie credenziali. È necessario fornire informazioni accurate e comunicarci tempestivamente qualsiasi accesso non autorizzato.\n\nPer creare un account è necessario avere almeno 13 anni di età.`,
    },
    {
      title: '4. Abbonamenti e Pagamenti',
      body: `Synaps offre un piano gratuito e un abbonamento PRO. Gli abbonamenti PRO vengono fatturati tramite Apple App Store o Google Play Store. I prezzi vengono visualizzati prima dell'acquisto e possono variare in base alla regione.\n\nGli abbonamenti si rinnovano automaticamente, salvo disdetta effettuata almeno 24 ore prima della scadenza del periodo in corso. È possibile gestire o annullare l'abbonamento dalle impostazioni dell'account del proprio dispositivo. Non sono previsti rimborsi per periodi di abbonamento parziali, salvo ove previsto dalla normativa applicabile.`,
    },
    {
      title: '5. Contenuti dell\'Utente',
      body: `L'utente mantiene la titolarità di tutti i contenuti delle flashcard creati. Utilizzando l'Applicazione, l'utente concede a noi una licenza limitata e non esclusiva per archiviare e visualizzare i propri contenuti al solo scopo di fornire il servizio.\n\nL'utente si impegna a non creare contenuti illegali, dannosi, diffamatori o lesivi dei diritti di proprietà intellettuale di terzi.`,
    },
    {
      title: '6. Proprietà Intellettuale',
      body: `Tutto il design, il codice, la grafica e i mazzi delle librerie preinstallate dell'Applicazione sono di proprietà di Mudimedia Ltd o dei suoi licenzianti e sono protetti dalle leggi sulla proprietà intellettuale. È vietato copiare, modificare, distribuire o creare opere derivate senza il nostro previo consenso scritto.`,
    },
    {
      title: '7. Esclusione di Garanzie',
      body: `L'Applicazione viene fornita "così com'è" e "come disponibile", senza garanzie di alcun tipo, espresse o implicite. Non garantiamo che l'Applicazione funzionerà senza interruzioni, senza errori, né che sarà priva di virus o altri componenti dannosi.`,
    },
    {
      title: '8. Limitazione di Responsabilità',
      body: `Nella misura massima consentita dalla legge, Mudimedia Ltd non sarà responsabile per danni indiretti, incidentali, speciali, consequenziali o punitivi derivanti dall'utilizzo o dall'impossibilità di utilizzare l'Applicazione, anche qualora fossimo stati informati della possibilità di tali danni.\n\nLa nostra responsabilità complessiva nei confronti dell'utente per qualsiasi reclamo non supererà l'importo corrisposto a noi nei 12 mesi precedenti il reclamo.`,
    },
    {
      title: '9. Legge Applicabile',
      body: `I presenti Termini sono disciplinati dalle leggi di Inghilterra e Galles. Qualsiasi controversia sarà soggetta alla giurisdizione esclusiva dei tribunali di Inghilterra e Galles.`,
    },
    {
      title: '10. Modifiche ai Termini',
      body: `Ci riserviamo il diritto di aggiornare periodicamente i presenti Termini. Le modifiche sostanziali saranno comunicate tramite l'Applicazione. L'uso continuato dell'Applicazione dopo la comunicazione costituisce accettazione dei Termini aggiornati.`,
    },
    {
      title: '11. Contatti',
      body: `Per domande relative ai presenti Termini, si prega di contattare:\n\nMudimedia Ltd\nLondra, Regno Unito\nsynaps@mudimedia.co.uk`,
    },
  ],

  de: [
    {
      title: '1. Annahme der Bedingungen',
      body: `Durch das Herunterladen, Installieren oder Verwenden von Synaps („die App") erklären Sie sich mit diesen Allgemeinen Geschäftsbedingungen einverstanden. Sollten Sie nicht einverstanden sein, bitten wir Sie, die App nicht zu verwenden.\n\nDiese Bedingungen stellen eine rechtsverbindliche Vereinbarung zwischen Ihnen und Mudimedia Ltd dar, einer in England und Wales eingetragenen Gesellschaft („wir", „uns" oder „unser").`,
    },
    {
      title: '2. Beschreibung des Dienstes',
      body: `Synaps ist eine auf dem Prinzip der verteilten Wiederholung basierende Lernkarten-Anwendung, die Nutzern beim Einprägen und Behalten von Informationen helfen soll. Die App funktioniert überwiegend offline; eine Internetverbindung wird nur für die Kontoerstellung, die Cloud-Synchronisierung (PRO) und den Download von Bibliotheken benötigt.`,
    },
    {
      title: '3. Benutzerkonten',
      body: `Sie können Synaps ohne Konto verwenden. Wenn Sie sich für die Erstellung eines Kontos entscheiden, sind Sie für die Vertraulichkeit Ihrer Zugangsdaten verantwortlich. Sie müssen korrekte Angaben machen und uns bei unbefugtem Zugriff unverzüglich benachrichtigen.\n\nFür die Erstellung eines Kontos müssen Sie mindestens 13 Jahre alt sein.`,
    },
    {
      title: '4. Abonnements und Zahlungen',
      body: `Synaps bietet einen kostenlosen Plan und ein PRO-Abonnement an. PRO-Abonnements werden über den Apple App Store oder Google Play Store abgerechnet. Die Preise werden vor dem Kauf angezeigt und können je nach Region variieren.\n\nAbonnements verlängern sich automatisch, sofern sie nicht mindestens 24 Stunden vor Ablauf des laufenden Zeitraums gekündigt werden. Sie können Ihr Abonnement in den Kontoeinstellungen Ihres Geräts verwalten oder kündigen. Für angebrochene Abonnementzeiträume erfolgt keine Rückerstattung, es sei denn, dies ist nach geltendem Recht vorgeschrieben.`,
    },
    {
      title: '5. Nutzerinhalte',
      body: `Sie behalten das Eigentum an allen von Ihnen erstellten Lernkarteninhalten. Durch die Nutzung der App gewähren Sie uns eine eingeschränkte, nicht-exklusive Lizenz zur Speicherung und Anzeige Ihrer Inhalte, ausschließlich zum Zweck der Bereitstellung des Dienstes für Sie.\n\nSie verpflichten sich, keine Inhalte zu erstellen, die rechtswidrig, schädlich, verleumderisch sind oder geistige Eigentumsrechte Dritter verletzen.`,
    },
    {
      title: '6. Geistiges Eigentum',
      body: `Sämtliches App-Design, Code, Grafiken und vorgefertigte Bibliotheks-Kartendecks sind Eigentum von Mudimedia Ltd oder deren Lizenzgebern und durch das Recht des geistigen Eigentums geschützt. Das Kopieren, Modifizieren, Verbreiten oder Erstellen abgeleiteter Werke ohne unsere vorherige schriftliche Zustimmung ist untersagt.`,
    },
    {
      title: '7. Gewährleistungsausschluss',
      body: `Die App wird „wie besehen" und „wie verfügbar" ohne jegliche ausdrückliche oder stillschweigende Gewährleistung bereitgestellt. Wir übernehmen keine Gewähr dafür, dass die App unterbrechungsfrei, fehlerfrei oder frei von Viren oder anderen schädlichen Komponenten ist.`,
    },
    {
      title: '8. Haftungsbeschränkung',
      body: `Im größtmöglichen gesetzlich zulässigen Umfang haftet Mudimedia Ltd nicht für mittelbare, zufällige, besondere, Folge- oder Strafschäden, die aus Ihrer Nutzung oder Nichtnutzbarkeit der App entstehen, selbst wenn wir auf die Möglichkeit solcher Schäden hingewiesen wurden.\n\nUnsere Gesamthaftung Ihnen gegenüber für jedweden Anspruch übersteigt nicht den Betrag, den Sie uns in den 12 Monaten vor dem Anspruch gezahlt haben.`,
    },
    {
      title: '9. Anwendbares Recht',
      body: `Diese Bedingungen unterliegen dem Recht von England und Wales. Etwaige Streitigkeiten unterliegen der ausschließlichen Zuständigkeit der Gerichte von England und Wales.`,
    },
    {
      title: '10. Änderungen der Bedingungen',
      body: `Wir können diese Bedingungen von Zeit zu Zeit aktualisieren. Wesentliche Änderungen werden innerhalb der App mitgeteilt. Die fortgesetzte Nutzung nach der Benachrichtigung gilt als Annahme der aktualisierten Bedingungen.`,
    },
    {
      title: '11. Kontakt',
      body: `Bei Fragen zu diesen Bedingungen wenden Sie sich bitte an:\n\nMudimedia Ltd\nLondon, Vereinigtes Königreich\nsynaps@mudimedia.co.uk`,
    },
  ],

  fr: [
    {
      title: '1. Acceptation des Conditions',
      body: `En téléchargeant, installant ou utilisant Synaps (« l'Application »), vous acceptez d'être lié par les présentes Conditions Générales. Si vous n'êtes pas d'accord, veuillez ne pas utiliser l'Application.\n\nLes présentes Conditions constituent un accord juridiquement contraignant entre vous et Mudimedia Ltd, une société immatriculée en Angleterre et au Pays de Galles (« nous », « notre » ou « nos »).`,
    },
    {
      title: '2. Description du Service',
      body: `Synaps est une application de cartes mémoire basée sur la répétition espacée, conçue pour aider les utilisateurs à mémoriser et retenir des informations. L'Application fonctionne principalement hors ligne ; une connexion internet n'est requise que pour la création de compte, la synchronisation cloud (PRO) et le téléchargement de bibliothèques.`,
    },
    {
      title: '3. Comptes Utilisateur',
      body: `Vous pouvez utiliser Synaps sans créer de compte. Si vous choisissez d'en créer un, vous êtes responsable de la confidentialité de vos identifiants. Vous devez fournir des informations exactes et nous informer immédiatement de tout accès non autorisé.\n\nVous devez avoir au moins 13 ans pour créer un compte.`,
    },
    {
      title: '4. Abonnements et Paiements',
      body: `Synaps propose une offre gratuite et un abonnement PRO. Les abonnements PRO sont facturés via l'Apple App Store ou le Google Play Store. Les prix sont affichés avant l'achat et peuvent varier selon la région.\n\nLes abonnements se renouvellent automatiquement sauf annulation au moins 24 heures avant la fin de la période en cours. Vous pouvez gérer ou annuler votre abonnement dans les paramètres de compte de votre appareil. Aucun remboursement n'est accordé pour les périodes d'abonnement partielles, sauf si la législation applicable l'exige.`,
    },
    {
      title: '5. Contenu Utilisateur',
      body: `Vous conservez la propriété de tout contenu de cartes que vous créez. En utilisant l'Application, vous nous accordez une licence limitée et non exclusive pour stocker et afficher votre contenu dans le seul but de vous fournir le service.\n\nVous vous engagez à ne pas créer de contenu illicite, nuisible, diffamatoire ou portant atteinte aux droits de propriété intellectuelle de tiers.`,
    },
    {
      title: '6. Propriété Intellectuelle',
      body: `L'ensemble du design, du code, des graphismes et des jeux de cartes de bibliothèque prédéfinis de l'Application sont la propriété de Mudimedia Ltd ou de ses concédants de licence et sont protégés par les lois sur la propriété intellectuelle. Toute reproduction, modification, distribution ou création d'œuvres dérivées est interdite sans notre consentement écrit préalable.`,
    },
    {
      title: '7. Exclusion de Garanties',
      body: `L'Application est fournie « en l'état » et « selon disponibilité », sans garantie d'aucune sorte, expresse ou implicite. Nous ne garantissons pas que l'Application fonctionnera sans interruption, sans erreur, ni qu'elle sera exempte de virus ou d'autres composants nuisibles.`,
    },
    {
      title: '8. Limitation de Responsabilité',
      body: `Dans toute la mesure permise par la loi, Mudimedia Ltd ne saurait être tenue responsable de tout dommage indirect, accessoire, spécial, consécutif ou punitif résultant de votre utilisation ou de votre incapacité à utiliser l'Application, même si nous avons été informés de la possibilité de tels dommages.\n\nNotre responsabilité totale envers vous pour toute réclamation ne saurait excéder le montant que vous nous avez versé au cours des 12 mois précédant la réclamation.`,
    },
    {
      title: '9. Droit Applicable',
      body: `Les présentes Conditions sont régies par le droit de l'Angleterre et du Pays de Galles. Tout litige sera soumis à la compétence exclusive des tribunaux d'Angleterre et du Pays de Galles.`,
    },
    {
      title: '10. Modifications des Conditions',
      body: `Nous pouvons mettre à jour les présentes Conditions de temps à autre. Les modifications substantielles seront notifiées au sein de l'Application. La poursuite de l'utilisation après notification vaut acceptation des Conditions mises à jour.`,
    },
    {
      title: '11. Contact',
      body: `Pour toute question relative aux présentes Conditions, veuillez contacter :\n\nMudimedia Ltd\nLondres, Royaume-Uni\nsynaps@mudimedia.co.uk`,
    },
  ],

  nl: [
    {
      title: '1. Aanvaarding van de Voorwaarden',
      body: `Door Synaps ("de App") te downloaden, installeren of gebruiken, stemt u ermee in gebonden te zijn aan deze Algemene Voorwaarden. Indien u niet akkoord gaat, verzoeken wij u de App niet te gebruiken.\n\nDeze Voorwaarden vormen een juridisch bindende overeenkomst tussen u en Mudimedia Ltd, een in Engeland en Wales geregistreerde onderneming ("wij", "ons" of "onze").`,
    },
    {
      title: '2. Beschrijving van de Dienst',
      body: `Synaps is een flashcard-applicatie gebaseerd op gespreid herhalen, ontworpen om gebruikers te helpen bij het memoriseren en onthouden van informatie. De App werkt voornamelijk offline; een internetverbinding is uitsluitend vereist voor het aanmaken van een account, cloudsynchronisatie (PRO) en het downloaden van bibliotheken.`,
    },
    {
      title: '3. Gebruikersaccounts',
      body: `U kunt Synaps gebruiken zonder account. Indien u ervoor kiest een account aan te maken, bent u verantwoordelijk voor het vertrouwelijk houden van uw inloggegevens. U dient correcte informatie te verstrekken en ons onmiddellijk op de hoogte te stellen van onbevoegde toegang.\n\nU dient ten minste 13 jaar oud te zijn om een account aan te maken.`,
    },
    {
      title: '4. Abonnementen en Betalingen',
      body: `Synaps biedt een gratis abonnement en een PRO-abonnement aan. PRO-abonnementen worden gefactureerd via de Apple App Store of Google Play Store. Prijzen worden voorafgaand aan de aankoop weergegeven en kunnen per regio verschillen.\n\nAbonnementen worden automatisch verlengd, tenzij ten minste 24 uur voor het einde van de lopende periode wordt opgezegd. U kunt uw abonnement beheren of opzeggen via de accountinstellingen van uw apparaat. Voor gedeeltelijke abonnementsperioden wordt geen restitutie verleend, behalve waar de toepasselijke wetgeving dit vereist.`,
    },
    {
      title: '5. Gebruikersinhoud',
      body: `U behoudt het eigendom van alle door u aangemaakte flashcard-inhoud. Door de App te gebruiken, verleent u ons een beperkte, niet-exclusieve licentie om uw inhoud op te slaan en weer te geven, uitsluitend ten behoeve van het verlenen van de dienst aan u.\n\nU verbindt zich ertoe geen inhoud te creëren die onrechtmatig, schadelijk, lasterlijk is of inbreuk maakt op de intellectuele eigendomsrechten van derden.`,
    },
    {
      title: '6. Intellectueel Eigendom',
      body: `Alle App-ontwerpen, code, grafische elementen en vooraf samengestelde bibliotheekkaartspellen zijn eigendom van Mudimedia Ltd of haar licentiegevers en worden beschermd door wetgeving inzake intellectueel eigendom. Het is niet toegestaan om zonder onze voorafgaande schriftelijke toestemming te kopiëren, te wijzigen, te verspreiden of afgeleide werken te maken.`,
    },
    {
      title: '7. Uitsluiting van Garanties',
      body: `De App wordt aangeboden "zoals deze is" en "zoals beschikbaar", zonder enige garantie, uitdrukkelijk noch stilzwijgend. Wij garanderen niet dat de App ononderbroken, foutloos of vrij van virussen of andere schadelijke componenten zal functioneren.`,
    },
    {
      title: '8. Beperking van Aansprakelijkheid',
      body: `Voor zover wettelijk toegestaan is Mudimedia Ltd niet aansprakelijk voor indirecte, incidentele, bijzondere, gevolg- of punitieve schade die voortvloeit uit uw gebruik van of onvermogen tot gebruik van de App, zelfs indien wij op de hoogte zijn gesteld van de mogelijkheid van dergelijke schade.\n\nOnze totale aansprakelijkheid jegens u voor enige vordering bedraagt niet meer dan het bedrag dat u ons heeft betaald in de 12 maanden voorafgaand aan de vordering.`,
    },
    {
      title: '9. Toepasselijk Recht',
      body: `Deze Voorwaarden worden beheerst door het recht van Engeland en Wales. Geschillen vallen onder de exclusieve bevoegdheid van de rechter in Engeland en Wales.`,
    },
    {
      title: '10. Wijziging van de Voorwaarden',
      body: `Wij kunnen deze Voorwaarden van tijd tot tijd bijwerken. Wezenlijke wijzigingen worden via de App medegedeeld. Voortgezet gebruik na kennisgeving geldt als aanvaarding van de bijgewerkte Voorwaarden.`,
    },
    {
      title: '11. Contact',
      body: `Voor vragen over deze Voorwaarden kunt u contact opnemen met:\n\nMudimedia Ltd\nLonden, Verenigd Koninkrijk\nsynaps@mudimedia.co.uk`,
    },
  ],

  ru: [
    {
      title: '1. Принятие условий',
      body: `Загружая, устанавливая или используя Synaps («Приложение»), вы соглашаетесь соблюдать настоящие Условия использования. Если вы не согласны, пожалуйста, не используйте Приложение.\n\nНастоящие Условия представляют собой юридически обязывающее соглашение между вами и Mudimedia Ltd — компанией, зарегистрированной в Англии и Уэльсе («мы», «нас» или «наш»).`,
    },
    {
      title: '2. Описание сервиса',
      body: `Synaps — это приложение для работы с карточками на основе метода интервального повторения, предназначенное для запоминания и удержания информации. Приложение работает преимущественно в автономном режиме; подключение к интернету требуется только для создания учётной записи, облачной синхронизации (PRO) и загрузки библиотек.`,
    },
    {
      title: '3. Учётные записи пользователей',
      body: `Вы можете использовать Synaps без учётной записи. Если вы решите её создать, вы несёте ответственность за сохранение конфиденциальности своих учётных данных. Вы обязаны предоставлять достоверную информацию и незамедлительно уведомлять нас о любом несанкционированном доступе.\n\nДля создания учётной записи необходимо достичь возраста 13 лет.`,
    },
    {
      title: '4. Подписки и платежи',
      body: `Synaps предлагает бесплатный тариф и подписку PRO. Подписки PRO оплачиваются через Apple App Store или Google Play Store. Цены отображаются перед покупкой и могут варьироваться в зависимости от региона.\n\nПодписки продлеваются автоматически, если они не отменены не менее чем за 24 часа до окончания текущего периода. Управлять подпиской или отменить её можно в настройках учётной записи вашего устройства. Возврат средств за неполные периоды подписки не осуществляется, за исключением случаев, предусмотренных применимым законодательством.`,
    },
    {
      title: '5. Пользовательский контент',
      body: `Вы сохраняете право собственности на весь созданный вами контент карточек. Используя Приложение, вы предоставляете нам ограниченную неисключительную лицензию на хранение и отображение вашего контента исключительно в целях оказания вам услуги.\n\nВы обязуетесь не создавать контент, который является незаконным, вредоносным, клеветническим или нарушает права интеллектуальной собственности третьих лиц.`,
    },
    {
      title: '6. Интеллектуальная собственность',
      body: `Весь дизайн Приложения, программный код, графика и предустановленные библиотечные колоды являются собственностью Mudimedia Ltd или её лицензиаров и защищены законодательством об интеллектуальной собственности. Копирование, изменение, распространение или создание производных произведений без нашего предварительного письменного согласия запрещено.`,
    },
    {
      title: '7. Отказ от гарантий',
      body: `Приложение предоставляется «как есть» и «по мере доступности» без каких-либо гарантий, явных или подразумеваемых. Мы не гарантируем, что Приложение будет работать бесперебойно, без ошибок или будет свободно от вирусов и других вредоносных компонентов.`,
    },
    {
      title: '8. Ограничение ответственности',
      body: `В максимальной степени, допускаемой законом, Mudimedia Ltd не несёт ответственности за косвенные, случайные, особые, последующие или штрафные убытки, возникающие в связи с использованием или невозможностью использования Приложения, даже если нам было сообщено о возможности таких убытков.\n\nНаша совокупная ответственность перед вами по любому требованию не превышает сумму, уплаченную вами нам за 12 месяцев, предшествующих предъявлению требования.`,
    },
    {
      title: '9. Применимое право',
      body: `Настоящие Условия регулируются законодательством Англии и Уэльса. Любые споры подлежат исключительной юрисдикции судов Англии и Уэльса.`,
    },
    {
      title: '10. Изменение условий',
      body: `Мы можем время от времени обновлять настоящие Условия. О существенных изменениях будет сообщено в Приложении. Продолжение использования Приложения после уведомления означает принятие обновлённых Условий.`,
    },
    {
      title: '11. Контакты',
      body: `По вопросам, касающимся настоящих Условий, обращайтесь:\n\nMudimedia Ltd\nЛондон, Великобритания\nsynaps@mudimedia.co.uk`,
    },
  ],

  zh: [
    {
      title: '1. 条款的接受',
      body: `下载、安装或使用 Synaps（以下简称"本应用"）即表示您同意受本条款与条件的约束。如您不同意，请勿使用本应用。\n\n本条款构成您与 Mudimedia Ltd（一家在英格兰和威尔士注册的公司，以下简称"我们"或"我方"）之间具有法律约束力的协议。`,
    },
    {
      title: '2. 服务说明',
      body: `Synaps 是一款基于间隔重复原理的闪卡应用，旨在帮助用户记忆和巩固知识。本应用以离线运行为主；仅在创建账户、云同步（PRO）和下载资料库时需要互联网连接。`,
    },
    {
      title: '3. 用户账户',
      body: `您可以在不创建账户的情况下使用 Synaps。如果您选择创建账户，您有责任对登录凭据予以保密。您须提供准确信息，并在发现未经授权的访问时立即通知我们。\n\n创建账户须年满 13 周岁。`,
    },
    {
      title: '4. 订阅与付款',
      body: `Synaps 提供免费版和 PRO 订阅服务。PRO 订阅通过 Apple App Store 或 Google Play Store 计费。价格在购买前展示，可能因地区而异。\n\n订阅将自动续订，除非在当前订阅期结束前至少 24 小时取消。您可以在设备的账户设置中管理或取消订阅。除适用法律另有规定外，不对部分订阅期退款。`,
    },
    {
      title: '5. 用户内容',
      body: `您创建的所有闪卡内容的所有权归您所有。使用本应用即表示您向我们授予一项有限的、非排他性的许可，仅用于为您提供服务而存储和展示您的内容。\n\n您同意不创建任何违法、有害、诽谤性的内容或侵犯第三方知识产权的内容。`,
    },
    {
      title: '6. 知识产权',
      body: `本应用的所有设计、代码、图形以及预置资料库卡组均为 Mudimedia Ltd 或其许可方的财产，受知识产权法保护。未经我方事先书面同意，不得复制、修改、分发或创建衍生作品。`,
    },
    {
      title: '7. 免责声明',
      body: `本应用按"现状"和"可用性"提供，不作任何形式的明示或暗示保证。我们不保证本应用将不间断运行、无错误，也不保证不含病毒或其他有害组件。`,
    },
    {
      title: '8. 责任限制',
      body: `在法律允许的最大范围内，Mudimedia Ltd 不对因您使用或无法使用本应用而产生的任何间接的、附带的、特殊的、后果性的或惩罚性的损害承担责任，即使我方已被告知此类损害的可能性。\n\n我方对您就任何索赔承担的全部责任不超过您在索赔前 12 个月内向我方支付的金额。`,
    },
    {
      title: '9. 适用法律',
      body: `本条款受英格兰和威尔士法律管辖。任何争议均受英格兰和威尔士法院的专属管辖。`,
    },
    {
      title: '10. 条款变更',
      body: `我们可能会不时更新本条款。重大变更将在本应用内通知。收到通知后继续使用即表示接受更新后的条款。`,
    },
    {
      title: '11. 联系方式',
      body: `如对本条款有任何疑问，请联系：\n\nMudimedia Ltd\n英国伦敦\nsynaps@mudimedia.co.uk`,
    },
  ],

  pt_BR: [
    {
      title: '1. Aceitação dos Termos',
      body: `Ao baixar, instalar ou utilizar o Synaps ("o Aplicativo"), você concorda em vincular-se a estes Termos e Condições. Caso não concorde, solicitamos que não utilize o Aplicativo.\n\nEstes Termos constituem um acordo juridicamente vinculante entre você e a Mudimedia Ltd, uma empresa registrada na Inglaterra e no País de Gales ("nós", "nos" ou "nosso").`,
    },
    {
      title: '2. Descrição do Serviço',
      body: `O Synaps é um aplicativo de cartões de memorização baseado em repetição espaçada, projetado para ajudar os usuários a memorizar e reter informações. O Aplicativo funciona predominantemente offline; a conexão com a internet é necessária apenas para criação de conta, sincronização na nuvem (PRO) e download de bibliotecas.`,
    },
    {
      title: '3. Contas de Usuário',
      body: `Você pode utilizar o Synaps sem criar uma conta. Caso opte por criar uma, você é responsável por manter a confidencialidade de suas credenciais. Você deve fornecer informações precisas e nos notificar imediatamente sobre qualquer acesso não autorizado.\n\nÉ necessário ter pelo menos 13 anos de idade para criar uma conta.`,
    },
    {
      title: '4. Assinaturas e Pagamentos',
      body: `O Synaps oferece um plano gratuito e uma assinatura PRO. As assinaturas PRO são cobradas pela Apple App Store ou Google Play Store. Os preços são exibidos antes da compra e podem variar conforme a região.\n\nAs assinaturas são renovadas automaticamente, a menos que sejam canceladas com pelo menos 24 horas de antecedência do término do período vigente. Você pode gerenciar ou cancelar sua assinatura nas configurações de conta do seu dispositivo. Não são concedidos reembolsos por períodos parciais de assinatura, exceto quando exigido pela legislação aplicável.`,
    },
    {
      title: '5. Conteúdo do Usuário',
      body: `Você mantém a titularidade de todo o conteúdo de cartões que criar. Ao utilizar o Aplicativo, você nos concede uma licença limitada e não exclusiva para armazenar e exibir seu conteúdo exclusivamente com a finalidade de lhe prestar o serviço.\n\nVocê concorda em não criar conteúdo que seja ilegal, prejudicial, difamatório ou que viole direitos de propriedade intelectual de terceiros.`,
    },
    {
      title: '6. Propriedade Intelectual',
      body: `Todo o design, código, elementos gráficos e baralhos de biblioteca pré-construídos do Aplicativo são de propriedade da Mudimedia Ltd ou de seus licenciadores e são protegidos pelas leis de propriedade intelectual. É proibido copiar, modificar, distribuir ou criar obras derivadas sem nosso consentimento prévio por escrito.`,
    },
    {
      title: '7. Isenção de Garantias',
      body: `O Aplicativo é fornecido "no estado em que se encontra" e "conforme disponível", sem garantias de qualquer natureza, expressas ou implícitas. Não garantimos que o Aplicativo funcionará sem interrupções, sem erros, nem que estará livre de vírus ou outros componentes prejudiciais.`,
    },
    {
      title: '8. Limitação de Responsabilidade',
      body: `Na máxima extensão permitida por lei, a Mudimedia Ltd não será responsável por quaisquer danos indiretos, incidentais, especiais, consequenciais ou punitivos decorrentes do uso ou da impossibilidade de uso do Aplicativo, mesmo que tenhamos sido informados da possibilidade de tais danos.\n\nNossa responsabilidade total perante você por qualquer reclamação não excederá o valor pago por você a nós nos 12 meses anteriores à reclamação.`,
    },
    {
      title: '9. Legislação Aplicável',
      body: `Estes Termos são regidos pelas leis da Inglaterra e do País de Gales. Quaisquer litígios estarão sujeitos à jurisdição exclusiva dos tribunais da Inglaterra e do País de Gales.`,
    },
    {
      title: '10. Alterações nos Termos',
      body: `Podemos atualizar estes Termos periodicamente. Alterações substanciais serão notificadas por meio do Aplicativo. O uso continuado após a notificação constitui aceitação dos Termos atualizados.`,
    },
    {
      title: '11. Contato',
      body: `Para dúvidas sobre estes Termos, entre em contato:\n\nMudimedia Ltd\nLondres, Reino Unido\nsynaps@mudimedia.co.uk`,
    },
  ],

  pt_PT: [
    {
      title: '1. Aceitação dos Termos',
      body: `Ao descarregar, instalar ou utilizar o Synaps ("a Aplicação"), o utilizador aceita ficar vinculado aos presentes Termos e Condições. Caso não concorde, solicitamos que não utilize a Aplicação.\n\nOs presentes Termos constituem um acordo juridicamente vinculativo entre o utilizador e a Mudimedia Ltd, uma sociedade registada em Inglaterra e no País de Gales ("nós", "nos" ou "nosso").`,
    },
    {
      title: '2. Descrição do Serviço',
      body: `O Synaps é uma aplicação de cartões de memorização baseada em repetição espaçada, concebida para ajudar os utilizadores a memorizar e reter informações. A Aplicação funciona predominantemente offline; a ligação à internet é necessária apenas para a criação de conta, sincronização na nuvem (PRO) e transferência de bibliotecas.`,
    },
    {
      title: '3. Contas de Utilizador',
      body: `Pode utilizar o Synaps sem criar uma conta. Caso opte por criar uma, é responsável por manter a confidencialidade das suas credenciais. Deve fornecer informações exatas e notificar-nos imediatamente de qualquer acesso não autorizado.\n\nÉ necessário ter pelo menos 13 anos de idade para criar uma conta.`,
    },
    {
      title: '4. Subscrições e Pagamentos',
      body: `O Synaps disponibiliza um plano gratuito e uma subscrição PRO. As subscrições PRO são faturadas através da Apple App Store ou do Google Play Store. Os preços são apresentados antes da compra e podem variar consoante a região.\n\nAs subscrições são renovadas automaticamente, salvo cancelamento com pelo menos 24 horas de antecedência relativamente ao final do período em curso. Pode gerir ou cancelar a sua subscrição nas definições de conta do seu dispositivo. Não são concedidos reembolsos por períodos parciais de subscrição, exceto quando exigido pela legislação aplicável.`,
    },
    {
      title: '5. Conteúdo do Utilizador',
      body: `O utilizador mantém a titularidade de todo o conteúdo de cartões que criar. Ao utilizar a Aplicação, concede-nos uma licença limitada e não exclusiva para armazenar e apresentar o seu conteúdo exclusivamente com a finalidade de lhe prestar o serviço.\n\nO utilizador compromete-se a não criar conteúdo que seja ilegal, prejudicial, difamatório ou que viole direitos de propriedade intelectual de terceiros.`,
    },
    {
      title: '6. Propriedade Intelectual',
      body: `Todo o design, código, elementos gráficos e baralhos de biblioteca pré-construídos da Aplicação são propriedade da Mudimedia Ltd ou dos seus licenciadores e estão protegidos pela legislação de propriedade intelectual. É proibido copiar, modificar, distribuir ou criar obras derivadas sem o nosso consentimento prévio por escrito.`,
    },
    {
      title: '7. Exclusão de Garantias',
      body: `A Aplicação é disponibilizada "tal como está" e "conforme disponível", sem garantias de qualquer natureza, expressas ou implícitas. Não garantimos que a Aplicação funcionará sem interrupções, sem erros, nem que estará isenta de vírus ou outros componentes prejudiciais.`,
    },
    {
      title: '8. Limitação de Responsabilidade',
      body: `Na máxima extensão permitida por lei, a Mudimedia Ltd não será responsável por quaisquer danos indiretos, incidentais, especiais, consequenciais ou punitivos decorrentes da utilização ou da impossibilidade de utilização da Aplicação, mesmo que tenhamos sido informados da possibilidade de tais danos.\n\nA nossa responsabilidade total perante o utilizador por qualquer reclamação não excederá o montante pago pelo utilizador nos 12 meses anteriores à reclamação.`,
    },
    {
      title: '9. Legislação Aplicável',
      body: `Os presentes Termos são regidos pela legislação de Inglaterra e do País de Gales. Quaisquer litígios ficam sujeitos à jurisdição exclusiva dos tribunais de Inglaterra e do País de Gales.`,
    },
    {
      title: '10. Alterações aos Termos',
      body: `Podemos atualizar os presentes Termos periodicamente. As alterações substanciais serão notificadas através da Aplicação. A continuação da utilização após a notificação constitui aceitação dos Termos atualizados.`,
    },
    {
      title: '11. Contacto',
      body: `Para questões relativas aos presentes Termos, queira contactar:\n\nMudimedia Ltd\nLondres, Reino Unido\nsynaps@mudimedia.co.uk`,
    },
  ],
};

export default function TermsScreen() {
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

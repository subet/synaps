import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import React from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { borderRadius, colors, spacing, typography } from '../../src/constants';
import { tap } from '../../src/utils/haptics';
import { useAppStore } from '../../src/stores/useAppStore';

const SUPPORT_EMAIL = 'synaps@mudimedia.co.uk';

/* ────────────────────────────────────────────────────────────
   UI strings per language
   ──────────────────────────────────────────────────────────── */

interface Strings {
  title: string;
  getInTouch: string;
  emailSupport: string;
  faq: string;
  note: string;
  cannotOpenEmail: string;
  pleaseEmailUs: string;
}

const STRINGS: Record<string, Strings> = {
  en: {
    title: 'Contact Support',
    getInTouch: 'GET IN TOUCH',
    emailSupport: 'Email Support',
    faq: 'FREQUENTLY ASKED QUESTIONS',
    note: "We're a small team at Mudimedia Ltd, London. We aim to respond within 1–2 business days.",
    cannotOpenEmail: 'Cannot open email',
    pleaseEmailUs: `Please email us at ${SUPPORT_EMAIL}`,
  },
  tr: {
    title: 'Destek ile İletişim',
    getInTouch: 'İLETİŞİME GEÇİN',
    emailSupport: 'E-posta Desteği',
    faq: 'SIK SORULAN SORULAR',
    note: "Mudimedia Ltd, Londra'da küçük bir ekibiz. 1-2 iş günü içinde yanıt vermeyi hedefliyoruz.",
    cannotOpenEmail: 'E-posta açılamıyor',
    pleaseEmailUs: `Lütfen bize şu adresten e-posta gönderin: ${SUPPORT_EMAIL}`,
  },
  es: {
    title: 'Contactar con soporte',
    getInTouch: 'PONTE EN CONTACTO',
    emailSupport: 'Soporte por correo',
    faq: 'PREGUNTAS FRECUENTES',
    note: 'Somos un equipo pequeño en Mudimedia Ltd, Londres. Respondemos en un plazo de 1-2 días laborables.',
    cannotOpenEmail: 'No se puede abrir el correo',
    pleaseEmailUs: `Envíanos un correo a ${SUPPORT_EMAIL}`,
  },
  it: {
    title: 'Contatta il supporto',
    getInTouch: 'CONTATTACI',
    emailSupport: 'Supporto via e-mail',
    faq: 'DOMANDE FREQUENTI',
    note: 'Siamo un piccolo team di Mudimedia Ltd, Londra. Rispondiamo entro 1-2 giorni lavorativi.',
    cannotOpenEmail: "Impossibile aprire l'e-mail",
    pleaseEmailUs: `Scrivici a ${SUPPORT_EMAIL}`,
  },
  de: {
    title: 'Support kontaktieren',
    getInTouch: 'KONTAKT AUFNEHMEN',
    emailSupport: 'E-Mail-Support',
    faq: 'HÄUFIG GESTELLTE FRAGEN',
    note: 'Wir sind ein kleines Team bei Mudimedia Ltd in London. Wir antworten in der Regel innerhalb von 1–2 Werktagen.',
    cannotOpenEmail: 'E-Mail kann nicht geöffnet werden',
    pleaseEmailUs: `Bitte schreiben Sie uns an ${SUPPORT_EMAIL}`,
  },
  fr: {
    title: 'Contacter le support',
    getInTouch: 'NOUS CONTACTER',
    emailSupport: 'Support par e-mail',
    faq: 'FOIRE AUX QUESTIONS',
    note: 'Nous sommes une petite équipe chez Mudimedia Ltd, à Londres. Nous répondons sous 1 à 2 jours ouvrés.',
    cannotOpenEmail: "Impossible d'ouvrir l'e-mail",
    pleaseEmailUs: `Veuillez nous écrire à ${SUPPORT_EMAIL}`,
  },
  nl: {
    title: 'Contact opnemen',
    getInTouch: 'NEEM CONTACT OP',
    emailSupport: 'E-mailondersteuning',
    faq: 'VEELGESTELDE VRAGEN',
    note: 'Wij zijn een klein team bij Mudimedia Ltd in Londen. We streven ernaar binnen 1-2 werkdagen te antwoorden.',
    cannotOpenEmail: 'Kan e-mail niet openen',
    pleaseEmailUs: `Stuur ons een e-mail op ${SUPPORT_EMAIL}`,
  },
  ru: {
    title: 'Связаться с поддержкой',
    getInTouch: 'СВЯЖИТЕСЬ С НАМИ',
    emailSupport: 'Написать на e-mail',
    faq: 'ЧАСТО ЗАДАВАЕМЫЕ ВОПРОСЫ',
    note: 'Мы — небольшая команда Mudimedia Ltd из Лондона. Мы стараемся отвечать в течение 1–2 рабочих дней.',
    cannotOpenEmail: 'Не удалось открыть почту',
    pleaseEmailUs: `Напишите нам на ${SUPPORT_EMAIL}`,
  },
  zh: {
    title: '联系支持',
    getInTouch: '联系我们',
    emailSupport: '邮件支持',
    faq: '常见问题',
    note: '我们是位于伦敦的 Mudimedia Ltd 小团队，通常会在 1-2 个工作日内回复。',
    cannotOpenEmail: '无法打开邮件',
    pleaseEmailUs: `请发送邮件至 ${SUPPORT_EMAIL}`,
  },
  pt_BR: {
    title: 'Fale com o suporte',
    getInTouch: 'ENTRE EM CONTATO',
    emailSupport: 'Suporte por e-mail',
    faq: 'PERGUNTAS FREQUENTES',
    note: 'Somos uma pequena equipe na Mudimedia Ltd, em Londres. Procuramos responder em até 1-2 dias úteis.',
    cannotOpenEmail: 'Não foi possível abrir o e-mail',
    pleaseEmailUs: `Envie um e-mail para ${SUPPORT_EMAIL}`,
  },
  pt_PT: {
    title: 'Contactar o suporte',
    getInTouch: 'ENTRE EM CONTACTO',
    emailSupport: 'Suporte por e-mail',
    faq: 'PERGUNTAS FREQUENTES',
    note: 'Somos uma pequena equipa na Mudimedia Ltd, em Londres. Procuramos responder no prazo de 1-2 dias úteis.',
    cannotOpenEmail: 'Não foi possível abrir o e-mail',
    pleaseEmailUs: `Envie-nos um e-mail para ${SUPPORT_EMAIL}`,
  },
};

/* ────────────────────────────────────────────────────────────
   FAQ entries per language
   ──────────────────────────────────────────────────────────── */

interface FaqItem {
  q: string;
  a: string;
}

const FAQS: Record<string, FaqItem[]> = {
  en: [
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
  ],

  tr: [
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
  ],

  es: [
    {
      q: '¿Cómo funciona la repetición espaciada?',
      a: 'Synaps utiliza el algoritmo SM-2. Las tarjetas que te resultan difíciles aparecen con más frecuencia; las que dominas aparecen con menos frecuencia. Con el tiempo, el sistema programa los repasos justo antes de que vayas a olvidar, lo que hace el aprendizaje mucho más eficiente que releer.',
    },
    {
      q: '¿Por qué mi racha muestra 0?',
      a: 'Tu racha aumenta cuando completas una sesión de estudio completa. Las rachas tienen un día de gracia: si estudiaste ayer pero aún no hoy, tu racha se mantiene hasta el final del día.',
    },
    {
      q: '¿Puedo usar Synaps sin conexión?',
      a: 'Sí. Todos tus mazos y sesiones de estudio se almacenan localmente en tu dispositivo. Solo se necesita conexión a internet para iniciar sesión, sincronización en la nube (PRO) y descargar mazos de la biblioteca.',
    },
    {
      q: '¿Cómo restauro mi suscripción PRO?',
      a: 'Ve a Ajustes → Gestionar suscripción y pulsa "Restaurar compras". Tu suscripción se restaurará si fue adquirida con la misma cuenta de App Store o Google Play.',
    },
    {
      q: '¿Cómo elimino mis datos?',
      a: 'Ve a Ajustes → Eliminar todos los datos. Esto elimina todos los mazos, tarjetas e historial de estudio de tu dispositivo. Si tienes la sincronización en la nube activada, contacta con soporte para eliminar los datos del servidor.',
    },
    {
      q: 'Encontré un error, ¿cómo lo reporto?',
      a: `Envíanos un correo a ${SUPPORT_EMAIL} con una descripción de lo ocurrido, el modelo de tu dispositivo y la versión de iOS/Android. Las capturas de pantalla siempre son de ayuda.`,
    },
  ],

  it: [
    {
      q: 'Come funziona la ripetizione dilazionata?',
      a: "Synaps utilizza l'algoritmo SM-2. Le carte che trovi difficili compaiono più spesso; quelle che conosci bene compaiono meno frequentemente. Nel tempo, il sistema pianifica i ripassi poco prima che tu dimentichi, rendendo l'apprendimento molto più efficace della semplice rilettura.",
    },
    {
      q: 'Perché la mia serie mostra 0?',
      a: 'La tua serie aumenta quando completi una sessione di studio completa. Le serie hanno un giorno di tolleranza: se hai studiato ieri ma non ancora oggi, la tua serie viene mantenuta fino alla fine della giornata.',
    },
    {
      q: 'Posso usare Synaps offline?',
      a: 'Sì. Tutti i tuoi mazzi e le sessioni di studio sono salvati localmente sul tuo dispositivo. La connessione a internet è necessaria solo per accedere al tuo account, la sincronizzazione cloud (PRO) e il download dei mazzi dalla libreria.',
    },
    {
      q: 'Come ripristino il mio abbonamento PRO?',
      a: 'Vai su Impostazioni → Gestisci abbonamento e tocca "Ripristina acquisti". Il tuo abbonamento verrà ripristinato se è stato acquistato con lo stesso account App Store o Google Play.',
    },
    {
      q: 'Come elimino i miei dati?',
      a: 'Vai su Impostazioni → Elimina tutti i dati. Questa operazione rimuove tutti i mazzi, le carte e la cronologia di studio dal tuo dispositivo. Se hai la sincronizzazione cloud attiva, contatta il supporto per rimuovere i dati dal server.',
    },
    {
      q: 'Ho trovato un bug — come lo segnalo?',
      a: `Scrivici a ${SUPPORT_EMAIL} con una descrizione dell'accaduto, il modello del tuo dispositivo e la versione iOS/Android. Gli screenshot sono sempre utili.`,
    },
  ],

  de: [
    {
      q: 'Wie funktioniert verteiltes Wiederholen?',
      a: 'Synaps verwendet den SM-2-Algorithmus. Karten, die dir schwerfallen, erscheinen häufiger; Karten, die du gut kennst, erscheinen seltener. Mit der Zeit plant das System Wiederholungen genau dann, wenn du kurz vor dem Vergessen stehst — das macht das Lernen deutlich effizienter als bloßes Nachlesen.',
    },
    {
      q: 'Warum zeigt meine Serie 0 an?',
      a: 'Deine Serie erhöht sich, sobald du eine vollständige Lernsitzung abschließt. Serien haben eine eintägige Toleranz — wenn du gestern gelernt hast, aber heute noch nicht, bleibt deine Serie bis zum Ende des heutigen Tages erhalten.',
    },
    {
      q: 'Kann ich Synaps offline nutzen?',
      a: 'Ja. Alle deine Stapel und Lernsitzungen werden lokal auf deinem Gerät gespeichert. Eine Internetverbindung wird nur für die Anmeldung, Cloud-Synchronisation (PRO) und das Herunterladen von Bibliotheks-Stapeln benötigt.',
    },
    {
      q: 'Wie stelle ich mein PRO-Abonnement wieder her?',
      a: 'Gehe zu Einstellungen → Abonnement verwalten und tippe auf „Käufe wiederherstellen". Dein Abonnement wird wiederhergestellt, wenn es mit demselben App Store- oder Google Play-Konto erworben wurde.',
    },
    {
      q: 'Wie lösche ich meine Daten?',
      a: 'Gehe zu Einstellungen → Alle Daten löschen. Dadurch werden alle lokalen Stapel, Karten und der Lernverlauf von deinem Gerät entfernt. Wenn die Cloud-Synchronisation aktiviert ist, kontaktiere den Support, um serverseitige Daten zu löschen.',
    },
    {
      q: 'Ich habe einen Fehler gefunden — wie melde ich ihn?',
      a: `Schreibe uns an ${SUPPORT_EMAIL} mit einer Beschreibung des Problems, deinem Gerätemodell und der iOS-/Android-Version. Screenshots sind immer hilfreich.`,
    },
  ],

  fr: [
    {
      q: 'Comment fonctionne la répétition espacée ?',
      a: "Synaps utilise l'algorithme SM-2. Les cartes que vous trouvez difficiles apparaissent plus souvent ; celles que vous maîtrisez apparaissent moins fréquemment. Au fil du temps, le système planifie les révisions juste avant l'oubli, rendant l'apprentissage bien plus efficace qu'une simple relecture.",
    },
    {
      q: 'Pourquoi ma série affiche-t-elle 0 ?',
      a: "Votre série augmente lorsque vous terminez une session d'étude complète. Les séries disposent d'un jour de grâce : si vous avez étudié hier mais pas encore aujourd'hui, votre série est préservée jusqu'à la fin de la journée.",
    },
    {
      q: 'Puis-je utiliser Synaps hors ligne ?',
      a: "Oui. Tous vos paquets et sessions d'étude sont stockés localement sur votre appareil. Une connexion internet n'est nécessaire que pour la connexion au compte, la synchronisation cloud (PRO) et le téléchargement de paquets depuis la bibliothèque.",
    },
    {
      q: 'Comment restaurer mon abonnement PRO ?',
      a: 'Accédez à Réglages → Gérer l\'abonnement et appuyez sur « Restaurer les achats ». Votre abonnement sera restauré s\'il a été acheté avec le même compte App Store ou Google Play.',
    },
    {
      q: 'Comment supprimer mes données ?',
      a: "Accédez à Réglages → Supprimer toutes les données. Cela supprime tous les paquets, cartes et l'historique d'étude de votre appareil. Si la synchronisation cloud est activée, contactez le support pour supprimer les données côté serveur.",
    },
    {
      q: 'J\'ai trouvé un bug — comment le signaler ?',
      a: `Écrivez-nous à ${SUPPORT_EMAIL} en décrivant le problème, le modèle de votre appareil et la version iOS/Android. Les captures d'écran sont toujours utiles.`,
    },
  ],

  nl: [
    {
      q: 'Hoe werkt gespreid herhalen?',
      a: 'Synaps gebruikt het SM-2-algoritme. Kaarten die je moeilijk vindt verschijnen vaker; kaarten die je goed kent verschijnen minder vaak. Na verloop van tijd plant het systeem herhalingen vlak voordat je dreigt te vergeten, waardoor leren veel efficiënter wordt dan herlezen.',
    },
    {
      q: 'Waarom staat mijn reeks op 0?',
      a: 'Je reeks wordt verhoogd zodra je een volledige studiesessie afrondt. Reeksen hebben een respijtdag — als je gisteren hebt gestudeerd maar vandaag nog niet, blijft je reeks behouden tot het einde van de dag.',
    },
    {
      q: 'Kan ik Synaps offline gebruiken?',
      a: 'Ja. Al je stapels en studiesessies worden lokaal op je apparaat opgeslagen. Een internetverbinding is alleen nodig om in te loggen, voor cloudsynchronisatie (PRO) en om stapels uit de bibliotheek te downloaden.',
    },
    {
      q: 'Hoe herstel ik mijn PRO-abonnement?',
      a: 'Ga naar Instellingen → Abonnement beheren en tik op "Aankopen herstellen". Je abonnement wordt hersteld als het is aangeschaft met hetzelfde App Store- of Google Play-account.',
    },
    {
      q: 'Hoe verwijder ik mijn gegevens?',
      a: 'Ga naar Instellingen → Alle gegevens verwijderen. Dit verwijdert alle lokale stapels, kaarten en studiegeschiedenis van je apparaat. Als je cloudsynchronisatie hebt ingeschakeld, neem dan contact op met support om servergegevens te verwijderen.',
    },
    {
      q: 'Ik heb een bug gevonden — hoe meld ik dit?',
      a: `Stuur ons een e-mail op ${SUPPORT_EMAIL} met een beschrijving van wat er gebeurde, je apparaatmodel en iOS-/Android-versie. Screenshots zijn altijd nuttig.`,
    },
  ],

  ru: [
    {
      q: 'Как работает интервальное повторение?',
      a: 'Synaps использует алгоритм SM-2. Карточки, которые даются вам с трудом, появляются чаще, а те, которые вы хорошо знаете — реже. Со временем система планирует повторения прямо перед тем, как вы забудете материал, что делает обучение гораздо эффективнее простого перечитывания.',
    },
    {
      q: 'Почему моя серия показывает 0?',
      a: 'Серия увеличивается после завершения полной учебной сессии. У серий есть однодневный запас: если вы занимались вчера, но ещё не сегодня, серия сохраняется до конца текущего дня.',
    },
    {
      q: 'Можно ли использовать Synaps без интернета?',
      a: 'Да. Все ваши колоды и учебные сессии хранятся локально на устройстве. Подключение к интернету требуется только для входа в аккаунт, облачной синхронизации (PRO) и загрузки колод из библиотеки.',
    },
    {
      q: 'Как восстановить подписку PRO?',
      a: 'Перейдите в Настройки → Управление подпиской и нажмите «Восстановить покупки». Подписка будет восстановлена, если она была оформлена с того же аккаунта App Store или Google Play.',
    },
    {
      q: 'Как удалить мои данные?',
      a: 'Перейдите в Настройки → Удалить все данные. Это удалит все локальные колоды, карточки и историю обучения с вашего устройства. Если включена облачная синхронизация, свяжитесь с поддержкой для удаления данных на сервере.',
    },
    {
      q: 'Я нашёл ошибку — как сообщить о ней?',
      a: `Напишите нам на ${SUPPORT_EMAIL}, описав проблему, модель устройства и версию iOS/Android. Скриншоты всегда помогают.`,
    },
  ],

  zh: [
    {
      q: '间隔重复是如何运作的？',
      a: 'Synaps 使用 SM-2 算法。你觉得困难的卡片会更频繁出现，而你已经掌握的卡片则较少出现。随着时间推移，系统会在你即将遗忘之前安排复习，使学习效率远高于反复阅读。',
    },
    {
      q: '为什么我的连续学习天数显示为 0？',
      a: '完成一次完整的学习后，连续天数才会增加。连续天数有一天的宽限期——如果你昨天学习了但今天还没有，你的连续天数将保留到今天结束。',
    },
    {
      q: '可以离线使用 Synaps 吗？',
      a: '可以。你的所有卡组和学习记录都存储在本地设备上。仅在登录账户、云同步（PRO）以及下载资料库卡组时才需要网络连接。',
    },
    {
      q: '如何恢复 PRO 订阅？',
      a: '前往设置 → 管理订阅，点击「恢复购买」。如果订阅是通过同一个 App Store 或 Google Play 账户购买的，即可恢复。',
    },
    {
      q: '如何删除我的数据？',
      a: '前往设置 → 删除所有数据。此操作将从设备中移除所有本地卡组、卡片和学习历史。如果已启用云同步，请联系支持团队以删除服务器端数据。',
    },
    {
      q: '我发现了一个问题，如何报告？',
      a: `请发送邮件至 ${SUPPORT_EMAIL}，附上问题描述、设备型号以及 iOS/Android 版本。截图总是很有帮助的。`,
    },
  ],

  pt_BR: [
    {
      q: 'Como funciona a repetição espaçada?',
      a: 'O Synaps utiliza o algoritmo SM-2. Cartões que você acha difíceis aparecem com mais frequência; os que você já domina aparecem menos. Com o tempo, o sistema agenda revisões pouco antes de você esquecer, tornando o aprendizado muito mais eficiente do que reler o conteúdo.',
    },
    {
      q: 'Por que minha sequência está mostrando 0?',
      a: 'Sua sequência aumenta quando você conclui uma sessão de estudo completa. As sequências têm um dia de tolerância — se você estudou ontem, mas ainda não hoje, sua sequência é mantida até o final do dia.',
    },
    {
      q: 'Posso usar o Synaps offline?',
      a: 'Sim. Todos os seus baralhos e sessões de estudo ficam armazenados localmente no seu dispositivo. A conexão com a internet só é necessária para login, sincronização na nuvem (PRO) e download de baralhos da biblioteca.',
    },
    {
      q: 'Como restauro minha assinatura PRO?',
      a: 'Vá em Configurações → Gerenciar assinatura e toque em "Restaurar compras". Sua assinatura será restaurada se tiver sido adquirida com a mesma conta da App Store ou Google Play.',
    },
    {
      q: 'Como excluo meus dados?',
      a: 'Vá em Configurações → Excluir todos os dados. Isso remove todos os baralhos, cartões e histórico de estudo do seu dispositivo. Se a sincronização na nuvem estiver ativada, entre em contato com o suporte para remover os dados do servidor.',
    },
    {
      q: 'Encontrei um bug — como faço para reportar?',
      a: `Envie um e-mail para ${SUPPORT_EMAIL} com uma descrição do ocorrido, o modelo do seu dispositivo e a versão do iOS/Android. Capturas de tela são sempre úteis.`,
    },
  ],

  pt_PT: [
    {
      q: 'Como funciona a repetição espaçada?',
      a: 'O Synaps utiliza o algoritmo SM-2. Os cartões que considera difíceis aparecem com mais frequência; os que já domina aparecem menos. Com o tempo, o sistema agenda revisões pouco antes de esquecer, tornando a aprendizagem muito mais eficiente do que reler o conteúdo.',
    },
    {
      q: 'Porque é que a minha série mostra 0?',
      a: 'A sua série aumenta quando conclui uma sessão de estudo completa. As séries têm um dia de tolerância — se estudou ontem mas ainda não hoje, a sua série é mantida até ao final do dia.',
    },
    {
      q: 'Posso utilizar o Synaps offline?',
      a: 'Sim. Todos os seus baralhos e sessões de estudo ficam armazenados localmente no seu dispositivo. A ligação à internet só é necessária para iniciar sessão, sincronização na nuvem (PRO) e transferir baralhos da biblioteca.',
    },
    {
      q: 'Como restauro a minha subscrição PRO?',
      a: 'Aceda a Definições → Gerir subscrição e toque em "Restaurar compras". A sua subscrição será restaurada se tiver sido adquirida com a mesma conta App Store ou Google Play.',
    },
    {
      q: 'Como elimino os meus dados?',
      a: 'Aceda a Definições → Eliminar todos os dados. Isto remove todos os baralhos, cartões e histórico de estudo do seu dispositivo. Se a sincronização na nuvem estiver ativa, contacte o suporte para remover os dados do servidor.',
    },
    {
      q: 'Encontrei um erro — como o reporto?',
      a: `Envie-nos um e-mail para ${SUPPORT_EMAIL} com uma descrição do sucedido, o modelo do seu dispositivo e a versão iOS/Android. As capturas de ecrã são sempre úteis.`,
    },
  ],
};

/* ────────────────────────────────────────────────────────────
   Components
   ──────────────────────────────────────────────────────────── */

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
  const faqs = FAQS[language] ?? FAQS.en;
  const strings = STRINGS[language] ?? STRINGS.en;

  const handleEmail = () => {
    Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=Synaps Support`).catch(() => {
      Alert.alert(strings.cannotOpenEmail, strings.pleaseEmailUs);
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>{strings.title}</Text>
        <Pressable onPress={() => router.back()} style={styles.closeBtn}>
          <Ionicons name="close" size={22} color={colors.textSecondary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Contact options */}
        <Text style={styles.sectionLabel}>{strings.getInTouch}</Text>
        <View style={styles.card}>
          <ContactCard
            icon="mail-outline"
            label={strings.emailSupport}
            value={SUPPORT_EMAIL}
            onPress={handleEmail}
          />
        </View>

        <Text style={styles.note}>{strings.note}</Text>

        {/* FAQ */}
        <Text style={styles.sectionLabel}>{strings.faq}</Text>
        <View style={styles.card}>
          {faqs.map((faq, i) => (
            <View key={i} style={[styles.faqItem, i < faqs.length - 1 && styles.faqBorder]}>
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

# NEXT UP (saved 2026-10-02 — read this first when Murat says "devam edelim")

**Now → 2026-10-13: wait, don't touch store listings** (so the ASO changes can be measured).
- Check iOS 1.0.10 (30) / Android 1.0.10 (20) went live (Android is live since 2026-09-29; iOS was in review).

**~2026-10-13 — measure** (Applyra MCP + Play Console + PostHog):
1. ASO ranks: `get_keyword_rank_history` for the tracked keywords — Play JP (571019), iOS JP (571021), Play US (208059), iOS US (208063), Play TR (571024), Play GB (571033). Baseline 2026-09-29: none in top 100 except iOS JP 古文単語 #37.
2. Play Console: store-listing visitors / installs for JP, US, TR, GB — 2 weeks before vs after (JP short description changed 2026-09-29; US short+long; 11 new Play languages).
3. PostHog (Activation & Drop-off dashboard 979791): effect of 1.0.10's language fix on Japanese users — `app_language` should now be `ja`; deck downloads, finished sessions, D1/D7 retention vs before; reminder prompt answers; first-run funnel.
4. Decide the next ASO round from that (e.g. title changes, more markets) — then store listings may change again.

**After 2026-10-23 (EAS build quota resets — no builds before) — release 1.0.11:**
- Already in code: first-run tips, empty-home get-started card, in-app review prompt after the 3rd session.
- Apply at iOS submission: US subtitle 「SAT Vocabulary & MCAT Prep」 + new keywords field; ja name 「Synaps：単語帳・暗記フラッシュカード」 + Japanese subtitle (simulate on 571021 first). Details in the ASO sections below.
- Usual path: TestFlight + Play internal → Murat tests → submit; translate whatsNew for 10 App Store locales.

**Decided by Murat (2026-10-02):**
- "Anki" comparison in store descriptions: **keep it for now** — don't remove.
- [ ] **Badge icons → Ionicons** (approved): the badge celebration popup and badge list use emoji (🔥 👣 …) — replace with Ionicons outline glyphs like the deck icons (rule in memory: no emoji/clipart icons). Code-only, ships with 1.0.11; do it at the start of the next session.

# GOOGLE PLAY — release dashboard (seen on 1.0.9 / 19, 2026-09-28)
- [x] **Done in 1.0.10:** DEX optimization/obfuscation was 3% (min 25%). Turn on R8 via `expo-build-properties` → `android.enableProguardInReleaseBuilds: true` (+ `enableShrinkResourcesInReleaseBuilds`), test the whole app on internal (RevenueCat, PostHog, Supabase, notifications), and upload `mapping.txt` to Play with each release (edits.deobfuscationfiles). Planned for 1.0.10.
- [ ] Recommended: "deprecated edge-to-edge APIs" — not from our code (no status/nav bar colour calls in app/ or src/); comes from RN 0.81 / Expo SDK 54 internals, goes away with an Expo SDK upgrade.
- [ ] Recommended: remove orientation/resizability restrictions (`orientation: portrait`). Android 16+ ignores the lock on large screens anyway (targetSdk 36), so check tablet/landscape layouts on an emulator before deciding.

# LEADERBOARD — anonymous learners
- [x] Anonymous sign-ins enabled in Supabase (2026-09-28); verified end to end (profile row created, names readable, own row writable, others' rows 403).
- [x] `profiles_id_fkey` now cascades (migration 20260928000001).
- [x] In-app account deletion (Settings → Delete account, edge function `delete-account`) — App Store guideline 5.1.1(v). Ships in Android 1.0.9 (19+) / iOS 1.0.10.
- [ ] Optional: prune anonymous users inactive for 30+ days (Supabase recommends it); deletes now cascade.

# ASO — Google Play ja-JP
- 2026-09-29: short description changed (Applyra data) from 「間隔反復（SM-2）で効率よく暗記。英検・TOEIC・古文単語の単語帳も。毎日の学習を習慣に。」 to 「英検・TOEIC・古文単語を効率よく覚える。英単語の暗記や試験対策を毎日の学習習慣に。」 — dropped unsearched 間隔/反復/SM, added 英単語 (96), 覚える (82), 対策 (82). Title and full description unchanged.
- [ ] ~2026-10-13: compare Japan store listing visitors / installs (Play Console) for the 2 weeks before vs after. Don't change the listing again before then.

# ASO — US (Applyra data, 2026-09-29)
Strategy: our old US keywords (study, learn, memory, flashcards, habit) are "out of reach" (owned by far bigger apps). Target long-tail exam terms we actually have decks for — Applyra KEI "excellent": sat vocabulary (Play 52/32, iOS 46/31), sat math, mcat prep, mcat flashcards, vocabulary builder (Play only). Don't use "anki" anywhere in metadata (competitor name; Apple 2.3.7 / Play policy).
- [x] Google Play en-US (2026-09-29): short description 「Smart Flashcards & Repetition」 → 「SAT vocabulary, SAT math & MCAT prep decks. Smart vocabulary builder for exams.」; long description line now "Study for SAT vocabulary & SAT math, MCAT prep, GCSE, YKS, …". Applyra sim: ASO health 64 → 70.
- [ ] **App Store en-US with 1.0.11** (metadata is locked while 1.0.10 is in review): subtitle 「Study, Memorize & Learn Fast」 → 「SAT Vocabulary & MCAT Prep」; keywords field 「flashcards app,flashcards,spaced repetition,anki,flashcard maker,study tool,memory training,revision」 → 「math,anatomy,medical,terminology,spaced,repetition,gcse,exam,biology,chemistry,psychology,quiz,cards」 (100/100). Applyra sim: 55 → 61, targeting 36 → 48.
- Tracked in Applyra on both US listings (baseline 2026-09-29: not in top 100 for any): sat vocabulary, sat math, sat prep, mcat prep, mcat flashcards, vocabulary builder, anatomy flashcards, medical terminology.
- [ ] ~2026-10-13: check ranks (`get_keyword_rank_history`) and Play Console US listing visitors/installs.
- Titles unchanged on purpose (brand + existing rank); revisit only after the above shows results.
- [x] **In-app review prompt — code done for 1.0.11 (not built/released yet):** ask for a store rating with the native dialog (`expo-store-review`) after the 3rd finished study session — the app has no ratings on either store, which hurts both ranking and conversion. Ships with 1.0.11 (no EAS builds until 2026-10-23).

# ASO — more markets (2026-09-29)
- [x] Google Play localised listings (were en-US + ja-JP only; other countries saw Play's machine translation with the English title): added tr-TR, en-GB, de-DE, fr-FR, es-ES, it-IT, pt-BR, pt-PT, ru-RU, zh-CN, nl-NL. Descriptions reuse the App Store localisations (es/it translated from the Play en-US text). tr-TR keeps the English title on purpose (Applyra: study/with/flashcards are searched in TR; Turkish title scored lower) with a YKS/TYT/AYT short description. en-GB: 「Synaps - GCSE Revision Cards」 + GCSE short description (Applyra sim 66 → 73). No per-language screenshots yet (fall back to en-US).
- Applyra: added App Store JP (571021), Play TR (571024), Play GB (571033); 10 keywords tracked on each (JP: 単語帳, 暗記, 英単語, 英検, toeic, 古文単語, 暗記カード, フラッシュカード, 英検2級, toeic 単語 — 古文単語 already #37 on iOS; TR: yks, tyt, ayt, yks matematik, yks biyoloji, kelime ezberleme, ingilizce kelime, bilgi kartı, ezber, flashcard; GB: gcse maths/revision/flashcards, revision app, gcse maths revision, flashcards, anatomy flashcards, medical terminology, spaced repetition, vocabulary builder). Baseline 2026-09-29: none in top 100 except 古文単語.
- [ ] **iOS ja name + subtitle are still English** (「Synaps: Flashcards & Memory」 / 「Study, Memorize & Learn Fast」) — the heaviest App Store field, so iOS JP can't rank for 単語帳/暗記/英単語. With 1.0.11 set ja name to 「Synaps：単語帳・暗記フラッシュカード」 (as on Play) and a Japanese subtitle (e.g. 「英検・TOEIC・古文単語の暗記カード」, ≤30) — check with `simulate_metadata` on app 571021 first.
- Every store description (all languages, both stores) compares us to "Anki" by name — Murat decided 2026-10-02 to keep it for now.

# RETENTION (2026-09-28)
**Found 2026-09-29 (first 1.0.9 data): the app never auto-detected the device language** — the `'en'` default made the detection branch unreachable, so all Japanese devices ran in English and the Japan decks were hidden from Discover. Fixed for 1.0.10 (one-time re-detect for existing installs). Other first-day signals (9 real users): 3 of 8 who reached the notification-permission step left there without answering; 1 left on the sign-up screen; 0 real users studied a card. → 1.0.10 drops that step (reminder now asked after the first finished session — and it now really enables reminders; the old step never did), skips the iOS-only ATT screen on Android, and translates the hard-coded English privacy footer.
- [x] Empty home: button was below the fold — home now shows a get-started card under the greeting when there are no decks (1.0.11).
- [x] Phase 2: first-run tip boxes (library, home, study ×2, leaderboard) — code done for 1.0.11, not yet built/released; watch the "First-run tips" tile.

278 of 325 users used the app on a single day; D1 ≈ 6%. The first-run instrumentation (1.0.9) should show exactly where they leave — read the **Activation & Drop-off** dashboard in PostHog once ~1–2 weeks of 1.0.9 data exist, then pick a strategy. Suspects found in the code, to confirm or rule out with that data:
- ~~Empty home screen's only button is "create your first deck"~~ — 1.0.9 leads with the library (done; watch `empty_home_cta`).
- ~~After a library download there is only a success alert~~ — 1.0.9 offers "Study now" (done; watch `download_next_step`).
- Free users are blocked from studying offline (deck screen locked, kicked out mid-session) — likely painful for students.
- Onboarding is long: 5 slides → ATT → sign-up → notifications before any value.
- Onboarding paywall removed in 1.0.9 (done).

# USER DECKS
Kullanıcılar oluşturdukları deckleri paylaşabilsinler. Öyle bir library olsun, diğerleri indirebilsinler bu deckleri.

# DECK DOWNLOADS
Show locked decks (Let user unlock the second part if he downloads the first part)
Sort by most downloaded in library.

# NEW DECKS
## BUSINESS
- Startups: Startup Fundamentals – From Idea to Launch
- Business: Business Basics – How Companies Actually Work
- Dropshipping: Dropshipping Essentials – From Store to First Sale
- Amazon selling: Amazon FBA Basics – Product to Profit

## ENTERTAINMENT
- Movies

## COUNTRY BASED
- {COUNTRY} History
- {COUNTRY} Culture
- {COUNTRY} Geography

## CODING
- PHP
- NextJS
- NodeJS
- Javascript
- C#
- Swift
- Python
- Flutter
- React

# EXAM SPECIFI DECKS
Tier 1 (HIGH ROI — start here)
🇯🇵 Japanese → 英検 2級・準2級, TOEIC, 古文単語 (done in 1.0.9; next candidates: 日本史 一問一答, 四字熟語・ことわざ)
🇹🇷 Turkish → YKS, LGS
🇩🇪 German → Abitur
🇬🇧 English → SAT, IELTS
🇫🇷 French → Baccalauréat
Tier 2
🇧🇷 Portuguese (BR) → ENEM
🇳🇱 Dutch → VWO exams
Tier 3 (later)
🇷🇺 Russian → EGE
🇨🇳 Chinese → Gaokao
🇸🇦 Arabic → regional exams (fragmented)

# PROMOTION TECHNIQUES
## Create content like:
“YKS’de çıkan 50 kritik bilgi”
“SAT’ta her yıl çıkan kelimeler”
“Abitur için en kritik 20 formül”

## Create a simple identity:
“Synaps kullanan öğrenciler”
Then push content like:
“Günde 20 dk Synaps kullananlar vs kullanmayanlar”
“Sınava 30 gün kala Synaps planı”

## Campaign like:
“Sınava 30 gün kaldı → sadece bunu çalış”
Create:
30-day plan
daily decks
countdown

## MISTAKE CONTENT
Content examples:
“YKS’de herkesin yaptığı 5 hata”
“SAT öğrencilerinin %80’i bunu yanlış yapıyor”
Then:
“Bu hatalar için özel deck Synaps’ta”

## APP STORE HACK
Instead of:
“Flashcards app”
“Study smarter”
Use:
“YKS flashcards”
“SAT vocabulary app”
“Abitur lernen app”



# ILERDE
Dershanelere, kurslara, etüt merkezlerine, okullara kullandırılabilir. Sınıf oluşturulur, öğrenciler eklenir, herkes birbiriyle yarışır. Düşünelim.

# PAYWALL LEGAL LINKS
Apple requires privacy policy and terms of use links in the paywall to open in a browser (not in-app navigation).
- In `app/paywall/index.tsx` (lines 188–193), change `router.push('/legal/terms')` and `router.push('/legal/privacy')` to open browser URLs.
- URLs per language (replace `en` with the locale code):
  - Privacy: https://www.mudimedia.co.uk/synaps/{locale}/privacy
  - Terms: https://www.mudimedia.co.uk/synaps/{locale}/terms
- Use `Linking.openURL(...)` from `react-native`.

# SYNC
PRO kullanıcıları "Settings > Sync Data" tıkladığında sync yapalım. 

# ONBOARDING WIZARD
İlk açılışta bir wizard gelsin. Yeni deck ekleme veya olanları görme gibi bir ekran olsun.

# RATE US
Ayarlar menüsünde "Rate us" linki çalışmıyor.
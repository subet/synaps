# GOOGLE PLAY — release dashboard (seen on 1.0.9 / 19, 2026-09-28)
- [x] **Done in 1.0.10:** DEX optimization/obfuscation was 3% (min 25%). Turn on R8 via `expo-build-properties` → `android.enableProguardInReleaseBuilds: true` (+ `enableShrinkResourcesInReleaseBuilds`), test the whole app on internal (RevenueCat, PostHog, Supabase, notifications), and upload `mapping.txt` to Play with each release (edits.deobfuscationfiles). Planned for 1.0.10.
- [ ] Recommended: "deprecated edge-to-edge APIs" — not from our code (no status/nav bar colour calls in app/ or src/); comes from RN 0.81 / Expo SDK 54 internals, goes away with an Expo SDK upgrade.
- [ ] Recommended: remove orientation/resizability restrictions (`orientation: portrait`). Android 16+ ignores the lock on large screens anyway (targetSdk 36), so check tablet/landscape layouts on an emulator before deciding.

# LEADERBOARD — anonymous learners
- [x] Anonymous sign-ins enabled in Supabase (2026-09-28); verified end to end (profile row created, names readable, own row writable, others' rows 403).
- [x] `profiles_id_fkey` now cascades (migration 20260928000001).
- [x] In-app account deletion (Settings → Delete account, edge function `delete-account`) — App Store guideline 5.1.1(v). Ships in Android 1.0.9 (19+) / iOS 1.0.10.
- [ ] Optional: prune anonymous users inactive for 30+ days (Supabase recommends it); deletes now cascade.

# RETENTION (2026-09-28)
**Found 2026-09-29 (first 1.0.9 data): the app never auto-detected the device language** — the `'en'` default made the detection branch unreachable, so all Japanese devices ran in English and the Japan decks were hidden from Discover. Fixed for 1.0.10 (one-time re-detect for existing installs). Other first-day signals (9 real users): 3 of 8 who reached the notification-permission step left there without answering; 1 left on the sign-up screen; 0 real users studied a card. → 1.0.10 drops that step (reminder now asked after the first finished session — and it now really enables reminders; the old step never did), skips the iOS-only ATT screen on Android, and translates the hard-coded English privacy footer.
- [ ] Empty home: the empty-state text and the "Browse ready-made decks" button sit below the fold on a phone (only the icon shows) — fold into the planned first-run tips.
- [ ] Phase 2 (Murat, 2026-09-29): first-run tip boxes / coach marks for new users.

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
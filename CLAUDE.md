# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Synaps is a flashcard/spaced-repetition mobile app (iOS + Android) built with Expo SDK 54, expo-router, React Native 0.81, React 19, and TypeScript (strict). New Architecture is enabled. Bundle ID: `com.mudimedia.synaps`.

## Commands

```bash
npm start            # expo start (dev server)
npm run ios          # expo run:ios (native build + run)
npm run android      # expo run:android
npm run web          # expo start --web
npx tsc --noEmit     # type check — there is no lint or test setup
```

- EAS builds use profiles `development`, `preview`, `production` from `eas.json` (production auto-increments; app version source is remote).
- Releases: `eas build -p ios --profile production --auto-submit` sends iOS to TestFlight (ASC key on EAS servers; `ascAppId` in `eas.json`). Android `--auto-submit` fails because no Google service account key is stored on EAS — upload the finished `.aab` to the Play `internal` track with the Play Developer API using `~/.playconsole/google-play-service-account.json` (edits → bundles upload → tracks/internal → commit), then promote to production after testing. Store listing text (App Store localizations, Play listings) is also edited through those APIs.
- Deck translation generation (offline, one-time scripts): `ANTHROPIC_API_KEY=sk-... npx tsx scripts/generate-translations.ts` — writes `front_translations`/`back_translations` into the static deck files, resumes from `scripts/.translation-checkpoint.json`.
- Required env vars (in `.env`, `EXPO_PUBLIC_` prefix): `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`, `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`. RevenueCat keys are hardcoded in `src/constants/index.ts`.

## Architecture

**Layering: screens (`app/`) → Zustand stores (`src/stores/`) → services (`src/services/`) → SQLite/Supabase.** Screens never call services directly for state-bearing data; stores wrap service calls and hold loading/error state. The path alias `@/*` maps to `./src/*`.

### Local-first data (SQLite)

`src/services/database.ts` owns the local SQLite database (`synaps.db`, WAL mode) and is the source of truth for decks, cards, study sessions, and streaks. Schema is created/migrated inline in `initializeDatabase()`. All study content lives on-device; there is no cloud sync of decks/cards.

`src/services/srs.ts` implements the SM-2 spaced-repetition algorithm with **minute-based intervals** (not days). Card statuses: `new → learning → review → mastered` (mastered = ≥3 reps and interval ≥7 days).

### Cloud (Supabase)

Supabase (`src/services/supabase.ts`) handles auth (email + Apple/Google via `socialAuth.ts`), friends, weekly leaderboards (weeks start Monday UTC, see `leaderboard.ts`), and push tokens. SQL migrations live in `supabase/migrations/`; the `send-push` edge function is in `supabase/functions/`. Auth sessions persist in AsyncStorage (not SecureStore — 2KB cap).

### App bootstrap

`app/_layout.tsx` runs the entire startup sequence: load settings → resolve locale → init auth → init RevenueCat subscription → register push token → repair public-deck translations → **cancel ALL scheduled notifications and reschedule** (prevents duplicates across reinstalls/updates). The native splash is replaced by `AnimatedSplash` until stores are initialized. All routes are declared in the `<Stack>` here — new screens must be registered.

### Monetization (RevenueCat)

`react-native-purchases` with entitlement `pro_access`; products/limits defined in `src/constants/index.ts` (`FREE_DECK_LIMIT = 5`, `FREE_CARDS_PER_DECK_LIMIT = 5`, `FREE_DOWNLOAD_LIMIT = 3`). Paywall is a modal route at `app/paywall/`. Win-back notifications are scheduled when a Pro subscription lapses.

### i18n (12 locales)

`src/i18n/` uses i18n-js with locales: en, es, it, tr, de, fr, nl, ru, zh, pt_BR, pt_PT, ja (full list with native names: `LANGUAGES.md`). Use the `useTranslation()` hook in components — it subscribes to `useAppStore.language` so components re-render on locale switch. `t()` outside components does not re-render. First launch detects device locale (Portuguese is region-split into pt_BR/pt_PT); any new user-facing string must be added to all 12 locale files. **When adding a new app language, follow the full checklist in `ADDING_NEW_LANGUAGE.md`** — language support spans ~15 files and TypeScript does not catch all of them.

### Public deck library

Ready-made decks are **statically bundled** in `src/data/publicDecks/` (metadata in `decks.ts`, cards per category under `languages/`, `subjects/`, `exams/`, `make_money/`). Downloading a deck copies it into local SQLite (`source_id`, `is_public_download` flags). Deck catalog is documented in `DECKS.md` — keep it in sync when adding decks. Deck `icon_url` must be an Ionicons name (`*-outline`, or `logo-*` for brands) — never emoji/clipart; country flags only on language decks and YKS. `repairPublicDeckTranslations()` re-syncs icons of already-downloaded decks on every cold start. Static cards carry `front_translations`/`back_translations` maps produced by the scripts in `scripts/`.

### Analytics (PostHog)

`src/services/analytics.ts` wraps `posthog-react-native` (EU, project **Synaps Mobile**, id 251689 — a separate PostHog account from the other Mudimedia apps). Production builds only; `__DEV__` logs to console. Identity is the Supabase user id when signed in, else the RevenueCat appUserID, so one device = one PostHog person. Super properties on every event: `app_language`, `is_pro`, `onboarding_done`, `signed_in`.

- **Screens:** `app/_layout.tsx` sends one `$screen` per route change, named by route pattern (`(tabs)/index`, `deck/[id]`, `auth/register`, …).
- **Onboarding:** `onboarding_step_viewed` (`step`, `index`), `auth_completed` / `auth_failed` / `auth_cancelled` (in `useAuthStore`), `auth_skipped` (`screen`, `via`), `notification_permission` (`choice`, `granted`), `onboarding_completed`.
- **Content:** `library_searched` (`query`, `results`), `library_deck_previewed`, `public_deck_downloaded`, `public_deck_download_failed`, `download_next_step` (`study` | `later`), `empty_home_cta` (`library` | `create`), `deck_created`, `card_created`.
- **Study (in `useStudyStore`):** `study_session_started`, `study_card_graded`, `study_session_completed`, `study_session_abandoned` (logged by `resetSession` when the session was not finished), `study_blocked_offline` (`where`: `deck_detail` | `mid_session`).
- **Money:** `paywall_view`, `paywall_closed`, `purchase_started`, `purchase_completed`, `purchase_error`, `restore_result` (all except `purchase_error` carry the paywall `source`), `free_limit_hit` (`limit`: `decks` | `cards_per_deck` | `downloads` | `pro_feature`).
- **Other:** `app_opened`, `notification_opened`, `language_changed`. The SDK adds `Application Installed/Opened/Became Active/Backgrounded`.

Dashboards: **Synaps — Growth & Monetization** (id 979762, project home) and **Synaps — Activation & Drop-off** (id 979791; first-run funnel, library funnel, study and retention by activation). The action **Got a deck** = `public_deck_downloaded` OR `deck_created`. A new event needs a tile there too. There is no OTA updates channel (`expo-updates` is not installed), so new events only arrive once a store build ships.

**Onboarding has no paywall** (since 1.0.9): slides → ATT → sign-up (skippable) → notifications → home. Students try the app first and meet the paywall at a free limit or via the Pro button. An empty home screen leads with **Browse ready-made decks** (to the library) and offers *Create my own deck* second; a library download ends with a **Study now** prompt that opens the study screen.

### Roadmap

`TODO.md` tracks planned features (user-shared decks, locked deck tiers, new deck subjects, exam-specific decks).

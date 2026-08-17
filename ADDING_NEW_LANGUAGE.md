# Adding a New Language to Synaps

Complete checklist for adding a new app locale (referred to as `xx` below). Follow the steps **in order** — step 1 makes TypeScript surface some (but not all) of the remaining work, so the later steps are listed explicitly.

> ⚠️ TypeScript will NOT catch everything. Maps typed as `Record<string, string>` (library labels, TTS, StreakCard) and the per-locale objects in legal pages fail silently — English fallback kicks in. Walk the whole checklist every time.

## 1. Core type

- [ ] `src/types/index.ts` — add `'xx'` to the `Language` union.
  - `TranslationMap` extends automatically.
  - After this, `npx tsc --noEmit` will flag `Record<Language, ...>` maps that need the new entry (e.g. `LANGUAGE_FLAGS`).

## 2. UI strings (i18n)

- [ ] `src/i18n/xx.ts` — create the locale file: copy `src/i18n/en.ts` (~540 keys) and translate **every** key. `enableFallback` is on, so missing keys silently fall back to English — don't rely on it.
- [ ] `src/i18n/index.ts` — import the file and register it in `new I18n({ ... })`.
- [ ] `app/_layout.tsx` — add `'xx'` to the `SUPPORTED` array (first-launch device-locale detection). If the language needs region splitting (like `pt` → `pt_BR`/`pt_PT`), extend `detectLocale()`.

## 3. Language pickers, labels, locale maps

- [ ] `app/(tabs)/settings.tsx` — add `{ code: 'xx', label: '<native name>' }` to the `LANGUAGES` array (keep alphabetical order by label).
- [ ] `app/(tabs)/library.tsx` — add to the `LANGUAGE_NAMES` map (bottom of file, ~line 509). **Not type-checked** (`Record<string, string>`).
- [ ] `src/utils/languages.ts` — add the flag emoji to `LANGUAGE_FLAGS`. Type-checked.
- [ ] `src/components/home/StreakCard.tsx` — add the BCP-47 code to `LANG_LOCALE` (date formatting, e.g. `xx: 'xx-XX'`). **Not type-checked.**
- [ ] `src/utils/tts.ts` — add to `LOCALE_MAP` if text-to-speech should support it. Keyed by *deck* language codes (note `ar` exists here for Arabic decks even though it's not an app locale). **Not type-checked.**

## 4. Country names

- [ ] `src/i18n/countries.ts` — add `xx: string` to the `Country` interface and translate all 88 country names.
  - `getCountryName()` falls back to English if the column is missing, so the app won't break — but the CountryPicker will show English names for the new locale. All 11 current locales have columns; keep it that way.

## 5. Legal pages

Each legal screen holds its own per-locale content objects. Add an `xx` entry to **every** map in:

- [ ] `app/legal/terms.tsx` — `SCREEN_TITLE`, `UPDATED_LABEL`, the date map, and the content sections array (~line 522 region).
- [ ] `app/legal/privacy.tsx` — same structure.
- [ ] `app/legal/support.tsx` — same structure.

## 6. Public deck translations ⚠️ REQUIRED

19 decks (8 language decks + 11 subject decks) support **all app locales** (`supported_languages` lists every locale). When a new app language ships, these decks must be translated too — otherwise their names, descriptions, and card fronts show English to `xx` users.

- [ ] `src/data/publicDecks/decks.ts` — for every multilingual deck: add `'xx'` to `supported_languages`, and add `xx` entries to `name_translations` and `description_translations`.
  - Single-language decks (YKS = `['tr']`, SAT/GCSE/Make Money = `['en']`) are left alone.
- [ ] Card-level translations via `scripts/generate-translations.ts`:
  1. Set its `LANGUAGES` const to **only the new language** (it currently lists the original 8 — re-running the full list wastes API calls; the script resumes from `scripts/.translation-checkpoint.json`).
  2. Run: `ANTHROPIC_API_KEY=sk-... npx tsx scripts/generate-translations.ts`
  3. Coverage rules: **language decks** get `front_translations` only (back = target-language word, unchanged); **subject decks** get `front_translations` AND `back_translations`.
- [ ] Verify the generated entries landed in `src/data/publicDecks/languages/*.ts` and `subjects/*.ts`.

**Already-downloaded decks:** no migration needed. `repairPublicDeckTranslations()` (called on every cold start from `app/_layout.tsx`) backfills deck- and card-level translations in users' local SQLite from the updated static data.

## 7. Docs

- [ ] `LANGUAGES.md` — add the new language to the supported-languages table.
- [ ] `DECKS.md` — update the translation-coverage note.
- [ ] This file — if you discover a new touch point, add it here.

## 8. Out-of-code (release checklist)

- [ ] App Store / Play Store listing metadata and screenshots for the new locale (`App Stores/` folder holds assets).
- [ ] Local notification strings in `src/services/notifications.ts` are currently **hardcoded English** (known limitation, applies to all locales — no per-language action needed, but flag it if localizing them later).

## 9. Verify

- [ ] `npx tsc --noEmit` passes.
- [ ] Fresh install with device set to `xx` → locale auto-detected, onboarding in `xx`.
- [ ] Settings → switch to `xx` → all tabs re-render translated.
- [ ] Library → multilingual deck names/descriptions show in `xx`; language filter chip works.
- [ ] Download a multilingual deck → study screen shows translated card fronts (and backs for subject decks).
- [ ] Legal pages (terms/privacy/support) render in `xx`.
- [ ] StreakCard weekday labels formatted for `xx`.

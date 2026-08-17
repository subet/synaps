# Synaps Supported Languages

The app UI supports **11 languages**. This file is the reference list — when a new language is added (see `ADDING_NEW_LANGUAGE.md`), add it here too.

| # | Code | Language | Native name | Flag |
|---|-------|--------------------------|------------------------|------|
| 1 | en | English | English | 🇬🇧 |
| 2 | de | German | Deutsch | 🇩🇪 |
| 3 | es | Spanish | Español | 🇪🇸 |
| 4 | fr | French | Français | 🇫🇷 |
| 5 | it | Italian | Italiano | 🇮🇹 |
| 6 | nl | Dutch | Nederlands | 🇳🇱 |
| 7 | pt_BR | Portuguese (Brazil) | Português (Brasil) | 🇧🇷 |
| 8 | pt_PT | Portuguese (Portugal) | Português (Portugal) | 🇵🇹 |
| 9 | ru | Russian | Русский | 🇷🇺 |
| 10 | tr | Turkish | Türkçe | 🇹🇷 |
| 11 | zh | Chinese (Simplified) | 中文 | 🇨🇳 |

Source of truth in code: the `Language` union in `src/types/index.ts`.

## Notes

- **Portuguese is region-split**: device locale `pt-BR` maps to `pt_BR`, everything else `pt` maps to `pt_PT` (`detectLocale()` in `app/_layout.tsx`). Unsupported device languages fall back to `en`.
- **`ar` (Arabic) is NOT an app locale** — it appears only as a deck content language (Arabic Vocabulary deck) and in the TTS locale map (`src/utils/tts.ts`).
- The 19 multilingual public decks (8 language + 11 subject decks) carry `name/description/card` translations for all locales above; single-language decks: YKS = `tr`, SAT/GCSE/Make Money = `en`.
- Country names in `src/i18n/countries.ts` have a column per locale (all 11 present).
- Local notification strings (`src/services/notifications.ts`) are hardcoded English — known limitation.

import * as Speech from 'expo-speech';

// Full BCP-47 locale codes for each supported language shortcode.
// Using full locales gives the OS enough context to pick a native-quality voice.
const LOCALE_MAP: Record<string, string> = {
  de: 'de-DE',
  es: 'es-ES',
  fr: 'fr-FR',
  tr: 'tr-TR',
  nl: 'nl-NL',
  ru: 'ru-RU',
  ar: 'ar-SA',
  zh: 'zh-CN',
  en: 'en-US',
};

// Cache the best voice identifier per locale so we only query once per session.
const voiceCache: Record<string, string | null> = {};

async function getBestVoice(locale: string): Promise<string | null> {
  if (locale in voiceCache) return voiceCache[locale];

  try {
    const voices = await Speech.getAvailableVoicesAsync();
    // Prefer Enhanced quality, then Default; match by locale prefix (e.g. "de-DE" or "de").
    const matching = voices.filter(
      (v) => v.language === locale || v.language.startsWith(locale.split('-')[0])
    );
    const enhanced = matching.find((v) => v.quality === Speech.VoiceQuality.Enhanced);
    const best = enhanced ?? matching[0] ?? null;
    voiceCache[locale] = best?.identifier ?? null;
  } catch {
    voiceCache[locale] = null;
  }

  return voiceCache[locale];
}

/**
 * Speak text with the best available voice for the given language code.
 * @param text      Text to speak.
 * @param language  Short language code (e.g. "de") or undefined for English.
 */
export async function speakText(text: string, language?: string): Promise<void> {
  const locale = LOCALE_MAP[language ?? 'en'] ?? 'en-US';
  const voiceId = await getBestVoice(locale);

  const options: Speech.SpeechOptions = {
    language: locale,
    rate: 0.9,   // slightly slower — noticeably clearer without feeling sluggish
    pitch: 1.0,
    ...(voiceId ? { voice: voiceId } : {}),
  };

  try {
    Speech.speak(text, options);
  } catch {}
}

export const stopSpeech = Speech.stop;

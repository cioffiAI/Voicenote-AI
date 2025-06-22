
export interface Language {
  code: string; // BCP 47 language tag, e.g., 'en-US', 'it-IT'
  name: string; // User-friendly name
}

// AUTO_DETECT_LANGUAGE_OPTION removed as it's no longer used.

// Unified list of supported languages for all features (recording, summary, translation)
// Ordered alphabetically by name for consistency.
export const UNIFIED_LANGUAGES: Language[] = [
  { code: 'ar-SA', name: 'Arabic (Saudi Arabia)' },
  { code: 'zh-CN', name: 'Chinese (Mandarin, Simplified)' },
  { code: 'en-US', name: 'English (US)' },
  { code: 'fr-FR', name: 'French (France)' },
  { code: 'de-DE', name: 'German (Germany)' },
  { code: 'hi-IN', name: 'Hindi (India)' },
  { code: 'it-IT', name: 'Italian (Italy)' },
  { code: 'ja-JP', name: 'Japanese (Japan)' },
  { code: 'ko-KR', name: 'Korean (South Korea)' },
  { code: 'pt-BR', name: 'Portuguese (Brazil)' },
  { code: 'ru-RU', name: 'Russian (Russia)' },
  { code: 'es-ES', name: 'Spanish (Spain)' },
];

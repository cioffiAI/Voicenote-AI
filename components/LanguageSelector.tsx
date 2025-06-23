
import React from 'react';
import { UNIFIED_LANGUAGES, Language } from '../constants'; // AUTO_DETECT_LANGUAGE_OPTION removed

interface LanguageSelectorProps {
  selectedLanguage: Language;
  onSelectLanguage: (language: Language) => void;
  disabled?: boolean;
  label?: string; 
  // showAutoOption?: boolean; // Prop removed
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguage,
  onSelectLanguage,
  disabled = false,
  label = "Language:", 
  // showAutoOption = false, // Prop removed
}) => {

  const languagesToShow = [...UNIFIED_LANGUAGES]; // Always use the unified list

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const langCode = event.target.value;
    const language = languagesToShow.find(lang => lang.code === langCode);
    if (language) {
      onSelectLanguage(language);
    }
  };

  return (
    <div className="w-full">
      <label htmlFor={`language-select-${label.replace(/\s+/g, '-').toLowerCase()}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>
      <select
        id={`language-select-${label.replace(/\s+/g, '-').toLowerCase()}`}
        value={selectedLanguage.code}
        onChange={handleChange}
        disabled={disabled}
        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:opacity-50"
        aria-label={label}
      >
        {languagesToShow.map(lang => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
};

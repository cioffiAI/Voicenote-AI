
import React from 'react';
// import { LanguageSelector } from './LanguageSelector'; // No longer needed here
// import { Language } from '../constants'; // No longer needed here
import { X } from 'lucide-react';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  // Language props removed:
  // inputLanguage: Language; 
  // onSetInputLanguage: (language: Language) => void; 
  // targetLanguage: Language;
  // onSetTargetLanguage: (language: Language) => void;
  // summaryLanguage: Language; 
  // onSetSummaryLanguage: (language: Language) => void; 
  isRecording: boolean;
  apiKeyMissing: boolean;
  speechApiUnsupported: boolean;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  onClose,
  // Language props removed
  isRecording,
  apiKeyMissing,
  speechApiUnsupported,
}) => {
  if (!isOpen) return null;

  // const commonDisabled = isRecording || apiKeyMissing || speechApiUnsupported; // Not used here anymore

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-panel-title"
    >
      <div 
        className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-md transform transition-all"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside panel
      >
        <div className="flex justify-between items-center mb-6">
          <h2 id="settings-panel-title" className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
            Settings
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close settings panel"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          {/* LanguageSelector instances removed from here */}
          <p className="text-gray-600 dark:text-gray-300">
            Microphone, Summary, and Translation language settings are now available directly in their respective sections on the main page.
          </p>
          <p className="text-gray-600 dark:text-gray-300">
            Other application settings (if any) will appear here.
          </p>
        </div>

        <div className="mt-8 text-right">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
import React from 'react';

interface SpeakerSelectorProps {
  value: number; // 0 for Auto, 1-N for specific speaker count
  onChange: (value: number) => void;
  disabled?: boolean;
  maxSpeakers?: number;
}

export const SpeakerSelector: React.FC<SpeakerSelectorProps> = ({
  value,
  onChange,
  disabled = false,
  maxSpeakers = 5, // Default max explicit speakers
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(parseInt(event.target.value, 10));
  };

  const explicitSpeakerOptions = Array.from({ length: maxSpeakers }, (_, i) => i + 1);

  return (
    <div className="w-full"> {/* Removed my-2 for better alignment in grid */}
      <select
        id="speaker-count-select"
        value={value}
        onChange={handleChange}
        disabled={disabled}
        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:opacity-50 transition-colors"
        aria-label="Select number of speakers"
      >
        <option key="auto" value="0">
          Auto (AI Detects Speakers)
        </option>
        {explicitSpeakerOptions.map(num => (
          <option key={num} value={num}>
            {num} Speaker{num > 1 ? 's' : ''} {num === 1 ? '(No Diarization - Punctuation Only)' : ''}
          </option>
        ))}
      </select>
    </div>
  );
};
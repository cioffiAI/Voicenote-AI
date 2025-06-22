
import React from 'react';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface ResultDisplayProps {
  title?: string;
  text: string;
  isLoading?: boolean;
  placeholder?: string;
  small?: boolean; 
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({
  title,
  text,
  isLoading = false,
  placeholder = "No content yet.",
  small = false,
}) => {
  const containerClasses = small 
    ? "bg-gray-50 dark:bg-gray-700 p-4 rounded-lg min-h-[100px] max-h-[200px] overflow-y-auto border border-gray-200 dark:border-gray-600"
    : "bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl min-h-[150px] max-h-[400px] overflow-y-auto";
  
  const textClasses = small
    ? "text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap"
    : "text-md text-gray-800 dark:text-gray-100 whitespace-pre-wrap";

  const placeholderClasses = small
    ? "text-sm text-gray-400 dark:text-gray-500"
    : "text-md text-gray-500 dark:text-gray-400";

  return (
    <div className={`${containerClasses} w-full`}> {/* Ensure ResultDisplay takes full width */}
      {title && !small && (
        <h3 className="text-xl font-semibold mb-3 text-gray-700 dark:text-gray-300">{title}</h3>
      )}
      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <SpinnerIcon className="w-8 h-8 text-sky-500" />
          <span className="ml-2 text-gray-500 dark:text-gray-400">
            {placeholder.includes("Loading") || placeholder.includes("Diarizing") || placeholder.includes("Listening") ? placeholder : "Loading..."}
          </span>
        </div>
      ) : text.trim() ? (
        <p className={textClasses}>{text}</p>
      ) : (
        <p className={placeholderClasses}>{placeholder}</p>
      )}
    </div>
  );
};

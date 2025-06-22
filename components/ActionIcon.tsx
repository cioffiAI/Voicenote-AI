
import React from 'react';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface ActionIconProps {
  IconComponent: React.ElementType;
  label: string;
  tooltip: string;
  onClick: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  iconClassName?: string;
  textClassName?: string;
}

export const ActionIcon: React.FC<ActionIconProps> = ({
  IconComponent,
  label,
  tooltip,
  onClick,
  disabled = false,
  isLoading = false,
  iconClassName = '',
  textClassName = '',
}) => {
  const effectiveDisabled = disabled || isLoading;

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      if (!effectiveDisabled) {
        onClick();
      }
    }
  };
  
  return (
    <div
      role="button"
      tabIndex={effectiveDisabled ? -1 : 0}
      onClick={effectiveDisabled ? undefined : onClick}
      onKeyDown={handleKeyDown}
      className={`group flex flex-col items-center justify-center p-4 rounded-lg cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-sky-500 dark:focus-visible:ring-offset-gray-800
                  ${effectiveDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors'}`}
      aria-label={tooltip}
      aria-disabled={effectiveDisabled}
    >
      <div className={`relative transition-transform duration-200 ease-in-out ${!effectiveDisabled ? 'group-hover:scale-110' : ''}`}>
        {isLoading ? (
          <SpinnerIcon className={`w-12 h-12 sm:w-16 sm:h-16 ${iconClassName.replace(/w-\d+|h-\d+|sm:w-\d+|sm:h-\d+/g, '')}`} />
        ) : (
          <IconComponent className={`${iconClassName || 'w-12 h-12 sm:w-16 sm:h-16 text-gray-700 dark:text-gray-300'}`} aria-hidden="true" />
        )}
      </div>
      <span className={`mt-2 text-sm sm:text-base font-medium ${textClassName || 'text-gray-700 dark:text-gray-300'} ${effectiveDisabled ? 'text-opacity-50' : ''}`}>
        {label}
      </span>
    </div>
  );
};

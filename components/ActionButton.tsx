
import React from 'react';
import { SpinnerIcon } from './icons/SpinnerIcon'; // Assuming SpinnerIcon is created

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  Icon?: React.ElementType;
  children: React.ReactNode;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  children,
  isLoading = false,
  Icon,
  className,
  ...props
}) => {
  return (
    <button
      type="button"
      className={`flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      disabled={props.disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <SpinnerIcon className="w-5 h-5 mr-2 animate-spin" />
      ) : Icon ? (
        <Icon className="w-5 h-5 mr-2" />
      ) : null}
      {children}
    </button>
  );
};

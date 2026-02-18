import React from 'react';
import { useTheme } from '@/provider/theme-provider';

interface ConfirmOverlayProps {
  show: boolean;
  onClose: () => void;
  title: string;
  message: string;
  buttonText?: string;
}

const ConfirmOverlay: React.FC<ConfirmOverlayProps> = ({
  show,
  onClose,
  title,
  message,
  buttonText,
}) => {
  const { theme } = useTheme();
  const isDark =
    theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  if (!show) return null;
  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black backdrop-blur-sm">
      <div
        className={`${
          isDark ? 'bg-gray-800' : 'bg-white'
        } mx-4 w-full max-w-md scale-100 transform rounded-2xl p-8 shadow-2xl transition-all duration-300 ease-in-out`}
      >
        <div className="mb-4 flex justify-center">
          <div
            className={`h-16 w-16 ${
              isDark ? 'bg-green-800' : 'bg-green-100'
            } flex items-center justify-center rounded-full`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="#4ade80"
              className="h-8 w-8"
            >
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
          </div>
        </div>
        <div className="mb-4 text-center">
          <span
            className={`inline-block ${
              isDark ? 'bg-blue-800 text-blue-200' : 'bg-blue-100 text-blue-800'
            } rounded-full px-3 py-1 text-xs font-medium tracking-wide uppercase`}
          >
            Swiftly
          </span>
        </div>
        <h2
          className={`text-2xl font-bold ${
            isDark ? 'text-white' : 'text-gray-900'
          } mb-4 text-center`}
        >
          {title}
        </h2>
        <p
          className={`${
            isDark ? 'text-green-400' : 'text-green-600'
          } mb-8 text-center leading-relaxed`}
        >
          {message}
        </p>
        <button
          className="w-full rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors duration-200 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
          onClick={onClose}
        >
          {buttonText || 'OK'}
        </button>
      </div>
    </div>
  );
};

export default ConfirmOverlay;

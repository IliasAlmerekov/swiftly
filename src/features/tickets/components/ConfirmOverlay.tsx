import React from "react";
import { useTheme } from "@/provider/theme-provider";

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
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div
        className={`${
          isDark ? "bg-gray-800" : "bg-white"
        } rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 transform transition-all duration-300 ease-in-out scale-100`}
      >
        <div className="flex justify-center mb-4">
          <div
            className={`w-16 h-16 ${
              isDark ? "bg-green-800" : "bg-green-100"
            } rounded-full flex items-center justify-center`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="#4ade80"
              className="w-8 h-8"
            >
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
          </div>
        </div>
        <div className="text-center mb-4">
          <span
            className={`inline-block ${
              isDark ? "bg-blue-800 text-blue-200" : "bg-blue-100 text-blue-800"
            } text-xs font-medium px-3 py-1 rounded-full uppercase tracking-wide`}
          >
            ScooTeq Helpdesk
          </span>
        </div>
        <h2
          className={`text-2xl font-bold ${
            isDark ? "text-white" : "text-gray-900"
          } text-center mb-4`}
        >
          {title}
        </h2>
        <p
          className={`${
            isDark ? "text-green-400" : "text-green-600"
          } text-center mb-8 leading-relaxed`}
        >
          {message}
        </p>
        <button
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          onClick={onClose}
        >
          {buttonText || "OK"}
        </button>
      </div>
    </div>
  );
};

export default ConfirmOverlay;

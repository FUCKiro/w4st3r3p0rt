import React from 'react';
import { Moon, Sun, LogOut, Settings } from 'lucide-react';

interface ProfileActionsProps {
  onLogout: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export function ProfileActions({ onLogout, isDark, onToggleTheme }: ProfileActionsProps) {
  return (
    <div className="space-y-4">
      {/* Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </div>
            <span className="font-medium text-gray-900 dark:text-white">
              Tema {isDark ? 'Scuro' : 'Chiaro'}
            </span>
          </div>
          <button
            onClick={onToggleTheme}
            className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center text-white hover:bg-teal-600 transition-colors"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={onLogout}
        className="w-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl p-4 font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex items-center justify-center space-x-2"
      >
        <LogOut className="w-5 h-5" />
        <span>Esci</span>
      </button>
    </div>
  );
}
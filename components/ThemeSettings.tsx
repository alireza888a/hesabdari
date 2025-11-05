import React, { useState, useEffect } from 'react';
import type { Theme } from '../types';

interface ThemeSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: Theme;
  onThemeChange: (newTheme: Theme) => void;
}

const ThemeSettings: React.FC<ThemeSettingsProps> = ({ isOpen, onClose, currentTheme, onThemeChange }) => {
  const [localTheme, setLocalTheme] = useState<Theme>(currentTheme);

  useEffect(() => {
    setLocalTheme(currentTheme);
  }, [currentTheme]);

  if (!isOpen) return null;

  const handleApply = () => {
    onThemeChange(localTheme);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center" onClick={onClose}>
      <div
        className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4">تنظیمات پوسته</h2>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="startColor" className="block text-sm font-medium text-gray-700 mb-1">
              رنگ شروع گرادینت
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                id="startColor"
                value={localTheme.start}
                onChange={(e) => setLocalTheme(prev => ({ ...prev, start: e.target.value }))}
                className="w-10 h-10 p-0 border-none cursor-pointer"
              />
              <input
                type="text"
                value={localTheme.start}
                onChange={(e) => setLocalTheme(prev => ({ ...prev, start: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[var(--color-primary-start)] focus:border-[var(--color-primary-start)]"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="endColor" className="block text-sm font-medium text-gray-700 mb-1">
              رنگ پایان گرادینت
            </label>
             <div className="flex items-center space-x-2">
              <input
                type="color"
                id="endColor"
                value={localTheme.end}
                onChange={(e) => setLocalTheme(prev => ({ ...prev, end: e.target.value }))}
                className="w-10 h-10 p-0 border-none cursor-pointer"
              />
              <input
                type="text"
                value={localTheme.end}
                onChange={(e) => setLocalTheme(prev => ({ ...prev, end: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[var(--color-primary-start)] focus:border-[var(--color-primary-start)]"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            انصراف
          </button>
          <button
            onClick={handleApply}
            style={{
              backgroundImage: `linear-gradient(to right, ${localTheme.start}, ${localTheme.end})`
            }}
            className="px-4 py-2 text-white font-semibold rounded-md hover:opacity-90 transition-opacity"
          >
            اعمال
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThemeSettings;
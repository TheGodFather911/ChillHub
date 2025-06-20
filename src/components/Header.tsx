import React from 'react';
import { Waves, Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const Header: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className={`relative z-20 backdrop-blur-md border-b transition-all duration-300 ${
      isDark 
        ? 'bg-gray-900/10 border-gray-700/20' 
        : 'bg-white/10 border-white/20'
    }`}>
      <div className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-rose-400 to-orange-400 rounded-2xl">
              <Waves className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className={`text-xl font-semibold transition-colors duration-300 ${
                isDark ? 'text-gray-100' : 'text-gray-800'
              }`}>Cozy Dashboard</h1>
              <p className={`text-xs transition-colors duration-300 ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>Your peaceful workspace</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 transition-colors duration-300 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              <Sun className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-medium">Good vibes only</span>
            </div>
            
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-xl transition-all duration-300 hover:scale-105 ${
                isDark 
                  ? 'bg-gray-700/50 hover:bg-gray-600/50 text-yellow-400' 
                  : 'bg-gray-100/50 hover:bg-gray-200/50 text-gray-600'
              }`}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
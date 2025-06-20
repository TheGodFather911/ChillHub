import React from 'react';
import { useTheme } from './contexts/ThemeContext';
import Header from './components/Header';
import YouTubePlayer from './components/YouTubePlayer';
import SSHTerminal from './components/SSHTerminal';
import Notebook from './components/Notebook';
import AIChat from './components/AIChat';

function App() {
  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen transition-all duration-300 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50'
    }`}>
      {/* Subtle overlay pattern */}
      <div className={`absolute inset-0 opacity-5 ${
        isDark ? 'opacity-10' : 'opacity-5'
      } bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23000000%22 fill-opacity=%220.1%22%3E%3Ccircle cx=%227%22 cy=%227%22 r=%221%22/%3E%3Ccircle cx=%2237%22 cy=%2237%22 r=%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]`}></div>
      
      <div className="relative z-10">
        <Header />
        
        {/* Main content grid - new layout */}
        <main className="container mx-auto px-6 py-4">
          <div className="grid grid-cols-12 gap-6 h-[calc(100vh-10rem)]">
            {/* Left column - Music Player (top) and Notebook (bottom) */}
            <div className="col-span-5 flex flex-col gap-6">
              {/* Music Player - compact at top */}
              <div className={`backdrop-blur-sm rounded-3xl shadow-lg border p-4 hover:shadow-xl transition-all duration-300 h-80 ${
                isDark 
                  ? 'bg-gray-800/80 border-gray-700/50' 
                  : 'bg-white/80 border-white/50'
              }`}>
                <YouTubePlayer />
              </div>
              
              {/* Notebook - takes remaining space */}
              <div className={`backdrop-blur-sm rounded-3xl shadow-lg border p-4 hover:shadow-xl transition-all duration-300 flex-1 ${
                isDark 
                  ? 'bg-gray-800/80 border-gray-700/50' 
                  : 'bg-white/80 border-white/50'
              }`}>
                <Notebook />
              </div>
            </div>
            
            {/* Right column - SSH Terminal */}
            <div className={`col-span-7 backdrop-blur-sm rounded-3xl shadow-lg border p-4 hover:shadow-xl transition-all duration-300 ${
              isDark 
                ? 'bg-gray-900/95 border-gray-700/50' 
                : 'bg-gray-900/95 border-gray-700/50'
            }`}>
              <SSHTerminal />
            </div>
            
            {/* Bottom row - Wide AI Chat */}
            <div className={`col-span-12 backdrop-blur-sm rounded-3xl shadow-lg border p-4 hover:shadow-xl transition-all duration-300 h-80 ${
              isDark 
                ? 'bg-gray-800/80 border-gray-700/50' 
                : 'bg-white/80 border-white/50'
            }`}>
              <AIChat />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
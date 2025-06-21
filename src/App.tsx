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
    <div
      className={`min-h-screen min-w-full transition-all duration-300 flex flex-col ${
        isDark
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
          : 'bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50'
      }`}
    >
      {/* Subtle overlay pattern */}
      <div
        className={`absolute inset-0 ${
          isDark ? 'opacity-10' : 'opacity-5'
        } bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23000000%22 fill-opacity=%220.1%22%3E%3Ccircle cx=%227%22 cy=%227%22 r=%221%22/%3E%3Ccircle cx=%2237%22 cy=%2237%22 r=%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]`}
      ></div>

      <div className="relative z-10 flex flex-col flex-grow overflow-hidden">
        <Header />
        <main
          className="flex-grow container mx-auto px-6 py-4"
          style={{ height: 'calc(100vh - 5rem)', minHeight: 0 }}
        >
          <div
            className="grid gap-6 h-full"
            style={{
              gridTemplateColumns: '1fr 2fr 2fr',
              gridTemplateRows: '2fr 1fr',   // Music Player gets more height here
              gridTemplateAreas: `
                "music ai ssh"
                "notebook ai ssh"
              `,
              minHeight: 0,
            }}
          >
            {/* Music Player - top-left, bigger now */}
            <div
              style={{ gridArea: 'music', minHeight: 0, minWidth: 0 }}
              className={`backdrop-blur-sm rounded-3xl shadow-lg border p-4 hover:shadow-xl transition-all duration-300 overflow-hidden ${
                isDark ? 'bg-gray-800/80 border-gray-700/50' : 'bg-white/80 border-white/50'
              }`}
            >
              <YouTubePlayer />
            </div>

            {/* AI Chat - middle column spanning 2 rows */}
            <div
              style={{ gridArea: 'ai', minHeight: 0, minWidth: 0 }}
              className={`backdrop-blur-sm rounded-3xl shadow-lg border p-4 hover:shadow-xl transition-all duration-300 overflow-hidden ${
                isDark ? 'bg-gray-800/80 border-gray-700/50' : 'bg-white/80 border-white/50'
              }`}
            >
              <AIChat />
            </div>

            {/* SSH Terminal - right column spanning 2 rows */}
            <div
              style={{ gridArea: 'ssh', minHeight: 0, minWidth: 0 }}
              className={`backdrop-blur-sm rounded-3xl shadow-lg border p-4 hover:shadow-xl transition-all duration-300 overflow-hidden ${
                isDark ? 'bg-gray-900/95 border-gray-700/50' : 'bg-gray-900/95 border-gray-700/50'
              }`}
            >
              <SSHTerminal />
            </div>

            {/* Notebook - bottom-left, smaller now */}
            <div
              style={{ gridArea: 'notebook', minHeight: 0, minWidth: 0 }}
              className={`backdrop-blur-sm rounded-3xl shadow-lg border p-4 hover:shadow-xl transition-all duration-300 overflow-hidden ${
                isDark ? 'bg-gray-800/80 border-gray-700/50' : 'bg-white/80 border-white/50'
              }`}
            >
              <Notebook />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;

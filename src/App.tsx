import React from 'react';
import Header from './components/Header';
import YouTubePlayer from './components/YouTubePlayer';
import SSHTerminal from './components/SSHTerminal';
import Notebook from './components/Notebook';
import AIChat from './components/AIChat';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50">
      {/* Subtle overlay pattern */}
      <div className="absolute inset-0 opacity-5 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23000000%22 fill-opacity=%220.1%22%3E%3Ccircle cx=%227%22 cy=%227%22 r=%221%22/%3E%3Ccircle cx=%2237%22 cy=%2237%22 r=%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
      
      <div className="relative z-10">
        <Header />
        
        {/* Main content grid - optimized layout */}
        <main className="container mx-auto px-6 py-4">
          <div className="grid grid-cols-12 gap-6 h-[calc(100vh-10rem)]">
            {/* Top row - Music Player (compact) and Terminal (wider) */}
            <div className="col-span-4 bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-white/50 p-4 hover:shadow-xl transition-all duration-300">
              <YouTubePlayer />
            </div>
            
            <div className="col-span-8 bg-gray-900/95 backdrop-blur-sm rounded-3xl shadow-lg border border-gray-700/50 p-4 hover:shadow-xl transition-all duration-300">
              <SSHTerminal />
            </div>
            
            {/* Bottom row - Notebook (larger) and AI Chat (taller) */}
            <div className="col-span-7 bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-white/50 p-4 hover:shadow-xl transition-all duration-300">
              <Notebook />
            </div>
            
            <div className="col-span-5 bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-white/50 p-4 hover:shadow-xl transition-all duration-300">
              <AIChat />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
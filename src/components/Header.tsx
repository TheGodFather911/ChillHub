import React from 'react';
import { Waves, Sun } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="relative z-20 bg-white/10 backdrop-blur-md border-b border-white/20">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-rose-400 to-orange-400 rounded-2xl">
              <Waves className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">Cozy Dashboard</h1>
              <p className="text-sm text-gray-600">Your peaceful workspace</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-gray-700">
              <Sun className="w-5 h-5 text-amber-500" />
              <span className="text-sm font-medium">Good vibes only</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
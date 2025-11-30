import React from 'react';
import { Home, Grid3X3, User, Settings } from 'lucide-react';

export const IconBar: React.FC = () => {
  return (
    <div className="w-16 bg-gray-900 flex flex-col items-center py-4 space-y-6">
      <button className="p-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
        <Home size={24} />
      </button>
      <button className="p-3 text-white bg-blue-600 rounded-lg">
        <Grid3X3 size={24} />
      </button>
      <button className="p-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
        <User size={24} />
      </button>
      <button className="p-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
        <Settings size={24} />
      </button>
    </div>
  );
};
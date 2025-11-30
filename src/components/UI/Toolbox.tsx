import React from 'react';
import { Pen, Edit, MousePointer, Eraser } from 'lucide-react';
import { useAOIStore } from '../../store/aoiStore';
import type { DrawingTool } from '../../types/aoi';

interface ToolboxProps {
  activeTool: DrawingTool;
  onToolChange: (tool: DrawingTool) => void;
}

export const Toolbox: React.FC<ToolboxProps> = ({ activeTool, onToolChange }) => {
  const { isConfirmed } = useAOIStore();
  
  const tools = [
    { id: 'draw' as DrawingTool, icon: Pen, label: 'Draw polygon' },
    { id: 'edit' as DrawingTool, icon: Edit, label: 'Edit polygon' },
    { id: 'select' as DrawingTool, icon: MousePointer, label: 'Select polygon' },
    { id: 'erase' as DrawingTool, icon: Eraser, label: 'Erase polygon' },
  ];

  return (
    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white rounded-lg shadow-lg border border-gray-200 p-2 space-y-2">
      {tools.map((tool) => {
        const Icon = tool.icon;
        const isActive = activeTool === tool.id;
        
        return (
          <button
            key={tool.id}
            onClick={() => onToolChange(isActive ? null : tool.id)}
            className={`p-3 rounded-lg transition-colors ${
              isActive
                ? 'bg-blue-600 text-white'
                : isConfirmed
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            title={tool.label}
            disabled={isConfirmed}
            data-testid={`tool-${tool.id}`}
          >
            <Icon size={20} />
          </button>
        );
      })}
    </div>
  );
};
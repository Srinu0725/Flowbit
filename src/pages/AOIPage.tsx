import React, { useState } from 'react';
import { IconBar } from '../components/UI/IconBar';
import { Sidebar } from '../components/UI/Sidebar';
import { AoiMap } from '../components/Map/AoiMap';
import { Toolbox } from '../components/UI/Toolbox';
import { MapControls } from '../components/UI/MapControls';
import { useAOIStore } from '../store/aoiStore';
import type { DrawingTool } from '../types/aoi';

export const AOIPage: React.FC = () => {
  const [activeTool, setActiveTool] = useState<DrawingTool>(null);
  const { isConfirmed } = useAOIStore();

  const handleToolChange = (tool: DrawingTool) => {
    if (isConfirmed) return;
    setActiveTool(tool);
  };

  return (
    <div className="h-screen flex" data-testid="aoi-page">
      <IconBar />
      <Sidebar />
      <div className="flex-1 relative">
        <AoiMap activeTool={activeTool} />
        <Toolbox activeTool={activeTool} onToolChange={handleToolChange} />
        <MapControls />
      </div>
    </div>
  );
};
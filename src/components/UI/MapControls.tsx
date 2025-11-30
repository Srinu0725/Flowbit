import React from 'react';
import { Plus, Minus, Map, Satellite } from 'lucide-react';
import { useAOIStore } from '../../store/aoiStore';

interface MapControlsProps {
  mapInstance?: any;
}

export const MapControls: React.FC<MapControlsProps> = ({ mapInstance }) => {
  const { mapView, setMapView } = useAOIStore();

  const handleZoomIn = () => {
    if (mapInstance) {
      const view = mapInstance.getView();
      const zoom = view.getZoom();
      view.setZoom(zoom + 1);
    }
  };

  const handleZoomOut = () => {
    if (mapInstance) {
      const view = mapInstance.getView();
      const zoom = view.getZoom();
      view.setZoom(zoom - 1);
    }
  };

  return (
    <div className="absolute bottom-4 right-4 space-y-2">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-1">
        <button 
          onClick={handleZoomIn}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded"
        >
          <Plus size={20} />
        </button>
        <button 
          onClick={handleZoomOut}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded"
        >
          <Minus size={20} />
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-1 flex">
        <button
          onClick={() => setMapView('base')}
          className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
            mapView === 'base'
              ? 'bg-blue-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
          data-testid="base-image-toggle"
        >
          <Satellite size={16} className="inline mr-1" />
          Base Image
        </button>
        <button
          onClick={() => setMapView('map')}
          className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
            mapView === 'map'
              ? 'bg-blue-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
          data-testid="map-view-toggle"
        >
          <Map size={16} className="inline mr-1" />
          Map View
        </button>
      </div>
    </div>
  );
};
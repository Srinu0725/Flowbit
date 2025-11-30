import React, { useState } from 'react';
import { Search, Trash2, Edit2, Eye, EyeOff } from 'lucide-react';
import { useAOIStore } from '../../store/aoiStore';

export const Sidebar: React.FC = () => {
  const {
    aois,
    searchLocation,
    isConfirmed,
    selectedAoiId,
    clearAOIs,
    confirmAOIs,
    resetConfirmation,
    setSearchLocation,
    removeAOI,
    updateAOI,
    selectAOI
  } = useAOIStore();
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  
  const hasAOIs = aois.length > 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchLocation.trim()) {
      (window as any).aoiMapHandlers?.handleSearch();
    }
  };

  const handleApplyOutline = () => {
    if (searchLocation.trim()) {
      (window as any).aoiMapHandlers?.handleApplyOutline();
    }
  };

  const handleConfirmAOI = () => {
    if (hasAOIs && !isConfirmed) {
      confirmAOIs();
    }
  };

  const handleReset = () => {
    resetConfirmation();
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-semibold text-gray-900 mb-4">
          Define Area of Interest
        </h1>
        
        <form onSubmit={handleSearch} className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search location..."
            value={searchLocation}
            onChange={(e) => setSearchLocation(e.target.value)}
            disabled={isConfirmed}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
          />
        </form>
        
        <button 
          onClick={handleApplyOutline}
          disabled={!searchLocation.trim() || isConfirmed}
          className="w-full mb-3 px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors disabled:bg-gray-100 disabled:text-gray-400"
        >
          Apply outline as base image
        </button>
        
        {!isConfirmed ? (
          <button 
            onClick={handleConfirmAOI}
            className={`w-full px-4 py-2 rounded-lg transition-colors ${
              hasAOIs 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            disabled={!hasAOIs}
            data-testid="confirm-aoi-button"
          >
            Confirm Area of Interest
          </button>
        ) : (
          <div className="space-y-2">
            <div className="w-full px-4 py-2 bg-green-100 text-green-800 rounded-lg text-center font-medium">
              ✓ AOIs Confirmed
            </div>
            <button 
              onClick={handleReset}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
            >
              Reset & Edit
            </button>
          </div>
        )}
      </div>
      
      <div className="flex-1 p-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-medium text-gray-900">Areas of Interest ({aois.length})</h3>
          {selectedAoiId && (
            <button 
              onClick={() => selectAOI(null)}
              className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <Eye size={12} />
              Show All
            </button>
          )}
        </div>
        {aois.length === 0 ? (
          <p className="text-sm text-gray-500">
            {isConfirmed ? 'No confirmed AOIs.' : 'No areas defined yet. Use the draw tool to create polygons.'}
          </p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {aois.map((aoi) => (
              <div key={aoi.id} className={`p-3 rounded-lg border transition-colors ${
                selectedAoiId === aoi.id 
                  ? 'bg-blue-50 border-blue-200' 
                  : isConfirmed 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
              }`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    {editingId === aoi.id ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full text-sm px-2 py-1 border rounded"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              updateAOI(aoi.id, { name: editName });
                              setEditingId(null);
                            } else if (e.key === 'Escape') {
                              setEditingId(null);
                            }
                          }}
                          autoFocus
                        />
                        <div className="flex gap-1">
                          <button
                            onClick={() => {
                              updateAOI(aoi.id, { name: editName });
                              setEditingId(null);
                            }}
                            className="text-xs px-2 py-1 bg-blue-600 text-white rounded"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="text-xs px-2 py-1 bg-gray-300 text-gray-700 rounded"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm font-medium text-gray-900">{aoi.name}</p>
                        <p className="text-xs text-gray-500">
                          Created {new Date(aoi.createdAt).toLocaleDateString()}
                        </p>
                      </>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1 ml-2">
                    {selectedAoiId === aoi.id ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          selectAOI(null);
                        }}
                        className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                        title="Hide"
                      >
                        <EyeOff size={12} />
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          selectAOI(aoi.id);
                        }}
                        className="p-1 text-gray-600 hover:bg-gray-200 rounded"
                        title="Show only this AOI"
                      >
                        <Eye size={12} />
                      </button>
                    )}
                    
                    {!isConfirmed && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingId(aoi.id);
                            setEditName(aoi.name);
                          }}
                          className="p-1 text-gray-600 hover:bg-gray-200 rounded"
                          title="Rename"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeAOI(aoi.id);
                          }}
                          className="p-1 text-red-600 hover:bg-red-100 rounded"
                          title="Delete"
                        >
                          <Trash2 size={12} />
                        </button>
                      </>
                    )}
                    
                    {isConfirmed && (
                      <span className="text-xs text-green-600 font-medium">✓</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
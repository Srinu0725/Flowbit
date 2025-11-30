import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MapState, AOI } from '../types';
import { Feature } from 'ol';
import { Geometry } from 'ol/geom';
import GeoJSON from 'ol/format/GeoJSON';

const geoJSONFormat = new GeoJSON();

export const useMapStore = create<MapState>()(
  persist(
    (set) => ({
      aois: [],
      selectedAoiId: null,
      isDrawing: false,
      isEditing: false,
      mapView: 'base',
      
      addAOI: (aoi: AOI) => {
        set((state) => ({
          aois: [...state.aois, aoi],
        }));
      },
      
      removeAOI: (id: string) => {
        set((state) => ({
          aois: state.aois.filter((aoi) => aoi.id !== id),
          selectedAoiId: state.selectedAoiId === id ? null : state.selectedAoiId,
        }));
      },
      
      selectAOI: (id: string | null) => {
        set({ selectedAoiId: id });
      },
      
      setDrawing: (drawing: boolean) => {
        set({ isDrawing: drawing });
      },
      
      setEditing: (editing: boolean) => {
        set({ isEditing: editing });
      },
      
      setMapView: (view: 'base' | 'map') => {
        set({ mapView: view });
      },
      
      clearAOIs: () => {
        set({ aois: [], selectedAoiId: null });
      },
    }),
    {
      name: 'aoi-storage',
      partialize: (state) => ({
        aois: state.aois.map(aoi => ({
          ...aoi,
          feature: geoJSONFormat.writeFeatureObject(aoi.feature),
        })),
        mapView: state.mapView,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.aois) {
          state.aois = state.aois.map((aoi: any) => ({
            ...aoi,
            feature: geoJSONFormat.readFeature(aoi.feature) as Feature<Geometry>,
            createdAt: new Date(aoi.createdAt),
          }));
        }
      },
    }
  )
);
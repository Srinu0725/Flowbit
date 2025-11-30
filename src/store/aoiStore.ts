import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Feature } from 'ol';
import { Polygon } from 'ol/geom';
import type { AOI, MapView } from '../types/aoi';

interface AOIState {
  aois: AOI[];
  selectedAoiId: string | null;
  vectorSource: any;
  baseOutline: Feature<Polygon> | null;
  mapView: MapView;
  isConfirmed: boolean;
  searchLocation: string;
  
  setVectorSource: (source: any) => void;
  addAOI: (feature: Feature<Polygon>) => void;
  deleteAOI: (aoiId: string) => void;
  removeAOI: (aoiId: string) => void;
  updateAOI: (aoiId: string, updates: Partial<AOI>) => void;
  selectAOI: (aoiId: string | null) => void;
  renameAndReindexAOIs: () => void;
  setMapView: (view: MapView) => void;
  setBaseOutline: (feature: Feature<Polygon> | null) => void;
  confirmAOIs: () => void;
  resetConfirmation: () => void;
  setSearchLocation: (location: string) => void;
  clearAOIs: () => void;
}

export const useAOIStore = create<AOIState>()(
  persist(
    (set, get) => ({
      aois: [],
      selectedAoiId: null,
      vectorSource: null,
      baseOutline: null,
      mapView: 'base',
      isConfirmed: false,
      searchLocation: '',

      setVectorSource: (source) => {
        set({ vectorSource: source });
      },

      addAOI: (feature) => {
        const { isConfirmed, aois } = get();
        if (isConfirmed) return;

        const featureId = feature.getId() || crypto.randomUUID();
        feature.setId(featureId);

        const newAOI: AOI = {
          id: crypto.randomUUID(),
          name: `AOI ${aois.length + 1}`,
          featureId: featureId.toString(),
          createdAt: new Date().toISOString()
        };

        set((state) => ({
          aois: [...state.aois, newAOI]
        }));
      },

      deleteAOI: (aoiId) => {
        const { isConfirmed, vectorSource } = get();
        if (isConfirmed) return;

        const aoi = get().aois.find(a => a.id === aoiId);
        if (aoi && vectorSource) {
          const feature = vectorSource.getFeatureById(aoi.featureId);
          if (feature) {
            vectorSource.removeFeature(feature);
          }
        }

        set((state) => ({
          aois: state.aois.filter(a => a.id !== aoiId),
          selectedAoiId: state.selectedAoiId === aoiId ? null : state.selectedAoiId
        }));

        get().renameAndReindexAOIs();
      },

      removeAOI: (aoiId) => {
        get().deleteAOI(aoiId);
      },

      updateAOI: (aoiId, updates) => {
        set((state) => ({
          aois: state.aois.map(aoi => 
            aoi.id === aoiId ? { ...aoi, ...updates } : aoi
          )
        }));
      },

      selectAOI: (aoiId) => {
        set({ selectedAoiId: aoiId });
      },

      renameAndReindexAOIs: () => {
        set((state) => ({
          aois: state.aois.map((aoi, index) => ({
            ...aoi,
            name: `AOI ${index + 1}`
          }))
        }));
      },

      setMapView: (view) => {
        set({ mapView: view });
      },

      setBaseOutline: (feature) => {
        set({ baseOutline: feature });
      },

      confirmAOIs: () => {
        const { aois } = get();
        if (aois.length > 0) {
          set({ isConfirmed: true });
        }
      },

      resetConfirmation: () => {
        set({ isConfirmed: false });
      },

      setSearchLocation: (location) => {
        set({ searchLocation: location });
      },

      clearAOIs: () => {
        const { vectorSource } = get();
        if (vectorSource) {
          vectorSource.clear();
        }
        set({ aois: [], selectedAoiId: null, isConfirmed: false });
      }
    }),
    {
      name: 'aoi-storage',
      partialize: (state) => ({
        aois: state.aois,
        mapView: state.mapView,
        isConfirmed: state.isConfirmed
      })
    }
  )
);
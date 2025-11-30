import { Feature } from 'ol';
import { Geometry } from 'ol/geom';

export interface AOI {
  id: string;
  name: string;
  feature: Feature<Geometry>;
  createdAt: Date;
}

export interface MapState {
  aois: AOI[];
  selectedAoiId: string | null;
  isDrawing: boolean;
  isEditing: boolean;
  mapView: 'base' | 'map';
  addAOI: (aoi: AOI) => void;
  removeAOI: (id: string) => void;
  selectAOI: (id: string | null) => void;
  setDrawing: (drawing: boolean) => void;
  setEditing: (editing: boolean) => void;
  setMapView: (view: 'base' | 'map') => void;
  clearAOIs: () => void;
}

export type DrawingTool = 'draw' | 'edit' | 'select' | 'erase' | null;
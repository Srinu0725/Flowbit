import { Feature } from 'ol';
import { Polygon } from 'ol/geom';

export interface AOI {
  id: string;
  name: string;
  featureId: string;
  createdAt: string;
}

export interface BoundingBox {
  minLon: number;
  minLat: number;
  maxLon: number;
  maxLat: number;
}

export interface NominatimResult {
  display_name: string;
  boundingbox: [string, string, string, string]; // [minLat, maxLat, minLon, maxLon]
}

export type DrawingTool = 'draw' | 'edit' | 'select' | 'erase' | null;
export type MapView = 'base' | 'map';
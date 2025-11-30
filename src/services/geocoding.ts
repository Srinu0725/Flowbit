import type { NominatimResult, BoundingBox } from '../types/aoi';

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';

export class GeocodingService {
  static async searchLocation(query: string): Promise<NominatimResult | null> {
    if (!query.trim()) return null;

    try {
      const response = await fetch(
        `${NOMINATIM_BASE_URL}/search?format=json&limit=1&polygon_geojson=1&q=${encodeURIComponent(query)}`
      );
      
      if (!response.ok) throw new Error('Geocoding request failed');
      
      const results = await response.json();
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  }

  static parseBoundingBox(boundingbox: [string, string, string, string]): BoundingBox {
    const [minLat, maxLat, minLon, maxLon] = boundingbox.map(Number);
    return { minLon, minLat, maxLon, maxLat };
  }

  static async getAreaPolygon(query: string): Promise<any> {
    try {
      console.log('Fetching polygon for:', query);
      
      // Use Nominatim with polygon_geojson parameter - try different approaches
      let response = await fetch(
        `${NOMINATIM_BASE_URL}/search?format=json&limit=1&polygon_geojson=1&addressdetails=1&q=${encodeURIComponent(query)}`
      );
      
      // If no polygon found, try with different parameters
      if (response.ok) {
        const testResults = await response.json();
        if (testResults.length > 0 && (!testResults[0].geojson || testResults[0].geojson.type === 'Point')) {
          console.log('First attempt returned Point, trying with admin level');
          response = await fetch(
            `${NOMINATIM_BASE_URL}/search?format=json&limit=5&polygon_geojson=1&addressdetails=1&q=${encodeURIComponent(query + ' city')}`
          );
        } else {
          // Reset response for normal processing
          response = await fetch(
            `${NOMINATIM_BASE_URL}/search?format=json&limit=1&polygon_geojson=1&addressdetails=1&q=${encodeURIComponent(query)}`
          );
        }
      }
      
      if (!response.ok) {
        console.log('Nominatim request failed');
        return null;
      }
      
      const results = await response.json();
      console.log('Nominatim results:', results);
      
      // Try to find the best result with polygon data
      let bestResult = null;
      for (const result of results) {
        if (result.geojson && (result.geojson.type === 'Polygon' || result.geojson.type === 'MultiPolygon')) {
          bestResult = result;
          break;
        }
      }
      
      const place = bestResult || results[0];
      console.log('Selected result:', place);
      
      if (results.length === 0) {
        console.log('No results found');
        return null;
      }
      
      if (place.geojson) {
        console.log('Found GeoJSON polygon:', place.geojson);
        console.log('GeoJSON type:', place.geojson.type);
        console.log('GeoJSON coordinates:', place.geojson.coordinates);
        
        if (place.geojson.type === 'Polygon' && place.geojson.coordinates) {
          console.log('Returning Polygon coordinates');
          return place.geojson.coordinates;
        } else if (place.geojson.type === 'MultiPolygon' && place.geojson.coordinates) {
          console.log('Returning first polygon from MultiPolygon');
          return place.geojson.coordinates[0];
        } else if (place.geojson.type === 'Point' || place.geojson.type === 'LineString') {
          console.log('Found Point/LineString, cannot create polygon');
          return null;
        }
      }
      
      console.log('No polygon geometry found in result');
      return null;
    } catch (error) {
      console.error('Area polygon fetch error:', error);
      return null;
    }
  }
}
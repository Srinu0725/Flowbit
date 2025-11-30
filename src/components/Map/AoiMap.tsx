import React, { useEffect, useRef, useCallback } from 'react';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import ImageLayer from 'ol/layer/Image';
import VectorLayer from 'ol/layer/Vector';
import OSM from 'ol/source/OSM';
import ImageWMS from 'ol/source/ImageWMS';
import VectorSource from 'ol/source/Vector';
import { Draw, Modify, Select } from 'ol/interaction';
import { fromLonLat, transformExtent } from 'ol/proj';
import { Feature } from 'ol';
import { Polygon } from 'ol/geom';
import { Style, Stroke, Fill } from 'ol/style';
import { useAOIStore } from '../../store/aoiStore';
import { GeocodingService } from '../../services/geocoding';
import type { DrawingTool } from '../../types/aoi';

interface AoiMapProps {
  activeTool: DrawingTool;
}

export const AoiMap: React.FC<AoiMapProps> = ({ activeTool }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<Map | null>(null);
  const drawRef = useRef<Draw | null>(null);
  const modifyRef = useRef<Modify | null>(null);
  const selectRef = useRef<Select | null>(null);
  const aoiSourceRef = useRef<VectorSource>(new VectorSource());
  const baseSourceRef = useRef<VectorSource>(new VectorSource());

  const {
    aois,
    baseOutline,
    mapView,
    isConfirmed,
    searchLocation,
    selectedAoiId,
    addAOI,
    removeAOI,
    setVectorSource,
    setBaseOutline
  } = useAOIStore();

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) return;

    const osmLayer = new TileLayer({
      source: new OSM(),
      visible: mapView === 'map'
    });

    const wmsLayer = new ImageLayer({
      source: new ImageWMS({
        url: 'https://www.wms.nrw.de/geobasis/wms_nw_dop',
        params: {
          'LAYERS': 'nw_dop_rgb',
          'VERSION': '1.3.0',
          'FORMAT': 'image/png'
        },
        ratio: 1
      }),
      visible: mapView === 'base'
    });

    const baseLayer = new VectorLayer({
      source: baseSourceRef.current,
      style: new Style({
        stroke: new Stroke({
          color: '#ff6b35',
          width: 3,
          lineDash: [10, 5]
        }),
        fill: new Fill({
          color: 'rgba(255, 107, 53, 0.1)'
        })
      })
    });

    const aoiLayer = new VectorLayer({
      source: aoiSourceRef.current,
      style: new Style({
        stroke: new Stroke({
          color: '#3b82f6',
          width: 2
        }),
        fill: new Fill({
          color: 'rgba(59, 130, 246, 0.2)'
        })
      })
    });

    const map = new Map({
      target: mapRef.current,
      layers: [osmLayer, wmsLayer, baseLayer, aoiLayer],
      view: new View({
        center: fromLonLat([7.0, 51.5]),
        zoom: 8
      })
    });

    mapInstanceRef.current = map;

    return () => {
      map.setTarget(undefined);
    };
  }, []);

  // Handle map view toggle
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const layers = mapInstanceRef.current.getLayers().getArray();
    layers[0].setVisible(mapView === 'map');  // OSM
    layers[1].setVisible(mapView === 'base'); // WMS
  }, [mapView]);

  // Set vector source reference in store
  useEffect(() => {
    setVectorSource(aoiSourceRef.current);
  }, [setVectorSource]);

  // Update AOI visibility - only show selected AOI
  useEffect(() => {
    if (!aoiSourceRef.current) return;
    
    const allFeatures = aoiSourceRef.current.getFeatures();
    
    if (selectedAoiId) {
      // Hide all features except selected
      allFeatures.forEach(feature => {
        const isSelected = aois.some(aoi => aoi.featureId === feature.getId() && aoi.id === selectedAoiId);
        feature.setStyle(isSelected ? undefined : new Style());
      });
    } else {
      // Show all features
      allFeatures.forEach(feature => {
        feature.setStyle(undefined);
      });
    }
  }, [aois, selectedAoiId]);

  // Update base outline
  useEffect(() => {
    baseSourceRef.current.clear();
    if (baseOutline) {
      baseSourceRef.current.addFeature(baseOutline);
    }
  }, [baseOutline]);

  // Handle drawing tools
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;
    
    // Remove existing interactions
    [drawRef.current, modifyRef.current, selectRef.current].forEach(interaction => {
      if (interaction) {
        map.removeInteraction(interaction);
      }
    });

    if (isConfirmed) return; // Disable tools after confirmation

    switch (activeTool) {
      case 'draw':
        const draw = new Draw({
          source: aoiSourceRef.current,
          type: 'Polygon',
          freehand: false
        });
        
        draw.on('drawstart', () => {
          map.getInteractions().forEach(interaction => {
            if (interaction.constructor.name === 'DragPan') {
              interaction.setActive(false);
            }
          });
        });

        draw.on('drawend', (event) => {
          const feature = event.feature as Feature<Polygon>;
          addAOI(feature);
          
          // Re-enable pan
          map.getInteractions().forEach(interaction => {
            if (interaction.constructor.name === 'DragPan') {
              interaction.setActive(true);
            }
          });
        });
        
        map.addInteraction(draw);
        drawRef.current = draw;
        break;

      case 'edit':
        const modify = new Modify({
          source: aoiSourceRef.current
        });
        map.addInteraction(modify);
        modifyRef.current = modify;
        break;

      case 'select':
        const select = new Select({
          layers: [map.getLayers().getArray()[3] as VectorLayer<VectorSource>]
        });
        map.addInteraction(select);
        selectRef.current = select;
        break;

      case 'erase':
        const eraseSelect = new Select({
          layers: [map.getLayers().getArray()[3] as VectorLayer<VectorSource>]
        });
        
        eraseSelect.on('select', (event) => {
          const selectedFeatures = event.selected;
          if (selectedFeatures.length > 0) {
            const feature = selectedFeatures[0];
            const aoiToRemove = aois.find(aoi => aoi.featureId === feature.getId());
            if (aoiToRemove) {
              removeAOI(aoiToRemove.id);
            }
          }
        });
        
        map.addInteraction(eraseSelect);
        selectRef.current = eraseSelect;
        break;
    }
  }, [activeTool, aois, isConfirmed, addAOI, removeAOI]);

  // Search functionality
  const handleSearch = useCallback(async () => {
    if (!searchLocation.trim() || !mapInstanceRef.current) return;

    const result = await GeocodingService.searchLocation(searchLocation);
    if (!result) return;

    const bbox = GeocodingService.parseBoundingBox(result.boundingbox);
    const extent = transformExtent(
      [bbox.minLon, bbox.minLat, bbox.maxLon, bbox.maxLat],
      'EPSG:4326',
      'EPSG:3857'
    );

    mapInstanceRef.current.getView().fit(extent, {
      padding: [50, 50, 50, 50],
      duration: 1000
    });
  }, [searchLocation]);

  // Apply outline as base image
  const handleApplyOutline = useCallback(async () => {
    if (!searchLocation.trim()) return;

    console.log('Apply outline clicked for:', searchLocation);

    // Try to get actual polygon geometry first
    const polygonCoords = await GeocodingService.getAreaPolygon(searchLocation);
    
    if (polygonCoords) {
      console.log('Creating polygon from coordinates:', polygonCoords);
      // Use actual administrative boundary
      const polygon = new Polygon(polygonCoords);
      polygon.transform('EPSG:4326', 'EPSG:3857');
      
      const feature = new Feature(polygon);
      setBaseOutline(feature);
      console.log('Base outline set with polygon');

      // Fit map to outline
      if (mapInstanceRef.current) {
        mapInstanceRef.current.getView().fit(polygon.getExtent(), {
          padding: [50, 50, 50, 50],
          duration: 1000
        });
      }
    } else {
      console.log('No polygon found, using bounding box fallback');
      // Fallback to bounding box if polygon not available
      const result = await GeocodingService.searchLocation(searchLocation);
      if (!result) return;

      const bbox = GeocodingService.parseBoundingBox(result.boundingbox);
      
      const coordinates = [[
        [bbox.minLon, bbox.minLat],
        [bbox.maxLon, bbox.minLat],
        [bbox.maxLon, bbox.maxLat],
        [bbox.minLon, bbox.maxLat],
        [bbox.minLon, bbox.minLat]
      ]];

      const polygon = new Polygon(coordinates);
      polygon.transform('EPSG:4326', 'EPSG:3857');
      
      const feature = new Feature(polygon);
      setBaseOutline(feature);
      console.log('Base outline set with bounding box');

      if (mapInstanceRef.current) {
        mapInstanceRef.current.getView().fit(polygon.getExtent(), {
          padding: [50, 50, 50, 50],
          duration: 1000
        });
      }
    }
  }, [searchLocation, setBaseOutline]);

  // Expose methods to parent
  useEffect(() => {
    (window as any).aoiMapHandlers = {
      handleSearch,
      handleApplyOutline
    };
  }, [handleSearch, handleApplyOutline]);

  return <div ref={mapRef} className="h-full w-full" />;
};
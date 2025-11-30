import React, { useEffect, useRef } from 'react';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import ImageLayer from 'ol/layer/Image';
import VectorLayer from 'ol/layer/Vector';
import OSM from 'ol/source/OSM';
import ImageWMS from 'ol/source/ImageWMS';
import VectorSource from 'ol/source/Vector';
import { Draw, Modify, Select } from 'ol/interaction';
import { fromLonLat } from 'ol/proj';
import { Feature } from 'ol';
import { Polygon } from 'ol/geom';
import { useMapStore } from '../../store/mapStore';
import type { AOI, DrawingTool } from '../../types';

interface MapContainerProps {
  activeTool: DrawingTool;
}

export const MapContainer: React.FC<MapContainerProps> = ({ activeTool }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<Map | null>(null);
  const drawRef = useRef<Draw | null>(null);
  const modifyRef = useRef<Modify | null>(null);
  const selectRef = useRef<Select | null>(null);
  const vectorSourceRef = useRef<VectorSource>(new VectorSource());
  
  const { aois, addAOI, removeAOI, mapView, setDrawing, setEditing } = useMapStore();

  useEffect(() => {
    if (!mapRef.current) return;

    const osmLayer = new TileLayer({
      source: new OSM({
        url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
        maxZoom: 19,
        attributions: '© OpenStreetMap contributors',
      }),
      visible: mapView === 'map',
    });

    const wmsLayer = new ImageLayer({
      source: new ImageWMS({
        url: 'https://www.wms.nrw.de/geobasis/wms_nw_dop',
        params: {
          'LAYERS': 'nw_dop_rgb',
          'VERSION': '1.1.1',
          'FORMAT': 'image/jpeg'
        },
        ratio: 1,
        serverType: 'mapserver',
      }),
      visible: mapView === 'base',
    });

    const vectorLayer = new VectorLayer({
      source: vectorSourceRef.current,
      style: {
        'fill-color': 'rgba(59, 130, 246, 0.2)',
        'stroke-color': '#3b82f6',
        'stroke-width': 2,
      },
    });

    const map = new Map({
      target: mapRef.current,
      layers: [osmLayer, wmsLayer, vectorLayer],
      view: new View({
        center: fromLonLat([7.0, 51.5]),
        zoom: 8,
        minZoom: 5,
        maxZoom: 18,
      }),
    });

    mapInstanceRef.current = map;

    return () => {
      map.setTarget(undefined);
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;
    const layers = map.getLayers().getArray();
    
    if (layers.length >= 2) {
      layers[0].setVisible(mapView === 'map');
      layers[1].setVisible(mapView === 'base');
    }
  }, [mapView]);

  useEffect(() => {
    vectorSourceRef.current.clear();
    aois.forEach(aoi => {
      vectorSourceRef.current.addFeature(aoi.feature);
    });
  }, [aois]);

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;
    
    [drawRef.current, modifyRef.current, selectRef.current].forEach(interaction => {
      if (interaction) {
        map.removeInteraction(interaction);
      }
    });

    if (activeTool === 'draw') {
      const draw = new Draw({
        source: vectorSourceRef.current,
        type: 'Polygon',
        freehand: false,
      });
      
      draw.on('drawend', (event) => {
        const feature = event.feature as Feature<Polygon>;
        const aoi: AOI = {
          id: Date.now().toString(),
          name: `AOI ${aois.length + 1}`,
          feature,
          createdAt: new Date(),
        };
        addAOI(aoi);
      });
      
      map.addInteraction(draw);
      drawRef.current = draw;
      setDrawing(true);
    } else if (activeTool === 'edit') {
      const modify = new Modify({
        source: vectorSourceRef.current,
      });
      
      map.addInteraction(modify);
      modifyRef.current = modify;
      setEditing(true);
    } else if (activeTool === 'select') {
      const select = new Select({
        layers: [map.getLayers().getArray()[2] as VectorLayer<VectorSource>],
      });
      
      map.addInteraction(select);
      selectRef.current = select;
    } else if (activeTool === 'erase') {
      const select = new Select({
        layers: [map.getLayers().getArray()[2] as VectorLayer<VectorSource>],
      });
      
      select.on('select', (event) => {
        const selectedFeatures = event.selected;
        if (selectedFeatures.length > 0) {
          const feature = selectedFeatures[0];
          const aoiToRemove = aois.find(aoi => aoi.feature === feature);
          if (aoiToRemove) {
            removeAOI(aoiToRemove.id);
          }
        }
      });
      
      map.addInteraction(select);
      selectRef.current = select;
    } else {
      setDrawing(false);
      setEditing(false);
    }
  }, [activeTool, aois, addAOI, removeAOI, setDrawing, setEditing]);

  return <div ref={mapRef} className="h-full w-full" />;
};
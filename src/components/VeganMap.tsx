'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import veganRestaurants from '@/data/vegan-restaurants.json';

// Fix for default markers in Leaflet with Next.js
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface VeganRestaurant {
  id: string;
  name: string;
  address: string;
  neighborhood: string;
  type: string;
  vegan_options: string;
  deal: string;
  hours: string;
  coordinates: [number, number];
}

const TYPE_COLORS: Record<string, string> = {
  '100% Vegan': '#16a34a',
  '100% Raw Vegan': '#15803d',
  'Vegan Health Food': '#166534',
  'Vegan-Friendly': '#2563eb',
  'Vegan Options': '#9333ea',
};

function getTypeBadge(type: string): string {
  const color = TYPE_COLORS[type] ?? '#6b7280';
  return `<span style="display:inline-block; background:${color}; color:white; font-size:11px; font-weight:600; padding:2px 8px; border-radius:999px; margin-bottom:8px;">${type}</span>`;
}

function createPopupContent(place: VeganRestaurant): string {
  return `
    <div style="max-width: 340px; padding: 16px; background: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <h3 style="font-size: 17px; font-weight: bold; color: #14532d; margin-bottom: 6px;">${place.name}</h3>
      ${getTypeBadge(place.type)}
      <div style="font-size: 13px; color: #374151; line-height: 1.55;">
        <div style="margin-bottom: 4px; font-weight: 600; color: #4b5563;">${place.neighborhood}</div>
        <div style="margin-bottom: 8px; color: #6b7280;">${place.address}</div>
        <div style="margin-bottom: 6px;"><strong style="color:#15803d;">Vegan Options:</strong> ${place.vegan_options}</div>
        ${place.deal ? `<div style="margin-bottom: 4px;"><strong>Deal:</strong> ${place.deal}</div>` : ''}
        <div style="font-size: 12px; color: #6b7280; margin-top: 6px;"><strong>Hours:</strong> ${place.hours}</div>
      </div>
    </div>
  `;
}

const WB_CENTER: [number, number] = [41.2459, -75.8813];
const DEFAULT_ZOOM = 13;

const MAP_THEMES: Record<string, { url: string; attribution: string; name: string }> = {
  'Voyager': {
    name: 'Voyager',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
  'Streets': {
    name: 'Streets',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  },
  'Light': {
    name: 'Light',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
  'Dark': {
    name: 'Dark',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
  'Topo': {
    name: 'Topographic',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
  },
};

export default function VeganMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current).setView(WB_CENTER, DEFAULT_ZOOM);
    mapInstanceRef.current = map;

    const baseLayers: L.Control.LayersObject = {};
    const defaultKey = 'Voyager';
    const defaultTheme = MAP_THEMES[defaultKey];

    const defaultLayer = L.tileLayer(defaultTheme.url, {
      maxZoom: 19,
      attribution: defaultTheme.attribution,
    }).addTo(map);
    baseLayers[defaultTheme.name] = defaultLayer;

    Object.entries(MAP_THEMES).forEach(([key, theme]) => {
      if (key === defaultKey) return;
      baseLayers[theme.name] = L.tileLayer(theme.url, {
        maxZoom: 19,
        attribution: theme.attribution,
      });
    });

    L.control.layers(baseLayers, undefined, { collapsed: true }).addTo(map);

    // Color-coded markers by type
    (veganRestaurants as VeganRestaurant[]).forEach((place) => {
      const color = TYPE_COLORS[place.type] ?? '#6b7280';
      const icon = L.divIcon({
        className: '',
        html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.4);"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
        popupAnchor: [0, -10],
      });

      const marker = L.marker(place.coordinates, { icon }).addTo(map);
      marker.bindPopup(createPopupContent(place), { maxWidth: 360 });
    });

    // Legend
    const LegendControl = L.Control.extend({
      onAdd() {
        const div = L.DomUtil.create('div');
        div.style.cssText = 'background:white;padding:10px 14px;border-radius:8px;box-shadow:0 2px 6px rgba(0,0,0,0.15);font-size:12px;line-height:1.8;';
        div.innerHTML = `
          <div style="font-weight:700;margin-bottom:6px;color:#14532d;">Type</div>
          ${Object.entries(TYPE_COLORS).map(([type, color]) =>
            `<div style="display:flex;align-items:center;gap:7px;">
              <div style="width:12px;height:12px;border-radius:50%;background:${color};flex-shrink:0;"></div>
              <span style="color:#374151;">${type}</span>
            </div>`
          ).join('')}
        `;
        return div;
      },
    });
    new LegendControl({ position: 'bottomright' }).addTo(map);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="h-screen w-full">
      <div ref={mapRef} className="h-full w-full" />
    </div>
  );
}

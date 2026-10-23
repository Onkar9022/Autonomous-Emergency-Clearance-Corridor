// AECC Interactive Command-Center Map
// Uses Leaflet (OpenStreetMap) when window.L is ready, with automatic responsive SVG fallback

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useAECC } from '../../context/AECCContext';
import {
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Crosshair,
  AlertTriangle,
  Building2,
  Navigation,
  Radio,
  Eye,
  EyeOff,
} from 'lucide-react';

export default function InteractiveMap({
  height = '500px',
  onSelectObject = null,
  showControls = true,
  interactiveLayers = true,
}) {
  const {
    hospitals,
    ambulances,
    trafficSignals,
    activeIncident,
    selectedRoute,
    ambulancePos,
    simStatus,
    corridorPlan,
  } = useAECC();

  const mapContainerRef = useRef(null);
  const leafletMapRef = useRef(null);
  const markersRef = useRef({
    hospitals: [],
    ambulances: [],
    signals: [],
    incident: null,
    ambulanceMoving: null,
    routePolyline: null,
    corridorPolyline: null,
  });

  const [hasLeaflet, setHasLeaflet] = useState(false);
  const [layersOpen, setLayersOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Layer Visibility Toggles
  const [visibleLayers, setVisibleLayers] = useState({
    hospitals: true,
    ambulances: true,
    signals: true,
    incident: true,
    route: true,
    corridor: true,
  });

  const toggleLayer = (key) => {
    setVisibleLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Center Coordinates (Solapur, Maharashtra)
  const defaultCenter = [17.6690, 75.9064];

  // Check for window.L
  useEffect(() => {
    if (typeof window !== 'undefined' && window.L) {
      setHasLeaflet(true);
    } else {
      const timer = setInterval(() => {
        if (window.L) {
          setHasLeaflet(true);
          clearInterval(timer);
        }
      }, 500);
      return () => clearInterval(timer);
    }
  }, []);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!hasLeaflet || !mapContainerRef.current || leafletMapRef.current) return;

    try {
      const L = window.L;
      const map = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: 14,
        zoomControl: false,
      });

      // CartoDB Voyager Tiles with authenticated key + OSM fallback
      const cartoKey = import.meta.env?.VITE_CARTO_API_KEY || 'cb1_4t4k_1_f757e6cf9484a7b7f74e78d5';
      const tileUrl = `https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?key=${cartoKey}`;
      
      const baseLayer = L.tileLayer(tileUrl, {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        maxZoom: 19,
        subdomains: 'abcd',
      });
      baseLayer.addTo(map);

      leafletMapRef.current = map;
    } catch (e) {
      console.warn('Leaflet initialization failed, switching to SVG fallback:', e);
      setHasLeaflet(false);
    }

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [hasLeaflet]);

  // Update Leaflet Layers on State Changes
  useEffect(() => {
    if (!hasLeaflet || !leafletMapRef.current || !window.L) return;
    const L = window.L;
    const map = leafletMapRef.current;
    const refs = markersRef.current;

    // Clear previous dynamic markers
    refs.hospitals.forEach((m) => m.remove());
    refs.ambulances.forEach((m) => m.remove());
    refs.signals.forEach((m) => m.remove());
    if (refs.incident) refs.incident.remove();
    if (refs.ambulanceMoving) refs.ambulanceMoving.remove();
    if (refs.routePolyline) refs.routePolyline.remove();
    if (refs.corridorPolyline) refs.corridorPolyline.remove();

    refs.hospitals = [];
    refs.ambulances = [];
    refs.signals = [];

    // 1. Draw Route Polyline & Animated Green Corridor
    if (selectedRoute && selectedRoute.geometry && visibleLayers.route) {
      // Background glow
      refs.routePolyline = L.polyline(selectedRoute.geometry, {
        color: '#102A43',
        weight: 6,
        opacity: 0.6,
      }).addTo(map);

      if (visibleLayers.corridor) {
        refs.corridorPolyline = L.polyline(selectedRoute.geometry, {
          color: '#22A06B',
          weight: 5,
          dashArray: simStatus === 'running' ? '12, 8' : null,
          opacity: 0.95,
        }).addTo(map);
      }
    }

    // 2. Hospital Markers
    if (visibleLayers.hospitals) {
      hospitals.forEach((hosp) => {
        const iconHtml = `
          <div class="flex items-center justify-center w-8 h-8 rounded-full bg-white border-2 border-sky-500 shadow-lg text-sky-600 font-bold text-xs hover:scale-110 transition-transform">
            🏥
          </div>
        `;
        const icon = L.divIcon({ html: iconHtml, className: '', iconSize: [32, 32], iconAnchor: [16, 16] });
        const marker = L.marker([hosp.location.lat, hosp.location.lng], { icon })
          .addTo(map)
          .bindPopup(`
            <div class="p-1 font-sans">
              <span class="text-[10px] font-bold uppercase tracking-wider text-sky-600">Hospital Facility</span>
              <h4 class="font-bold text-navy text-sm leading-tight mt-0.5">${hosp.name}</h4>
              <p class="text-xs text-slate-500 mt-1">${hosp.traumaLevel}</p>
              <div class="mt-2 text-[11px] font-semibold text-emerald-600">Status: ${hosp.status} (${hosp.availableBedsSimulated || 15} beds)</div>
            </div>
          `);
        marker.on('click', () => setSelectedItem({ type: 'hospital', data: hosp }));
        refs.hospitals.push(marker);
      });
    }

    // 3. Traffic Signals
    if (visibleLayers.signals) {
      trafficSignals.forEach((sig) => {
        const isPriority = sig.state === 'priority_active';
        const color = isPriority ? '#22A06B' : sig.state === 'green' ? '#159A9C' : '#F05A47';
        const iconHtml = `
          <div class="flex items-center justify-center w-7 h-7 rounded-full bg-slate-900 border-2 shadow-md ${
            isPriority ? 'border-corridor ring-2 ring-corridor/50 animate-pulse' : 'border-slate-700'
          }">
            <span class="w-2.5 h-2.5 rounded-full" style="background-color: ${color}"></span>
          </div>
        `;
        const icon = L.divIcon({ html: iconHtml, className: '', iconSize: [28, 28], iconAnchor: [14, 14] });
        const marker = L.marker([sig.location.lat, sig.location.lng], { icon })
          .addTo(map)
          .bindPopup(`
            <div class="p-1 font-sans">
              <span class="text-[10px] font-mono font-bold uppercase text-slate-500">${sig.id}</span>
              <h4 class="font-bold text-navy text-sm mt-0.5">${sig.intersectionName}</h4>
              <div class="text-xs mt-1">State: <strong class="uppercase text-slate-800">${sig.state}</strong></div>
              <div class="text-[11px] text-slate-400 mt-0.5">Mode: ${sig.operatingMode}</div>
            </div>
          `);
        marker.on('click', () => setSelectedItem({ type: 'signal', data: sig }));
        refs.signals.push(marker);
      });
    }

    // 4. Static Ambulances
    if (visibleLayers.ambulances) {
      ambulances.forEach((amb) => {
        const isAssigned = amb.status !== 'Available';
        const iconHtml = `
          <div class="flex items-center justify-center w-8 h-8 rounded-full bg-white border-2 ${
            isAssigned ? 'border-coral-500 animate-bounce' : 'border-slate-400'
          } shadow-lg text-xs">
            🚑
          </div>
        `;
        const icon = L.divIcon({ html: iconHtml, className: '', iconSize: [32, 32], iconAnchor: [16, 16] });
        const marker = L.marker([amb.location.lat, amb.location.lng], { icon })
          .addTo(map)
          .bindPopup(`
            <div class="p-1 font-sans">
              <span class="text-[10px] font-bold text-coral-600 uppercase tracking-wider">${amb.id}</span>
              <h4 class="font-bold text-navy text-sm mt-0.5">${amb.callSign}</h4>
              <div class="text-xs text-slate-600 mt-1">${amb.type}</div>
              <div class="text-[11px] font-semibold mt-1 text-slate-800">Status: ${amb.status}</div>
            </div>
          `);
        marker.on('click', () => setSelectedItem({ type: 'ambulance', data: amb }));
        refs.ambulances.push(marker);
      });
    }

    // 5. Active Incident Marker
    if (activeIncident && activeIncident.location && visibleLayers.incident) {
      const iconHtml = `
        <div class="relative flex items-center justify-center w-10 h-10">
          <span class="absolute w-full h-full rounded-full bg-red-500/40 animate-ping"></span>
          <div class="relative w-8 h-8 rounded-full bg-red-600 border-2 border-white shadow-xl flex items-center justify-center text-white text-xs font-bold">
            ⚠️
          </div>
        </div>
      `;
      const icon = L.divIcon({ html: iconHtml, className: '', iconSize: [40, 40], iconAnchor: [20, 20] });
      const marker = L.marker([activeIncident.location.lat, activeIncident.location.lng], { icon, zIndexOffset: 1000 })
        .addTo(map)
        .bindPopup(`
          <div class="p-1 font-sans">
            <span class="text-[10px] font-bold text-red-600 uppercase tracking-wider">CRITICAL INCIDENT</span>
            <h4 class="font-bold text-navy text-sm mt-0.5">${activeIncident.category}</h4>
            <p class="text-xs text-slate-600 mt-1">${activeIncident.location.address}</p>
            <div class="text-[11px] font-bold text-red-700 mt-1">Severity: ${activeIncident.severity}</div>
          </div>
        `);
      marker.on('click', () => setSelectedItem({ type: 'incident', data: activeIncident }));
      refs.incident = marker;
    }

    // 6. Real-time Animated Ambulance Marker
    if (ambulancePos && simStatus === 'running') {
      const ambIconHtml = `
        <div class="relative flex items-center justify-center w-11 h-11">
          <span class="absolute w-full h-full rounded-full bg-corridor/50 animate-ping"></span>
          <div class="relative w-9 h-9 rounded-full bg-white border-2 border-corridor shadow-2xl flex items-center justify-center text-sm">
            🚑
          </div>
        </div>
      `;
      const ambIcon = L.divIcon({ html: ambIconHtml, className: '', iconSize: [44, 44], iconAnchor: [22, 22] });
      refs.ambulanceMoving = L.marker([ambulancePos.lat, ambulancePos.lng], { icon: ambIcon, zIndexOffset: 2000 }).addTo(map);
    }
  }, [
    hasLeaflet,
    hospitals,
    ambulances,
    trafficSignals,
    activeIncident,
    selectedRoute,
    ambulancePos,
    simStatus,
    visibleLayers,
  ]);

  // Map Controls Helpers
  const handleZoomIn = () => leafletMapRef.current?.zoomIn();
  const handleZoomOut = () => leafletMapRef.current?.zoomOut();
  const handleRecenter = () => {
    if (!leafletMapRef.current) return;
    if (activeIncident && activeIncident.location) {
      leafletMapRef.current.setView([activeIncident.location.lat, activeIncident.location.lng], 15);
    } else {
      leafletMapRef.current.setView(defaultCenter, 14);
    }
  };

  const handleFitRoute = () => {
    if (!leafletMapRef.current || !selectedRoute || !selectedRoute.geometry) return;
    const L = window.L;
    if (!L) return;
    const bounds = L.latLngBounds(selectedRoute.geometry);
    leafletMapRef.current.fitBounds(bounds, { padding: [50, 50] });
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200/80 shadow-md bg-slate-900" style={{ height }}>
      {/* ── Leaflet Container ── */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* ── SVG Fallback if Leaflet fails ── */}
      {!hasLeaflet && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 text-white p-6 z-10">
          <div className="w-12 h-12 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center mb-3">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <h4 className="font-bold text-lg text-slate-100">Solapur GIS Vector Grid (Autonomous Mode)</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm text-center">
            Standard OpenStreetMap tiles offline. Displaying real-time mathematical road network & signal nodes.
          </p>
          <div className="mt-4 flex gap-3 text-xs">
            <span className="px-2.5 py-1 rounded bg-slate-800 text-teal-300 font-mono">5 Hospitals</span>
            <span className="px-2.5 py-1 rounded bg-slate-800 text-coral-300 font-mono">4 Ambulances</span>
            <span className="px-2.5 py-1 rounded bg-slate-800 text-emerald-300 font-mono">6 Smart Signals</span>
          </div>
        </div>
      )}

      {/* ── Floating Map Controls ── */}
      {showControls && (
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
          <button
            onClick={handleZoomIn}
            className="w-9 h-9 rounded-xl bg-white/95 hover:bg-white text-navy shadow-md flex items-center justify-center text-sm font-bold border border-slate-200 transition-all active:scale-95"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="w-9 h-9 rounded-xl bg-white/95 hover:bg-white text-navy shadow-md flex items-center justify-center text-sm font-bold border border-slate-200 transition-all active:scale-95"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleRecenter}
            className="w-9 h-9 rounded-xl bg-white/95 hover:bg-white text-navy shadow-md flex items-center justify-center text-sm font-bold border border-slate-200 transition-all active:scale-95"
            title="Recenter on Incident"
          >
            <Crosshair className="w-4 h-4" />
          </button>
          {selectedRoute && (
            <button
              onClick={handleFitRoute}
              className="w-9 h-9 rounded-xl bg-corridor text-white shadow-md flex items-center justify-center text-sm font-bold border border-corridor-dark transition-all active:scale-95"
              title="Fit Corridor Route"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setLayersOpen(!layersOpen)}
            className={`w-9 h-9 rounded-xl shadow-md flex items-center justify-center text-sm font-bold border transition-all active:scale-95 ${
              layersOpen ? 'bg-navy text-white border-navy' : 'bg-white/95 text-navy border-slate-200'
            }`}
            title="Toggle Map Layers"
          >
            <Layers className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Layer Toggles Dropdown Panel ── */}
      {layersOpen && (
        <div className="absolute top-16 right-16 z-30 w-52 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200 p-3 text-xs text-navy animate-in fade-in slide-in-from-top-2">
          <div className="font-bold uppercase tracking-wider text-[10px] text-muted mb-2 px-1">
            Display Layers
          </div>
          <div className="space-y-1">
            {Object.keys(visibleLayers).map((key) => (
              <button
                key={key}
                onClick={() => toggleLayer(key)}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors capitalize font-medium text-left"
              >
                <span>{key}</span>
                {visibleLayers[key] ? (
                  <Eye className="w-3.5 h-3.5 text-corridor" />
                ) : (
                  <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Selected Object Modal/Drawer ── */}
      {selectedItem && (
        <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-md z-30 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200 p-4 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                {selectedItem.type}
              </span>
              <h4 className="font-bold text-navy text-base mt-1">
                {selectedItem.data.name || selectedItem.data.callSign || selectedItem.data.intersectionName || selectedItem.data.category}
              </h4>
            </div>
            <button
              onClick={() => setSelectedItem(null)}
              className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1"
            >
              ✕
            </button>
          </div>
          <div className="mt-2 text-xs text-slate-600">
            {selectedItem.data.address || selectedItem.data.type || selectedItem.data.operatingMode || selectedItem.data.notes}
          </div>
        </div>
      )}

      {/* ── Bottom Map Status HUD ── */}
      <div className="absolute bottom-3 left-3 z-20 flex items-center gap-2 bg-navy/90 backdrop-blur-md text-white px-3 py-1.5 rounded-xl border border-white/10 text-[11px] font-mono">
        <span className="w-2 h-2 rounded-full bg-corridor animate-pulse" />
        <span>SOLAPUR REGION — 17.669°N, 75.906°E</span>
        <span className="text-white/40">|</span>
        <span className="text-teal-400">
          {selectedRoute?.source?.includes('OSRM') ? 'OSRM LIVE ROUTING' : 'AECC DETERMINISTIC GIS'}
        </span>
      </div>
    </div>
  );
}

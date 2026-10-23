// Live Emergency Map View (Section 12 of Specification)
// Full-height geospatial command map with entity search, layer toggles and inspector

import React, { useState } from 'react';
import { useAECC } from '../../context/AECCContext';
import InteractiveMap from '../common/InteractiveMap';
import { MapPin, Search, Filter, Layers, Building2, Ambulance, Radio, AlertTriangle } from 'lucide-react';

export default function LiveEmergencyMapPage() {
  const { hospitals, ambulances, trafficSignals, activeIncident } = useAECC();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'hospitals' | 'ambulances' | 'signals'

  // Filtered entities for inspector strip
  const filteredHospitals = hospitals.filter(
    (h) => h.name.toLowerCase().includes(searchTerm.toLowerCase()) || h.id.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredAmbulances = ambulances.filter(
    (a) => a.callSign.toLowerCase().includes(searchTerm.toLowerCase()) || a.id.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredSignals = trafficSignals.filter(
    (s) => s.intersectionName.toLowerCase().includes(searchTerm.toLowerCase()) || s.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col space-y-3">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div>
          <h2 className="text-xl font-black text-navy flex items-center gap-2">
            <MapPin className="w-5 h-5 text-coral" />
            <span>Municipal Geospatial Operations Map</span>
          </h2>
          <p className="text-xs text-muted mt-0.5">
            Real-time Solapur emergency response cartography with live V2X telemetry overlays
          </p>
        </div>

        {/* Search & Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter entities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl bg-white border border-surface-dim text-navy text-xs w-36 sm:w-44 focus:outline-none focus:border-corridor shadow-xs placeholder:text-muted"
            />
          </div>

          <div className="flex items-center gap-1 p-1 bg-white border border-surface-dim rounded-xl text-xs shadow-xs">
            {[
              { id: 'all', label: 'All' },
              { id: 'hospitals', label: 'Hospitals' },
              { id: 'ambulances', label: 'Ambulances' },
              { id: 'signals', label: 'Signals' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                  activeTab === tab.id ? 'bg-navy text-white shadow-xs' : 'text-muted hover:text-navy'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Map Container */}
      <div className="flex-1 min-h-[460px] rounded-2xl overflow-hidden border border-surface-dim shadow-xs relative bg-white">
        <InteractiveMap height="100%" />
      </div>

      {/* Filtered Entity Inspector Bottom Strip */}
      <div className="p-3 bg-white rounded-2xl border border-surface-dim shadow-xs flex items-center gap-2 overflow-x-auto text-xs shrink-0 scrollbar-none">
        <span className="text-[10px] font-mono font-bold text-muted uppercase tracking-wider shrink-0 mr-1">
          Entities ({activeTab}):
        </span>

        {(activeTab === 'all' || activeTab === 'hospitals') &&
          filteredHospitals.map((h) => (
            <div
              key={h.id}
              className="px-2.5 py-1.5 rounded-xl bg-surface border border-surface-dim flex items-center gap-1.5 shrink-0"
            >
              <Building2 className="w-3.5 h-3.5 text-sky" />
              <span className="text-navy font-medium truncate max-w-[140px]">{h.shortName}</span>
              <span className="text-[10px] font-mono text-muted">
                {h.bedCapacityVerified ? `${h.availableBedsVerified} beds` : 'Cap. Unknown'}
              </span>
            </div>
          ))}

        {(activeTab === 'all' || activeTab === 'ambulances') &&
          filteredAmbulances.map((a) => (
            <div
              key={a.id}
              className="px-2.5 py-1.5 rounded-xl bg-surface border border-surface-dim flex items-center gap-1.5 shrink-0"
            >
              <Ambulance className="w-3.5 h-3.5 text-coral" />
              <span className="text-navy font-medium">{a.callSign}</span>
              <span
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                  a.status === 'Available' ? 'bg-corridor/15 text-corridor' : 'bg-coral/15 text-coral'
                }`}
              >
                {a.status}
              </span>
            </div>
          ))}

        {(activeTab === 'all' || activeTab === 'signals') &&
          filteredSignals.map((s) => (
            <div
              key={s.id}
              className="px-2.5 py-1.5 rounded-xl bg-surface border border-surface-dim flex items-center gap-1.5 shrink-0"
            >
              <Radio className="w-3.5 h-3.5 text-teal" />
              <span className="text-navy font-medium truncate max-w-[130px]">{s.intersectionName}</span>
              <span
                className={`w-2 h-2 rounded-full ${
                  s.state === 'priority_active' ? 'bg-corridor animate-pulse' : s.state === 'green' ? 'bg-corridor' : 'bg-coral'
                }`}
              />
            </div>
          ))}
      </div>
    </div>
  );
}

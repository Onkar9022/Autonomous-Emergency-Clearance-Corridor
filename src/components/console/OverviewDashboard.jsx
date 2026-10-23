// Overview Dashboard (Section 5 of Specification)
// Reactive KPI metrics, central command map, active incident operational panel

import React from 'react';
import { useAECC } from '../../context/AECCContext';
import InteractiveMap from '../common/InteractiveMap';
import {
  AlertTriangle,
  Ambulance,
  Zap,
  Building2,
  Clock,
  Radio,
  Timer,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  Play,
  ShieldAlert,
} from 'lucide-react';

export default function OverviewDashboard({ onNavigate }) {
  const {
    incidents,
    activeIncident,
    hospitals,
    ambulances,
    trafficSignals,
    corridorPlan,
    selectedRoute,
    simStatus,
    startSimulation,
    resetSimulation,
    startLiveDemonstration,
    currentSpeedKmH,
    remainingDistanceKm,
    estArrivalSeconds,
    resolveIncident,
  } = useAECC();

  // Derived KPIs from actual state
  const activeIncCount = incidents.filter((i) => i.status !== 'Resolved').length;
  const enRouteAmbCount = ambulances.filter((a) => a.status === 'Dispatched' || a.status === 'En Route').length;
  const activeCorridors = corridorPlan && corridorPlan.status === 'Active' ? 1 : 0;
  const coordinatedSignals = corridorPlan && corridorPlan.signals ? corridorPlan.signals.length : 0;
  const totalTimeSaved = incidents.reduce((acc, curr) => acc + (curr.timeSavedMinutes || 0), 0);
  const avgResponseTime = incidents.length > 0
    ? Math.round(incidents.reduce((acc, curr) => acc + (curr.totalTravelMinutes || 8), 0) / incidents.length)
    : 8;

  const kpis = [
    { label: 'Active Emergencies', value: activeIncCount, icon: AlertTriangle, color: 'text-coral', bg: 'bg-coral/10', border: 'border-coral/20' },
    { label: 'Ambulances En Route', value: enRouteAmbCount, icon: Ambulance, color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20' },
    { label: 'Green Corridors Active', value: activeCorridors, icon: Zap, color: 'text-corridor', bg: 'bg-corridor/10', border: 'border-corridor/20' },
    { label: 'Hospitals Verified', value: hospitals.length, icon: Building2, color: 'text-sky-400', bg: 'bg-sky-400/10', border: 'border-sky-400/20' },
    { label: 'Avg Estimated ETA', value: `${avgResponseTime} min`, icon: Clock, color: 'text-teal-400', bg: 'bg-teal-400/10', border: 'border-teal-400/20' },
    { label: 'Signals Coordinated', value: coordinatedSignals, icon: Radio, color: 'text-corridor', bg: 'bg-corridor/10', border: 'border-corridor/20' },
    { label: 'Simulated Time Saved', value: `${totalTimeSaved} min`, icon: Timer, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' },
    { label: 'System Availability', value: '100%', icon: CheckCircle2, color: 'text-sky-300', bg: 'bg-sky-300/10', border: 'border-sky-300/20' },
  ];

  return (
    <div className="space-y-6">
      {/* ── Top KPI Grid (Section 5.B) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-white border border-surface-dim shadow-xs flex flex-col justify-between hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center justify-between">
                <span className={`p-2 rounded-xl ${kpi.bg} ${kpi.color}`}>
                  <Icon className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-3">
                <div className="text-xl md:text-2xl font-black text-navy tracking-tight">{kpi.value}</div>
                <div className="text-[11px] text-muted font-medium leading-tight mt-0.5">{kpi.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Main Operations Row: Map + Active Incident Panel ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Central Operations Map (8 cols) */}
        <div className="lg:col-span-8 flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-navy flex items-center gap-2">
                <span>Live Municipal Operations Map</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-surface-alt text-teal font-mono border border-surface-dim">
                  SOLAPUR SECTOR
                </span>
              </h2>
              <p className="text-xs text-muted">
                Real-time tracking of ambulance telematics, corridor trajectories & traffic lights
              </p>
            </div>
            <button
              onClick={() => onNavigate('map')}
              className="text-xs text-corridor hover:underline flex items-center gap-1 font-bold"
            >
              <span>Full Screen Map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="rounded-2xl overflow-hidden border border-surface-dim shadow-xs bg-white">
            <InteractiveMap height="440px" />
          </div>

          {/* Quick Signal Status Strip */}
          <div className="p-3 bg-white rounded-2xl border border-surface-dim shadow-xs flex items-center justify-between overflow-x-auto gap-3">
            <span className="text-[11px] font-mono font-bold text-muted uppercase tracking-wider shrink-0">
              Intersections:
            </span>
            <div className="flex items-center gap-3 shrink-0">
              {trafficSignals.map((sig) => {
                const isPriority = sig.state === 'priority_active';
                return (
                  <div key={sig.id} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface border border-surface-dim text-xs">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isPriority ? 'bg-corridor animate-pulse' : sig.state === 'green' ? 'bg-emerald-500' : 'bg-coral'
                      }`}
                    />
                    <span className="text-navy-light font-mono text-[11px] font-semibold">{sig.id}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Active Emergency Operational Panel (4 cols) */}
        <div className="lg:col-span-4 flex flex-col space-y-4">
          <div className="p-5 rounded-2xl bg-white border border-surface-dim shadow-xs flex-1 flex flex-col justify-between">
            {activeIncident ? (
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-coral/15 text-coral text-[10px] font-mono font-bold uppercase tracking-wider border border-coral/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-coral animate-ping" />
                      CRITICAL EMERGENCY ACTIVE
                    </span>
                    <h3 className="text-lg font-black text-navy mt-1.5">{activeIncident.category}</h3>
                  </div>
                  <span className="text-xs font-mono font-bold text-muted">{activeIncident.id}</span>
                </div>

                {/* Location & Details */}
                <div className="p-3 rounded-xl bg-surface border border-surface-dim text-xs space-y-1.5">
                  <div className="text-muted font-medium">Incident Location:</div>
                  <div className="text-navy font-bold">{activeIncident.location.address}</div>
                  <div className="text-[11px] text-teal font-mono">
                    Coords: {activeIncident.location.lat.toFixed(4)}°N, {activeIncident.location.lng.toFixed(4)}°E
                  </div>
                </div>

                {/* Assigned Resources */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-surface border border-surface-dim">
                    <span className="text-[10px] text-muted font-medium block">Ambulance Unit</span>
                    <strong className="text-navy block mt-0.5">
                      {activeIncident.assignedAmbulanceId || 'Awaiting Selection'}
                    </strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-surface border border-surface-dim">
                    <span className="text-[10px] text-muted font-medium block">Receiving Hospital</span>
                    <strong className="text-navy block mt-0.5 truncate">
                      {activeIncident.destinationHospitalId
                        ? hospitals.find((h) => h.id === activeIncident.destinationHospitalId)?.shortName
                        : 'Calculating...'}
                    </strong>
                  </div>
                </div>

                {/* Corridor Live Telemetry (if simulation running) */}
                {simStatus === 'running' && (
                  <div className="p-3 rounded-xl bg-corridor/10 border border-corridor/30 text-xs space-y-2">
                    <div className="flex items-center justify-between text-corridor font-black">
                      <span>LIVE CORRIDOR TELEMETRY</span>
                      <span className="font-mono text-sm">{currentSpeedKmH} km/h</span>
                    </div>
                    <div className="flex items-center justify-between text-navy-light text-[11px]">
                      <span>Remaining Distance:</span>
                      <strong className="font-mono">{remainingDistanceKm} km</strong>
                    </div>
                    <div className="flex items-center justify-between text-navy-light text-[11px]">
                      <span>Est. Arrival in:</span>
                      <strong className="font-mono text-corridor font-bold">{estArrivalSeconds} seconds</strong>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-2 space-y-2">
                  {simStatus === 'idle' ? (
                    <button
                      onClick={startSimulation}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-corridor hover:bg-corridor-dark text-white font-extrabold text-xs shadow-md shadow-corridor/20 transition-all active:scale-95"
                    >
                      <Zap className="w-4 h-4 fill-current" />
                      <span>ACTIVATE GREEN CORRIDOR</span>
                    </button>
                  ) : simStatus === 'running' ? (
                    <button
                      onClick={resetSimulation}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-surface-alt hover:bg-surface-dim text-navy border border-surface-dim font-bold text-xs"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Reset Corridor</span>
                    </button>
                  ) : (
                    <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-800 text-xs text-center font-bold">
                      ✓ Emergency Incident Successfully Resolved
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      onClick={() => onNavigate('routes')}
                      className="py-2 px-3 rounded-xl bg-surface-alt hover:bg-surface-dim text-navy font-bold text-center border border-surface-dim transition-colors"
                    >
                      Recalculate Route
                    </button>
                    <button
                      onClick={() => onNavigate('fleet')}
                      className="py-2 px-3 rounded-xl bg-surface-alt hover:bg-surface-dim text-navy font-bold text-center border border-surface-dim transition-colors"
                    >
                      Assign Ambulance
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <button
                      onClick={() => onNavigate('hospitals')}
                      className="py-2 px-3 rounded-xl bg-surface-alt hover:bg-surface-dim text-navy font-bold text-center border border-surface-dim transition-colors"
                    >
                      Change Hospital
                    </button>
                    <button
                      onClick={() => resolveIncident()}
                      className="py-2 px-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-800 font-extrabold text-center border border-emerald-500/40 transition-colors"
                    >
                      Mark Resolved
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-coral/10 border border-coral/20 text-coral flex items-center justify-center">
                  <ShieldAlert className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-extrabold text-navy text-base">No Critical Emergency Active</h3>
                  <p className="text-xs text-muted mt-1 max-w-xs">
                    The corridor decision engine is standing by. Create a new emergency incident or launch the live Solapur demonstration scenario.
                  </p>
                </div>
                <div className="w-full space-y-2 pt-2">
                  <button
                    onClick={startLiveDemonstration}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-coral hover:bg-coral-dark text-white font-extrabold text-xs shadow-md shadow-coral/20 transition-all active:scale-95"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>LAUNCH SOLAPUR DEMO SCENARIO</span>
                  </button>
                  <button
                    onClick={() => onNavigate('create')}
                    className="w-full py-2.5 rounded-xl bg-surface-alt hover:bg-surface-dim text-navy border border-surface-dim font-bold text-xs"
                  >
                    Create Manual Emergency
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

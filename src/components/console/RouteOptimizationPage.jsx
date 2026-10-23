// Route Optimization & Comparison Engine (Section 8 of Specification)
// Multi-route evaluation, scoring breakdown, alternative selector

import React from 'react';
import { useAECC } from '../../context/AECCContext';
import { Route, CheckCircle2, Clock, MapPin, AlertTriangle, Radio, ShieldCheck, Zap } from 'lucide-react';

export default function RouteOptimizationPage({ onNavigate }) {
  const { availableRoutes, selectedRoute, selectRoute, activeIncident } = useAECC();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-navy flex items-center gap-2">
            <Route className="w-5 h-5 text-corridor" />
            <span>Intelligent Route Optimization & Comparison</span>
          </h2>
          <p className="text-xs text-muted mt-1">
            Deterministic multi-parameter route scoring comparing road distance, estimated transit time, traffic density and traffic signals.
          </p>
        </div>
        {activeIncident && (
          <span className="text-xs font-mono font-bold text-coral px-3 py-1 rounded-lg bg-coral/15 border border-coral/30">
            INCIDENT: {activeIncident.id}
          </span>
        )}
      </div>

      {/* Routes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {availableRoutes.map((route, idx) => {
          const isSelected = selectedRoute?.id === route.id;
          return (
            <div
              key={route.id}
              className={`p-5 rounded-3xl bg-white border transition-all flex flex-col justify-between shadow-xs ${
                isSelected
                  ? 'border-corridor shadow-md shadow-corridor/15 ring-2 ring-corridor/30'
                  : 'border-surface-dim hover:border-corridor/40'
              }`}
            >
              <div className="space-y-3">
                {/* Title & Badge */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-muted uppercase tracking-wider block">
                      Option {idx + 1}
                    </span>
                    <h3 className="font-extrabold text-navy text-base mt-0.5 leading-snug">{route.name}</h3>
                  </div>
                  {isSelected && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-corridor text-white text-[10px] font-bold">
                      <CheckCircle2 className="w-3 h-3" />
                      ACTIVE
                    </span>
                  )}
                </div>

                {/* Core Metrics */}
                <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-surface border border-surface-dim text-xs">
                  <div>
                    <span className="text-[10px] text-muted block font-medium">Estimated Travel Time</span>
                    <strong className="text-navy text-sm font-black flex items-center gap-1 mt-0.5">
                      <Clock className="w-3.5 h-3.5 text-teal" />
                      {route.durationMinutes} mins
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted block font-medium">Road Distance</span>
                    <strong className="text-navy text-sm font-black flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-coral" />
                      {route.distanceKm} km
                    </strong>
                  </div>
                </div>

                {/* Traffic & Signal Penalties */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-navy-light font-medium">
                    <span className="text-muted">Traffic Congestion:</span>
                    <span
                      className={`font-bold ${
                        route.congestionLevel === 'Low'
                          ? 'text-corridor'
                          : route.congestionLevel === 'Moderate'
                          ? 'text-amber-700'
                          : 'text-coral'
                      }`}
                    >
                      {route.congestionLevel}
                    </span>
                  </div>
                  <div className="flex justify-between text-navy-light font-medium">
                    <span className="text-muted">Signals Encountered:</span>
                    <span className="font-mono font-bold text-navy">{route.signalCount} smart nodes</span>
                  </div>
                  <div className="flex justify-between text-navy-light font-medium">
                    <span className="text-muted">Est. Time Saved:</span>
                    <span className="font-mono font-bold text-corridor">~{route.estTimeSavedMinutes} mins</span>
                  </div>
                </div>

                {/* Transparent Score Breakdown */}
                <div className="p-3 rounded-xl bg-surface border border-surface-dim space-y-1 text-[11px]">
                  <div className="flex justify-between font-bold text-navy">
                    <span>Optimization Score:</span>
                    <span className="font-mono text-corridor text-xs font-black">{route.score} (Lower is better)</span>
                  </div>
                  {route.scoreBreakdown && (
                    <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10px] text-muted pt-1 font-mono">
                      <span>Time: {route.scoreBreakdown.timeScore}</span>
                      <span>Dist: {route.scoreBreakdown.distScore}</span>
                      <span>Congest: {route.scoreBreakdown.congestionScore}</span>
                      <span>Signals: {route.scoreBreakdown.signalScore}</span>
                    </div>
                  )}
                </div>

                {/* Restrictions */}
                <div className="text-[11px] text-muted">
                  <span className="font-bold text-navy">Restrictions: </span>
                  {route.restrictions}
                </div>
              </div>

              {/* Selection Button */}
              <div className="pt-4">
                {isSelected ? (
                  <button
                    onClick={() => onNavigate('corridor')}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-corridor hover:bg-corridor-dark text-white font-extrabold text-xs shadow-md shadow-corridor/20 transition-all"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Proceed to Corridor Control →</span>
                  </button>
                ) : (
                  <button
                    onClick={() => selectRoute(route.id)}
                    className="w-full py-2.5 rounded-xl bg-surface-alt hover:bg-surface-dim text-navy font-bold text-xs border border-surface-dim transition-colors"
                  >
                    Select This Route
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Transparent Explanation Box */}
      <div className="p-4 rounded-2xl bg-white border border-surface-dim text-xs text-navy-light space-y-1 leading-relaxed shadow-xs">
        <h4 className="font-extrabold text-navy text-sm">AECC Neural Route Recommendation Logic:</h4>
        <p className="text-muted">
          Route 1 achieves the lowest mathematical penalty score (
          <code className="text-corridor font-mono font-bold">{selectedRoute?.score || '3.2'}</code>) by prioritizing
          coordinated smart intersections with automated virtual corridor overrides over congested municipal bypasses. This maximizes uninterrupted emergency velocity while avoiding road closures.
        </p>
      </div>
    </div>
  );
}

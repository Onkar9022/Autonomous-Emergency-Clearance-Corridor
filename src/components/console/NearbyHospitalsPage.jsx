// Nearby Hospitals Discovery Engine (Section 7 of Specification)
// Multi-criteria ranking, capabilities inspection, destination selection

import React from 'react';
import { useAECC } from '../../context/AECCContext';
import {
  Building2,
  Clock,
  MapPin,
  CheckCircle2,
  HeartPulse,
  Flame,
  ShieldCheck,
  Phone,
  BedDouble,
  ArrowRight,
} from 'lucide-react';

export default function NearbyHospitalsPage({ onNavigate }) {
  const { hospitals, rankedHospitals, activeIncident, selectHospital } = useAECC();

  const displayList = rankedHospitals.length > 0 ? rankedHospitals : hospitals;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-navy flex items-center gap-2">
            <Building2 className="w-5 h-5 text-sky" />
            <span>Nearby Hospital Discovery & Multi-Criteria Ranking</span>
          </h2>
          <p className="text-xs text-muted mt-1">
            Autonomous evaluation of clinical capabilities, travel duration, road distance and verified ICU readiness.
          </p>
        </div>
        {activeIncident && (
          <span className="text-xs font-mono font-bold text-teal px-3 py-1 rounded-lg bg-surface-alt border border-surface-dim">
            INCIDENT TARGET: {activeIncident.location.address}
          </span>
        )}
      </div>

      {/* Hospital Cards List */}
      <div className="space-y-4">
        {displayList.map((hosp, idx) => {
          const isSelected = activeIncident?.destinationHospitalId === hosp.id;
          const isTopRanked = idx === 0 && rankedHospitals.length > 0;

          return (
            <div
              key={hosp.id}
              className={`p-5 rounded-3xl bg-white border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs ${
                isSelected
                  ? 'border-sky shadow-md shadow-sky/15 ring-2 ring-sky/30'
                  : 'border-surface-dim hover:border-sky/40'
              }`}
            >
              <div className="space-y-2 max-w-2xl">
                {/* Header & Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-surface-alt text-navy">
                    RANK #{idx + 1}
                  </span>
                  <h3 className="text-base font-black text-navy">{hosp.name}</h3>
                  {isTopRanked && (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-800 border border-emerald-500/30 text-[10px] font-bold">
                      RECOMMENDED DESTINATION
                    </span>
                  )}
                  {isSelected && (
                    <span className="px-2.5 py-0.5 rounded-full bg-sky text-white text-[10px] font-bold">
                      SELECTED
                    </span>
                  )}
                </div>

                <p className="text-xs text-muted">{hosp.address}</p>

                {/* Capability Badges */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="px-2.5 py-1 rounded-lg bg-surface border border-surface-dim text-[11px] font-bold text-navy">
                    {hosp.traumaLevel}
                  </span>
                  {hosp.hasICU && (
                    <span className="px-2.5 py-1 rounded-lg bg-teal/10 text-teal border border-teal/20 text-[11px] font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      24/7 ICU Ready
                    </span>
                  )}
                  {hosp.hasCardiac && (
                    <span className="px-2.5 py-1 rounded-lg bg-coral/10 text-coral border border-coral/20 text-[11px] font-bold flex items-center gap-1">
                      <HeartPulse className="w-3 h-3" />
                      Cardiac Cath Lab
                    </span>
                  )}
                  {hosp.hasBurnUnit && (
                    <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-800 border border-amber-500/20 text-[11px] font-bold flex items-center gap-1">
                      <Flame className="w-3 h-3" />
                      Burn Unit
                    </span>
                  )}
                  <span className="px-2.5 py-1 rounded-lg bg-surface border border-surface-dim text-[11px] text-muted flex items-center gap-1.5">
                    <BedDouble className="w-3.5 h-3.5 text-navy" />
                    <span>Bed Capacity:</span>
                    {hosp.availableBedsSimulated ? (
                      <>
                        <strong className="text-navy font-mono">{hosp.availableBedsSimulated} available</strong>
                        <span className="text-[10px] text-amber-700 font-mono">(Simulated Telemetry)</span>
                      </>
                    ) : (
                      <span className="text-muted italic font-mono font-medium">Capacity Unknown</span>
                    )}
                  </span>
                </div>

                {/* Recommendation Rationale */}
                {hosp.recommendationReason && (
                  <div className="text-[11px] text-corridor font-bold">
                    Reason: {hosp.recommendationReason}
                  </div>
                )}

                <div className="text-[10px] text-muted font-mono">
                  Source: {hosp.source} • Verified: {hosp.lastVerified}
                </div>
              </div>

              {/* Transit & Selection Actions */}
              <div className="flex flex-col sm:flex-row md:flex-col items-end gap-3 shrink-0 w-full md:w-auto pt-2 md:pt-0">
                <div className="text-right">
                  <div className="text-xl font-black text-navy flex items-center gap-1 justify-end">
                    <Clock className="w-4 h-4 text-teal" />
                    <span>~{hosp.estimatedTravelMinutes || 8} mins</span>
                  </div>
                  <div className="text-xs text-muted">
                    Road Distance: <strong className="text-navy">{hosp.distanceKm || 3.4} km</strong>
                  </div>
                </div>

                <button
                  onClick={() => selectHospital(hosp.id)}
                  disabled={isSelected}
                  className={`w-full md:w-auto px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
                    isSelected
                      ? 'bg-surface-alt text-muted border border-surface-dim cursor-default'
                      : 'bg-sky hover:bg-sky/90 text-white shadow-md shadow-sky/20 active:scale-95'
                  }`}
                >
                  {isSelected ? 'Current Destination' : 'Select Destination'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

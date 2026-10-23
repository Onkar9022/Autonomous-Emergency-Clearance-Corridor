// Ambulance Fleet Management Dashboard (Section 14 of Specification)
// Telemetry tracking, vehicle equipment, driver details, availability status

import React from 'react';
import { useAECC } from '../../context/AECCContext';
import {
  Ambulance,
  BatteryCharging,
  Fuel,
  Radio,
  User,
  Phone,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export default function AmbulanceFleetPage({ onNavigate }) {
  const { ambulances, activeIncident, assignAmbulance } = useAECC();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-navy flex items-center gap-2">
            <Ambulance className="w-5 h-5 text-coral" />
            <span>Ambulance Telematics & Fleet Management</span>
          </h2>
          <p className="text-xs text-muted mt-1">
            Real-time GPS coordinates, onboard life-support equipment, and municipal dispatch readiness.
          </p>
        </div>
      </div>

      {/* Fleet Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {ambulances.map((amb) => {
          const isAssigned = activeIncident?.assignedAmbulanceId === amb.id;
          const isBusy = amb.status !== 'Available';

          return (
            <div
              key={amb.id}
              className={`p-5 rounded-3xl bg-white border transition-all space-y-4 shadow-xs ${
                isAssigned
                  ? 'border-coral shadow-md shadow-coral/15 ring-2 ring-coral/30'
                  : 'border-surface-dim hover:border-coral/40'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-coral bg-coral/10 px-2.5 py-0.5 rounded border border-coral/20">
                      {amb.id}
                    </span>
                    <h3 className="font-extrabold text-navy text-base">{amb.callSign}</h3>
                  </div>
                  <p className="text-xs text-muted mt-1">{amb.type}</p>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    isBusy
                      ? 'bg-amber-500/15 text-amber-800 border border-amber-500/30'
                      : 'bg-emerald-500/15 text-emerald-800 border border-emerald-500/30'
                  }`}
                >
                  {amb.status}
                </span>
              </div>

              {/* Specs & Driver Info */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-surface border border-surface-dim">
                  <span className="text-[10px] text-muted block font-medium">Base Depot</span>
                  <strong className="text-navy block mt-0.5 truncate font-semibold">{amb.baseStation}</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-surface border border-surface-dim">
                  <span className="text-[10px] text-muted block font-medium">Lead Paramedic</span>
                  <strong className="text-navy block mt-0.5 truncate font-semibold">{amb.driver}</strong>
                </div>
              </div>

              {/* Telemetry Status Bar */}
              <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-surface border border-surface-dim">
                <div className="flex items-center gap-2 text-navy-light font-medium">
                  <BatteryCharging className="w-4 h-4 text-corridor" />
                  <span>Battery / Fuel:</span>
                  <strong className="font-mono text-navy font-bold">{amb.fuelBatteryPercent}%</strong>
                </div>
                <div className="text-muted font-mono text-[11px]">
                  Coords: {amb.location.lat.toFixed(4)}°N, {amb.location.lng.toFixed(4)}°E
                </div>
              </div>

              {/* Onboard Life-Support Equipment */}
              <div>
                <span className="text-[10px] font-bold uppercase text-muted tracking-wider block mb-1.5">
                  Certified Clinical Equipment
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {amb.equipment.map((eq, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-0.5 rounded-md bg-surface text-[10px] text-navy-light font-medium border border-surface-dim"
                    >
                      {eq}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                {isAssigned ? (
                  <div className="p-2.5 rounded-xl bg-coral/15 border border-coral/30 text-coral text-xs text-center font-bold">
                    ✓ Currently Assigned to Active Incident
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      if (activeIncident) assignAmbulance(amb.id);
                    }}
                    disabled={!activeIncident || isBusy}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all ${
                      !activeIncident
                        ? 'bg-surface-alt text-muted cursor-not-allowed border border-surface-dim'
                        : isBusy
                        ? 'bg-surface-alt text-muted cursor-not-allowed border border-surface-dim'
                        : 'bg-corridor hover:bg-corridor-dark text-white shadow-md shadow-corridor/20 active:scale-95'
                    }`}
                  >
                    {!activeIncident
                      ? 'No Active Emergency to Assign'
                      : isBusy
                      ? 'Vehicle Currently En Route'
                      : 'Assign to Current Incident'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

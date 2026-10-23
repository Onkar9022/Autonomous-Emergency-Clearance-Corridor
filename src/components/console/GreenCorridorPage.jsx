// Autonomous Green Corridor Control Module (Section 10 of Specification)
// Signature AECC Feature — Coordinated Signal Sequence & Arrival Countdowns

import React from 'react';
import { useAECC } from '../../context/AECCContext';
import {
  Zap,
  Play,
  Pause,
  RotateCcw,
  Radio,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  ArrowRight,
  Flame,
} from 'lucide-react';

export default function GreenCorridorPage({ onNavigate }) {
  const {
    corridorPlan,
    selectedRoute,
    activeIncident,
    simStatus,
    startSimulation,
    pauseSimulation,
    resumeSimulation,
    resetSimulation,
    currentSpeedKmH,
    remainingDistanceKm,
    estArrivalSeconds,
    simProgress,
  } = useAECC();

  const signals = corridorPlan?.signals || [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-navy flex items-center gap-2">
            <Zap className="w-5 h-5 text-corridor fill-current" />
            <span>Autonomous Green Corridor Control Center</span>
          </h2>
          <p className="text-xs text-muted mt-1">
            Real-time NTCIP-compliant virtual signal preemption, intersection holding and green-wave flushing along ambulance trajectory.
          </p>
        </div>

        {/* Master Control Buttons */}
        <div className="flex items-center gap-2">
          {simStatus === 'idle' && (
            <button
              onClick={startSimulation}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-corridor hover:bg-corridor-dark text-white font-extrabold text-xs shadow-md shadow-corridor/20 transition-all active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>ENGAGE GREEN CORRIDOR</span>
            </button>
          )}
          {simStatus === 'running' && (
            <button
              onClick={pauseSimulation}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs"
            >
              <Pause className="w-4 h-4" />
              <span>Pause Corridor</span>
            </button>
          )}
          {simStatus === 'paused' && (
            <button
              onClick={resumeSimulation}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Resume Corridor</span>
            </button>
          )}
          {simStatus !== 'idle' && (
            <button
              onClick={resetSimulation}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-surface-alt hover:bg-surface-dim text-navy border border-surface-dim text-xs font-bold transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Corridor Status HUD Banner */}
      <div className="p-5 rounded-3xl bg-white border border-surface-dim shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
              simStatus === 'running'
                ? 'bg-corridor text-white shadow-md shadow-corridor/30 animate-pulse'
                : 'bg-surface-alt text-muted'
            }`}
          >
            <Zap className="w-6 h-6 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold text-muted uppercase tracking-wider">
                Corridor Lifecycle State
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  simStatus === 'running'
                    ? 'bg-corridor/15 text-corridor border border-corridor/30'
                    : 'bg-surface-alt text-navy'
                }`}
              >
                {simStatus === 'running'
                  ? 'ACTIVE DYNAMIC PASSAGE'
                  : simStatus === 'completed'
                  ? 'CORRIDOR RELEASED'
                  : 'READY FOR DISPATCH'}
              </span>
            </div>
            <h3 className="text-base font-black text-navy mt-0.5">
              {corridorPlan?.id || 'COR-SOLAPUR-CENTRAL-01'}
            </h3>
          </div>
        </div>

        {/* Live Telemetry Tickers */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="px-3 py-1.5 rounded-xl bg-surface border border-surface-dim">
            <span className="text-[10px] text-muted block">Ambulance Velocity</span>
            <strong className="text-navy text-sm font-mono">{currentSpeedKmH} km/h</strong>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-surface border border-surface-dim">
            <span className="text-[10px] text-muted block">Distance to Trauma</span>
            <strong className="text-navy text-sm font-mono">{remainingDistanceKm} km</strong>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-surface border border-surface-dim">
            <span className="text-[10px] text-muted block">Corridor Countdown</span>
            <strong className="text-corridor text-sm font-mono font-bold">{estArrivalSeconds}s</strong>
          </div>
        </div>
      </div>

      {/* Signal Coordination Sequence Timeline */}
      <div className="p-6 rounded-3xl bg-white border border-surface-dim shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-navy uppercase tracking-wider flex items-center gap-2">
            <Radio className="w-4 h-4 text-teal" />
            <span>Coordinated Signal Sequence ({signals.length} Intersections)</span>
          </h3>
          <span className="text-[11px] text-muted font-mono">NTCIP Priority Protocol</span>
        </div>

        <div className="space-y-3">
          {signals.map((sig, idx) => {
            const isPassed = simProgress >= sig.progressPct + 0.08;
            const isCurrent = simProgress >= sig.progressPct - 0.08 && !isPassed;

            return (
              <div
                key={sig.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isCurrent
                    ? 'bg-corridor/10 border-corridor shadow-sm shadow-corridor/15 ring-1 ring-corridor/40'
                    : isPassed
                    ? 'bg-surface/50 border-surface-dim opacity-70'
                    : 'bg-surface border-surface-dim'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-xl bg-surface-alt border border-surface-dim text-navy text-xs font-mono font-bold flex items-center justify-center">
                    0{idx + 1}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-navy">{sig.intersectionName}</span>
                      <span className="text-[10px] font-mono text-muted">({sig.id})</span>
                    </div>
                    <div className="text-[11px] text-muted flex items-center gap-2 mt-0.5">
                      <span>Mode: {sig.operatingMode}</span>
                      <span>•</span>
                      <span>Proto: {sig.hardwareProto}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <div className="text-right">
                    <span className="text-[10px] text-muted block font-mono">Estimated Intercept</span>
                    <strong className="text-xs font-mono text-navy">
                      {Math.max(0, sig.estEtaSeconds - Math.round(simProgress * (selectedRoute?.durationMinutes || 8) * 60))}s
                    </strong>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-xl text-xs font-bold ${
                      isCurrent
                        ? 'bg-corridor text-white animate-pulse'
                        : isPassed
                        ? 'bg-surface-alt text-muted border border-surface-dim'
                        : simStatus === 'running'
                        ? 'bg-amber-500/15 text-amber-800 border border-amber-500/30'
                        : 'bg-surface text-muted border border-surface-dim'
                    }`}
                  >
                    {isCurrent
                      ? 'GREEN WAVE ACTIVE'
                      : isPassed
                      ? 'PASSED / RELEASED'
                      : simStatus === 'running'
                      ? 'HOLDING FEEDER RED'
                      : 'PENDING ACTIVATION'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Safety & Protocol Interlocks (Section 10 Requirement) */}
      <div className="p-4 rounded-2xl bg-white border border-surface-dim shadow-xs text-xs text-muted space-y-1.5 leading-relaxed">
        <div className="flex items-center gap-2 text-amber-700 font-bold">
          <ShieldCheck className="w-4 h-4 text-amber-600" />
          <span>Safety Interlock & Virtual Simulation Disclaimer</span>
        </div>
        <p>
          All traffic signal preemptions displayed above operate within the AECC Demonstration Sandbox. In real-world municipal deployments, NTCIP 1202 standards require pedestrian clearance intervals, conflict monitor unit (CMU) interlocking and authenticated mutual TLS 1.3 cryptographic handshakes prior to physical signal preemption.
        </p>
      </div>
    </div>
  );
}

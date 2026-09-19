import { useState } from 'react';
import { ScrollFade } from '../hooks/useScrollAnimation';
import { Zap, RotateCcw } from 'lucide-react';

const simPhases = [
  {
    name: 'PHASE 1 / 4: CORRIDOR ACTIVATED', progress: '25%',
    amb: ['• Switch: ACTIVE (Driver Engagement)', '• Speed: 42 km/h', '• Token: AES-256 Validated'],
    rb: ['• Feeder Lights: AMBER HOLD', '• Dynamic Signs: YIELD CORRIDOR', '• Buffer: 1,500m Synchronized'],
    hosp: ['• Notification: PENDING', '• Trauma Bay: Pre-Alert Dispatched', '• Gate: IDLE'],
    btn: 'ADVANCE TO PHASE 2 (APPROACH R1)',
  },
  {
    name: 'PHASE 2 / 4: ROUNDABOUT R1 FLUSHED', progress: '50%',
    amb: ['• Speed: 62 km/h (Unimpeded)', '• RTK GNSS: Accuracy ±0.04m', '• Latency: 1.1ms'],
    rb: ['• Feeder Lights: SOLID RED', '• Circulatory Ring: FLUSHED', '• Vehicle Transit: PASSING'],
    hosp: ['• Notification: LIVE STREAM', '• ETA: 05 MIN 12 SEC', '• Bay 02: Team Alpha Paged'],
    btn: 'ADVANCE TO PHASE 3 (HOSPITAL GATE)',
  },
  {
    name: 'PHASE 3 / 4: TRAUMA BAY GATE OPENED', progress: '75%',
    amb: ['• Proximity: 300m to Destination', '• Patient Heartrate: 118 BPM', '• Priority: Level 1'],
    rb: ['• Signal R1: RESTORED TO NORMAL', '• Signal R2: RESTORED TO NORMAL', '• Traffic Equilibrium: Balanced'],
    hosp: ['• RFID Barrier: ELEVATED', '• Trauma Surgeon: Standing by in Bay', '• Reception Ready: YES'],
    btn: 'COMPLETE SCENARIO (RESET)',
  },
  {
    name: 'PHASE 4 / 4: MISSION COMPLETE', progress: '100%',
    amb: ['• Patient Transferred Successfully', '• Transit Reduction: 48.2%', '• Corridor: SECURE RESTORE'],
    rb: ['• All Intersections: NOMINAL', '• Heartbeat: 100% OK', '• Audit Log: ARCHIVED'],
    hosp: ['• Bay 02: Procedure Commenced', '• Clearance Time: 08m 14s', '• Status: RECEPTIVE COMPLETE'],
    btn: 'RE-RUN EMERGENCY SCENARIO',
  },
];

export default function Simulation() {
  const [phase, setPhase] = useState(0);
  const [started, setStarted] = useState(false);
  const current = simPhases[phase];

  const handleClick = () => {
    if (!started) {
      setStarted(true);
      setPhase(0);
    } else {
      setPhase(prev => (prev >= 3 ? 0 : prev + 1));
      if (phase >= 3) setStarted(false);
    }
  };

  return (
    <section id="simulation" className="w-full px-4 md:px-8 py-16 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto">
        <ScrollFade>
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-[11px] font-bold text-corridor uppercase tracking-wider">Operational Testbed</span>
            <h2 className="text-[28px] md:text-[32px] font-bold text-navy mt-1">
              Simulate the Emergency Corridor
            </h2>
            <p className="text-[14px] text-muted mt-3">
              Run an automated corridor activation test to inspect telemetry flow, signal phase locking, and hospital reception notifications.
            </p>
          </div>
        </ScrollFade>

        <ScrollFade delay={0.1}>
          <div className="bg-ivory rounded-2xl p-4 md:p-8 shadow-md">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <span className="text-[18px] font-bold text-navy block">Test Scenario: Critical Cardiac Transit (Priority 1)</span>
                <span className="text-[12px] text-muted">Vehicle: AECC-EMS-402 | Destination: Metro Health Trauma Unit</span>
              </div>
              <button
                onClick={handleClick}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-corridor text-white text-[14px] font-bold shadow-md hover:bg-corridor-dark transition-all active:translate-y-px pulse-glow"
              >
                <Zap className="w-5 h-5" />
                <span>{started ? current.btn : 'START EMERGENCY SCENARIO'}</span>
              </button>
            </div>

            {/* Progress */}
            <div className="w-full bg-white rounded-xl p-4 shadow-sm mb-8">
              <div className="flex items-center justify-between text-[11px] font-bold mb-2">
                <span className="text-navy">SCENARIO PROGRESSION</span>
                <span className="text-corridor">{started ? current.name : 'PHASE 1 / 4: READY'}</span>
              </div>
              <div className="w-full bg-surface-alt h-3 rounded-full overflow-hidden">
                <div
                  className="bg-corridor h-full rounded-full transition-all duration-500"
                  style={{ width: started ? current.progress : '0%' }}
                />
              </div>
            </div>

            {/* Telemetry Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-white rounded-xl shadow-sm">
                <span className="text-[11px] font-bold text-muted uppercase block mb-2">Ambulance Telemetry</span>
                <div className="space-y-1 text-[12px]">
                  {(started ? current.amb : ['• Switch: STANDBY', '• Speed: 0 km/h', '• V2X Ping: 1.1ms']).map((t, i) => (
                    <div key={i} className="text-navy font-medium">{t}</div>
                  ))}
                </div>
              </div>
              <div className="p-4 bg-white rounded-xl shadow-sm">
                <span className="text-[11px] font-bold text-muted uppercase block mb-2">Downstream Intersection R1</span>
                <div className="space-y-1 text-[12px]">
                  {(started ? current.rb : ['• Normal Split: ACTIVE', '• mmWave Density: 32 veh/min', '• Feeder Gate: PASS']).map((t, i) => (
                    <div key={i} className="text-navy font-medium">{t}</div>
                  ))}
                </div>
              </div>
              <div className="p-4 bg-white rounded-xl shadow-sm">
                <span className="text-[11px] font-bold text-muted uppercase block mb-2">Receiving Trauma Hub</span>
                <div className="space-y-1 text-[12px]">
                  {(started ? current.hosp : ['• Inbound Alert: IDLE', '• Trauma Bay: 02 (Standby)', '• Barrier Gate: LOCKED']).map((t, i) => (
                    <div key={i} className="text-navy font-medium">{t}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </ScrollFade>
      </div>
    </section>
  );
}

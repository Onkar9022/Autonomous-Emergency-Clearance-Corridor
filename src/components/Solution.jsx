import { ScrollFade } from '../hooks/useScrollAnimation';

const capabilities = [
  { num: '01', name: 'Detect', desc: 'Emergency vehicle detected via V2X beacon' },
  { num: '02', name: 'Authenticate', desc: 'Vehicle identity verified with zero-trust TLS' },
  { num: '03', name: 'Track', desc: 'Real-time RTK-GPS location stream initiated' },
  { num: '04', name: 'Analyze', desc: 'Live traffic conditions analyzed via mmWave' },
  { num: '05', name: 'Predict', desc: 'Optimal corridor route evaluated by AI core' },
  { num: '06', name: 'Coordinate', desc: 'Downstream roundabouts pre-clear signals' },
  { num: '07', name: 'Notify', desc: 'Hospital receives ETA and trauma prep alert' },
  { num: '08', name: 'Restore', desc: 'Normal traffic flow restored within 3.5 seconds' },
];

const units = [
  { num: '01', label: 'Ambulance Unit', icon: 'emergency', color: 'coral', bg: 'bg-coral-light', desc: 'Continuous RTK-GPS streaming, biometric payload metadata, and V2X broadcast beacons.' },
  { num: '02', label: 'Roundabout Unit', icon: 'sync_alt', color: 'teal', bg: 'bg-surface-container', desc: 'Roadside radar sensing, dynamic LED lane control, and physical signal controller bypass.' },
  { num: '03', label: 'Hospital Unit', icon: 'local_hospital', color: 'sky', bg: 'bg-sky-light', desc: 'Sub-second live ETA streaming, surgical trauma prep synchronization, and automated gate clearance.' },
];

export default function Solution() {
  return (
    <section className="w-full px-4 md:px-8 py-16 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        <ScrollFade>
          <div className="text-center max-w-3xl mb-12">
            <span className="text-[11px] font-bold text-teal uppercase tracking-wider">Holistic Infrastructure</span>
            <h2 className="text-[28px] md:text-[32px] font-bold text-navy mt-1">
              One Connected Corridor. Three Intelligent Units.
            </h2>
            <p className="text-[14px] text-muted mt-3">
              Hardware and cloud synchronized across edge compute nodes to ensure deterministic green-wave pathways from patient pickup to the trauma bay.
            </p>
          </div>
        </ScrollFade>

        {/* Ecosystem Diagram */}
        <ScrollFade delay={0.1}>
          <div className="w-full bg-ivory rounded-2xl p-6 md:p-10 shadow-sm relative mb-12">
            {/* Central Intelligence */}
            <div className="mx-auto max-w-sm bg-white rounded-xl p-4 shadow-md text-center mb-12 relative">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-teal-light text-teal mb-2">
                <span className="material-symbols-outlined">hub</span>
              </div>
              <h4 className="text-[20px] font-bold text-navy">AECC Intelligence Core</h4>
              <p className="text-[12px] text-muted">Dynamic Route Arbitration &amp; Queue Management</p>
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-0.5 h-6 bg-teal" />
            </div>

            {/* 3 Units */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
              <div className="hidden md:block absolute top-1/2 left-[18%] right-[18%] h-1 bg-corridor -translate-y-1/2 z-0 opacity-40" />
              {units.map((unit, i) => (
                <ScrollFade key={unit.num} delay={0.1 + i * 0.1}>
                  <div className="bg-white rounded-xl p-4 shadow-sm z-10 relative flex flex-col items-center text-center">
                    <div className={`w-12 h-12 rounded-xl ${unit.bg} text-${unit.color} flex items-center justify-center mb-3 shadow-sm`}>
                      <span className="material-symbols-outlined">{unit.icon}</span>
                    </div>
                    <span className={`text-[11px] font-bold uppercase text-${unit.color}`}>Unit {unit.num}</span>
                    <h5 className="text-[20px] font-bold text-navy">{unit.label}</h5>
                    <p className="text-[12px] text-muted mt-1">{unit.desc}</p>
                  </div>
                </ScrollFade>
              ))}
            </div>

            {/* ── Capability Flow ── */}
            <ScrollFade delay={0.4}>
              <div className="mt-10">
                <span className="block text-center text-[11px] font-bold text-muted uppercase tracking-wider mb-4">How AECC Works</span>

                {/* Desktop: Horizontal pills with arrows (hidden on mobile) */}
                <div className="hidden md:flex flex-wrap items-center justify-center gap-2">
                  {capabilities.map((cap, i) => (
                    <span key={cap.num} className="flex items-center gap-2">
                      <span className="px-3 py-1.5 rounded-full bg-white shadow-sm text-[11px] font-bold text-navy tracking-wider whitespace-nowrap">
                        {cap.num}. {cap.name}
                      </span>
                      {i < capabilities.length - 1 && (
                        <span className="text-corridor text-[13px] font-bold">→</span>
                      )}
                    </span>
                  ))}
                </div>

                {/* Mobile: Vertical timeline (hidden on desktop) */}
                <div className="md:hidden relative pl-8">
                  {/* Vertical green line */}
                  <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-corridor/30" />

                  <div className="space-y-1">
                    {capabilities.map((cap, i) => (
                      <div key={cap.num} className="relative flex items-start gap-3 py-2">
                        {/* Dot on the line */}
                        <div className="absolute left-[-21px] top-3 w-2.5 h-2.5 rounded-full bg-corridor ring-2 ring-white shrink-0" />
                        {/* Content */}
                        <div className="bg-white rounded-lg px-3 py-2.5 shadow-sm flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold text-corridor">{cap.num}</span>
                            <span className="text-[14px] font-bold text-navy">{cap.name}</span>
                          </div>
                          <p className="text-[12px] text-muted mt-0.5">{cap.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollFade>
          </div>
        </ScrollFade>
      </div>
    </section>
  );
}

import { ScrollFade } from '../hooks/useScrollAnimation';

const phases = [
  { title: 'Phase 1: Dynamic Lane Holding', desc: 'Feeder lights switch to cautionary amber then red 45 seconds prior to vehicle entry, preventing vehicle bunching.' },
  { title: 'Phase 2: Ring Flushing', desc: 'Vehicles currently inside the roundabout exit unimpeded, leaving the central lane completely clear for high-speed transit.' },
  { title: 'Phase 3: Smooth Resumption', desc: 'Within 3.5 seconds of ambulance departure, signals resume equitable green times based on mmWave queue depths.' },
];

export default function RoundaboutSpotlight() {
  return (
    <section className="w-full px-4 md:px-8 py-16 md:py-20 bg-surface-alt">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {/* Left — Text */}
        <div className="lg:col-span-5">
          <ScrollFade>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white shadow-sm mb-3">
              <span className="w-2 h-2 rounded-full bg-teal" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-navy">Roadside Geometry Management</span>
            </div>
            <h2 className="text-[28px] md:text-[32px] font-bold text-navy tracking-tight mb-3">
              The Roadside Becomes Intelligent
            </h2>
            <p className="text-[16px] text-muted leading-relaxed mb-6">
              Roundabouts present complex circulatory dynamics where conventional sirens cause dangerous gridlock. AECC micro-holds incoming feeder lanes while gently purging the central circulatory carriageway.
            </p>
          </ScrollFade>

          <div className="space-y-3">
            {phases.map((phase, i) => (
              <ScrollFade key={i} delay={0.1 + i * 0.1}>
                <div className="p-4 bg-white rounded-xl shadow-sm">
                  <h4 className="text-[18px] font-bold text-navy">{phase.title}</h4>
                  <p className="text-[12px] text-muted mt-1">{phase.desc}</p>
                </div>
              </ScrollFade>
            ))}
          </div>
        </div>

        {/* Right — SVG Diagram */}
        <ScrollFade delay={0.2} className="lg:col-span-7">
          <div className="w-full bg-white rounded-2xl p-4 md:p-6 shadow-sm flex flex-col items-center">
            <span className="text-[11px] font-bold uppercase text-muted mb-4 tracking-wider">Top-Down Coordinated Roundabout Clearance</span>
            <svg className="w-full max-w-lg aspect-square" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* ── 4 Approach Roads ── */}
              {/* North approach */}
              <rect x="175" y="0" width="50" height="120" fill="#EAF0F4" />
              {/* South approach */}
              <rect x="175" y="280" width="50" height="120" fill="#EAF0F4" />
              {/* West approach */}
              <rect x="0" y="175" width="120" height="50" fill="#EAF0F4" />
              {/* East approach */}
              <rect x="280" y="175" width="120" height="50" fill="#EAF0F4" />

              {/* ── Circulatory Roadway (ring between r=60 and r=110) ── */}
              <circle cx="200" cy="200" r="110" fill="#EAF0F4" />
              <circle cx="200" cy="200" r="60" fill="#F5F7F2" />

              {/* ── Central Island (solid, clearly separated) ── */}
              <circle cx="200" cy="200" r="52" fill="#D4E4F7" stroke="#CBDCEE" strokeWidth="2" />
              <text x="200" y="196" textAnchor="middle" fill="#102A43" fontFamily="Manrope" fontSize="10" fontWeight="bold">AECC</text>
              <text x="200" y="210" textAnchor="middle" fill="#607080" fontFamily="Manrope" fontSize="8" fontWeight="600">EDGE NODE</text>

              {/* ── Held Feeder Lane Indicators (red bars on approach entries) ── */}
              {/* North approach - held */}
              <rect x="183" y="110" width="34" height="6" rx="3" fill="#F05A47" opacity="0.9" />
              {/* East approach - held */}
              <rect x="284" y="183" width="6" height="34" rx="3" fill="#F05A47" opacity="0.9" />
              {/* South approach - held */}
              <rect x="183" y="284" width="34" height="6" rx="3" fill="#F05A47" opacity="0.9" />

              {/* ── Civilian Vehicles (held at approaches) ── */}
              {/* North civilian */}
              <rect x="191" y="68" width="14" height="24" rx="3" fill="#74777E" />
              <rect x="191" y="40" width="14" height="22" rx="3" fill="#8A8E96" opacity="0.6" />
              {/* East civilian */}
              <rect x="330" y="191" width="24" height="14" rx="3" fill="#74777E" />
              <rect x="360" y="191" width="22" height="14" rx="3" fill="#8A8E96" opacity="0.6" />
              {/* South civilian */}
              <rect x="195" y="306" width="14" height="24" rx="3" fill="#74777E" />

              {/* ── Emergency Corridor (GREEN — follows the circulation lane OUTSIDE the island) ── */}
              {/* 
                Route: Enter from West approach → join circulatory ring → travel clockwise 
                around the OUTSIDE of the central island → exit via North approach
                
                The arc stays at radius ~85 (between island r=52 and outer ring r=110)
              */}

              {/* Corridor fill (wide translucent green) */}
              <path
                d="M 0 200 L 115 200 
                   A 85 85 0 0 1 200 115 
                   L 200 0"
                stroke="#22A06B"
                strokeLinecap="round"
                strokeWidth="28"
                opacity="0.25"
                fill="none"
              />

              {/* Corridor dashed line (center of the path) */}
              <path
                d="M 0 200 L 115 200 
                   A 85 85 0 0 1 200 115 
                   L 200 0"
                stroke="#22A06B"
                strokeDasharray="6 6"
                strokeLinecap="round"
                strokeWidth="5"
                fill="none"
              />

              {/* Direction arrow indicators on the corridor */}
              {/* Arrow on west approach */}
              <polygon points="90,194 102,200 90,206" fill="#22A06B" opacity="0.7" />
              {/* Arrow on the arc (approximately at 45° position) */}
              <g transform="translate(148, 148) rotate(-45)">
                <polygon points="-5,-6 7,0 -5,6" fill="#22A06B" opacity="0.7" />
              </g>
              {/* Arrow on north exit */}
              <polygon points="194,65 200,53 206,65" fill="#22A06B" opacity="0.7" />

              {/* ── Ambulance (on the west approach, entering) ── */}
              <g transform="translate(40, 186)">
                {/* Pulse ring */}
                <circle cx="18" cy="14" r="20" fill="#F05A47" opacity="0.15">
                  <animate attributeName="r" values="16;24;16" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.2;0.05;0.2" dur="2s" repeatCount="indefinite" />
                </circle>
                {/* Vehicle body */}
                <rect x="0" y="2" width="36" height="24" rx="5" fill="#F05A47" />
                {/* Cross */}
                <path d="M 18 7 L 18 21 M 11 14 L 25 14" stroke="#FFFFFF" strokeLinecap="round" strokeWidth="2.5" />
              </g>
            </svg>

            {/* Legend */}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-4">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-coral" />
                <span className="text-[12px] text-navy font-medium">Emergency Vehicle</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-corridor" />
                <span className="text-[12px] text-navy font-medium">Cleared Corridor</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-outline" />
                <span className="text-[12px] text-navy font-medium">Civilians Held</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-2 rounded-sm bg-coral opacity-80" />
                <span className="text-[12px] text-navy font-medium">Lane Barrier</span>
              </div>
            </div>
          </div>
        </ScrollFade>
      </div>
    </section>
  );
}

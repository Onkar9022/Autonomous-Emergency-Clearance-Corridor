import { ScrollFade } from '../hooks/useScrollAnimation';
import { Play, ArrowDown } from 'lucide-react';

export default function Hero() {
  return (
    <section id="hero" className="relative w-full px-4 md:px-8 pt-24 pb-16 md:pt-28 md:pb-20 overflow-hidden bg-ivory">
      {/* City Grid Background */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="city-grid" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#CBDCEE" strokeDasharray="2 4" strokeWidth="0.75" />
              <circle cx="80" cy="0" r="1.5" fill="#B0C9E8" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#city-grid)" />
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {/* Left Column */}
        <div className="lg:col-span-6 flex flex-col items-start">
          <ScrollFade>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-alt/70 shadow-sm mb-5">
              <span className="w-2 h-2 rounded-full bg-teal animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-navy">Intelligent Emergency Mobility</span>
            </div>
          </ScrollFade>

          <ScrollFade delay={0.1}>
            <h1 className="text-[36px] md:text-[44px] lg:text-[48px] font-bold text-navy tracking-tight leading-[1.1] mb-3">
              Autonomous Emergency Clearance Corridor{' '}
              <span className="text-corridor">AECC</span>
            </h1>
          </ScrollFade>

          <ScrollFade delay={0.15}>
            <p className="text-[18px] md:text-[20px] font-semibold text-corridor-dark mb-4">
              Every Second Matters. Every Life Matters.
            </p>
          </ScrollFade>

          <ScrollFade delay={0.2}>
            <p className="text-[15px] md:text-[16px] text-muted leading-relaxed max-w-xl mb-8">
              Connecting emergency responders, municipal smart roundabouts, and receiving trauma hospitals into a singular, synchronized, route-aware mobility grid.
            </p>
          </ScrollFade>

          <ScrollFade delay={0.25}>
            <div className="flex flex-wrap items-center gap-3 mb-10">
              <a href="#console/dashboard" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-corridor text-white text-[14px] font-bold shadow-md hover:bg-corridor-dark transition-all active:translate-y-px">
                <span>Operations Console</span>
                <Play className="w-4 h-4 fill-current" />
              </a>
              <a href="#three-units" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-navy text-[14px] font-bold shadow-sm hover:bg-surface-alt transition-all active:translate-y-px">
                <span>Explore 3 Units</span>
                <ArrowDown className="w-4 h-4" />
              </a>
            </div>
          </ScrollFade>

          {/* Live Stats */}
          <ScrollFade delay={0.3}>
            <div className="w-full grid grid-cols-3 gap-3">
              <div className="p-3 md:p-4 rounded-xl bg-white shadow-sm flex flex-col">
                <span className="text-[18px] md:text-[20px] font-bold text-navy">1.2ms</span>
                <span className="text-[11px] font-bold text-muted tracking-wide">Edge Latency</span>
              </div>
              <div className="p-3 md:p-4 rounded-xl bg-white shadow-sm flex flex-col">
                <span className="text-[18px] md:text-[20px] font-bold text-corridor">-48.2%</span>
                <span className="text-[11px] font-bold text-muted tracking-wide">Transit Delay</span>
              </div>
              <div className="p-3 md:p-4 rounded-xl bg-white shadow-sm flex flex-col">
                <span className="text-[18px] md:text-[20px] font-bold text-navy">99.8%</span>
                <span className="text-[11px] font-bold text-muted tracking-wide">Preemption Gate</span>
              </div>
            </div>
          </ScrollFade>
        </div>

        {/* Right Column — Map Visualization */}
        <ScrollFade delay={0.2} className="lg:col-span-6">
          <div className="relative w-full aspect-[4/3] rounded-2xl bg-white shadow-lg p-3 md:p-4 overflow-hidden flex items-center justify-center">
            <svg className="w-full h-full" viewBox="0 0 600 450" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Road Base */}
              <path d="M 40 180 C 180 180 200 120 300 120 C 400 120 420 300 560 300" stroke="#EAF0F4" strokeLinecap="round" strokeWidth="48" />
              <path d="M 300 20 L 300 420" stroke="#EAF0F4" strokeLinecap="round" strokeWidth="32" />
              <path d="M 80 400 C 180 340 380 420 540 100" stroke="#EAF0F4" strokeLinecap="round" strokeWidth="28" />

              {/* City Blocks */}
              <rect x="70" y="80" width="80" height="60" rx="8" fill="#F5F7F2" />
              <rect x="200" y="30" width="60" height="50" rx="8" fill="#F5F7F2" />
              <rect x="340" y="40" width="70" height="50" rx="8" fill="#F5F7F2" />
              <rect x="180" y="240" width="90" height="70" rx="8" fill="#F5F7F2" />
              <rect x="360" y="190" width="85" height="80" rx="8" fill="#F5F7F2" />
              <rect x="460" y="160" width="90" height="60" rx="8" fill="#F5F7F2" />

              {/* Green Corridor */}
              <path d="M 80 180 C 180 180 200 120 300 120 C 400 120 420 300 520 300" stroke="#22A06B" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12" opacity="0.95" />
              <path d="M 80 180 C 180 180 200 120 300 120 C 400 120 420 300 520 300" stroke="#86F9BC" strokeDasharray="6 8" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />

              {/* R1 */}
              <circle cx="190" cy="165" r="22" fill="#FFFFFF" stroke="#159A9C" strokeWidth="4" />
              <circle cx="190" cy="165" r="10" fill="#159A9C" />
              <text x="190" y="169" textAnchor="middle" fill="#FFFFFF" fontFamily="Manrope" fontSize="9" fontWeight="bold">R1</text>

              {/* R2 */}
              <circle cx="300" cy="120" r="24" fill="#FFFFFF" stroke="#159A9C" strokeWidth="4" />
              <circle cx="300" cy="120" r="11" fill="#159A9C" />
              <text x="300" y="124" textAnchor="middle" fill="#FFFFFF" fontFamily="Manrope" fontSize="9" fontWeight="bold">R2</text>

              {/* R3 */}
              <circle cx="415" cy="220" r="22" fill="#FFFFFF" stroke="#159A9C" strokeWidth="4" />
              <circle cx="415" cy="220" r="10" fill="#159A9C" />
              <text x="415" y="224" textAnchor="middle" fill="#FFFFFF" fontFamily="Manrope" fontSize="9" fontWeight="bold">R3</text>

              {/* Hospital */}
              <g transform="translate(500, 275)">
                <circle cx="25" cy="25" r="26" fill="#FFFFFF" stroke="#4A90E2" strokeWidth="4" />
                <rect x="14" y="14" width="22" height="22" rx="4" fill="#4A90E2" />
                <path d="M 25 18 L 25 32 M 18 25 L 32 25" stroke="#FFFFFF" strokeLinecap="round" strokeWidth="3.5" />
                <text x="25" y="44" textAnchor="middle" fill="#102A43" fontFamily="Manrope" fontSize="8" fontWeight="700">HOSPITAL</text>
              </g>

              {/* Ambulance */}
              <g transform="translate(70, 160)">
                <circle cx="20" cy="20" r="22" fill="#F05A47" opacity="0.2">
                  <animate attributeName="r" values="18;28;18" dur="2s" repeatCount="indefinite" />
                </circle>
                <rect x="8" y="10" width="24" height="20" rx="5" fill="#F05A47" />
                <path d="M 20 14 L 20 26 M 14 20 L 26 20" stroke="#FFFFFF" strokeLinecap="round" strokeWidth="2.5" />
              </g>
            </svg>

            {/* Floating Status Cards */}
            <div className="absolute top-3 left-3 bg-white/95 backdrop-blur rounded-xl px-3 py-1.5 shadow-md flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-corridor animate-ping" />
              <span className="text-[11px] font-bold text-navy">LIVE CORRIDOR ACTIVE</span>
              <span className="text-[11px] text-muted">| ID: CR-409</span>
            </div>

            <div className="absolute top-3 right-3 bg-white/95 backdrop-blur rounded-xl px-3 py-1.5 shadow-md flex items-center gap-1.5">
              <span className="material-symbols-outlined text-coral text-[18px]">ambulance</span>
              <span className="text-[11px] font-bold text-navy">AECC-001</span>
              <span className="bg-teal-light px-1.5 py-0.5 rounded text-[11px] font-bold text-navy">ETA 08:32</span>
            </div>

            <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur rounded-xl px-3 py-2 shadow-md flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-teal" />
                <span className="text-[11px] font-bold text-navy">NODES: 04 CONNECTED</span>
              </div>
              <div className="hidden sm:flex items-center gap-4">
                <span className="text-[12px] text-muted">Signal Sync: <strong className="text-corridor">99.4%</strong></span>
                <span className="text-[12px] text-muted">Grid Clearance: <strong className="text-corridor">Uninhibited</strong></span>
              </div>
            </div>
          </div>
        </ScrollFade>
      </div>
    </section>
  );
}

import { ScrollFade } from '../hooks/useScrollAnimation';

const metrics = [
  { icon: 'ambulance', label: 'Active Responders', value: '01 En Route', iconBg: 'bg-coral-light', iconColor: 'text-coral' },
  { icon: 'schedule', label: 'Hospital ETA', value: '08:32 Remaining', iconBg: 'bg-sky-light', iconColor: 'text-navy' },
  { icon: 'traffic', label: 'Arterial Congestion', value: 'Moderate (14km/h)', iconBg: 'bg-surface-container', iconColor: 'text-teal', valueColor: 'text-teal' },
  { icon: 'share_location', label: 'Signal Preemption', value: '04 Nodes Locked', iconBg: 'bg-corridor-light', iconColor: 'text-corridor-dark', valueColor: 'text-corridor-dark' },
];

const nodes = [
  { name: 'Node R-01', location: 'Grand River & 4th Ave • 480m', status: 'READY', statusBg: 'bg-corridor-light', statusText: 'text-corridor-dark', dot: 'bg-corridor' },
  { name: 'Node R-02', location: 'Civic Ring & North Way • 1.2km', status: 'PREPARING', statusBg: 'bg-teal-light', statusText: 'text-teal', dot: 'bg-teal animate-pulse' },
  { name: 'Node R-03', location: 'Hospital Approach • 2.1km', status: 'STANDBY', statusBg: 'bg-surface-alt', statusText: 'text-muted', dot: 'bg-outline' },
];

export default function LiveDashboard() {
  return (
    <section id="dashboard" className="w-full px-4 md:px-8 py-16 md:py-20 bg-ivory">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <ScrollFade>
            <div>
              <span className="text-[11px] font-bold text-teal uppercase tracking-wider">Metropolitan Control Deck</span>
              <h2 className="text-[28px] md:text-[32px] font-bold text-navy mt-1">Live AECC Command Operations</h2>
            </div>
          </ScrollFade>
          <ScrollFade delay={0.1}>
            <div className="mt-3 md:mt-0">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white shadow-sm text-[11px] font-bold text-navy">
                <span className="w-2 h-2 rounded-full bg-corridor animate-pulse" />
                Telemetry Stream Live (20Hz)
              </span>
            </div>
          </ScrollFade>
        </div>

        <ScrollFade delay={0.1}>
          <div className="bg-white rounded-2xl p-4 md:p-6 shadow-md">
            {/* Top Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-4">
              {metrics.map((m, i) => (
                <div key={i} className="p-4 rounded-xl bg-ivory flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${m.iconBg} ${m.iconColor} flex items-center justify-center font-bold`}>
                    <span className="material-symbols-outlined">{m.icon}</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-muted block">{m.label}</span>
                    <span className={`text-[16px] md:text-[18px] font-bold ${m.valueColor || 'text-navy'}`}>{m.value}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Map + Queue */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-2">
              {/* Map */}
              <div className="lg:col-span-8 aspect-[16/10] bg-ivory rounded-xl relative overflow-hidden flex items-center justify-center">
                <svg className="w-full h-full" viewBox="0 0 800 500" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M 50 100 L 750 100 M 50 250 L 750 250 M 50 400 L 750 400" stroke="#EAF0F4" strokeWidth="16" />
                  <path d="M 150 50 L 150 450 M 350 50 L 350 450 M 550 50 L 550 450" stroke="#EAF0F4" strokeWidth="16" />
                  <path d="M 80 400 L 250 400 C 350 400 350 250 450 250 L 680 250" stroke="#22A06B" strokeLinecap="round" strokeWidth="12" />
                  <path d="M 80 400 L 250 400 C 350 400 350 250 450 250 L 680 250" stroke="#86F9BC" strokeDasharray="8 8" strokeWidth="4" />
                  <circle cx="250" cy="400" r="18" fill="#FFFFFF" stroke="#159A9C" strokeWidth="4" />
                  <text x="250" y="404" textAnchor="middle" fill="#102A43" fontFamily="Manrope" fontSize="9" fontWeight="bold">R1</text>
                  <circle cx="450" cy="250" r="18" fill="#FFFFFF" stroke="#159A9C" strokeWidth="4" />
                  <text x="450" y="254" textAnchor="middle" fill="#102A43" fontFamily="Manrope" fontSize="9" fontWeight="bold">R2</text>
                  <circle cx="580" cy="250" r="18" fill="#FFFFFF" stroke="#159A9C" strokeWidth="4" />
                  <text x="580" y="254" textAnchor="middle" fill="#102A43" fontFamily="Manrope" fontSize="9" fontWeight="bold">R3</text>
                  {/* Ambulance */}
                  <g transform="translate(180, 385)">
                    <circle cx="15" cy="15" r="22" fill="#F05A47" opacity="0.25">
                      <animate attributeName="r" values="14;24;14" dur="1.8s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="15" cy="15" r="14" fill="#F05A47" />
                    <path d="M 15 10 L 15 20 M 10 15 L 20 15" stroke="#FFFFFF" strokeLinecap="round" strokeWidth="2.5" />
                  </g>
                  {/* Hospital */}
                  <g transform="translate(670, 230)">
                    <circle cx="20" cy="20" r="22" fill="#FFFFFF" stroke="#4A90E2" strokeWidth="4" />
                    <rect x="12" y="12" width="16" height="16" rx="3" fill="#4A90E2" />
                    <path d="M 20 15 L 20 25 M 15 20 L 25 20" stroke="#FFFFFF" strokeLinecap="round" strokeWidth="2" />
                  </g>
                </svg>
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur rounded-xl p-2 shadow-sm">
                  <span className="text-[11px] font-bold text-navy block">Ambulance AECC-001</span>
                  <span className="text-[12px] text-muted">Speed: <strong>58 km/h</strong> | Heading: <strong>NE 042°</strong></span>
                </div>
              </div>

              {/* Queue */}
              <div className="lg:col-span-4 flex flex-col gap-3">
                <span className="text-[11px] font-bold uppercase text-muted">Upcoming Roadside Queue</span>
                {nodes.map((node, i) => (
                  <div key={i} className="p-4 rounded-xl bg-ivory shadow-sm flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2.5 h-2.5 rounded-full ${node.dot}`} />
                        <span className="text-[16px] font-bold text-navy">{node.name}</span>
                      </div>
                      <span className="text-[12px] text-muted">{node.location}</span>
                    </div>
                    <span className={`px-2 py-1 rounded ${node.statusBg} ${node.statusText} text-[11px] font-bold`}>{node.status}</span>
                  </div>
                ))}
                <div className="p-4 rounded-xl bg-teal-light shadow-sm">
                  <span className="text-[11px] font-bold text-navy block mb-1">RECEIVING TRAUMA DESK</span>
                  <p className="text-[12px] text-navy">St. Jude Medical Center — Team Alpha standing by in Trauma Bay 02. Pre-notification confirmed.</p>
                </div>
              </div>
            </div>
          </div>
        </ScrollFade>
      </div>
    </section>
  );
}

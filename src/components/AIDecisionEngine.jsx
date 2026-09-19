import { ScrollFade } from '../hooks/useScrollAnimation';

const routes = [
  {
    name: 'Route A: Arterial Corridor',
    desc: 'Via Grand River Parkway & 3 pre-cleared roundabouts.',
    time: '08m 32s',
    selected: true,
    badge: 'OPTIMAL PATH',
    badgeBg: 'bg-corridor-light',
    badgeText: 'text-corridor-dark',
    timeColor: 'text-corridor',
    borderColor: 'bg-corridor',
    stats: [
      { label: 'Distance:', value: '4.2 km' },
      { label: 'Nodes Synchronized:', value: '3 of 3 Active', valueColor: 'text-corridor' },
      { label: 'Estimated Friction:', value: 'Lowest (0.04)', valueColor: 'text-corridor' },
    ],
  },
  {
    name: 'Route B: West Commercial Bypass',
    desc: 'Via Industrial Road; carries heavy commercial freight density.',
    time: '11m 45s',
    badge: 'STANDBY',
    badgeBg: 'bg-surface-alt',
    badgeText: 'text-muted',
    stats: [
      { label: 'Distance:', value: '5.8 km' },
      { label: 'Nodes Synchronized:', value: '2 of 2 Available' },
      { label: 'Estimated Friction:', value: 'Elevated (+3m 13s)', valueColor: 'text-error' },
    ],
  },
  {
    name: 'Route C: Outer Ring Highway',
    desc: 'Via Ring 400; longer trajectory with manual signal bottlenecks.',
    time: '14m 10s',
    badge: 'REJECTED',
    badgeBg: 'bg-surface-alt',
    badgeText: 'text-muted',
    stats: [
      { label: 'Distance:', value: '7.4 km' },
      { label: 'Nodes Synchronized:', value: '0 Nodes' },
      { label: 'Estimated Friction:', value: 'Severe Delays', valueColor: 'text-error' },
    ],
  },
];

export default function AIDecisionEngine() {
  return (
    <section id="ai-engine" className="w-full px-4 md:px-8 py-16 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center mb-10">
          <div className="lg:col-span-6">
            <ScrollFade>
              <span className="text-[11px] font-bold text-corridor uppercase tracking-wider">Dynamic Graph Routing</span>
              <h2 className="text-[28px] md:text-[32px] font-bold text-navy mt-1">
                The route adapts to the emergency.
              </h2>
              <p className="text-[16px] text-muted mt-3 leading-relaxed">
                AECC evaluates municipal graph networks in real-time. If an artery exhibits unexpected gridlock or a stalled civilian vehicle, the corridor autonomously re-arbitrates to the fastest viable clearance path.
              </p>
            </ScrollFade>
          </div>
          <div className="lg:col-span-6 flex justify-end">
            <ScrollFade delay={0.1}>
              <div className="p-4 bg-ivory rounded-xl flex items-center gap-4">
                <span className="material-symbols-outlined text-corridor text-[32px]">alt_route</span>
                <div>
                  <span className="text-[11px] font-bold text-muted uppercase block">Arbitration Algorithm</span>
                  <span className="text-[12px] text-navy font-bold">Dijkstra + mmWave Real-Time Friction Penalties</span>
                </div>
              </div>
            </ScrollFade>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {routes.map((route, i) => (
            <ScrollFade key={i} delay={i * 0.1}>
              <div className={`${route.selected ? 'bg-white shadow-md' : 'bg-ivory shadow-sm'} rounded-xl p-6 relative overflow-hidden h-full`}>
                {route.selected && <div className="w-full h-1.5 bg-corridor absolute top-0 left-0" />}
                <div className="flex justify-between items-center mb-3">
                  <span className={`px-2 py-0.5 rounded-full ${route.badgeBg} ${route.badgeText} text-[11px] font-bold`}>{route.badge}</span>
                  <span className={`text-[20px] font-bold ${route.timeColor || 'text-navy'}`}>{route.time}</span>
                </div>
                <h4 className="text-[18px] font-bold text-navy mb-1">{route.name}</h4>
                <p className="text-[12px] text-muted mb-4">{route.desc}</p>
                <div className={`space-y-1 text-[12px] p-3 ${route.selected ? 'bg-ivory' : 'bg-white'} rounded-lg`}>
                  {route.stats.map((s, j) => (
                    <div key={j} className="flex justify-between">
                      <span className="text-muted">{s.label}</span>
                      <span className={`font-bold ${s.valueColor || 'text-navy'}`}>{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollFade>
          ))}
        </div>
      </div>
    </section>
  );
}

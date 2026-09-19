import { ScrollFade } from '../hooks/useScrollAnimation';

const stages = [
  { num: '01', title: 'Emergency Switch', desc: 'Driver engages hardware corridor switch inside vehicle cockpit.', tag: 'Vehicle Unit', tagColor: 'text-coral' },
  { num: '02', title: 'Crypto Handshake', desc: 'Onboard unit authenticates with municipal root CA via zero-trust TLS.', tag: 'Zero-Trust', tagColor: 'text-teal' },
  { num: '03', title: 'RTK-GPS Pin', desc: 'Sub-meter positional telemetry begins broadcasting at 20Hz frequency.', tag: 'Telemetry', tagColor: 'text-navy' },
  { num: '04', title: 'Traffic Ingestion', desc: 'City-wide mmWave sensor arrays calculate live artery congestion.', tag: 'Edge Sensing', tagColor: 'text-teal' },
  { num: '05', title: 'Neural Routing', desc: 'AI core evaluates optimal pathing to closest level-1 trauma facility.', tag: 'AECC AI', tagColor: 'text-corridor' },
  { num: '06', title: 'Roundabouts Prep', desc: 'Downstream controllers (R1, R2) begin phase adjustment 90s in advance.', tag: 'Intersection', tagColor: 'text-teal' },
  { num: '07', title: 'Green Wave Active', desc: 'Feeder arms sealed; circulatory carriageways cleared for passage.', tag: 'Corridor Lock', tagColor: 'text-corridor' },
  { num: '08', title: 'Hospital Alert', desc: 'Trauma Bay assigned, surgeon team paged, ambulance bay gate elevated.', tag: 'Hospital Unit', tagColor: 'text-sky' },
  { num: '09', title: 'Vehicle Transit', desc: 'Ambulance traverses intersection at continuous cruising speed (60km/h).', tag: 'Passage', tagColor: 'text-navy' },
  { num: '10', title: 'Civilian Restore', desc: 'Signals systematically restored to equitable split within 3.5s of exit.', tag: 'Equilibrium', tagColor: 'text-corridor' },
];

const numColors = {
  '01': 'text-coral', '02': 'text-teal', '03': 'text-navy', '04': 'text-teal', '05': 'text-corridor',
  '06': 'text-teal', '07': 'text-corridor', '08': 'text-sky', '09': 'text-navy', '10': 'text-corridor',
};

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="w-full px-4 md:px-8 py-16 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto">
        <ScrollFade>
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-[11px] font-bold text-corridor uppercase tracking-wider">End-to-End Orchestration</span>
            <h2 className="text-[28px] md:text-[32px] font-bold text-navy mt-1">
              The 10-Stage Autonomous Life Corridor
            </h2>
            <p className="text-[14px] text-muted mt-3">
              A synchronized transit chain that shifts municipal signals from reactive listening to deterministic route clearance.
            </p>
          </div>
        </ScrollFade>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {stages.map((stage, i) => (
            <ScrollFade key={stage.num} delay={i * 0.06}>
              <div className="bg-ivory rounded-xl p-4 flex flex-col justify-between h-full">
                <span className={`text-[20px] font-bold ${numColors[stage.num]}`}>{stage.num}</span>
                <div className="my-3">
                  <h4 className="text-[16px] font-bold text-navy">{stage.title}</h4>
                  <p className="text-[12px] text-muted mt-1">{stage.desc}</p>
                </div>
                <span className={`text-[11px] font-bold ${stage.tagColor}`}>{stage.tag}</span>
              </div>
            </ScrollFade>
          ))}
        </div>
      </div>
    </section>
  );
}

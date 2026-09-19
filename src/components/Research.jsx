import { ScrollFade } from '../hooks/useScrollAnimation';

const researchCards = [
  { label: 'Benchmark Data', labelColor: 'text-teal', value: '100 Scenarios', desc: 'Synthesized real-world urban grid tests simulating diverse peak and non-peak loads.' },
  { label: 'V2I Verification', labelColor: 'text-corridor', value: '99.82%', desc: 'Successful preemption command execution within the dedicated 1500m boundary.' },
  { label: 'Transit Optimization', labelColor: 'text-coral', value: '3.2x Faster', desc: 'Clearance speed across congested roundabout clusters compared to siren-only travel.' },
  { label: 'Clinical Prep', labelColor: 'text-sky', value: '0s Lag', desc: 'Zero idle waiting time at trauma admissions bays during simulated patient transfers.' },
];

const futureCards = [
  { title: 'Autonomous Level 4 Ambulances', desc: 'Direct integration with drive-by-wire autonomous response vehicles.' },
  { title: 'UAV Defibrillator Corridors', desc: 'Simultaneous low-altitude urban airspace preemption for medical drone delivery.' },
  { title: 'Multi-Hospital Load Balancing', desc: 'Cross-regional algorithmic load routing based on real-time trauma bed availability.' },
];

export default function Research() {
  return (
    <section className="w-full px-4 md:px-8 py-16 md:py-20 bg-ivory">
      <div className="max-w-7xl mx-auto">
        <ScrollFade>
          <div className="mb-12">
            <span className="text-[11px] font-bold text-navy uppercase tracking-wider">Empirical Validation</span>
            <h2 className="text-[28px] md:text-[32px] font-bold text-navy mt-1">
              Research Dataset &amp; Next Horizons
            </h2>
          </div>
        </ScrollFade>

        {/* Research Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {researchCards.map((card, i) => (
            <ScrollFade key={i} delay={i * 0.08}>
              <div className="bg-white rounded-xl p-4 shadow-sm h-full">
                <span className={`text-[11px] font-bold ${card.labelColor} uppercase block mb-1`}>{card.label}</span>
                <h4 className="text-[22px] font-bold text-navy">{card.value}</h4>
                <p className="text-[12px] text-muted mt-1">{card.desc}</p>
              </div>
            </ScrollFade>
          ))}
        </div>

        {/* Future Scope */}
        <ScrollFade delay={0.3}>
          <div className="p-6 bg-white rounded-2xl shadow-sm">
            <span className="text-[11px] font-bold uppercase text-navy block mb-4">Future Roadmap 2026–2028</span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {futureCards.map((card, i) => (
                <div key={i} className="p-4 rounded-xl bg-ivory">
                  <h5 className="text-[18px] font-bold text-navy">{card.title}</h5>
                  <p className="text-[12px] text-muted mt-1">{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </ScrollFade>
      </div>
    </section>
  );
}

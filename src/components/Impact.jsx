import { ScrollFade } from '../hooks/useScrollAnimation';

const impactCards = [
  { label: 'Social', value: '+38%', desc: 'Survival odds increase in acute cardiac arrests via halved golden-hour transit times.', borderColor: 'border-t-coral', labelColor: 'text-coral' },
  { label: 'Environment', value: '-29%', desc: 'Reduction in idle emissions across cleared corridors by avoiding stop-and-go jams.', borderColor: 'border-t-corridor', labelColor: 'text-corridor' },
  { label: 'Economic', value: '$4.2M', desc: 'Annual municipal savings per municipality in fleet wear, collisions, and fuel costs.', borderColor: 'border-t-sky', labelColor: 'text-sky' },
  { label: 'Smart City', value: '100%', desc: 'Compatibility with existing municipal NTCIP traffic controllers via edge relays.', borderColor: 'border-t-teal', labelColor: 'text-teal' },
  { label: 'Healthcare', value: '8.5 min', desc: 'Faster surgical intervention through early automated hospital arrival readiness.', borderColor: 'border-t-navy', labelColor: 'text-navy' },
];

const sdgs = [
  { num: 'SDG 3', label: 'Good Health' },
  { num: 'SDG 9', label: 'Industry & Infra' },
  { num: 'SDG 11', label: 'Smart Cities' },
  { num: 'SDG 13', label: 'Climate Action' },
];

export default function Impact() {
  return (
    <section id="impact" className="w-full px-4 md:px-8 py-16 md:py-20 bg-ivory">
      <div className="max-w-7xl mx-auto">
        <ScrollFade>
          <div className="mb-12">
            <span className="text-[11px] font-bold text-corridor-dark uppercase tracking-wider">Civic Value Creation</span>
            <h2 className="text-[28px] md:text-[32px] font-bold text-navy mt-1">
              Measurable Urban Impact &amp; Sustainability
            </h2>
          </div>
        </ScrollFade>

        {/* Impact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-12">
          {impactCards.map((card, i) => (
            <ScrollFade key={i} delay={i * 0.08}>
              <div className={`bg-white rounded-xl p-4 shadow-sm border-t-4 ${card.borderColor} h-full`}>
                <span className={`text-[11px] font-bold ${card.labelColor} uppercase`}>{card.label}</span>
                <h4 className="text-[22px] font-bold text-navy mt-1">{card.value}</h4>
                <p className="text-[12px] text-muted mt-1">{card.desc}</p>
              </div>
            </ScrollFade>
          ))}
        </div>

        {/* Sustainability Chain */}
        <ScrollFade delay={0.3}>
          <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-6">
            <div>
              <span className="text-[11px] font-bold uppercase text-muted">The Sustainable Mobility Ripple Effect</span>
              <h4 className="text-[18px] font-bold text-navy mt-1">AECC → Smoother Traffic → Less Braking → Zero Gridlock Spikes</h4>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {sdgs.map((sdg, i) => (
                <div key={i} className="px-3 py-1.5 rounded-lg bg-ivory text-center">
                  <span className="text-[11px] font-bold text-navy">{sdg.num}</span>
                  <span className="block text-[10px] text-muted">{sdg.label}</span>
                </div>
              ))}
            </div>
          </div>
        </ScrollFade>
      </div>
    </section>
  );
}

import { ScrollFade } from '../hooks/useScrollAnimation';

export default function Problem() {
  return (
    <section className="w-full px-4 md:px-8 py-16 md:py-20 bg-surface-alt">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center mb-10">
          <div className="lg:col-span-5">
            <ScrollFade>
              <span className="text-[11px] font-bold text-coral uppercase tracking-wider block mb-2">The Urban Preemption Dilemma</span>
              <h2 className="text-[28px] md:text-[32px] font-bold text-navy tracking-tight leading-tight">
                Emergency vehicles should not have to fight the city to save a human life.
              </h2>
            </ScrollFade>
          </div>
          <div className="lg:col-span-7">
            <ScrollFade delay={0.15}>
              <p className="text-[16px] text-muted leading-relaxed">
                Dense metropolitan centers rely on passive audio sirens and line-of-sight optical strobe detectors. Congested roundabouts lock up as panicked drivers freeze in intersecting lanes, destroying the critical golden hour for cardiac and trauma patients.
              </p>
            </ScrollFade>
          </div>
        </div>

        {/* Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Legacy */}
          <ScrollFade>
            <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col justify-between h-full">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-error bg-coral-light px-2.5 py-1 rounded-full">Legacy Bottleneck</span>
                <span className="material-symbols-outlined text-error">report_problem</span>
              </div>
              <h3 className="text-[20px] font-bold text-navy mb-2">Uncoordinated Friction</h3>
              <p className="text-[14px] text-muted mb-4">
                Isolated sirens prompt erratic human reactions. Intersections freeze because vehicles have nowhere to pull over, resulting in 4-6 minutes of dead delay per kilometer.
              </p>
              <div className="bg-surface rounded-xl p-4 space-y-2">
                <div className="flex justify-between items-center text-[12px]">
                  <span className="text-muted">Mean Intersection Clearance</span>
                  <span className="font-bold text-error">240 — 360 sec</span>
                </div>
                <div className="w-full bg-surface-dim h-2 rounded-full overflow-hidden">
                  <div className="bg-error h-full w-[85%] rounded-full" />
                </div>
                <span className="text-[11px] text-muted">Secondary accident hazard elevation: +34%</span>
              </div>
            </div>
          </ScrollFade>

          {/* AECC */}
          <ScrollFade delay={0.15}>
            <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col justify-between h-full">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-corridor-dark bg-corridor-light px-2.5 py-1 rounded-full">AECC Solution</span>
                <span className="material-symbols-outlined text-corridor">verified</span>
              </div>
              <h3 className="text-[20px] font-bold text-navy mb-2">Autonomous Coordinated Clearance</h3>
              <p className="text-[14px] text-muted mb-4">
                Signals downstream pre-clear up to 1,500 meters ahead. Civilian traffic is smoothly redirected away from the corridor trajectory before auditory sirens are even heard.
              </p>
              <div className="bg-surface rounded-xl p-4 space-y-2">
                <div className="flex justify-between items-center text-[12px]">
                  <span className="text-muted">Mean Intersection Clearance</span>
                  <span className="font-bold text-corridor-dark">2.4 — 5.8 sec</span>
                </div>
                <div className="w-full bg-surface-dim h-2 rounded-full overflow-hidden">
                  <div className="bg-corridor h-full w-[15%] rounded-full" />
                </div>
                <span className="text-[11px] text-muted">Continuous green-wave corridor reliability: 99.8%</span>
              </div>
            </div>
          </ScrollFade>
        </div>
      </div>
    </section>
  );
}

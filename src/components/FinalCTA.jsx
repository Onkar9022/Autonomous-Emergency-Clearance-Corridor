import { ScrollFade } from '../hooks/useScrollAnimation';
import { ArrowRight, Activity } from 'lucide-react';

export default function FinalCTA() {
  return (
    <section className="w-full px-4 md:px-8 py-16 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto">
        <ScrollFade>
          <div className="w-full bg-navy rounded-3xl p-8 md:p-12 lg:p-16 shadow-xl relative overflow-hidden text-white">
            {/* Flowing Green Corridor Overlay */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" xmlns="http://www.w3.org/2000/svg">
              <path d="M -100 200 C 200 100 400 350 800 200 C 1000 100 1200 250 1400 150" fill="none" stroke="#22A06B" strokeWidth="60" />
            </svg>

            <div className="relative max-w-3xl flex flex-col items-start">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur mb-5">
                <Activity className="w-3 h-3 text-corridor-light animate-pulse" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-white">Ready for Deployment</span>
              </div>

              <h2 className="text-[30px] md:text-[40px] font-bold tracking-tight text-white mb-4 leading-tight">
                When every second matters, build the corridor.
              </h2>

              <p className="text-[16px] text-surface-dim mb-8 max-w-2xl leading-relaxed">
                Explore how AECC connects emergency vehicles, intelligent intersections and hospitals into one coordinated emergency mobility system.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="#simulation"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-corridor text-white text-[14px] font-bold shadow-lg hover:bg-corridor-dark transition-all active:translate-y-px"
                >
                  <span>Launch Live Simulation</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
                <a
                  href="#hero"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-navy text-[14px] font-bold shadow-sm hover:bg-ivory transition-all active:translate-y-px"
                >
                  <span>View Architecture</span>
                </a>
              </div>
            </div>
          </div>
        </ScrollFade>
      </div>
    </section>
  );
}

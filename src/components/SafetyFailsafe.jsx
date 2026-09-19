import { ScrollFade } from '../hooks/useScrollAnimation';
import { ShieldCheck, Timer, Lock, FileText } from 'lucide-react';

const trustCards = [
  { Icon: ShieldCheck, title: 'Zero-Trust Auth', desc: 'Preemption requests require valid hardware tokens signed by municipal authorities.' },
  { Icon: Timer, title: 'Hardware Watchdogs', desc: 'Controllers auto-revert to standard traffic cycles if heartbeats lapse for >500ms.' },
  { Icon: Lock, title: 'Mutual TLS 1.3', desc: 'End-to-end encrypted packet transmission prevents GPS spoofing and replay attacks.' },
  { Icon: FileText, title: 'Tamper Audit Log', desc: 'Immutable ledger logs every signal override event with millisecond micro-timestamps.' },
];

export default function SafetyFailsafe() {
  return (
    <section className="w-full px-4 md:px-8 py-16 md:py-20 bg-ivory">
      <div className="max-w-7xl mx-auto">
        <ScrollFade>
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-[11px] font-bold text-error uppercase tracking-wider">Zero-Compromise Security</span>
            <h2 className="text-[28px] md:text-[32px] font-bold text-navy mt-1">
              Engineered for Safety &amp; Fail-Safe Continuity
            </h2>
            <p className="text-[14px] text-muted mt-3">
              A physical emergency corridor must never cause a civilian casualty. Strict ASIL-D protocols govern every signal actuation.
            </p>
          </div>
        </ScrollFade>

        {/* Trust Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {trustCards.map((card, i) => {
            const Icon = card.Icon;
            return (
              <ScrollFade key={i} delay={i * 0.08}>
                <div className="bg-white rounded-xl p-5 shadow-sm h-full">
                  <div className="w-10 h-10 rounded-xl bg-corridor/10 text-corridor flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="text-[18px] font-bold text-navy">{card.title}</h4>
                  <p className="text-[12px] text-muted mt-1">{card.desc}</p>
                </div>
              </ScrollFade>
            );
          })}
        </div>

        {/* Fail-Safe Hero Card */}
        <ScrollFade delay={0.3}>
          <div className="w-full bg-navy text-white rounded-2xl p-6 md:p-10 shadow-md flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-xl">
              <span className="text-[11px] font-bold text-corridor-light uppercase">Fail-Safe Assurance</span>
              <h3 className="text-[28px] md:text-[32px] font-bold mt-1">Deterministic Fail-Safe Guarantee</h3>
              <p className="text-[14px] text-surface-dim mt-2">
                In the event of network blackout, hardware disconnect, or packet corruption, intersection controllers instantly drop into isolated safe operation without jarring sudden red signals.
              </p>
            </div>
            <div className="shrink-0">
              <div className="px-6 py-4 rounded-xl bg-white/10 backdrop-blur text-center">
                <span className="text-[24px] font-bold text-white block">100%</span>
                <span className="text-[11px] text-surface-dim">ISO ASIL-D Compliant</span>
              </div>
            </div>
          </div>
        </ScrollFade>
      </div>
    </section>
  );
}

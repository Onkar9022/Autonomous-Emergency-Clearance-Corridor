import { ScrollFade } from '../hooks/useScrollAnimation';

const comparisonRows = [
  { cap: 'Detection Distance', legacy: '150m — 250m (Line of Sight)', aecc: '1,500m+ (Dynamic Network Buffer)' },
  { cap: 'Roundabout Geometry Control', legacy: 'None (Causes inside lockup)', aecc: 'Intelligent Ring Flushing & Feeder Hold' },
  { cap: 'Hospital Triage Connectivity', legacy: 'Disconnected (Radio phone call)', aecc: 'Continuous RTK GPS & Sub-Second ETA' },
  { cap: 'Authentication Security', legacy: 'Vulnerable to strobe spoofing', aecc: 'Mutual TLS 1.3 & Zero-Trust PKI' },
];

const techPills = [
  'Graph Neural Networks', 'Extended Kalman Filtering', 'ESP32-S3 Microcontrollers',
  '60GHz mmWave FMCW Radar', '3GPP Rel-16 C-V2X', '5G URLLC Sub-10ms',
  'TimescaleDB Geospatial Engine', 'NTCIP 1202 Traffic Standards',
];

export default function Innovation() {
  return (
    <section className="w-full px-4 md:px-8 py-16 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center mb-12">
          <div className="lg:col-span-6">
            <ScrollFade>
              <span className="text-[11px] font-bold text-teal uppercase tracking-wider">Benchmark Comparison</span>
              <h2 className="text-[28px] md:text-[32px] font-bold text-navy mt-1">
                How AECC Outperforms Conventional Systems
              </h2>
            </ScrollFade>
          </div>
          <div className="lg:col-span-6">
            <ScrollFade delay={0.1}>
              <p className="text-[14px] text-muted leading-relaxed">
                Traditional optical emitters (e.g., Opticom) only trigger when an ambulance is 200m away in direct line-of-sight. AECC creates an unbroken predictive corridor 1.5km downstream before sirens are audible.
              </p>
            </ScrollFade>
          </div>
        </div>

        {/* Comparison Table */}
        <ScrollFade delay={0.15}>
          <div className="w-full bg-ivory rounded-2xl p-4 md:p-6 shadow-sm overflow-x-auto mb-12">
            <table className="w-full text-left text-[12px]">
              <thead>
                <tr className="border-b border-surface-dim text-navy font-bold">
                  <th className="pb-3">Capability</th>
                  <th className="pb-3">Legacy Audio/Strobe</th>
                  <th className="pb-3 text-corridor">AECC Autonomous Corridor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-alt">
                {comparisonRows.map((row, i) => (
                  <tr key={i}>
                    <td className="py-3 font-bold text-navy">{row.cap}</td>
                    <td className="py-3 text-muted">{row.legacy}</td>
                    <td className="py-3 text-corridor font-bold">{row.aecc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ScrollFade>

        {/* Tech Stack Pills */}
        <ScrollFade delay={0.2}>
          <div>
            <span className="text-[11px] font-bold uppercase text-muted block mb-3">Underlying Core Technologies</span>
            <div className="flex flex-wrap gap-2">
              {techPills.map((tech, i) => (
                <span key={i} className="px-3 py-1.5 rounded-lg bg-surface-alt text-[11px] font-bold text-navy">{tech}</span>
              ))}
            </div>
          </div>
        </ScrollFade>
      </div>
    </section>
  );
}

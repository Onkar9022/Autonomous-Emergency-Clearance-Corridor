import aeccLogo from '../assets/logo.png';

export default function Footer() {
  const footerLinks = {
    Platform: [
      { label: 'Overview', href: '#hero' },
      { label: '3 Modular Units', href: '#three-units' },
      { label: 'Live Telemetry Deck', href: '#dashboard' },
      { label: 'Dynamic Preemption', href: '#ai-engine' },
    ],
    Infrastructure: [
      { label: 'V2X Signal Architecture', href: '#how-it-works' },
      { label: 'Municipal Mesh Interop', href: '#safety' },
      { label: 'Digital Twin Simulation', href: '#simulation' },
      { label: 'Corridor Green-Wave KPI', href: '#impact' },
    ],
    'Research & Validation': [
      { label: 'Clinical Response Data', href: '#impact' },
      { label: 'Simulation Benchmarks', href: '#simulation' },
      { label: 'Engineering Team', href: '#team' },
    ],
  };

  return (
    <footer className="w-full bg-white border-t border-surface-alt py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <img src={aeccLogo} alt="AECC" className="h-8 w-auto" />
              <span className="text-[20px] font-bold text-navy">AECC</span>
            </div>
            <p className="text-[18px] font-semibold text-corridor-dark tracking-tight leading-snug mb-4">
              Every Second Matters.<br />Every Life Matters.
            </p>
            <p className="text-[12px] text-muted max-w-xs">
              Autonomous Emergency Clearance Corridor system harmonizing connected vehicle telematics, intelligent municipal signals, and pre-hospital dispatch.
            </p>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title} className="flex flex-col gap-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-navy">{title}</span>
              {links.map(link => (
                <a key={link.label} href={link.href} className="text-[14px] text-muted hover:text-navy transition-colors">
                  {link.label}
                </a>
              ))}
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-surface-alt flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-[12px] text-muted">
            © 2026 AECC Team. All rights reserved. Autonomous Emergency Clearance Corridor.
          </span>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-corridor-dark">
              <span className="w-1.5 h-1.5 rounded-full bg-corridor" />
              V2X Core Online
            </span>
            <span className="text-[12px] text-muted">ISO 26262 ASIL-D Compliant Architecture</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

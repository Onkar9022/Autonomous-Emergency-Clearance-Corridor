import { ScrollFade } from '../hooks/useScrollAnimation';

const unitsData = [
  {
    num: '01',
    badge: 'Mobile Edge',
    title: 'Ambulance Telematics',
    color: 'coral',
    borderColor: 'border-t-coral',
    badgeBg: 'bg-coral-light',
    badgeText: 'text-coral-dark',
    desc: 'Onboard cellular V2X compute nodes broadcasting cryptographic status, velocity, and patient emergency severity tier.',
    features: [
      'ESP32-S3 Dual-Core Industrial Controller',
      'Multi-Band RTK GNSS (Sub-Meter Accuracy)',
      'Mutual TLS 1.3 Hardware Handshake',
      'Tactile Physical Emergency Toggle',
    ],
    pipeline: 'Driver Dispatch → AES Auth → RTK GNSS Pin → 5G Cloud Mesh',
  },
  {
    num: '02',
    badge: 'Roadside Unit',
    title: 'Smart Roundabout',
    color: 'teal',
    borderColor: 'border-t-teal',
    badgeBg: 'bg-surface-alt',
    badgeText: 'text-teal',
    desc: 'Municipal edge gateways deployed at intersections, arbitrating right-of-way via mmWave radar and automated traffic signals.',
    features: [
      '60GHz mmWave Vehicle Queue Radar',
      'NTCIP-Compliant Signal Override Relays',
      'Roadside Dynamic Matrix Display Sync',
      '1500m Predictive Buffer Window',
    ],
    nodeHud: { id: 'AECC-RB-001', status: 'READY', vehicle: 'AECC-001 (450m)' },
  },
  {
    num: '03',
    badge: 'Receiving Triage',
    title: 'Hospital Clinical Triage',
    color: 'sky',
    borderColor: 'border-t-sky',
    badgeBg: 'bg-sky-light',
    badgeText: 'text-navy',
    desc: 'Live patient vital telemetry feed, computerized trauma bay auto-assignment, and automated ambulance bay security clearance.',
    features: [
      'Deterministic Millisecond ETA Stream',
      'HL7 / FHIR Clinical System Integration',
      'Automatic RFID Perimeter Gate Opener',
      'Trauma Bay 02 Readiness Status Sync',
    ],
    etaInfo: { eta: '08 MIN 32 SEC', bay: 'Bay 02 (Team Alpha Ready)' },
  },
];

export default function ThreeUnits() {
  return (
    <section id="three-units" className="w-full px-4 md:px-8 py-16 md:py-20 bg-ivory">
      <div className="max-w-7xl mx-auto">
        <ScrollFade>
          <div className="mb-12">
            <span className="text-[11px] font-bold text-teal uppercase tracking-wider">Modular Architecture</span>
            <h2 className="text-[28px] md:text-[32px] font-bold text-navy mt-1">
              Built for Mission-Critical Reliability
            </h2>
          </div>
        </ScrollFade>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {unitsData.map((unit, i) => (
            <ScrollFade key={unit.num} delay={i * 0.12}>
              <div className={`bg-white rounded-2xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden border-t-4 ${unit.borderColor} h-full`}>
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-[11px] font-bold uppercase text-${unit.color}`}>Unit {unit.num}</span>
                    <span className={`px-2 py-0.5 rounded-full ${unit.badgeBg} ${unit.badgeText} text-[11px] font-bold`}>{unit.badge}</span>
                  </div>
                  <h3 className="text-[20px] font-bold text-navy mb-1">{unit.title}</h3>
                  <p className="text-[14px] text-muted mb-4">{unit.desc}</p>
                  <div className="space-y-2 mb-4">
                    {unit.features.map(f => (
                      <div key={f} className="flex items-center gap-2 text-[12px] text-navy">
                        <span className="material-symbols-outlined text-corridor text-[16px]">check_circle</span>
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="bg-surface rounded-xl p-3">
                  {unit.pipeline && (
                    <>
                      <span className="text-[11px] font-bold text-muted uppercase block mb-1">Data Pipeline Flow</span>
                      <p className="text-[12px] text-navy font-medium">{unit.pipeline}</p>
                    </>
                  )}
                  {unit.nodeHud && (
                    <>
                      <div className="flex justify-between items-center text-[11px] font-bold mb-1">
                        <span className="text-muted">NODE HUD: {unit.nodeHud.id}</span>
                        <span className="text-corridor">{unit.nodeHud.status}</span>
                      </div>
                      <div className="flex justify-between items-center text-[12px]">
                        <span className="text-muted">Approaching Vehicle:</span>
                        <span className="text-navy font-bold">{unit.nodeHud.vehicle}</span>
                      </div>
                    </>
                  )}
                  {unit.etaInfo && (
                    <>
                      <div className="flex justify-between items-center text-[11px] font-bold mb-1">
                        <span className="text-muted">INCOMING ETA</span>
                        <span className="text-sky">{unit.etaInfo.eta}</span>
                      </div>
                      <div className="flex justify-between items-center text-[12px]">
                        <span className="text-muted">Trauma Bay Assigned:</span>
                        <span className="text-navy font-bold">{unit.etaInfo.bay}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </ScrollFade>
          ))}
        </div>
      </div>
    </section>
  );
}

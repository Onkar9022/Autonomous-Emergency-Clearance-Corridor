import { ScrollFade } from '../hooks/useScrollAnimation';

const layers = [
  { num: '05', label: 'Operations Tier', title: 'Emergency Hospital & Municipal TMC', desc: 'Hospital emergency triage portal, clinical desk notifications, municipal emergency dispatch.', tech: 'HL7 / REST / WebSockets', color: 'bg-sky' },
  { num: '04', label: 'Applications Tier', title: 'Fleet Telemetry HUD & Dispatch Console', desc: 'In-cockpit tablet display, route HUD, signal status preview, corridor lock telemetry.', tech: 'React / React Native / gRPC', color: 'bg-teal' },
  { num: '03', label: 'Intelligence Tier', title: 'AECC Distributed Routing Core', desc: 'Dynamic friction arbitration, green-wave queue balancing, mmWave traffic estimation.', tech: 'Rust / TimescaleDB / ONNX', color: 'bg-corridor' },
  { num: '02', label: 'Communication Tier', title: '5G Cellular V2X & Dedicated DSRC Mesh', desc: 'Direct low-latency vehicle-to-infrastructure handshakes, mutual TLS 1.3 cryptographic validation.', tech: 'C-V2X / IEEE 802.11bd', color: 'bg-navy' },
  { num: '01', label: 'Physical Edge Hardware', title: 'ESP32-S3 Microcontrollers & Roadside Actuators', desc: 'Fail-safe hardware relays, 60GHz mmWave radar heads, RTK multi-GNSS receivers.', tech: 'GPIO / Relay Overrides / CAN bus', color: 'bg-coral' },
];

export default function SystemArchitecture() {
  return (
    <section id="safety" className="w-full px-4 md:px-8 py-16 md:py-20 bg-surface-alt">
      <div className="max-w-7xl mx-auto">
        <ScrollFade>
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-[11px] font-bold text-navy uppercase tracking-wider">Enterprise Reliability</span>
            <h2 className="text-[28px] md:text-[32px] font-bold text-navy mt-1">
              5-Tier Modular System Architecture
            </h2>
            <p className="text-[14px] text-muted mt-3">
              ISO 26262 ASIL-D compliant hierarchy guaranteeing deterministic signal handoffs between hardware relays and municipal backbones.
            </p>
          </div>
        </ScrollFade>

        <div className="flex flex-col gap-3 max-w-4xl mx-auto">
          {layers.map((layer, i) => (
            <ScrollFade key={layer.num} delay={i * 0.08}>
              <div className="bg-white rounded-xl p-4 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between relative overflow-hidden">
                <div className={`w-1.5 h-full ${layer.color} absolute left-0 top-0`} />
                <div className="pl-3">
                  <span className={`text-[11px] font-bold uppercase`} style={{ color: layer.color === 'bg-navy' ? '#102A43' : layer.color === 'bg-coral' ? '#F05A47' : layer.color === 'bg-corridor' ? '#22A06B' : layer.color === 'bg-teal' ? '#159A9C' : '#4A90E2' }}>
                    Layer {layer.num} • {layer.label}
                  </span>
                  <h4 className="text-[18px] font-bold text-navy">{layer.title}</h4>
                  <p className="text-[12px] text-muted">{layer.desc}</p>
                </div>
                <span className="mt-2 md:mt-0 text-[11px] font-bold px-2.5 py-1 rounded bg-ivory text-navy shrink-0">{layer.tech}</span>
              </div>
            </ScrollFade>
          ))}
        </div>
      </div>
    </section>
  );
}

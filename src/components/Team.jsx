import { useRef, useEffect, useState } from 'react';
import { ScrollFade } from '../hooks/useScrollAnimation';
import { GraduationCap, Cpu, Code, PenTool, Megaphone } from 'lucide-react';

import profPhoto from '../assets/Prof.V.D.Gaikwad.jpeg';
import riteshPhoto from '../assets/Ritesh Kulkarni.jpeg';
import srushtiPhoto from '../assets/Srushti sakhare.jpeg';
import pratikPhoto from '../assets/Pratik Gundla.jpeg';
import vaishnaviPhoto from '../assets/Vaishnavi Pardeshi.jpeg';

const teamMembers = [
  {
    name: 'Prof. V.D. Gaikwad',
    role: 'Project Guide & Mentor',
    photo: profPhoto,
    icon: GraduationCap,
    accentColor: 'text-navy',
    accentBg: 'bg-navy/10',
    borderColor: 'border-navy/20',
  },
  {
    name: 'Ritesh Kulkarni',
    role: 'Ideation & Circuit Designer',
    photo: riteshPhoto,
    icon: Cpu,
    accentColor: 'text-coral',
    accentBg: 'bg-coral/10',
    borderColor: 'border-coral/20',
  },
  {
    name: 'Srushti Sakhare',
    role: 'System Architecture & Software Developer',
    photo: srushtiPhoto,
    icon: Code,
    accentColor: 'text-corridor',
    accentBg: 'bg-corridor/10',
    borderColor: 'border-corridor/20',
  },
  {
    name: 'Pratik Gundla',
    role: 'CAM Designer & Researcher',
    photo: pratikPhoto,
    icon: PenTool,
    accentColor: 'text-teal',
    accentBg: 'bg-teal/10',
    borderColor: 'border-teal/20',
  },
  {
    name: 'Vaishnavi Pardeshi',
    role: 'CAD Designer & Marketing',
    photo: vaishnaviPhoto,
    icon: Megaphone,
    accentColor: 'text-sky',
    accentBg: 'bg-sky/10',
    borderColor: 'border-sky/20',
  },
];

function TeamCard({ member }) {
  const Icon = member.icon;
  return (
    <div className={`shrink-0 w-[260px] sm:w-[280px] bg-white rounded-2xl shadow-sm border ${member.borderColor} overflow-hidden group hover:shadow-md transition-shadow duration-300`}>
      {/* Photo */}
      <div className="w-full aspect-[4/5] overflow-hidden bg-ivory">
        <img
          src={member.photo}
          alt={member.name}
          className="w-full h-full object-cover object-top group-hover:scale-[1.03] transition-transform duration-500"
          loading="lazy"
        />
      </div>
      {/* Info */}
      <div className="p-4">
        <h4 className="text-[17px] font-bold text-navy leading-tight">{member.name}</h4>
        <div className="flex items-center gap-1.5 mt-1.5">
          <div className={`w-5 h-5 rounded-full ${member.accentBg} ${member.accentColor} flex items-center justify-center`}>
            <Icon className="w-3 h-3" />
          </div>
          <span className={`text-[12px] font-semibold ${member.accentColor}`}>{member.role}</span>
        </div>
      </div>
    </div>
  );
}

export default function Team() {
  const trackRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, scrollLeft: 0 });

  // Touch/mouse drag support
  const handlePointerDown = (e) => {
    setIsDragging(true);
    setIsPaused(true);
    dragStart.current = {
      x: e.pageX || e.touches?.[0]?.pageX || 0,
      scrollLeft: trackRef.current?.scrollLeft || 0,
    };
  };

  const handlePointerMove = (e) => {
    if (!isDragging || !trackRef.current) return;
    e.preventDefault();
    const x = e.pageX || e.touches?.[0]?.pageX || 0;
    const diff = dragStart.current.x - x;
    trackRef.current.scrollLeft = dragStart.current.scrollLeft + diff;
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    setIsPaused(false);
  };

  // Duplicate members for infinite loop illusion: original + clone
  const displayMembers = [...teamMembers, ...teamMembers];

  return (
    <section id="team" className="w-full py-16 md:py-20 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <ScrollFade>
          <div className="mb-10 text-center max-w-xl mx-auto">
            <span className="text-[11px] font-bold text-teal uppercase tracking-wider">The AECC Team</span>
            <h2 className="text-[28px] md:text-[32px] font-bold text-navy mt-1">
              Built by Emergency Engineers
            </h2>
            <p className="text-[14px] text-muted mt-2">
              The multidisciplinary team behind the Autonomous Emergency Clearance Corridor.
            </p>
          </div>
        </ScrollFade>
      </div>

      {/* ─── Infinite Carousel ─── */}
      <ScrollFade delay={0.15}>
        <div
          className="relative w-full"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => { if (!isDragging) setIsPaused(false); }}
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
        >
          {/* Fade edges */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 md:w-24 bg-gradient-to-r from-white to-transparent z-10" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 md:w-24 bg-gradient-to-l from-white to-transparent z-10" />

          <div
            ref={trackRef}
            className="flex gap-5 px-6 md:px-12 overflow-x-hidden select-none cursor-grab active:cursor-grabbing"
          >
            <div
              className={`team-track flex gap-5 ${isPaused ? '[animation-play-state:paused]' : ''}`}
              style={{ willChange: 'transform' }}
            >
              {displayMembers.map((member, i) => (
                <TeamCard key={`${member.name}-${i}`} member={member} />
              ))}
            </div>
          </div>
        </div>
      </ScrollFade>
    </section>
  );
}

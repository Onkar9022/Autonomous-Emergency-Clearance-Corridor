import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Layers, Eye } from 'lucide-react';
import { ScrollFade } from '../hooks/useScrollAnimation';

import perspectiveImg from '../assets/Perspective.jpeg';
import topImg from '../assets/Top.jpeg';
import frontImg from '../assets/Front.jpeg';
import rightImg from '../assets/Right.jpeg';
import backImg from '../assets/Back.jpeg';
import bottomImg from '../assets/Bottom.jpeg';

export const cadViews = [
  {
    id: 'perspective',
    label: 'Perspective View',
    shortLabel: 'Perspective',
    code: 'ISO-01',
    image: perspectiveImg,
    alt: 'AECC model perspective view',
    desc: 'Isometric assembly of the full autonomous corridor, smart intersection, and trauma facility.',
  },
  {
    id: 'top',
    label: 'Top View',
    shortLabel: 'Top',
    code: 'TOP-02',
    image: topImg,
    alt: 'AECC model top view',
    desc: 'Orthographic plan view of the 4-way clearance junction, green corridor lane, and crosswalks.',
  },
  {
    id: 'front',
    label: 'Front View',
    shortLabel: 'Front',
    code: 'FRN-03',
    image: frontImg,
    alt: 'AECC model front view',
    desc: 'Front elevation showcasing vehicle clearance gantry, signal arrays, and hospital receiving wing.',
  },
  {
    id: 'right',
    label: 'Right View',
    shortLabel: 'Right',
    code: 'RGT-04',
    image: rightImg,
    alt: 'AECC model right view',
    desc: 'Right profile displaying ambulance transit bay, emergency signal masts, and high-gain antenna.',
  },
  {
    id: 'back',
    label: 'Back View',
    shortLabel: 'Back',
    code: 'BCK-05',
    image: backImg,
    alt: 'AECC model back view',
    desc: 'Rear elevation detailing peripheral safety fencing, satellite uplink tower, and outbound lane.',
  },
  {
    id: 'bottom',
    label: 'Bottom View',
    shortLabel: 'Bottom',
    code: 'BTM-06',
    image: bottomImg,
    alt: 'AECC model bottom view',
    desc: 'Geometric footprint and structural roadway baseplate alignment across all four quadrants.',
  },
];

export default function ModelViewer() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animKey, setAnimKey] = useState(0);

  // Preload images for instantaneous transitions
  useEffect(() => {
    cadViews.forEach((view) => {
      const img = new Image();
      img.src = view.image;
    });
  }, []);

  const prevView = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + cadViews.length) % cadViews.length);
    setAnimKey((k) => k + 1);
  }, []);

  const nextView = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % cadViews.length);
    setAnimKey((k) => k + 1);
  }, []);

  const selectView = useCallback((index) => {
    if (index === currentIndex) return;
    setCurrentIndex(index);
    setAnimKey((k) => k + 1);
  }, [currentIndex]);

  // Keyboard navigation (ArrowLeft & ArrowRight)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target?.tagName) ||
        e.target?.isContentEditable
      ) {
        return;
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevView();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextView();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prevView, nextView]);

  const currentView = cadViews[currentIndex];

  return (
    <section id="model-viewer" className="w-full px-4 md:px-8 py-16 md:py-20 bg-surface">
      <div className="max-w-6xl mx-auto">
        {/* Section Heading */}
        <ScrollFade>
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-light text-teal text-[11px] font-bold uppercase tracking-wider mb-2">
              <Layers className="w-3.5 h-3.5" />
              <span>Physical Architecture</span>
            </div>
            <h2 className="text-[28px] md:text-[36px] font-bold text-navy tracking-tight">
              AECC Hardware — Model Views
            </h2>
            <p className="text-[15px] md:text-[16px] text-muted mt-2">
              Explore the physical design from multiple perspectives.
            </p>
          </div>
        </ScrollFade>

        {/* Main Model Viewer Card */}
        <ScrollFade delay={0.1}>
          <div className="relative bg-white rounded-2xl md:rounded-3xl border border-surface-dim/70 shadow-xl shadow-navy/5 p-4 sm:p-6 md:p-8 overflow-hidden">
            {/* Top Technical Badges */}
            <div className="flex items-center justify-between gap-3 mb-4 sm:mb-6">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-alt text-[10px] md:text-[11px] font-bold font-mono tracking-wider text-navy uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-corridor animate-pulse" />
                  MODEL VIEW
                </span>
                <span className="text-[10px] md:text-[11px] font-mono font-medium text-muted">
                  0{currentIndex + 1} / 0{cadViews.length} PERSPECTIVES
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono text-muted/70 bg-surface px-2.5 py-1 rounded-md border border-surface-dim">
                  Use ← → keys
                </span>
                <span className="text-[11px] font-mono font-bold text-corridor bg-corridor-light/40 border border-corridor/20 px-2.5 py-1 rounded-md">
                  {currentView.code}
                </span>
              </div>
            </div>

            {/* CAD Image Canvas Area */}
            <div className="relative flex items-center justify-center bg-surface/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 min-h-[280px] sm:min-h-[380px] md:min-h-[460px] lg:min-h-[500px]">
              {/* Previous View Arrow Button */}
              <button
                type="button"
                onClick={prevView}
                className="absolute left-2 sm:left-4 md:left-6 top-1/2 -translate-y-1/2 z-10 min-w-[44px] min-h-[44px] w-11 h-11 md:w-12 md:h-12 rounded-full bg-white/95 hover:bg-white text-navy hover:text-corridor shadow-md hover:shadow-lg border border-surface-dim flex items-center justify-center transition-all duration-200 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-corridor"
                aria-label="Previous CAD view"
              >
                <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
              </button>

              {/* Next View Arrow Button */}
              <button
                type="button"
                onClick={nextView}
                className="absolute right-2 sm:right-4 md:right-6 top-1/2 -translate-y-1/2 z-10 min-w-[44px] min-h-[44px] w-11 h-11 md:w-12 md:h-12 rounded-full bg-white/95 hover:bg-white text-navy hover:text-corridor shadow-md hover:shadow-lg border border-surface-dim flex items-center justify-center transition-all duration-200 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-corridor"
                aria-label="Next CAD view"
              >
                <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
              </button>

              {/* Main CAD Model Image Container */}
              <div className="w-full flex items-center justify-center overflow-hidden">
                <img
                  key={animKey}
                  src={currentView.image}
                  alt={currentView.alt}
                  className="cad-image-fade max-w-full max-h-[260px] sm:max-h-[340px] md:max-h-[440px] lg:max-h-[480px] w-auto h-auto object-contain mx-auto select-none pointer-events-none drop-shadow-sm"
                  loading="eager"
                />
              </div>
            </div>

            {/* View Label & Technical Description */}
            <div className="text-center mt-6">
              <div className="inline-flex items-center justify-center gap-2 mb-1">
                <h3 className="text-[17px] sm:text-[20px] md:text-[22px] font-extrabold uppercase tracking-wider text-navy">
                  {currentView.label}
                </h3>
              </div>
              <p className="text-[13px] md:text-[14px] text-muted max-w-lg mx-auto">
                {currentView.desc}
              </p>
            </div>

            {/* View Indicators (Dots) */}
            <div
              className="flex items-center justify-center gap-2 mt-4"
              role="tablist"
              aria-label="CAD model view selector"
            >
              {cadViews.map((v, i) => {
                const isActive = i === currentIndex;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => selectView(i)}
                    className={`h-2.5 rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-corridor ${
                      isActive
                        ? 'w-8 bg-corridor shadow-sm shadow-corridor/30'
                        : 'w-2.5 bg-surface-dim hover:bg-muted/40'
                    }`}
                    aria-label={`View ${i + 1}: ${v.label}`}
                    aria-selected={isActive}
                    role="tab"
                  />
                );
              })}
            </div>

            {/* Interactive Thumbnail Strip */}
            <div className="mt-8 pt-6 border-t border-surface-dim/60">
              <div className="flex items-center justify-start sm:justify-center gap-2 sm:gap-3 overflow-x-auto pb-2 px-1 scrollbar-none">
                {cadViews.map((v, i) => {
                  const isActive = i === currentIndex;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => selectView(i)}
                      className={`group flex items-center gap-2 px-3 py-2 rounded-xl text-left transition-all duration-200 shrink-0 border ${
                        isActive
                          ? 'bg-corridor-light/20 border-corridor shadow-sm ring-1 ring-corridor/30'
                          : 'bg-white hover:bg-surface border-surface-dim hover:border-outline-variant/50'
                      }`}
                      aria-label={`Select ${v.label}`}
                    >
                      <div className="w-10 h-7 rounded overflow-hidden bg-surface-alt flex items-center justify-center shrink-0 border border-surface-dim/80">
                        <img
                          src={v.image}
                          alt=""
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span
                          className={`text-[12px] font-bold leading-tight ${
                            isActive ? 'text-corridor-dark font-extrabold' : 'text-navy'
                          }`}
                        >
                          {v.shortLabel}
                        </span>
                        <span className="text-[10px] font-mono text-muted">
                          {v.code}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </ScrollFade>
      </div>
    </section>
  );
}

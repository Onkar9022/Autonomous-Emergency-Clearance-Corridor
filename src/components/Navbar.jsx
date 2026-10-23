import { useState, useEffect, useRef } from 'react';
import { Menu, X, ArrowRight, Activity } from 'lucide-react';
import aeccLogo from '../assets/logo.png';

const primaryLinks = [
  { label: 'Overview', href: '#hero' },
  { label: '3 Units', href: '#three-units' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Operations Console', href: '#console/dashboard' },
  { label: 'Live Dashboard', href: '#dashboard' },
  { label: 'Simulation', href: '#simulation' },
];

const secondaryLinks = [
  { label: 'AI Routing', href: '#ai-engine' },
  { label: 'Safety & Architecture', href: '#safety' },
  { label: 'Impact', href: '#impact' },
  { label: 'Team', href: '#team' },
];

const allLinks = [...primaryLinks, ...secondaryLinks];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close "More" dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1280) setMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-[0_4px_12px_-2px_rgba(16,42,67,0.06)] border-b border-surface-alt'
          : 'bg-white border-b border-transparent'
      }`}
    >
      <div className="h-[64px] w-full max-w-[1360px] mx-auto px-6 lg:px-12 xl:px-16 flex items-center justify-between">
        {/* ─── Logo Area ─── */}
        <a href="#hero" className="flex items-center gap-3 shrink-0 mr-6 lg:mr-10">
          <img
            src={aeccLogo}
            alt="AECC"
            className="h-10 lg:h-11 w-auto object-contain"
          />
          <div className="hidden sm:flex flex-col">
            <span className="text-[20px] lg:text-[22px] font-extrabold text-navy tracking-tight leading-none">
              AECC
            </span>
            <span className="text-[10px] font-bold text-corridor uppercase tracking-[0.14em] leading-none mt-0.5">
              Emergency Corridor
            </span>
          </div>
        </a>

        {/* ─── Desktop Navigation ─── */}
        <nav className="hidden xl:flex items-center gap-1 flex-1 justify-center">
          {primaryLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="px-3 py-1.5 text-[13px] font-semibold text-muted hover:text-navy hover:bg-ivory rounded-lg transition-all whitespace-nowrap"
            >
              {link.label}
            </a>
          ))}

          {/* More Dropdown for secondary links */}
          <div ref={moreRef} className="relative">
            <button
              onClick={() => setMoreOpen(!moreOpen)}
              className={`px-3 py-1.5 text-[13px] font-semibold rounded-lg transition-all whitespace-nowrap flex items-center gap-1 ${
                moreOpen ? 'text-navy bg-ivory' : 'text-muted hover:text-navy hover:bg-ivory'
              }`}
            >
              More
              <svg
                className={`w-3.5 h-3.5 transition-transform duration-200 ${moreOpen ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {moreOpen && (
              <div className="absolute top-full left-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-surface-alt py-2 z-50">
                {secondaryLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMoreOpen(false)}
                    className="block px-4 py-2.5 text-[13px] font-semibold text-muted hover:text-navy hover:bg-ivory transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* ─── 2XL: Show ALL links inline (no More) ─── */}
        <nav className="hidden 2xl:!flex xl:!hidden items-center gap-1 flex-1 justify-center">
          {allLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="px-3 py-1.5 text-[13px] font-semibold text-muted hover:text-navy hover:bg-ivory rounded-lg transition-all whitespace-nowrap"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* ─── Right Actions ─── */}
        <div className="flex items-center gap-3 shrink-0 ml-6 lg:ml-10">
          {/* Status Badge */}
          <div className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-corridor-light/30 border border-corridor/20">
            <Activity className="w-3 h-3 text-corridor animate-pulse" />
            <span className="text-[11px] font-bold text-corridor-dark tracking-wide">Corridor Ready</span>
          </div>

          {/* CTA */}
          <a
            href="#console/dashboard"
            className="hidden sm:inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-corridor text-white text-[13px] font-bold hover:bg-corridor-dark transition-all shadow-[0_2px_8px_rgba(34,160,107,0.25)] active:translate-y-px whitespace-nowrap"
          >
            Operations Console
            <ArrowRight className="w-4 h-4" />
          </a>

          {/* Mobile Hamburger */}
          <button
            className="xl:hidden flex items-center justify-center w-10 h-10 rounded-lg hover:bg-ivory transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <X className="w-5 h-5 text-navy" />
            ) : (
              <Menu className="w-5 h-5 text-navy" />
            )}
          </button>
        </div>
      </div>

      {/* ─── Mobile Menu Overlay ─── */}
      <div
        className={`xl:hidden fixed inset-0 top-[64px] z-40 transition-all duration-300 ${
          menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-navy/20 backdrop-blur-sm"
          onClick={() => setMenuOpen(false)}
        />

        {/* Panel */}
        <div
          className={`absolute top-0 right-0 w-full max-w-sm h-full bg-white shadow-2xl transform transition-transform duration-300 ${
            menuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex flex-col h-full">
            <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
              {allLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 text-[15px] font-semibold text-navy py-3 px-4 rounded-xl hover:bg-ivory transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* Mobile Bottom Actions */}
            <div className="px-4 pb-8 pt-4 border-t border-surface-alt space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-corridor-light/30">
                <Activity className="w-3 h-3 text-corridor animate-pulse" />
                <span className="text-[11px] font-bold text-corridor-dark tracking-wide">Corridor Ready</span>
              </div>
              <a
                href="#simulation"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl bg-corridor text-white text-[14px] font-bold shadow-md hover:bg-corridor-dark transition-all"
              >
                Launch Simulation
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

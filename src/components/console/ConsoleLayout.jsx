// AECC Operations Console — Master Layout
// Section 4 & 5 of Functional Specification

import React, { useState, useEffect } from 'react';
import { useAECC } from '../../context/AECCContext';
import {
  LayoutDashboard,
  MapPin,
  PlusCircle,
  Route,
  Building2,
  Zap,
  Radio,
  Ambulance,
  BrainCircuit,
  History,
  BarChart3,
  Activity,
  Settings,
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  Bell,
  ShieldAlert,
  User,
  ChevronDown,
  Menu,
  X,
} from 'lucide-react';

export const CONSOLE_NAV_ITEMS = [
  { id: 'dashboard', label: 'Overview Dashboard', icon: LayoutDashboard },
  { id: 'map', label: 'Live Emergency Map', icon: MapPin },
  { id: 'create', label: 'Create Emergency', icon: PlusCircle },
  { id: 'routes', label: 'Route Optimization', icon: Route },
  { id: 'hospitals', label: 'Nearby Hospitals', icon: Building2 },
  { id: 'corridor', label: 'Green Corridor Control', icon: Zap },
  { id: 'signals', label: 'Traffic Signal Network', icon: Radio },
  { id: 'fleet', label: 'Ambulance Fleet', icon: Ambulance },
  { id: 'ai-traffic', label: 'AI Traffic Intelligence', icon: BrainCircuit },
  { id: 'history', label: 'Incident History', icon: History },
  { id: 'analytics', label: 'Analytics & Reports', icon: BarChart3 },
  { id: 'health', label: 'System Health', icon: Activity },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function ConsoleLayout({ currentView, onViewChange, onExitConsole, children }) {
  const {
    operatingMode,
    userRole,
    setUserRole,
    currentUser,
    backendOnline,
    dataSourceLabel,
    switchRole,
    events,
    startLiveDemonstration,
    simStatus,
    pauseSimulation,
    resumeSimulation,
    resetSimulation,
    simSpeed,
    setSimSpeed,
    activeIncident,
  } = useAECC();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [roleSelectOpen, setRoleSelectOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  // Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex h-screen w-full bg-ivory text-navy-light overflow-hidden font-sans">
      {/* ── Left Sidebar (Desktop) ── */}
      <aside className="hidden lg:flex flex-col w-64 bg-navy border-r border-[#1B3A57] shrink-0 select-none text-white shadow-lg z-30">
        {/* Brand Header */}
        <div className="p-4 border-b border-[#1B3A57]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-corridor flex items-center justify-center text-white font-black text-sm shadow-md shadow-corridor/30">
              A
            </div>
            <div>
              <div className="font-extrabold text-sm tracking-wider text-white">AECC SYSTEM</div>
              <div className="text-[10px] font-semibold text-teal-300">Team Sanjivani</div>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#0D2236] border border-white/10 text-[10px] font-mono">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className={`w-2 h-2 rounded-full ${backendOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              {backendOnline ? 'POSTGRES: ONLINE' : 'SANDBOX: ACTIVE'}
            </span>
            <span className="text-corridor font-bold">{operatingMode}</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-none">
          {CONSOLE_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-corridor text-white shadow-md shadow-corridor/25 font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
                {item.id === 'create' && activeIncident && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-coral animate-ping" />
                )}
              </button>
            );
          })}
        </nav>

        {/* User Role Switcher & Back to Landing */}
        <div className="p-3 border-t border-[#1B3A57] space-y-2">
          {/* Role selector dropdown */}
          <div className="relative">
            <button
              onClick={() => setRoleSelectOpen(!roleSelectOpen)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-[#0D2236] border border-white/10 text-[11px] text-slate-200 hover:border-teal-400/50 transition-colors"
            >
              <div className="flex items-center gap-2 truncate">
                <User className="w-3.5 h-3.5 text-teal-300" />
                <span className="truncate font-semibold">{userRole}</span>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
            </button>

            {roleSelectOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-1.5 p-1 rounded-xl bg-[#0D2236] border border-[#1B3A57] shadow-xl text-xs space-y-1 z-50 animate-in fade-in slide-in-from-bottom-2">
                {['Administrator', 'Emergency Operator', 'Read-Only Observer'].map((role) => (
                  <button
                    key={role}
                    onClick={() => {
                      switchRole(role);
                      setRoleSelectOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] transition-colors ${
                      userRole === role ? 'bg-teal/20 text-teal-300 font-bold' : 'text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={onExitConsole}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-[#0D2236] hover:bg-[#15344F] text-xs font-bold text-slate-200 border border-white/10 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Public Website</span>
          </button>
        </div>
      </aside>

      {/* ── Mobile Sidebar Drawer ── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-navy/80 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative w-72 bg-navy border-r border-[#1B3A57] flex flex-col p-4 z-10 text-white shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#1B3A57]">
              <span className="font-extrabold text-white text-sm">AECC Operations Console</span>
              <button onClick={() => setMobileMenuOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto py-3 space-y-1">
              {CONSOLE_NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onViewChange(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold ${
                      isActive ? 'bg-corridor text-white font-bold' : 'text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
            <button
              onClick={onExitConsole}
              className="mt-auto w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-[#0D2236] text-xs text-white border border-white/10"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Exit to Public Website</span>
            </button>
          </div>
        </div>
      )}

      {/* ── Main Content Area ── */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-16 px-4 md:px-6 bg-white/95 backdrop-blur-md border-b border-surface-dim shadow-xs flex items-center justify-between shrink-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg bg-surface-alt hover:bg-surface-dim text-navy"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xs sm:text-base font-extrabold text-navy flex items-center gap-2">
                <span className="hidden sm:inline">Autonomous Emergency Corridor Creator System</span>
                <span className="sm:hidden font-extrabold tracking-wider">AECC CONSOLE</span>
                <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded-full bg-corridor/15 text-corridor font-bold border border-corridor/30">
                  SOLAPUR OPS
                </span>
              </h1>
              <div className="text-[11px] text-muted font-mono hidden md:block">
                Clock: {currentTime} • {dataSourceLabel}
              </div>
            </div>
          </div>

          {/* Quick Simulation & Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Start Live Demonstration Button */}
            <button
              onClick={startLiveDemonstration}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-coral hover:bg-coral-dark text-white text-xs font-extrabold shadow-md shadow-coral/20 transition-all active:scale-95 animate-pulse"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span className="hidden sm:inline">START LIVE DEMO</span>
              <span className="sm:hidden">DEMO</span>
            </button>

            {/* Simulation Controls when active */}
            {simStatus === 'running' && (
              <button
                onClick={pauseSimulation}
                className="p-2 rounded-xl bg-amber-500/15 text-amber-700 border border-amber-500/40 text-xs font-bold hover:bg-amber-500/25 transition-colors"
                title="Pause Simulation"
              >
                <Pause className="w-4 h-4" />
              </button>
            )}
            {simStatus === 'paused' && (
              <button
                onClick={resumeSimulation}
                className="p-2 rounded-xl bg-emerald-500/15 text-emerald-700 border border-emerald-500/40 text-xs font-bold hover:bg-emerald-500/25 transition-colors"
                title="Resume Simulation"
              >
                <Play className="w-4 h-4" />
              </button>
            )}
            {simStatus !== 'idle' && (
              <button
                onClick={resetSimulation}
                className="p-2 rounded-xl bg-surface-alt hover:bg-surface-dim text-navy border border-surface-dim text-xs font-bold transition-colors"
                title="Reset Scenario"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}

            {/* Sim Speed Toggles */}
            <div className="hidden sm:flex items-center rounded-lg bg-surface-alt p-0.5 border border-surface-dim text-[11px] font-mono">
              {[1, 2, 5].map((spd) => (
                <button
                  key={spd}
                  onClick={() => setSimSpeed(spd)}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    simSpeed === spd ? 'bg-corridor text-white font-bold' : 'text-muted hover:text-navy'
                  }`}
                >
                  {spd}×
                </button>
              ))}
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 rounded-xl bg-surface-alt hover:bg-surface-dim text-navy border border-surface-dim transition-colors"
                title="System Notifications"
              >
                <Bell className="w-4 h-4" />
                {events.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-coral text-[9px] font-bold text-white flex items-center justify-center">
                    {Math.min(9, events.length)}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown Drawer */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-surface-dim rounded-2xl shadow-2xl p-4 z-50 text-xs text-navy-light animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between pb-2 border-b border-surface-dim">
                    <span className="font-extrabold text-navy">Live Event Log ({events.length})</span>
                    <button onClick={() => setNotificationsOpen(false)} className="text-muted hover:text-navy text-xs font-semibold">
                      Close
                    </button>
                  </div>
                  <div className="mt-2 max-h-80 overflow-y-auto space-y-2 scrollbar-none">
                    {events.map((evt) => (
                      <div key={evt.id} className="p-2.5 rounded-xl bg-surface border border-surface-dim">
                        <div className="flex items-center justify-between text-[10px] text-muted font-mono">
                          <span className="font-bold text-teal uppercase">{evt.category}</span>
                          <span>{evt.timestamp}</span>
                        </div>
                        <p className="mt-1 text-navy-light text-xs leading-relaxed font-medium">{evt.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-ivory p-4 md:p-6 scrollbar-none">
          {children}
        </main>
      </div>
    </div>
  );
}

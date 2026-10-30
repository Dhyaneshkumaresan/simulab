import React from 'react';
import {
  Zap,
  Sparkles,
  Volume2,
  VolumeX,
  Moon,
  Sun,
  Layers,
  HelpCircle,
} from 'lucide-react';

interface NavbarProps {
  currentSection: string;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
  onOpenAI: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentSection,
  darkMode,
  setDarkMode,
  soundEnabled,
  setSoundEnabled,
  onOpenAI,
}) => {
  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between shrink-0 z-30 select-none">
      {/* Brand & Tagline */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
          <Zap className="w-5 h-5 fill-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-extrabold tracking-tight text-white">
              ECE SIMULAB
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-bold">
              v2.0 PRO
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">
            Design Circuits. Simulate Reality. Understand Electronics.
          </p>
        </div>
      </div>

      {/* Center status badge */}
      <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-xs text-slate-300">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="font-mono text-[11px]">
          Numerical MNA Engine • High-Speed Transient Solver
        </span>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onOpenAI}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 hover:from-cyan-500/30 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Ask Gemini AI</span>
        </button>

        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          title={soundEnabled ? 'Mute Sound Effects' : 'Enable Laboratory Sounds'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4" />}
        </button>

        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          title="Toggle Dark Navy / Light Theme"
        >
          {darkMode ? <Moon className="w-4 h-4 text-cyan-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
        </button>
      </div>
    </header>
  );
};

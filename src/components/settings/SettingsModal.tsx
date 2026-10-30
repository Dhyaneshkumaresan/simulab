import React from 'react';
import {
  Settings as SettingsIcon,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Sliders,
  Grid,
  Zap,
  CheckCircle,
  Info,
} from 'lucide-react';

interface SettingsModalProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
  gridSize: number;
  setGridSize: (val: number) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  darkMode,
  setDarkMode,
  soundEnabled,
  setSoundEnabled,
  gridSize,
  setGridSize,
}) => {
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-950 text-slate-100 overflow-hidden select-none p-6">
      <div className="max-w-3xl mx-auto w-full space-y-6">
        <div className="border-b border-slate-800 pb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
            <SettingsIcon className="w-6 h-6 text-cyan-400" />
            Platform &amp; Simulation Workbench Settings
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure laboratory environment, visual appearance, simulation engines, and audio effects.
          </p>
        </div>

        {/* Visual Appearance & Theme */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
            <Moon className="w-4 h-4" />
            Workbench Visual Theme
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div
              onClick={() => setDarkMode(true)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                darkMode
                  ? 'bg-cyan-950/40 border-cyan-400 shadow-lg shadow-cyan-500/10'
                  : 'bg-slate-950 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-xs text-white mb-1">
                <Moon className="w-4 h-4 text-cyan-400" />
                Dark Navy &amp; Charcoal Laboratory (Recommended)
              </div>
              <p className="text-[11px] text-slate-400">
                High contrast engineering dark room mode with electric cyan accents and phosphor glow.
              </p>
            </div>

            <div
              onClick={() => setDarkMode(false)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                !darkMode
                  ? 'bg-cyan-950/40 border-cyan-400 shadow-lg shadow-cyan-500/10'
                  : 'bg-slate-950 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-xs text-white mb-1">
                <Sun className="w-4 h-4 text-amber-400" />
                Light Laboratory Paper Mode
              </div>
              <p className="text-[11px] text-slate-400">
                Clean daylight contrast suited for academic lecture presentations and document printing.
              </p>
            </div>
          </div>
        </div>

        {/* Simulation Precision & Grid Snapping */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
            <Grid className="w-4 h-4" />
            Schematic Grid &amp; Solvers
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1">
                Grid Snapping Resolution
              </label>
              <select
                value={gridSize}
                onChange={(e) => setGridSize(parseInt(e.target.value, 10))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-cyan-300 font-medium focus:outline-none focus:border-cyan-500"
              >
                <option value={10}>10 px (Fine Alignment)</option>
                <option value={20}>20 px (Standard IEEE Standard)</option>
                <option value={40}>40 px (Coarse)</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">
                MNA Matrix Convergence Tolerance
              </label>
              <select className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-cyan-300 font-medium focus:outline-none focus:border-cyan-500">
                <option>1e-6 (Standard 64-bit Float)</option>
                <option>1e-9 (High Precision Newton-Raphson)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Audio Effects */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-cyan-400">
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5 text-slate-600" />}
            </div>
            <div>
              <div className="text-xs font-bold text-white">Laboratory Audio Effects</div>
              <p className="text-[11px] text-slate-400">
                Play simulated relay clicks, rotary clicks, and DMM continuity buzzer tone.
              </p>
            </div>
          </div>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              soundEnabled
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            {soundEnabled ? 'ENABLED' : 'MUTED'}
          </button>
        </div>

        {/* System & Architecture Info */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 text-xs text-slate-400 space-y-2">
          <div className="flex items-center gap-1.5 text-cyan-400 font-semibold">
            <Info className="w-4 h-4" />
            <span>Platform Architecture</span>
          </div>
          <p>
            <strong>ECE SIMULAB v2.0 Enterprise</strong> is an integrated circuit engineering environment designed for Electronics and Communication Engineering departments. It pairs client-side numerical solvers (Modified Nodal Analysis, discrete digital logic, virtual microcontroller simulation) with Google Gemini AI for pedagogical guidance and schema validation.
          </p>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import {
  Zap,
  Activity,
  Binary,
  Cpu,
  Gauge,
  Sparkles,
  BookOpen,
  FolderGit2,
  Plus,
  ArrowRight,
  TrendingUp,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { EXPERIMENTS_DATABASE } from '../../data/experimentsData';
import { CircuitData } from '../../types/circuit';

interface DashboardProps {
  onNavigate: (section: string) => void;
  onOpenExperiment: (expId: string) => void;
  onOpenProject: (proj: CircuitData) => void;
  onStartNewCircuit: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onNavigate,
  onOpenExperiment,
  onOpenProject,
  onStartNewCircuit,
}) => {
  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 text-slate-100 p-8 select-none">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Hero Welcome Banner */}
        <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-slate-800 p-8 shadow-2xl overflow-hidden">
          {/* Subtle decorative glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              ECE SIMULAB v2.0 • Intelligent Electronics Workbench
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Design Circuits. Simulate Reality.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                Understand Electronics.
              </span>
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
              An engineering-grade laboratory workbench specially built for ECE students, teachers, and electronics designers. Conduct verified analog, digital, and embedded system experiments with real-time waveform analysis and AI tutoring.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onStartNewCircuit}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Start New Circuit</span>
              </button>

              <button
                onClick={() => onNavigate('analog')}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs rounded-xl transition-all cursor-pointer"
              >
                <Activity className="w-4 h-4 text-cyan-400" />
                <span>Analog Lab</span>
              </button>

              <button
                onClick={() => onNavigate('digital')}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs rounded-xl transition-all cursor-pointer"
              >
                <Binary className="w-4 h-4 text-cyan-400" />
                <span>Digital Lab</span>
              </button>

              <button
                onClick={() => onNavigate('embedded')}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs rounded-xl transition-all cursor-pointer"
              >
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span>Embedded MCU Lab</span>
              </button>
            </div>
          </div>
        </div>

        {/* Real-Time Platform Simulation Telemetry Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                MNA Solver Engine
              </span>
              <Activity className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-white">64-Bit Float</div>
            <span className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3 h-3" /> Matrix Convergence 100%
            </span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Component Library
              </span>
              <Layers className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-cyan-300">32+ Models</div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Passive, Active, TTL &amp; MCU
            </span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Syllabus Experiments
              </span>
              <BookOpen className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-amber-300">
              {EXPERIMENTS_DATABASE.length} Labs
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              With Observation &amp; Viva Voce
            </span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                AI Engineering Assistant
              </span>
              <Sparkles className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-cyan-300">Gemini 3.8</div>
            <span className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1">
              ● Server-Side Grounded
            </span>
          </div>
        </div>

        {/* Quick Access Labs Cards */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            Core Laboratory Environments
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Analog Electronics */}
            <div
              onClick={() => onNavigate('analog')}
              className="bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-6 shadow-xl cursor-pointer group transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-110 transition-transform">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors mb-2">
                Analog Electronics Lab
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Verify Ohm's law, RC/RL transients, RLC resonance, diode IV characteristics, Zener regulation, and BJT CE amplifier frequency responses with Plotly waveforms.
              </p>
              <div className="flex items-center gap-1 text-xs font-semibold text-cyan-400">
                <span>Enter Analog Workbench</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Digital Electronics */}
            <div
              onClick={() => onNavigate('digital')}
              className="bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-6 shadow-xl cursor-pointer group transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-4 group-hover:scale-110 transition-transform">
                <Binary className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors mb-2">
                Digital Electronics Lab
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Universal logic gates, interactive toggle switches, glowing LED indicators, adders, multiplexers, flip-flops, 4-bit counters, and interactive K-Map simplification.
              </p>
              <div className="flex items-center gap-1 text-xs font-semibold text-cyan-400">
                <span>Enter Digital Logic Workbench</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Embedded Systems */}
            <div
              onClick={() => onNavigate('embedded')}
              className="bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-6 shadow-xl cursor-pointer group transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors mb-2">
                Embedded Microcontroller Lab
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Virtual Arduino Uno &amp; ESP32 MCU boards with GPIO, ADC potentiometer reading, PWM LED fading, 7-segment counting, 16x2 I2C LCD, and live Serial Monitor.
              </p>
              <div className="flex items-center gap-1 text-xs font-semibold text-cyan-400">
                <span>Enter Embedded Workbench</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>

        {/* Featured Curriculum Experiments */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              Recommended ECE Laboratory Experiments
            </h2>
            <button
              onClick={() => onNavigate('experiments')}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <span>View All Experiments</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {EXPERIMENTS_DATABASE.slice(0, 3).map((exp, idx) => (
              <div
                key={exp.id}
                onClick={() => onOpenExperiment(exp.id)}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 cursor-pointer group transition-all"
              >
                <div className="text-[10px] font-mono text-cyan-400 uppercase font-semibold mb-1">
                  EXPERIMENT #{idx + 1} • {exp.category.toUpperCase().replace('_', ' ')}
                </div>
                <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors mb-2">
                  {exp.title}
                </h4>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {exp.aim}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Virtual Instruments Rack & AI Shortcut */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            onClick={() => onNavigate('instruments')}
            className="bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 hover:border-cyan-500/40 rounded-2xl p-6 shadow-xl cursor-pointer group transition-all"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <Gauge className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base group-hover:text-cyan-300">
                  Virtual Instruments Rack
                </h3>
                <span className="text-xs text-slate-400">
                  Dual-Trace DSO, DDS Function Generator, True-RMS DMM, DC Power Supply
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Real-time oscilloscope visualization with Lissajous X-Y mode, frequency sweep generator, continuity buzzer, and dual constant-voltage power outputs.
            </p>
            <div className="flex items-center gap-1 text-xs font-semibold text-cyan-400">
              <span>Launch Virtual Instruments Rack</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          <div
            onClick={() => onNavigate('ai_assistant')}
            className="bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 hover:border-cyan-500/40 rounded-2xl p-6 shadow-xl cursor-pointer group transition-all"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base group-hover:text-cyan-300">
                  AI Circuit Assistant &amp; Tutor
                </h3>
                <span className="text-xs text-slate-400">
                  Powered by Google Gemini 3.8 Flash
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Instant circuit fault troubleshooting, component sizing formulas (R, L, C, beta), mathematical derivations, and oral viva voce practice.
            </p>
            <div className="flex items-center gap-1 text-xs font-semibold text-cyan-400">
              <span>Open AI Assistant</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  FolderGit2,
  Plus,
  Play,
  Copy,
  Trash2,
  Download,
  Upload,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import { CircuitData } from '../../types/circuit';

interface MyProjectsProps {
  onOpenCircuit: (circuit: CircuitData) => void;
  onNewCircuit: () => void;
}

const TEMPLATE_PROJECTS: CircuitData[] = [
  {
    id: 'tmpl_ce_amp',
    name: 'BJT CE Audio Amplifier',
    description: 'Voltage divider biased common emitter stage with 180° phase inversion and 38 dB gain.',
    components: [
      { id: 'q1', type: 'bjt_npn', label: '2N2222', x: 280, y: 160, rotation: 0, values: { beta: 150 } },
      { id: 'rc', type: 'resistor', label: 'Rc', x: 340, y: 70, rotation: 90, values: { resistance: 2200 } },
      { id: 're', type: 'resistor', label: 'Re', x: 340, y: 260, rotation: 90, values: { resistance: 470 } },
      { id: 'r1', type: 'resistor', label: 'R1', x: 200, y: 70, rotation: 90, values: { resistance: 47000 } },
      { id: 'r2', type: 'resistor', label: 'R2', x: 200, y: 260, rotation: 90, values: { resistance: 10000 } },
      { id: 'vcc', type: 'dc_source', label: '12V Vcc', x: 80, y: 70, rotation: 0, values: { voltage: 12 } },
      { id: 'gnd', type: 'ground', label: 'GND', x: 200, y: 360, rotation: 0, values: {} },
    ],
    wires: [],
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 86400000,
  },
  {
    id: 'tmpl_rectifier',
    name: 'Full-Wave Bridge Rectifier with Filter',
    description: 'AC mains transformer input rectified through 4-diode bridge and smoothed with 470µF reservoir capacitor.',
    components: [
      { id: 'ac1', type: 'ac_source', label: '12V~ RMS', x: 100, y: 160, rotation: 0, values: { amplitude: 12, frequency: 50 } },
      { id: 'd1', type: 'diode', label: '1N4007', x: 260, y: 120, rotation: 0, values: { forwardVoltage: 0.7 } },
      { id: 'c1', type: 'capacitor', label: '470µF', x: 420, y: 160, rotation: 90, values: { capacitance: 470 } },
      { id: 'rl', type: 'resistor', label: 'RL 1kΩ', x: 540, y: 160, rotation: 90, values: { resistance: 1000 } },
      { id: 'gnd', type: 'ground', label: 'GND', x: 300, y: 300, rotation: 0, values: {} },
    ],
    wires: [],
    createdAt: Date.now() - 86400000 * 5,
    updatedAt: Date.now() - 86400000 * 3,
  },
  {
    id: 'tmpl_counter',
    name: '4-Bit Ripple Counter & Display',
    description: 'Asynchronous binary counter counting 0 to 15 clocked by 1Hz pulse source.',
    components: [
      { id: 'clk1', type: 'pulse_source', label: 'Clock 1Hz', x: 100, y: 160, rotation: 0, values: { frequency: 1 } },
      { id: 'cnt1', type: 'ripple_counter_4bit', label: '7493 Counter', x: 300, y: 160, rotation: 0, values: {} },
    ],
    wires: [],
    createdAt: Date.now() - 86400000 * 7,
    updatedAt: Date.now() - 86400000 * 4,
  },
];

export const MyProjects: React.FC<MyProjectsProps> = ({ onOpenCircuit, onNewCircuit }) => {
  const [projects, setProjects] = useState<CircuitData[]>(() => {
    try {
      const saved = localStorage.getItem('ece_simulab_projects');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return TEMPLATE_PROJECTS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('ece_simulab_projects', JSON.stringify(projects));
    } catch (e) {}
  }, [projects]);

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      setProjects((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const handleDuplicate = (project: CircuitData) => {
    const dup: CircuitData = {
      ...project,
      id: `proj_${Date.now()}`,
      name: `${project.name} (Copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setProjects([dup, ...projects]);
  };

  const handleExport = (project: CircuitData) => {
    const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name.toLowerCase().replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-950 text-slate-100 overflow-hidden select-none">
      {/* Top Bar */}
      <div className="h-14 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <FolderGit2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              My Circuit Projects &amp; Templates
              <span className="text-[11px] font-normal px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                {projects.length} Saved Designs
              </span>
            </h2>
          </div>
        </div>

        <button
          onClick={onNewCircuit}
          className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-white font-semibold text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Blank Circuit</span>
        </button>
      </div>

      {/* Grid of Projects */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {projects.map((proj) => (
            <div
              key={proj.id}
              className="bg-slate-900 border border-slate-800 hover:border-cyan-500/40 rounded-2xl p-5 shadow-xl flex flex-col justify-between group transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-cyan-400">
                      <Layers className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-mono text-slate-400">
                      {proj.components.length} Components
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(proj.updatedAt).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors mb-2">
                  {proj.name}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                  {proj.description || 'Custom circuit schematic built on ECE SIMULAB platform.'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
                <button
                  onClick={() => onOpenCircuit(proj)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-cyan-400" />
                  <span>Open CAD</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleDuplicate(proj)}
                    className="p-1.5 text-slate-400 hover:text-cyan-300 rounded hover:bg-slate-800 transition-colors"
                    title="Duplicate Project"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleExport(proj)}
                    className="p-1.5 text-slate-400 hover:text-cyan-300 rounded hover:bg-slate-800 transition-colors"
                    title="Export JSON"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(proj.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800 transition-colors"
                    title="Delete Project"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

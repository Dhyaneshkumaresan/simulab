import React, { useState, useEffect, useRef } from 'react';
import {
  Binary,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Table,
  Grid,
  Activity,
  CheckCircle2,
  Clock,
  Layers,
} from 'lucide-react';
import {
  evaluateDigitalSubcircuit,
  generateTruthTable,
  solveKMap,
  KMapResult,
} from '../../simulation/digitalEngine';
import { TruthTableRow } from '../../types/circuit';

interface DigitalLabProps {
  onAskAI?: (topic: string, details?: any) => void;
}

const DIGITAL_CIRCUITS = [
  { id: 'half_adder', name: 'Half Adder (Sum & Carry)', inputs: ['a', 'b'], category: 'Arithmetic' },
  { id: 'full_adder', name: 'Full Adder (Sum & Carry Out)', inputs: ['a', 'b', 'cin'], category: 'Arithmetic' },
  { id: 'half_subtractor', name: 'Half Subtractor (Diff & Borrow)', inputs: ['a', 'b'], category: 'Arithmetic' },
  { id: 'full_subtractor', name: 'Full Subtractor', inputs: ['a', 'b', 'bin'], category: 'Arithmetic' },
  { id: 'mux_4to1', name: '4:1 Multiplexer (Data Selector)', inputs: ['d0', 'd1', 'd2', 'd3', 's0', 's1'], category: 'Combinational' },
  { id: 'demux_1to4', name: '1:4 Demultiplexer', inputs: ['din', 's0', 's1'], category: 'Combinational' },
  { id: 'jk_flipflop', name: 'JK Flip-Flop (with Toggle)', inputs: ['j', 'k', 'clk'], category: 'Sequential' },
  { id: 'd_flipflop', name: 'D Flip-Flop (Data Latch)', inputs: ['d', 'clk'], category: 'Sequential' },
  { id: 't_flipflop', name: 'T Flip-Flop (Toggle / Divider)', inputs: ['t', 'clk'], category: 'Sequential' },
  { id: 'ripple_counter_4bit', name: '4-Bit Binary Ripple Counter (MOD-16)', inputs: ['clk', 'reset'], category: 'Counters' },
  { id: 'shift_register_4bit', name: '4-Bit SIPO Shift Register', inputs: ['sin', 'clk', 'reset'], category: 'Registers' },
];

const getInitialInputs = (circuitId: string): Record<string, number> => {
  const def = DIGITAL_CIRCUITS.find((c) => c.id === circuitId) || DIGITAL_CIRCUITS[0];
  const inps: Record<string, number> = {};
  def.inputs.forEach((k) => {
    inps[k] = 0;
  });
  if (inps.a !== undefined) inps.a = 1;
  if (inps.cin !== undefined) inps.cin = 1;
  if (inps.d0 !== undefined) inps.d0 = 1;
  if (inps.j !== undefined) inps.j = 1;
  if (inps.d !== undefined) inps.d = 1;
  if (inps.t !== undefined) inps.t = 1;
  return inps;
};

export const DigitalLab: React.FC<DigitalLabProps> = ({ onAskAI }) => {
  const [selectedCircuitId, setSelectedCircuitId] = useState('full_adder');
  const [inputs, setInputs] = useState<Record<string, number>>(() => getInitialInputs('full_adder'));
  const [internalState, setInternalState] = useState<Record<string, any>>({ q: 0, count: 0, prevClk: 0, bits: [0, 0, 0, 0] });
  const [clockRunning, setClockRunning] = useState(false);
  const [clockSpeedHz, setClockSpeedHz] = useState(1);
  const [activeTab, setActiveTab] = useState<'interactive' | 'truth_table' | 'timing' | 'kmap'>('interactive');

  // Timing diagram history
  const [timingHistory, setTimingHistory] = useState<{ clk: number; inputs: Record<string, number>; outputs: Record<string, number> }[]>([]);

  // K-Map state
  const [kmapMinterms, setKmapMinterms] = useState<number[]>([1, 2, 4, 7]);
  const [kmapVars, setKmapVars] = useState<2 | 3 | 4>(3);

  const selectedDef = DIGITAL_CIRCUITS.find((c) => c.id === selectedCircuitId) || DIGITAL_CIRCUITS[0];

  // Evaluate current logic state safely with fallback
  const safeInputs = { ...getInitialInputs(selectedCircuitId), ...inputs };
  const evaluation = evaluateDigitalSubcircuit(selectedCircuitId, safeInputs, internalState);

  const handleCircuitChange = (newCircuitId: string) => {
    const freshInputs = getInitialInputs(newCircuitId);
    setSelectedCircuitId(newCircuitId);
    setInputs(freshInputs);
    setInternalState({ q: 0, count: 0, prevClk: 0, bits: [0, 0, 0, 0] });
    setTimingHistory([]);
    setClockRunning(false);
  };

  // Auto-Clock Generator loop
  useEffect(() => {
    if (!clockRunning) return;
    const intervalMs = 1000 / (clockSpeedHz * 2);

    const timer = setInterval(() => {
      setInputs((prev) => {
        const nextClk = (prev.clk ?? 0) === 1 ? 0 : 1;
        const nextInputs = { ...prev, clk: nextClk };

        // Evaluate and record timing
        const res = evaluateDigitalSubcircuit(selectedCircuitId, nextInputs, internalState);
        setInternalState(res.nextState);
        setTimingHistory((hist) => [
          ...hist.slice(-25),
          { clk: nextClk, inputs: nextInputs, outputs: res.outputs },
        ]);

        return nextInputs;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [clockRunning, clockSpeedHz, selectedCircuitId, internalState]);

  // Toggle single logic switch
  const handleToggleInput = (key: string) => {
    const currentVal = inputs[key] ?? safeInputs[key] ?? 0;
    const nextVal = currentVal === 1 ? 0 : 1;
    const nextInputs = { ...safeInputs, ...inputs, [key]: nextVal };
    setInputs(nextInputs);

    const res = evaluateDigitalSubcircuit(selectedCircuitId, nextInputs, internalState);
    setInternalState(res.nextState);
    setTimingHistory((hist) => [
      ...hist.slice(-25),
      { clk: nextInputs.clk ?? 0, inputs: nextInputs, outputs: res.outputs },
    ]);
  };

  // Clock Pulse (Low -> High -> Low)
  const handleClockPulse = () => {
    // Rising Edge
    const highInputs = { ...safeInputs, ...inputs, clk: 1 };
    setInputs(highInputs);
    const res = evaluateDigitalSubcircuit(selectedCircuitId, highInputs, internalState);
    setInternalState(res.nextState);
    setTimingHistory((hist) => [
      ...hist.slice(-25),
      { clk: 1, inputs: highInputs, outputs: res.outputs },
    ]);

    // Return to Low after 150ms
    setTimeout(() => {
      setInputs((prev) => {
        const lowInputs = { ...prev, clk: 0 };
        const resLow = evaluateDigitalSubcircuit(selectedCircuitId, lowInputs, res.nextState);
        setInternalState(resLow.nextState);
        setTimingHistory((hist) => [
          ...hist.slice(-25),
          { clk: 0, inputs: lowInputs, outputs: resLow.outputs },
        ]);
        return lowInputs;
      });
    }, 150);
  };

  // Truth table calculation
  const truthTable = generateTruthTable(
    selectedCircuitId,
    selectedDef.inputs.filter((i) => i !== 'clk' && i !== 'reset')
  );

  // K-Map computation
  const kmapResult = solveKMap(kmapMinterms, kmapVars);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-950 text-slate-100 overflow-hidden select-none">
      {/* Top Bar */}
      <div className="h-14 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Binary className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              Digital Electronics Laboratory
              <span className="text-[11px] font-normal px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                Discrete Event Logic Solver
              </span>
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedCircuitId}
            onChange={(e) => handleCircuitChange(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-cyan-300 font-medium focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            {DIGITAL_CIRCUITS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.category}: {c.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => onAskAI?.(selectedDef.name, { inputs, outputs: evaluation.outputs })}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 rounded-lg text-xs font-medium transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI Analyze Logic
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Interactive Switches & Clock Control Panel */}
        <div className="w-80 bg-slate-900/90 border-r border-slate-800 p-4 flex flex-col shrink-0 overflow-y-auto space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Logic Inputs (TTL)
            </h3>
            <span className="text-[10px] text-cyan-400 font-mono">HIGH: 5V | LOW: 0V</span>
          </div>

          {/* Interactive Switches */}
          <div className="space-y-2.5">
            {selectedDef.inputs
              .filter((k) => k !== 'clk')
              .map((key) => {
                const isHigh = inputs[key] === 1;
                return (
                  <div
                    key={key}
                    onClick={() => handleToggleInput(key)}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/40 cursor-pointer transition-all"
                  >
                    <div>
                      <span className="text-xs font-semibold uppercase text-slate-200">
                        Input {key.toUpperCase()}
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        State: {isHigh ? 'HIGH (1)' : 'LOW (0)'}
                      </span>
                    </div>

                    {/* Toggle Switch Graphic */}
                    <div
                      className={`w-12 h-6 rounded-full transition-colors p-1 flex items-center ${
                        isHigh ? 'bg-cyan-600 justify-end' : 'bg-slate-800 justify-start'
                      }`}
                    >
                      <div className="w-4 h-4 rounded-full bg-white shadow-md transform transition-transform" />
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Clock Generator Controls (if sequential) */}
          {selectedDef.inputs.includes('clk') && (
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-cyan-400 flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  Clock Generator
                </span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                    inputs.clk ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  CLK: {inputs.clk ? '1 (HIGH)' : '0 (LOW)'}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleClockPulse}
                  className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs rounded-lg text-slate-200 font-medium transition-colors"
                >
                  Single Pulse ⎍
                </button>
                <button
                  onClick={() => setClockRunning(!clockRunning)}
                  className={`flex-1 py-1.5 text-xs rounded-lg font-medium flex items-center justify-center gap-1 transition-colors ${
                    clockRunning
                      ? 'bg-rose-900/60 text-rose-300 border border-rose-700'
                      : 'bg-cyan-600/30 text-cyan-300 border border-cyan-500/40'
                  }`}
                >
                  {clockRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  {clockRunning ? 'Stop Clock' : 'Auto Clock'}
                </button>
              </div>

              {clockRunning && (
                <div className="pt-2 border-t border-slate-800">
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>Frequency</span>
                    <span className="font-mono text-cyan-400">{clockSpeedHz} Hz</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={clockSpeedHz}
                    onChange={(e) => setClockSpeedHz(parseInt(e.target.value, 10))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>
              )}
            </div>
          )}

          {/* Logic Explanation Box */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
            <span className="text-[10px] font-semibold text-cyan-400 uppercase tracking-wider block">
              Step Transition Telemetry
            </span>
            <p className="text-xs text-slate-300 font-mono leading-relaxed">
              {evaluation.explanation}
            </p>
          </div>
        </div>

        {/* Center & Right: Visual Output Dashboard & Tool Tabs */}
        <div className="flex-1 flex flex-col p-4 space-y-4 overflow-y-auto">
          {/* Output LED Indicators Display */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Real-Time Logic Outputs &amp; LED Probes
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(evaluation.outputs).map(([key, val]) => {
                const isHigh = val === 1;
                return (
                  <div
                    key={key}
                    className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-3 transition-all ${
                      isHigh
                        ? 'bg-cyan-950/40 border-cyan-500/50 shadow-lg shadow-cyan-500/10'
                        : 'bg-slate-950 border-slate-800'
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                        isHigh
                          ? 'bg-cyan-400 shadow-[0_0_20px_#22d3ee] scale-110'
                          : 'bg-slate-800'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full ${isHigh ? 'bg-white' : 'bg-slate-900'}`} />
                    </div>

                    <div className="text-center">
                      <span className="text-xs font-bold uppercase text-slate-200 block">
                        Output {key.toUpperCase()}
                      </span>
                      <span
                        className={`text-sm font-mono font-bold ${
                          isHigh ? 'text-cyan-300' : 'text-slate-500'
                        }`}
                      >
                        {isHigh ? 'HIGH (1)' : 'LOW (0)'}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* 7-Segment display for 4-bit Counter */}
              {selectedCircuitId === 'ripple_counter_4bit' && (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center">
                  <span className="text-xs font-bold uppercase text-slate-400 mb-2">
                    7-Segment Display
                  </span>
                  <div className="text-4xl font-mono font-black text-cyan-400 tracking-wider bg-slate-900 px-4 py-2 rounded-lg border border-slate-800 shadow-inner">
                    {evaluation.outputs.count ?? 0}
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 font-mono">
                    HEX: {(evaluation.outputs.count ?? 0).toString(16).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <button
              onClick={() => setActiveTab('interactive')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'interactive'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              Timing Waveforms (Logic Analyzer)
            </button>

            <button
              onClick={() => setActiveTab('truth_table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'truth_table'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              Truth Table Generator
            </button>

            <button
              onClick={() => setActiveTab('kmap')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'kmap'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              Karnaugh Map (K-Map) Solver
            </button>
          </div>

          {/* Tab 1: Logic Analyzer Timing Diagram */}
          {activeTab === 'interactive' && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center text-xs text-slate-400">
                <span className="font-semibold text-slate-200">
                  Digital Logic Analyzer (8-Channels)
                </span>
                <span className="font-mono text-[11px]">
                  Samples: {timingHistory.length} cycles captured
                </span>
              </div>

              {timingHistory.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  Toggle switches or clock pulses to begin recording logic traces.
                </div>
              ) : (
                <div className="space-y-2 pt-2">
                  {/* Clock Trace */}
                  {selectedDef.inputs.includes('clk') && (
                    <div className="flex items-center gap-3">
                      <span className="w-16 text-right text-xs font-mono text-cyan-400">
                        CLK:
                      </span>
                      <div className="flex-1 flex h-8 bg-slate-950 border border-slate-800 rounded px-1 items-center overflow-hidden">
                        {timingHistory.map((h, i) => (
                          <div
                            key={i}
                            className={`w-3 h-full border-r border-slate-800 flex items-center justify-center text-[9px] font-mono ${
                              h.clk ? 'bg-cyan-950/80 text-cyan-300 border-t-2 border-t-cyan-400' : 'bg-transparent text-slate-600 border-b-2 border-b-slate-700'
                            }`}
                          >
                            {h.clk}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Input Traces */}
                  {selectedDef.inputs.filter((k) => k !== 'clk').map((k) => (
                    <div key={k} className="flex items-center gap-3">
                      <span className="w-16 text-right text-xs font-mono text-slate-300 uppercase">
                        {k}:
                      </span>
                      <div className="flex-1 flex h-8 bg-slate-950 border border-slate-800 rounded px-1 items-center overflow-hidden">
                        {timingHistory.map((h, i) => {
                          const val = h.inputs[k] ?? 0;
                          return (
                            <div
                              key={i}
                              className={`w-3 h-full border-r border-slate-800 flex items-center justify-center text-[9px] font-mono ${
                                val ? 'bg-blue-950/80 text-blue-300 border-t-2 border-t-blue-400' : 'bg-transparent text-slate-600 border-b-2 border-b-slate-700'
                              }`}
                            >
                              {val}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  {/* Output Traces */}
                  {Object.keys(evaluation.outputs).map((outKey) => (
                    <div key={outKey} className="flex items-center gap-3">
                      <span className="w-16 text-right text-xs font-mono text-emerald-400 uppercase">
                        {outKey}:
                      </span>
                      <div className="flex-1 flex h-8 bg-slate-950 border border-slate-800 rounded px-1 items-center overflow-hidden">
                        {timingHistory.map((h, i) => {
                          const val = h.outputs[outKey] ?? 0;
                          return (
                            <div
                              key={i}
                              className={`w-3 h-full border-r border-slate-800 flex items-center justify-center text-[9px] font-mono ${
                                val ? 'bg-emerald-950/80 text-emerald-300 border-t-2 border-t-emerald-400' : 'bg-transparent text-slate-600 border-b-2 border-b-slate-700'
                              }`}
                            >
                              {val}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Truth Table Generator */}
          {activeTab === 'truth_table' && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 overflow-x-auto space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-slate-200">
                  Complete State Enumeration (All {truthTable.length} Combinations)
                </h4>
                <span className="text-[11px] text-cyan-400 font-medium">
                  💡 Click any row to automatically load its input state!
                </span>
              </div>

              <table className="w-full text-xs text-left border-collapse font-mono">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-800 text-slate-400">
                    <th className="p-2.5">Row #</th>
                    {Object.keys(truthTable[0]?.inputs || {}).map((k) => (
                      <th key={k} className="p-2.5 text-cyan-300 uppercase">
                        {k}
                      </th>
                    ))}
                    {Object.keys(truthTable[0]?.outputs || {}).map((k) => (
                      <th key={k} className="p-2.5 text-emerald-400 uppercase">
                        {k}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {truthTable.map((row, idx) => {
                    const rowEntries = Object.entries(row.inputs);
                    const isActive =
                      rowEntries.length > 0 &&
                      rowEntries.every(([k, v]) => (inputs[k] ?? safeInputs[k] ?? 0) === v);

                    return (
                      <tr
                        key={idx}
                        onClick={() => {
                          setInputs((prev) => ({ ...prev, ...row.inputs }));
                          const nextInputs = { ...safeInputs, ...inputs, ...row.inputs };
                          const res = evaluateDigitalSubcircuit(selectedCircuitId, nextInputs, internalState);
                          setInternalState(res.nextState);
                        }}
                        className={`border-b border-slate-800/60 cursor-pointer transition-colors ${
                          isActive
                            ? 'bg-cyan-500/20 text-white font-bold'
                            : 'hover:bg-slate-800/60 text-slate-300'
                        }`}
                        title="Click to apply these inputs"
                      >
                        <td className="p-2.5 text-slate-500">{idx}</td>
                        {Object.values(row.inputs).map((v, i) => (
                          <td key={i} className="p-2.5">
                            {v}
                          </td>
                        ))}
                        {Object.values(row.outputs).map((v, i) => (
                          <td key={i} className="p-2.5 font-bold text-emerald-400">
                            {v}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Tab 3: K-Map Solver */}
          {activeTab === 'kmap' && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-slate-200">
                    Karnaugh Map (K-Map) Solver &amp; Boolean Minimizer
                  </h4>
                  <p className="text-xs text-slate-400">
                    Click cells to toggle minterms (0 or 1). Observe automated grouping and minimized SOP expression.
                  </p>
                </div>

                <div className="flex gap-2">
                  {[2, 3, 4].map((v) => (
                    <button
                      key={v}
                      onClick={() => {
                        setKmapVars(v as 2 | 3 | 4);
                        setKmapMinterms([1, 2, 3]);
                      }}
                      className={`px-2.5 py-1 text-xs rounded font-medium ${
                        kmapVars === v
                          ? 'bg-cyan-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {v} Variables
                    </button>
                  ))}
                </div>
              </div>

              {/* K-Map Grid Display */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl max-w-xl mx-auto">
                <div className="text-center text-xs font-mono text-cyan-400 mb-2">
                  Variables: {kmapResult.variables.join(', ')}
                </div>

                <div className="grid grid-flow-col gap-2 justify-center items-center">
                  <div className="flex flex-col gap-2 pt-6">
                    {kmapResult.rowLabels.map((rl, rIdx) => (
                      <div key={rIdx} className="h-14 flex items-center justify-end text-xs font-mono text-slate-400 pr-2">
                        {rl}
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      {kmapResult.colLabels.map((cl, cIdx) => (
                        <div key={cIdx} className="w-14 text-center text-xs font-mono text-slate-400">
                          {cl}
                        </div>
                      ))}
                    </div>

                    {kmapResult.grid.map((row, rIdx) => (
                      <div key={rIdx} className="flex gap-2">
                        {row.map((cellVal, cIdx) => {
                          const mintermNum = rIdx * row.length + cIdx;
                          const isOne = cellVal === 1;
                          return (
                            <button
                              key={cIdx}
                              onClick={() => {
                                if (kmapMinterms.includes(mintermNum)) {
                                  setKmapMinterms(kmapMinterms.filter((m) => m !== mintermNum));
                                } else {
                                  setKmapMinterms([...kmapMinterms, mintermNum]);
                                }
                              }}
                              className={`w-14 h-14 rounded-lg font-mono text-lg font-bold transition-all border ${
                                isOne
                                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-lg shadow-cyan-500/20'
                                  : 'bg-slate-900 text-slate-600 border-slate-800 hover:border-slate-700'
                              }`}
                            >
                              {cellVal}
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Minimized SOP Expression Output */}
              <div className="p-4 bg-slate-950 border border-cyan-800/40 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Minimal Sum-of-Products (SOP) Form
                  </span>
                  <div className="text-lg font-mono font-bold text-cyan-300">
                    F({kmapResult.variables.join(',')}) = {kmapResult.simplifiedExpression}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block font-mono">
                    Minterms: Σm({kmapMinterms.sort((a,b)=>a-b).join(', ') || 'none'})
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

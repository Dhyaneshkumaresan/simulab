import React, { useState, useMemo } from 'react';
import {
  Activity,
  Sliders,
  Cpu,
  Layers,
  Sparkles,
  Info,
  Zap,
  TrendingUp,
  Download,
} from 'lucide-react';
import { simulateAnalogCircuit, CircuitParameters } from '../../simulation/analogEngine';
import { WaveformPlot } from '../common/WaveformPlot';

interface AnalogLabProps {
  onAskAI?: (topic: string, details?: any) => void;
}

const ANALOG_CIRCUIT_PRESETS = [
  { id: 'bjt_ce_amplifier', name: 'BJT Common Emitter (CE) Amplifier', category: 'Amplifiers' },
  { id: 'rc_transient', name: 'RC Charging & Discharging Transient', category: 'Transients' },
  { id: 'rlc_resonance', name: 'RLC Resonant Circuit & Bandwidth', category: 'Resonance' },
  { id: 'half_wave_rectifier', name: 'Half-Wave Rectifier with C-Filter', category: 'Power & Diodes' },
  { id: 'full_wave_rectifier', name: 'Full-Wave Bridge Rectifier', category: 'Power & Diodes' },
  { id: 'zener_regulator', name: 'Zener Diode Voltage Regulator', category: 'Power & Diodes' },
  { id: 'diode_characteristics', name: 'PN Junction Diode V-I Curve', category: 'Semiconductors' },
  { id: 'ohms_law', name: "Ohm's Law & Power Dissipation", category: 'Basics' },
  { id: 'voltage_divider', name: 'Voltage & Current Division', category: 'Basics' },
  { id: 'astable_multivibrator', name: '555 Astable Multivibrator (Oscillator)', category: 'Waveform Generators' },
  { id: 'rc_filter_lowpass', name: '1st-Order RC Low-Pass Filter', category: 'Filters' },
];

export const AnalogLab: React.FC<AnalogLabProps> = ({ onAskAI }) => {
  const [selectedCircuitId, setSelectedCircuitId] = useState('bjt_ce_amplifier');
  const [activeTab, setActiveTab] = useState<'transient' | 'bode' | 'dc_point'>('transient');

  // Adjustable Parameters
  const [params, setParams] = useState<CircuitParameters>({
    supplyVoltage: 5,
    resistance: 1000,
    resistance2: 2200,
    capacitance: 10,
    inductance: 10,
    frequency: 1000,
    beta: 150,
    loadResistance: 1000,
    capacitorFilter: 100,
    zenerVoltage: 5.1,
  });

  // Execute actual simulation computation
  const simulation = useMemo(() => {
    return simulateAnalogCircuit(selectedCircuitId, params);
  }, [selectedCircuitId, params]);

  const updateParam = (key: keyof CircuitParameters, val: number) => {
    setParams((prev) => ({ ...prev, [key]: val }));
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-950 text-slate-100 overflow-hidden select-none">
      {/* Top Header / Circuit Selector */}
      <div className="h-14 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              Analog Electronics Laboratory
              <span className="text-[11px] font-normal px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                MNA &amp; Mathematical Solvers
              </span>
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedCircuitId}
            onChange={(e) => setSelectedCircuitId(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-cyan-300 font-medium focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            {ANALOG_CIRCUIT_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.category}: {p.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => onAskAI?.(simulation.circuitType, { params, metrics: simulation.metrics })}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 rounded-lg text-xs font-medium transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI Explain Circuit
          </button>
        </div>
      </div>

      {/* Main Grid: Left Controls & Formulas | Center/Right Waveforms & Telemetry */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Parameters Slider & Theory Box */}
        <div className="w-80 bg-slate-900/90 border-r border-slate-800 flex flex-col shrink-0 overflow-y-auto p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-cyan-400" />
              Circuit Parameters
            </h3>
            <span className="text-[10px] text-emerald-400 font-medium animate-pulse">
              ● Live Numerical Engine
            </span>
          </div>

          {/* Supply Voltage */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400 font-medium">Input Voltage (Vin)</span>
              <span className="text-cyan-300 font-mono font-bold">{params.supplyVoltage} V</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="24"
              step="0.5"
              value={params.supplyVoltage}
              onChange={(e) => updateParam('supplyVoltage', parseFloat(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          {/* Resistance R1 */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400 font-medium">Resistor R1</span>
              <span className="text-cyan-300 font-mono font-bold">{params.resistance} Ω</span>
            </div>
            <input
              type="range"
              min="100"
              max="50000"
              step="100"
              value={params.resistance}
              onChange={(e) => updateParam('resistance', parseFloat(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          {/* Resistance R2 */}
          {(selectedCircuitId === 'voltage_divider' ||
            selectedCircuitId === 'astable_multivibrator' ||
            selectedCircuitId === 'bjt_ce_amplifier') && (
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400 font-medium">Resistor R2</span>
                <span className="text-cyan-300 font-mono font-bold">{params.resistance2} Ω</span>
              </div>
              <input
                type="range"
                min="100"
                max="50000"
                step="100"
                value={params.resistance2}
                onChange={(e) => updateParam('resistance2', parseFloat(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>
          )}

          {/* Capacitance C */}
          {(selectedCircuitId === 'rc_transient' ||
            selectedCircuitId === 'rlc_resonance' ||
            selectedCircuitId === 'astable_multivibrator' ||
            selectedCircuitId === 'rc_filter_lowpass') && (
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400 font-medium">Capacitance C</span>
                <span className="text-cyan-300 font-mono font-bold">{params.capacitance} µF</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="100"
                step="0.5"
                value={params.capacitance}
                onChange={(e) => updateParam('capacitance', parseFloat(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>
          )}

          {/* Inductance L */}
          {selectedCircuitId === 'rlc_resonance' && (
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400 font-medium">Inductance L</span>
                <span className="text-cyan-300 font-mono font-bold">{params.inductance} mH</span>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                step="1"
                value={params.inductance}
                onChange={(e) => updateParam('inductance', parseFloat(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>
          )}

          {/* Frequency */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400 font-medium">Signal Frequency</span>
              <span className="text-cyan-300 font-mono font-bold">{params.frequency} Hz</span>
            </div>
            <input
              type="range"
              min="50"
              max="20000"
              step="50"
              value={params.frequency}
              onChange={(e) => updateParam('frequency', parseFloat(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          {/* Filter Capacitor for Rectifiers */}
          {(selectedCircuitId === 'half_wave_rectifier' || selectedCircuitId === 'full_wave_rectifier') && (
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400 font-medium">Filter Capacitor (C_filt)</span>
                <span className="text-cyan-300 font-mono font-bold">{params.capacitorFilter} µF</span>
              </div>
              <input
                type="range"
                min="0"
                max="470"
                step="10"
                value={params.capacitorFilter}
                onChange={(e) => updateParam('capacitorFilter', parseFloat(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>
          )}

          {/* Load Resistance for Rectifiers & Zener */}
          {(selectedCircuitId === 'half_wave_rectifier' ||
            selectedCircuitId === 'full_wave_rectifier' ||
            selectedCircuitId === 'zener_regulator') && (
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400 font-medium">Load Resistor (RL)</span>
                <span className="text-cyan-300 font-mono font-bold">{params.loadResistance} Ω</span>
              </div>
              <input
                type="range"
                min="100"
                max="10000"
                step="100"
                value={params.loadResistance}
                onChange={(e) => updateParam('loadResistance', parseFloat(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>
          )}

          {/* Zener Diode Voltage */}
          {selectedCircuitId === 'zener_regulator' && (
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400 font-medium">Zener Breakdown Voltage (Vz)</span>
                <span className="text-cyan-300 font-mono font-bold">{params.zenerVoltage} V</span>
              </div>
              <input
                type="range"
                min="2.4"
                max="15"
                step="0.3"
                value={params.zenerVoltage}
                onChange={(e) => updateParam('zenerVoltage', parseFloat(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>
          )}

          {/* Transistor Beta (hFE) */}
          {selectedCircuitId === 'bjt_ce_amplifier' && (
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400 font-medium">BJT Current Gain β (hFE)</span>
                <span className="text-cyan-300 font-mono font-bold">{params.beta}</span>
              </div>
              <input
                type="range"
                min="50"
                max="350"
                step="10"
                value={params.beta}
                onChange={(e) => updateParam('beta', parseFloat(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>
          )}

          {/* Summary / Formula Calculation Card */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400">
              <Info className="w-3.5 h-3.5" />
              <span>Theoretical Summary</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {simulation.summaryText}
            </p>
          </div>
        </div>

        {/* Center & Right: Waveform Display & Instruments */}
        <div className="flex-1 flex flex-col overflow-y-auto p-4 space-y-4">
          {/* Key Metrics Banner */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Peak Output Vp-p
              </span>
              <span className="text-xl font-mono font-bold text-cyan-300">
                {simulation.metrics.peakToPeakOut.toFixed(2)} V
              </span>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Voltage Gain Av
              </span>
              <span className="text-xl font-mono font-bold text-emerald-400">
                {simulation.metrics.gain.toFixed(2)}{' '}
                <span className="text-xs text-slate-400 font-normal">
                  ({simulation.metrics.gainDb.toFixed(1)} dB)
                </span>
              </span>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Signal Frequency
              </span>
              <span className="text-xl font-mono font-bold text-amber-300">
                {simulation.metrics.frequencyHz.toFixed(1)} Hz
              </span>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Phase Shift Δφ
              </span>
              <span className="text-xl font-mono font-bold text-indigo-300">
                {simulation.metrics.phaseShiftDeg.toFixed(1)}°
              </span>
            </div>
          </div>

          {/* Waveform Tabs */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('transient')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'transient'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Time-Domain Transient Waveform
              </button>

              {simulation.acAnalysis && (
                <button
                  onClick={() => setActiveTab('bode')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'bode'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  AC Frequency Response (Bode Plot)
                </button>
              )}

              {simulation.dcOperatingPoints && (
                <button
                  onClick={() => setActiveTab('dc_point')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'dc_point'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  DC Operating Point &amp; Power
                </button>
              )}
            </div>

            <span className="text-xs font-mono text-slate-500">
              Plotly High-Res Engine
            </span>
          </div>

          {/* Plot Content */}
          {activeTab === 'transient' && (
            <div className="space-y-4">
              <WaveformPlot
                title={`${simulation.circuitType} - Transient Analysis`}
                xData={simulation.timeVector}
                yData1={simulation.inputWaveform}
                yData2={simulation.outputWaveform}
                xLabel={selectedCircuitId === 'ohms_law' || selectedCircuitId === 'diode_characteristics' ? 'Voltage (V)' : 'Time (seconds)'}
                yLabel={selectedCircuitId === 'ohms_law' || selectedCircuitId === 'diode_characteristics' ? 'Current (mA)' : 'Amplitude (V)'}
                trace1Name={selectedCircuitId === 'diode_characteristics' ? 'V-Sweep (V)' : 'Input (Vin)'}
                trace2Name={selectedCircuitId === 'diode_characteristics' ? 'Diode Current ID (mA)' : 'Output (Vout)'}
                height={340}
              />

              {simulation.currentWaveform && (
                <WaveformPlot
                  title="Branch Current Waveform"
                  xData={simulation.timeVector}
                  yData1={simulation.currentWaveform}
                  xLabel="Time (s)"
                  yLabel="Current (mA)"
                  trace1Name="Branch Current i(t) (mA)"
                  height={220}
                />
              )}
            </div>
          )}

          {activeTab === 'bode' && simulation.acAnalysis && (
            <div className="space-y-4">
              <WaveformPlot
                title="Bode Plot - Magnitude Response"
                xData={simulation.acAnalysis.frequencyVector}
                yData1={simulation.acAnalysis.magnitudeDb}
                xLabel="Frequency (Hz, Log Scale)"
                yLabel="Magnitude Gain (dB)"
                trace1Name="Magnitude |Av| (dB)"
                plotType="bode"
                logX={true}
                height={300}
              />

              <WaveformPlot
                title="Bode Plot - Phase Angle Response"
                xData={simulation.acAnalysis.frequencyVector}
                yData1={simulation.acAnalysis.phaseDeg}
                xLabel="Frequency (Hz, Log Scale)"
                yLabel="Phase Shift (°)"
                trace1Name="Phase ∠Av (°)"
                plotType="bode"
                logX={true}
                height={240}
              />
            </div>
          )}

          {activeTab === 'dc_point' && simulation.dcOperatingPoints && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <h4 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-3">
                  Node Potentials (V)
                </h4>
                <div className="space-y-2">
                  {Object.entries(simulation.dcOperatingPoints.nodeVoltages).map(([node, val]) => (
                    <div key={node} className="flex justify-between text-xs font-mono">
                      <span className="text-slate-400">{node}</span>
                      <span className="text-white font-bold">{val.toFixed(2)} V</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <h4 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-3">
                  Branch Currents (mA)
                </h4>
                <div className="space-y-2">
                  {Object.entries(simulation.dcOperatingPoints.branchCurrents).map(([branch, val]) => (
                    <div key={branch} className="flex justify-between text-xs font-mono">
                      <span className="text-slate-400">{branch}</span>
                      <span className="text-cyan-300 font-bold">{val.toFixed(2)} mA</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <h4 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-3">
                  Component Power Dissipation
                </h4>
                <div className="space-y-2">
                  {Object.entries(simulation.dcOperatingPoints.componentPower).map(([comp, val]) => (
                    <div key={comp} className="flex justify-between text-xs font-mono">
                      <span className="text-slate-400">{comp}</span>
                      <span className="text-amber-300 font-bold">{(val * 1000).toFixed(2)} mW</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

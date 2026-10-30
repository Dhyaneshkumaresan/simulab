import React, { useState, useEffect, useRef } from 'react';
import {
  Gauge,
  Sliders,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCw,
  Power,
  Zap,
  Activity,
  Layers,
} from 'lucide-react';

export const VirtualInstruments: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'cro' | 'dmm' | 'funcgen' | 'powersupply'>('cro');

  // OSCILLOSCOPE STATE
  const [timeDivMs, setTimeDivMs] = useState(1); // 1ms/div
  const [ch1VoltDiv, setCh1VoltDiv] = useState(1); // 1V/div
  const [ch2VoltDiv, setCh2VoltDiv] = useState(2); // 2V/div
  const [ch1Enabled, setCh1Enabled] = useState(true);
  const [ch2Enabled, setCh2Enabled] = useState(true);
  const [isLissajous, setIsLissajous] = useState(false);
  const [oscRunning, setOscRunning] = useState(true);

  // FUNCTION GENERATOR STATE
  const [funcWave, setFuncWave] = useState<'sine' | 'square' | 'triangle' | 'sawtooth'>('sine');
  const [funcFreqHz, setFuncFreqHz] = useState(1000);
  const [funcAmpVpp, setFuncAmpVpp] = useState(5);
  const [funcOffsetV, setFuncOffsetV] = useState(0);

  // DMM STATE
  const [dmmMode, setDmmMode] = useState<'dc_v' | 'ac_v' | 'dc_ma' | 'resistance' | 'diode' | 'continuity'>('dc_v');
  const [dmmHold, setDmmHold] = useState(false);
  const [buzzerAudio, setBuzzerAudio] = useState(true);

  // POWER SUPPLY STATE
  const [psCh1V, setPsCh1V] = useState(5.0);
  const [psCh1I, setPsCh1I] = useState(0.25);
  const [psCh2V, setPsCh2V] = useState(12.0);
  const [psCh2I, setPsCh2I] = useState(0.5);
  const [psOutputOn, setPsOutputOn] = useState(true);

  // Animation frame loop for Oscilloscope
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number | null>(null);
  const phaseRef = useRef(0);

  useEffect(() => {
    if (activeTab !== 'cro' || !oscRunning) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      phaseRef.current += 0.08;
      const w = canvas.width;
      const h = canvas.height;

      // Dark oscilloscope CRT background
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, w, h);

      // CRT Reticle Grid
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      const divX = w / 10;
      const divY = h / 8;

      ctx.beginPath();
      for (let x = 0; x <= w; x += divX) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
      }
      for (let y = 0; y <= h; y += divY) {
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
      }
      ctx.stroke();

      // Center crosshairs with tick marks
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(w / 2, 0);
      ctx.lineTo(w / 2, h);
      ctx.moveTo(0, h / 2);
      ctx.lineTo(w, h / 2);
      ctx.stroke();

      if (isLissajous) {
        // Lissajous X-Y Mode (Phase difference pattern)
        ctx.strokeStyle = '#22d3ee';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 10;
        ctx.beginPath();

        const a1 = (funcAmpVpp / 2) * (divY / ch1VoltDiv);
        const a2 = (funcAmpVpp / 2) * (divX / ch2VoltDiv);
        const deltaPhi = 0.5; // rad

        for (let t = 0; t <= Math.PI * 2; t += 0.05) {
          const x = w / 2 + a2 * Math.sin(t + deltaPhi);
          const y = h / 2 - a1 * Math.sin(t);
          if (t === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
      } else {
        // Standard Time-Base Oscilloscope traces
        const centerY = h / 2;

        // CH1 Waveform (Cyan)
        if (ch1Enabled) {
          ctx.strokeStyle = '#22d3ee';
          ctx.lineWidth = 2;
          ctx.shadowColor = '#06b6d4';
          ctx.shadowBlur = 8;
          ctx.beginPath();

          for (let x = 0; x < w; x++) {
            const t = (x / divX) * (timeDivMs * 1e-3);
            let val = 0;
            const arg = 2 * Math.PI * funcFreqHz * t + phaseRef.current;

            if (funcWave === 'sine') {
              val = Math.sin(arg);
            } else if (funcWave === 'square') {
              val = Math.sin(arg) >= 0 ? 1 : -1;
            } else if (funcWave === 'triangle') {
              val = (2 / Math.PI) * Math.asin(Math.sin(arg));
            } else {
              val = 2 * ((arg / (2 * Math.PI)) % 1) - 1;
            }

            const vActual = val * (funcAmpVpp / 2) + funcOffsetV;
            const y = centerY - (vActual / ch1VoltDiv) * divY;

            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
          ctx.shadowBlur = 0;
        }

        // CH2 Waveform (Amber - 180° phase shifted or scaled)
        if (ch2Enabled) {
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 2;
          ctx.shadowColor = '#d97706';
          ctx.shadowBlur = 8;
          ctx.beginPath();

          for (let x = 0; x < w; x++) {
            const t = (x / divX) * (timeDivMs * 1e-3);
            const arg = 2 * Math.PI * funcFreqHz * t + phaseRef.current + Math.PI; // 180 deg
            const val = Math.sin(arg) * 0.7;
            const y = centerY - (val * (funcAmpVpp / 2) / ch2VoltDiv) * divY;

            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
          ctx.shadowBlur = 0;
        }
      }

      animRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [activeTab, oscRunning, timeDivMs, ch1VoltDiv, ch2VoltDiv, ch1Enabled, ch2Enabled, isLissajous, funcWave, funcFreqHz, funcAmpVpp, funcOffsetV]);

  // Calculate DMM display reading based on active mode
  const getDmmReading = () => {
    if (dmmHold) return '5.012 HOLD';
    switch (dmmMode) {
      case 'dc_v':
        return `${(funcOffsetV + 5.0).toFixed(3)} V`;
      case 'ac_v':
        return `${(funcAmpVpp / (2 * Math.SQRT2)).toFixed(3)} V_rms`;
      case 'dc_ma':
        return `${(5.0 / 1000 * 1000).toFixed(2)} mA`;
      case 'resistance':
        return '1.002 kΩ';
      case 'diode':
        return '0.684 V (Good)';
      case 'continuity':
        return '0.4 Ω 🔊 (Short)';
      default:
        return '0.000';
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-950 text-slate-100 overflow-hidden select-none">
      {/* Top Instrument Selector Bar */}
      <div className="h-14 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Gauge className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              Virtual Electronics Instrument Rack
              <span className="text-[11px] font-normal px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                Benchtop Grade Accuracy
              </span>
            </h2>
          </div>
        </div>

        <div className="flex gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('cro')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'cro'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Digital Storage Oscilloscope (DSO)
          </button>
          <button
            onClick={() => setActiveTab('funcgen')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'funcgen'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            DDS Function Generator
          </button>
          <button
            onClick={() => setActiveTab('dmm')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'dmm'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            True-RMS Digital Multimeter (DMM)
          </button>
          <button
            onClick={() => setActiveTab('powersupply')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'powersupply'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Dual DC Power Supply
          </button>
        </div>
      </div>

      {/* Main Instrument Display Area */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* INSTRUMENT 1: DUAL-TRACE OSCILLOSCOPE */}
        {activeTab === 'cro' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-5xl mx-auto shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />
                <h3 className="font-bold text-white text-base">
                  DSO-4000: 100MHz Dual-Channel Digital Storage Oscilloscope
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsLissajous(!isLissajous)}
                  className={`px-3 py-1 text-xs rounded-lg font-medium border transition-all ${
                    isLissajous
                      ? 'bg-cyan-500/30 text-cyan-300 border-cyan-400'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                >
                  {isLissajous ? 'X-Y Mode (Lissajous)' : 'Time-Base (Y-T)'}
                </button>
                <button
                  onClick={() => setOscRunning(!oscRunning)}
                  className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
                    oscRunning
                      ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'
                      : 'bg-rose-600/30 text-rose-300 border border-rose-500/40'
                  }`}
                >
                  {oscRunning ? 'RUNNING' : 'STOPPED'}
                </button>
              </div>
            </div>

            {/* CRT Display Screen */}
            <div className="relative bg-slate-950 border-2 border-slate-700 rounded-xl overflow-hidden shadow-inner flex items-center justify-center">
              <canvas
                ref={canvasRef}
                width={800}
                height={380}
                className="w-full max-w-[800px] h-[380px]"
              />

              {/* On-screen telemetry readouts */}
              <div className="absolute top-3 left-4 text-xs font-mono space-y-1 bg-slate-950/80 p-2 rounded border border-slate-800">
                <div className="text-cyan-400 font-bold">CH1: {ch1VoltDiv}V/div (Active)</div>
                <div className="text-amber-400 font-bold">CH2: {ch2VoltDiv}V/div (Active)</div>
                <div className="text-slate-400">Time: {timeDivMs} ms/div</div>
              </div>
            </div>

            {/* Oscilloscope Hardware Front Panel Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-950 p-5 rounded-xl border border-slate-800">
              {/* Channel 1 Controls */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-400 uppercase">CH1 Vertical</span>
                  <input
                    type="checkbox"
                    checked={ch1Enabled}
                    onChange={(e) => setCh1Enabled(e.target.checked)}
                    className="accent-cyan-400"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Volts / Div</span>
                    <span className="font-mono text-cyan-300">{ch1VoltDiv} V</span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="5"
                    step="0.2"
                    value={ch1VoltDiv}
                    onChange={(e) => setCh1VoltDiv(parseFloat(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>
              </div>

              {/* Horizontal Timebase Controls */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-300 uppercase block">
                  Horizontal Timebase
                </span>
                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Time / Div</span>
                    <span className="font-mono text-slate-200">{timeDivMs} ms</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="10"
                    step="0.1"
                    value={timeDivMs}
                    onChange={(e) => setTimeDivMs(parseFloat(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>
              </div>

              {/* Channel 2 Controls */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 uppercase">CH2 Vertical</span>
                  <input
                    type="checkbox"
                    checked={ch2Enabled}
                    onChange={(e) => setCh2Enabled(e.target.checked)}
                    className="accent-amber-400"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Volts / Div</span>
                    <span className="font-mono text-amber-300">{ch2VoltDiv} V</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="10"
                    step="0.5"
                    value={ch2VoltDiv}
                    onChange={(e) => setCh2VoltDiv(parseFloat(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* INSTRUMENT 2: DDS FUNCTION GENERATOR */}
        {activeTab === 'funcgen' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-4xl mx-auto shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Activity className="w-5 h-5 text-cyan-400" />
                FG-2000 Direct Digital Synthesis (DDS) Function Generator
              </h3>
              <span className="text-xs font-mono text-emerald-400">OUTPUT: ENABLED (50Ω)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left: Waveform Picker & Frequency */}
              <div className="space-y-4 bg-slate-950 p-5 rounded-xl border border-slate-800">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Select Output Waveform
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {(['sine', 'square', 'triangle', 'sawtooth'] as const).map((w) => (
                    <button
                      key={w}
                      onClick={() => setFuncWave(w)}
                      className={`py-2 px-3 rounded-lg text-xs font-semibold capitalize transition-all ${
                        funcWave === w
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400 shadow-md shadow-cyan-500/10'
                          : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                      }`}
                    >
                      {w} Wave
                    </button>
                  ))}
                </div>

                <div className="pt-2">
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Frequency (Hz)</span>
                    <span className="font-mono font-bold text-cyan-300">{funcFreqHz} Hz</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="10000"
                    step="10"
                    value={funcFreqHz}
                    onChange={(e) => setFuncFreqHz(parseInt(e.target.value, 10))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>
              </div>

              {/* Right: Amplitude & Offset */}
              <div className="space-y-4 bg-slate-950 p-5 rounded-xl border border-slate-800">
                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Peak-to-Peak Amplitude (Vpp)</span>
                    <span className="font-mono font-bold text-cyan-300">{funcAmpVpp} Vpp</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="20"
                    step="0.5"
                    value={funcAmpVpp}
                    onChange={(e) => setFuncAmpVpp(parseFloat(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>DC Offset Voltage</span>
                    <span className="font-mono font-bold text-cyan-300">{funcOffsetV} V</span>
                  </div>
                  <input
                    type="range"
                    min="-5"
                    max="5"
                    step="0.1"
                    value={funcOffsetV}
                    onChange={(e) => setFuncOffsetV(parseFloat(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>

                <div className="p-3 bg-slate-900 rounded-lg text-xs font-mono text-slate-300 space-y-1">
                  <div>V_rms: {(funcAmpVpp / (2 * Math.SQRT2)).toFixed(2)} V</div>
                  <div>Period T: {(1000 / funcFreqHz).toFixed(3)} ms</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* INSTRUMENT 3: TRUE-RMS DIGITAL MULTIMETER */}
        {activeTab === 'dmm' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-2xl mx-auto shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">
                DMM-8050 True-RMS 4½ Digit Multimeter
              </h3>
              <button
                onClick={() => setDmmHold(!dmmHold)}
                className={`px-3 py-1 text-xs rounded font-bold border transition-all ${
                  dmmHold ? 'bg-amber-500 text-black border-amber-400' : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}
              >
                HOLD
              </button>
            </div>

            {/* DMM 7-Segment High-Contrast Display Screen */}
            <div className="bg-[#111827] border-4 border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center shadow-inner">
              <span className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-1">
                TRUE RMS MULTIMETER DISPLAY
              </span>
              <div className="text-5xl font-mono font-black text-cyan-400 tracking-wider">
                {getDmmReading()}
              </div>
              <span className="text-xs font-mono text-slate-400 mt-2">
                AUTO RANGE | 20,000 COUNTS | 0.05% BASIC ACCURACY
              </span>
            </div>

            {/* Rotary Function Switch Dial */}
            <div className="grid grid-cols-3 gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <button
                onClick={() => setDmmMode('dc_v')}
                className={`p-3 rounded-lg text-xs font-bold transition-all ${
                  dmmMode === 'dc_v' ? 'bg-cyan-600 text-white shadow-lg' : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                V ⎓ (DC Volts)
              </button>
              <button
                onClick={() => setDmmMode('ac_v')}
                className={`p-3 rounded-lg text-xs font-bold transition-all ${
                  dmmMode === 'ac_v' ? 'bg-cyan-600 text-white shadow-lg' : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                V ~ (AC Volts)
              </button>
              <button
                onClick={() => setDmmMode('dc_ma')}
                className={`p-3 rounded-lg text-xs font-bold transition-all ${
                  dmmMode === 'dc_ma' ? 'bg-cyan-600 text-white shadow-lg' : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                mA ⎓ (DC Current)
              </button>
              <button
                onClick={() => setDmmMode('resistance')}
                className={`p-3 rounded-lg text-xs font-bold transition-all ${
                  dmmMode === 'resistance' ? 'bg-cyan-600 text-white shadow-lg' : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                Ω (Resistance)
              </button>
              <button
                onClick={() => setDmmMode('diode')}
                className={`p-3 rounded-lg text-xs font-bold transition-all ${
                  dmmMode === 'diode' ? 'bg-cyan-600 text-white shadow-lg' : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                ⯈| (Diode Drop)
              </button>
              <button
                onClick={() => setDmmMode('continuity')}
                className={`p-3 rounded-lg text-xs font-bold transition-all ${
                  dmmMode === 'continuity' ? 'bg-cyan-600 text-white shadow-lg' : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                🔊 (Continuity)
              </button>
            </div>
          </div>
        )}

        {/* INSTRUMENT 4: DUAL REGULATED DC BENCH POWER SUPPLY */}
        {activeTab === 'powersupply' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-4xl mx-auto shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">
                PS-3005D Dual-Channel Linear Regulated DC Power Supply (0-30V, 0-5A)
              </h3>
              <button
                onClick={() => setPsOutputOn(!psOutputOn)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  psOutputOn
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                    : 'bg-rose-950 text-rose-300 border border-rose-800'
                }`}
              >
                <Power className="w-3.5 h-3.5" />
                {psOutputOn ? 'OUTPUT ON' : 'OUTPUT OFF'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Channel 1 */}
              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-cyan-400 uppercase">Channel 1</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                    CV Mode
                  </span>
                </div>

                <div className="bg-slate-900 p-4 rounded-lg flex justify-around text-center border border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-mono">VOLTAGE</span>
                    <span className="text-3xl font-mono font-bold text-cyan-300">
                      {psCh1V.toFixed(2)} V
                    </span>
                  </div>
                  <div className="w-px bg-slate-800" />
                  <div>
                    <span className="text-[10px] text-slate-400 block font-mono">CURRENT</span>
                    <span className="text-3xl font-mono font-bold text-amber-300">
                      {psCh1I.toFixed(2)} A
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Voltage Set</span>
                    <span className="font-mono text-cyan-400">{psCh1V} V</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    step="0.1"
                    value={psCh1V}
                    onChange={(e) => setPsCh1V(parseFloat(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>
              </div>

              {/* Channel 2 */}
              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-amber-400 uppercase">Channel 2</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                    CV Mode
                  </span>
                </div>

                <div className="bg-slate-900 p-4 rounded-lg flex justify-around text-center border border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-mono">VOLTAGE</span>
                    <span className="text-3xl font-mono font-bold text-cyan-300">
                      {psCh2V.toFixed(2)} V
                    </span>
                  </div>
                  <div className="w-px bg-slate-800" />
                  <div>
                    <span className="text-[10px] text-slate-400 block font-mono">CURRENT</span>
                    <span className="text-3xl font-mono font-bold text-amber-300">
                      {psCh2I.toFixed(2)} A
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Voltage Set</span>
                    <span className="font-mono text-cyan-400">{psCh2V} V</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    step="0.1"
                    value={psCh2V}
                    onChange={(e) => setPsCh2V(parseFloat(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

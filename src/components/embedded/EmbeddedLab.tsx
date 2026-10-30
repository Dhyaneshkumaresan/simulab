import React, { useState, useEffect, useRef } from 'react';
import {
  Cpu,
  Play,
  Pause,
  RotateCcw,
  Terminal,
  Code,
  Sparkles,
  Sliders,
  CheckCircle,
  HelpCircle,
  Zap,
} from 'lucide-react';
import {
  EMBEDDED_PRESET_PROGRAMS,
  createInitialBoardState,
  executeProgramStep,
  EmbeddedProgram,
} from '../../simulation/embeddedEngine';
import { EmbeddedBoardState } from '../../types/circuit';

interface EmbeddedLabProps {
  onAskAI?: (topic: string, details?: any) => void;
}

export const EmbeddedLab: React.FC<EmbeddedLabProps> = ({ onAskAI }) => {
  const [boardType, setBoardType] = useState<'arduino-uno' | 'esp32'>('arduino-uno');
  const [selectedProgramId, setSelectedProgramId] = useState('blink');
  const [customCode, setCustomCode] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [execSpeedMs, setExecSpeedMs] = useState(500);

  const [boardState, setBoardState] = useState<EmbeddedBoardState>(() =>
    createInitialBoardState('arduino-uno')
  );

  const serialEndRef = useRef<HTMLDivElement>(null);

  // Active program
  const activeProgram =
    EMBEDDED_PRESET_PROGRAMS.find((p) => p.id === selectedProgramId) ||
    EMBEDDED_PRESET_PROGRAMS[0];

  useEffect(() => {
    setCustomCode(activeProgram.code);
    setBoardState(createInitialBoardState(activeProgram.board));
    setBoardType(activeProgram.board);
    setIsRunning(false);
  }, [selectedProgramId]);

  // Simulation execution loop
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setBoardState((prev) => executeProgramStep(activeProgram, prev));
    }, execSpeedMs);

    return () => clearInterval(interval);
  }, [isRunning, execSpeedMs, activeProgram]);

  // Auto-scroll serial monitor
  useEffect(() => {
    serialEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [boardState.serialOutput]);

  const handleReset = () => {
    setIsRunning(false);
    setBoardState(createInitialBoardState(boardType));
  };

  const handleStep = () => {
    setBoardState((prev) => executeProgramStep(activeProgram, prev));
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-950 text-slate-100 overflow-hidden select-none">
      {/* Top Header */}
      <div className="h-14 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              Embedded Systems Laboratory
              <span className="text-[11px] font-normal px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                {boardType === 'arduino-uno' ? 'ATmega328P 16MHz' : 'ESP32 Dual-Core 240MHz'}
              </span>
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Preset program picker */}
          <select
            value={selectedProgramId}
            onChange={(e) => setSelectedProgramId(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-cyan-300 font-medium focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            {EMBEDDED_PRESET_PROGRAMS.map((p) => (
              <option key={p.id} value={p.id}>
                [{p.board.toUpperCase()}] {p.name}
              </option>
            ))}
          </select>

          {/* Execution Controls */}
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-lg transition-all cursor-pointer ${
              isRunning
                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-500/20'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-white shadow-cyan-500/20'
            }`}
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
            {isRunning ? 'Halt Simulation' : 'Flash & Run Firmware'}
          </button>

          <button
            onClick={handleStep}
            disabled={isRunning}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs rounded-lg text-slate-300 font-medium transition-colors"
            title="Execute Single Instruction Step"
          >
            Step ⏭
          </button>

          <button
            onClick={handleReset}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
            title="Reset Microcontroller"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => onAskAI?.(activeProgram.name, { code: customCode, board: boardType })}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-800/40 rounded-lg text-xs font-medium transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI Explain Firmware
          </button>
        </div>
      </div>

      {/* Main Grid: Left Code Editor | Center Interactive Hardware Board & Breadboard | Right Serial Monitor */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: C++/Arduino Code Editor */}
        <div className="w-1/3 bg-slate-900/90 border-r border-slate-800 flex flex-col shrink-0">
          <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <Code className="w-4 h-4 text-cyan-400" />
              <span>firmware.ino</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">GCC C++ 11</span>
          </div>

          <div className="flex-1 p-2 bg-slate-950">
            <textarea
              value={customCode}
              onChange={(e) => setCustomCode(e.target.value)}
              className="w-full h-full bg-slate-950 text-cyan-100 font-mono text-xs p-3 focus:outline-none resize-none border border-slate-800 rounded-lg leading-relaxed selection:bg-cyan-500/30"
              spellCheck={false}
            />
          </div>

          <div className="p-3 bg-slate-950/60 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Clock Speed:</span>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="100"
                max="1000"
                step="100"
                value={execSpeedMs}
                onChange={(e) => setExecSpeedMs(parseInt(e.target.value, 10))}
                className="w-24 accent-cyan-400 cursor-pointer"
              />
              <span className="font-mono text-cyan-400">{execSpeedMs}ms/tick</span>
            </div>
          </div>
        </div>

        {/* Center: Interactive Microcontroller Hardware & Peripherals */}
        <div className="flex-1 bg-slate-950 p-4 flex flex-col overflow-y-auto space-y-4">
          {/* Virtual Board Graphics */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                <h3 className="font-bold text-sm text-white">
                  {boardType === 'arduino-uno' ? 'Arduino Uno Rev 3' : 'ESP32 NodeMCU DevKit'}
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-400">
                Ticks: {boardState.cycleCount} | Status: {isRunning ? 'RUNNING' : 'HALTED'}
              </span>
            </div>

            {/* Board Pin Headers Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Digital Pins */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  Digital Header (GPIO 0-13)
                </span>
                <div className="grid grid-cols-7 gap-1.5">
                  {Object.entries(boardState.pins)
                    .slice(0, 14)
                    .map(([pinNum, pin]) => {
                      const isActive = pin.value > 0;
                      return (
                        <div
                          key={pinNum}
                          className={`p-1.5 rounded border text-center transition-all ${
                            isActive
                              ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-md shadow-cyan-500/20'
                              : 'bg-slate-900 border-slate-800 text-slate-500'
                          }`}
                        >
                          <div className="text-[9px] font-mono">{pin.label}</div>
                          <div className="text-xs font-bold font-mono">
                            {pin.mode === 'PWM' ? pin.value : isActive ? '1' : '0'}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Analog Inputs & Controls */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 space-y-3">
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Analog Input (ADC A0)
                  </span>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-400">Potentiometer Wiper</span>
                    <span className="text-cyan-300 font-bold">
                      {boardState.analogInputs[0]} / 1023 (
                      {((boardState.analogInputs[0] * 5.0) / 1023).toFixed(2)}V)
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1023"
                    value={boardState.analogInputs[0]}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      setBoardState((prev) => ({
                        ...prev,
                        analogInputs: { ...prev.analogInputs, 0: val },
                      }));
                    }}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Digital Input (Pin 2)
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      State: {boardState.pushButtons[2] ? 'PRESSED (LOW)' : 'RELEASED (PULLUP)'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onMouseDown={() => {
                      setBoardState((prev) => ({
                        ...prev,
                        pushButtons: { ...prev.pushButtons, 2: true },
                        pins: { ...prev.pins, 2: { ...prev.pins[2], value: 0 } },
                        serialOutput: [...prev.serialOutput.slice(-30), '[Interrupt] Button on Pin 2 PRESSED'],
                      }));
                    }}
                    onMouseUp={() => {
                      setBoardState((prev) => ({
                        ...prev,
                        pushButtons: { ...prev.pushButtons, 2: false },
                        pins: { ...prev.pins, 2: { ...prev.pins[2], value: 1 } },
                      }));
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      boardState.pushButtons[2]
                        ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-400/30'
                        : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'
                    }`}
                  >
                    {boardState.pushButtons[2] ? 'Pressed 🔘' : 'Press Button 🔘'}
                  </button>
                </div>
              </div>
            </div>

            {/* Hardware Peripherals Breadboard */}
            <div className="mt-5 pt-4 border-t border-slate-800">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Connected Hardware Actuators &amp; Indicators
              </h4>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Traffic LEDs or Standard LEDs */}
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col items-center justify-center gap-2">
                  <span className="text-xs font-medium text-slate-400">LED Indicators</span>
                  <div className="flex gap-3">
                    <div
                      className={`w-7 h-7 rounded-full border transition-all ${
                        boardState.pins[12]?.value
                          ? 'bg-rose-500 shadow-[0_0_15px_#f43f5e] border-rose-300'
                          : 'bg-slate-900 border-slate-800'
                      }`}
                      title="Red LED (Pin 12)"
                    />
                    <div
                      className={`w-7 h-7 rounded-full border transition-all ${
                        boardState.pins[11]?.value
                          ? 'bg-amber-400 shadow-[0_0_15px_#fbbf24] border-amber-200'
                          : 'bg-slate-900 border-slate-800'
                      }`}
                      title="Yellow LED (Pin 11)"
                    />
                    <div
                      className={`w-7 h-7 rounded-full border transition-all ${
                        boardState.pins[10]?.value || boardState.pins[13]?.value
                          ? 'bg-emerald-400 shadow-[0_0_15px_#34d399] border-emerald-200'
                          : 'bg-slate-900 border-slate-800'
                      }`}
                      title="Green LED (Pin 10 / Onboard 13)"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">Pins 12, 11, 10</span>
                </div>

                {/* 7-Segment Display */}
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col items-center justify-center">
                  <span className="text-xs font-medium text-slate-400 mb-1">7-Segment Display</span>
                  <div className="text-3xl font-mono font-black text-cyan-400 bg-slate-900 px-3 py-1 rounded border border-slate-800 shadow-inner">
                    {boardState.sevenSegmentValue ?? '0'}
                  </div>
                </div>

                {/* 16x2 I2C LCD Screen */}
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col justify-center">
                  <span className="text-[11px] font-medium text-slate-400 mb-1 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    I2C LCD 16x2 (0x27)
                  </span>
                  <div className="bg-[#1b4332] text-[#95d5b2] p-2 rounded border border-[#2d6a4f] font-mono text-[11px] leading-tight h-14 overflow-hidden whitespace-pre-wrap shadow-inner">
                    {boardState.lcdMessage || 'ECE SIMULAB\nSystem Ready...'}
                  </div>
                </div>

                {/* Micro Servo Motor */}
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col items-center justify-center gap-1">
                  <span className="text-xs font-medium text-slate-400">Micro Servo (Pin 9)</span>
                  <div className="relative w-16 h-10 border-b-2 border-slate-700 flex items-end justify-center">
                    <div
                      className="w-1.5 h-10 bg-cyan-400 origin-bottom rounded-full transition-transform duration-300"
                      style={{
                        transform: `rotate(${((boardState.servoAngleDeg || 0) - 90)}deg)`,
                      }}
                    />
                  </div>
                  <span className="text-xs font-mono font-bold text-cyan-300">
                    {boardState.servoAngleDeg ?? 0}°
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Serial Monitor Log */}
        <div className="w-80 bg-slate-900/90 border-l border-slate-800 flex flex-col shrink-0">
          <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>Serial Monitor (9600 baud)</span>
            </div>
            <button
              onClick={() =>
                setBoardState((prev) => ({ ...prev, serialOutput: ['[Log Cleared]'] }))
              }
              className="text-[10px] text-slate-400 hover:text-white"
            >
              Clear
            </button>
          </div>

          <div className="flex-1 p-3 bg-slate-950 font-mono text-[11px] text-emerald-400 overflow-y-auto space-y-1">
            {boardState.serialOutput.map((line, idx) => (
              <div key={idx} className="leading-snug break-words">
                {line}
              </div>
            ))}
            <div ref={serialEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
};

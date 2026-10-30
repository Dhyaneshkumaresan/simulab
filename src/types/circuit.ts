export type ComponentCategory = 'passive' | 'active' | 'sources' | 'digital' | 'measurement' | 'embedded';

export interface Terminal {
  id: string; // e.g. 't1', 't2', 'anode', 'cathode', 'base', 'collector', 'emitter'
  name: string;
  x: number; // offset from component center/top-left
  y: number;
  orientation?: 'top' | 'bottom' | 'left' | 'right';
}

export interface ComponentDefinition {
  type: string;
  label: string;
  category: ComponentCategory;
  defaultValues: Record<string, number | string>;
  units: Record<string, string>;
  terminals: Terminal[];
  width: number;
  height: number;
  equationDescription?: string;
}

export interface PlacedComponent {
  id: string;
  type: string;
  label: string;
  x: number;
  y: number;
  rotation: number; // 0, 90, 180, 270
  values: Record<string, number | string>;
  unit?: string;
}

export interface WireConnection {
  id: string;
  fromComponentId: string;
  fromTerminalId: string;
  toComponentId: string;
  toTerminalId: string;
}

export interface CircuitData {
  id: string;
  name: string;
  description: string;
  components: PlacedComponent[];
  wires: WireConnection[];
  createdAt: number;
  updatedAt: number;
  notes?: string;
}

// Analog Simulation Output
export interface SimulationPoint {
  time: number; // seconds
  voltageIn?: number;
  voltageOut?: number;
  current?: number;
  power?: number;
  nodeVoltages?: Record<string, number>;
}

export interface AnalogSimulationResult {
  circuitType: string;
  timeVector: number[];
  inputWaveform: number[];
  outputWaveform: number[];
  currentWaveform?: number[];
  dcOperatingPoints?: {
    nodeVoltages: Record<string, number>;
    branchCurrents: Record<string, number>;
    componentPower: Record<string, number>;
  };
  acAnalysis?: {
    frequencyVector: number[];
    magnitudeDb: number[];
    phaseDeg: number[];
    bandwidthHz?: number;
    cutoffFrequencyHz?: number;
    peakGainDb?: number;
  };
  metrics: {
    peakToPeakIn: number;
    peakToPeakOut: number;
    gain: number;
    gainDb: number;
    rmsIn: number;
    rmsOut: number;
    frequencyHz: number;
    phaseShiftDeg: number;
    thdPercent?: number;
  };
  summaryText: string;
}

// Digital Simulation Models
export interface DigitalState {
  inputs: Record<string, boolean>;
  outputs: Record<string, boolean>;
  internalState?: Record<string, any>;
  clockCycle?: number;
}

export interface TimingTrace {
  name: string;
  type: 'clock' | 'input' | 'output' | 'state';
  values: number[]; // 0 or 1 at each time step
}

export interface TruthTableRow {
  inputs: Record<string, number>;
  outputs: Record<string, number>;
}

// Embedded System Laboratory Models
export interface VirtualPin {
  pinNumber: number;
  label: string;
  mode: 'INPUT' | 'OUTPUT' | 'INPUT_PULLUP' | 'ANALOG_IN' | 'PWM';
  value: number; // 0 or 1 for digital, 0-1023 for analog, 0-255 for PWM
  connectedComponent?: string;
}

export interface EmbeddedBoardState {
  boardType: 'arduino-uno' | 'esp32';
  powerOn: boolean;
  running: boolean;
  pins: Record<number, VirtualPin>;
  serialOutput: string[];
  analogInputs: Record<number, number>; // pot sliders (0-1023)
  pushButtons: Record<number, boolean>; // button pressed state
  cycleCount: number;
  ledMatrix?: number[]; // for 8x8 or NeoPixels
  sevenSegmentValue?: string;
  lcdMessage?: string;
  servoAngleDeg?: number;
}

// Lab Experiment definition
export interface Experiment {
  id: string;
  title: string;
  category: 'analog' | 'digital' | 'embedded' | 'network_theory';
  aim: string;
  apparatus: string[];
  theory: string;
  formulas: { label: string; formula: string; explanation: string }[];
  procedure: string[];
  defaultCircuit: CircuitData;
  vivaQuestions: { question: string; answer: string; concept: string }[];
  observationColumns: { key: string; label: string; unit: string }[];
}

import { AnalogSimulationResult } from '../types/circuit';

export interface CircuitParameters {
  resistance?: number; // Ohms
  resistance2?: number; // Ohms
  capacitance?: number; // microFarads
  inductance?: number; // milliHenries
  supplyVoltage?: number; // Volts DC or Vpk AC
  frequency?: number; // Hertz
  inputWaveformType?: 'sine' | 'square' | 'triangle' | 'step';
  zenerVoltage?: number; // Volts
  diodeForwardDrop?: number; // Volts (0.7V standard)
  beta?: number; // Transistor hfe
  loadResistance?: number; // Ohms
  capacitorFilter?: number; // microFarads
  biasVoltage?: number; // Volts
  wiperPercent?: number; // 0-100%
}

// Numerical solver for Analog Electronics
export function simulateAnalogCircuit(
  experimentKey: string,
  params: CircuitParameters
): AnalogSimulationResult {
  const points = 300;
  const R1 = Math.max(1, params.resistance || 1000);
  const R2 = Math.max(1, params.resistance2 || 2200);
  const C_uF = Math.max(0.001, params.capacitance || 10);
  const C = C_uF * 1e-6;
  const L_mH = Math.max(0.01, params.inductance || 10);
  const L = L_mH * 1e-3;
  const Vin = Math.max(0.1, params.supplyVoltage ?? 5);
  const freq = Math.max(1, params.frequency || 1000);
  const omega = 2 * Math.PI * freq;
  const period = 1 / (freq || 1);

  const timeVector: number[] = [];
  const inputWaveform: number[] = [];
  const outputWaveform: number[] = [];
  const currentWaveform: number[] = [];

  switch (experimentKey) {
    case 'ohms_law': {
      // Sweeping voltage from 0 to Vin
      const vSweep = Array.from({ length: 50 }, (_, i) => (Vin * i) / 49);
      const iSweep = vSweep.map((v) => (v / R1) * 1000); // mA
      const pSweep = vSweep.map((v, i) => (v * (v / R1))); // W

      const current_mA = (Vin / R1) * 1000;
      const power_W = (Vin * Vin) / R1;

      return {
        circuitType: "Ohm's Law Verification",
        timeVector: vSweep, // Used as V-axis
        inputWaveform: vSweep,
        outputWaveform: iSweep, // Used as I-axis (mA)
        currentWaveform: pSweep,
        dcOperatingPoints: {
          nodeVoltages: { 'V_in': Vin, 'V_gnd': 0 },
          branchCurrents: { 'I_resistor': current_mA },
          componentPower: { 'P_resistor': power_W },
        },
        metrics: {
          peakToPeakIn: Vin,
          peakToPeakOut: current_mA,
          gain: 1 / R1,
          gainDb: 20 * Math.log10(1 / R1),
          rmsIn: Vin,
          rmsOut: current_mA,
          frequencyHz: 0,
          phaseShiftDeg: 0,
        },
        summaryText: `Current I = V / R = ${Vin}V / ${R1}Ω = ${current_mA.toFixed(2)} mA. Power dissipated = ${power_W.toFixed(3)} W.`,
      };
    }

    case 'voltage_divider': {
      // Vout = Vin * (R2 / (R1 + R2))
      const Vout = Vin * (R2 / (R1 + R2));
      const I_total_mA = (Vin / (R1 + R2)) * 1000;
      const P_total = Vin * (I_total_mA / 1000);

      // Generate AC response if AC or steady DC
      const tMax = period * 2;
      for (let i = 0; i < points; i++) {
        const t = (i / (points - 1)) * tMax;
        const vInVal = Vin * Math.sin(omega * t);
        const vOutVal = vInVal * (R2 / (R1 + R2));
        timeVector.push(t);
        inputWaveform.push(vInVal);
        outputWaveform.push(vOutVal);
        currentWaveform.push((vInVal / (R1 + R2)) * 1000);
      }

      return {
        circuitType: 'Voltage & Current Division',
        timeVector,
        inputWaveform,
        outputWaveform,
        currentWaveform,
        dcOperatingPoints: {
          nodeVoltages: { 'Node_In': Vin, 'Node_Mid_Vout': Vout, 'GND': 0 },
          branchCurrents: { 'I_branch': I_total_mA },
          componentPower: { 'P_R1': Math.pow(Vin - Vout, 2) / R1, 'P_R2': Math.pow(Vout, 2) / R2 },
        },
        metrics: {
          peakToPeakIn: 2 * Vin,
          peakToPeakOut: 2 * Vout,
          gain: R2 / (R1 + R2),
          gainDb: 20 * Math.log10(R2 / (R1 + R2)),
          rmsIn: Vin / Math.SQRT2,
          rmsOut: Vout / Math.SQRT2,
          frequencyHz: freq,
          phaseShiftDeg: 0,
        },
        summaryText: `Voltage Division Ratio: ${(R2 / (R1 + R2)).toFixed(3)}. Vout = ${Vout.toFixed(2)}V for Vin = ${Vin}V. Branch current = ${I_total_mA.toFixed(2)} mA.`,
      };
    }

    case 'rc_transient': {
      // RC Charging and Discharging
      const tau = R1 * C; // seconds
      const tMax = 5 * tau; // 5 time constants
      for (let i = 0; i < points; i++) {
        const t = (i / (points - 1)) * tMax;
        timeVector.push(t);
        // Step input 0 to Vin
        const vinVal = Vin;
        // Vc(t) = Vin * (1 - e^(-t/tau))
        const vc = Vin * (1 - Math.exp(-t / tau));
        // Current i(t) = (Vin / R) * e^(-t/tau)
        const i_mA = (Vin / R1) * Math.exp(-t / tau) * 1000;

        inputWaveform.push(vinVal);
        outputWaveform.push(vc);
        currentWaveform.push(i_mA);
      }

      return {
        circuitType: 'RC Charging & Discharging Transient',
        timeVector,
        inputWaveform,
        outputWaveform,
        currentWaveform,
        metrics: {
          peakToPeakIn: Vin,
          peakToPeakOut: Vin,
          gain: 1,
          gainDb: 0,
          rmsIn: Vin,
          rmsOut: Vin * 0.707,
          frequencyHz: 1 / (2 * Math.PI * tau),
          phaseShiftDeg: -45,
        },
        summaryText: `Time constant τ = R × C = ${R1}Ω × ${C_uF}µF = ${(tau * 1000).toFixed(2)} ms. At t = 1τ, Vc reaches 63.2% (${(Vin * 0.632).toFixed(2)}V). Fully charged at 5τ (${(tMax * 1000).toFixed(1)} ms).`,
      };
    }

    case 'rlc_resonance': {
      // Series RLC Resonance & Transient
      // fo = 1 / (2 * pi * sqrt(L * C))
      const f0 = 1 / (2 * Math.PI * Math.sqrt(L * C));
      const Q = (1 / R1) * Math.sqrt(L / C);
      const alpha = R1 / (2 * L);
      const omega0 = 1 / Math.sqrt(L * C);
      const omegaD = omega0 > alpha ? Math.sqrt(omega0 * omega0 - alpha * alpha) : 0;

      // Frequency response sweep (Bode Plot)
      const freqVector: number[] = [];
      const magDbVector: number[] = [];
      const phaseDegVector: number[] = [];

      for (let f = Math.max(10, f0 * 0.1); f <= f0 * 10; f += (f0 * 9.9) / 200) {
        const w = 2 * Math.PI * f;
        const XL = w * L;
        const XC = 1 / (w * C);
        const Z_mag = Math.sqrt(R1 * R1 + Math.pow(XL - XC, 2));
        const Vout_R = (Vin * R1) / Z_mag; // across resistor
        const gain = Vout_R / Vin;
        const phase = -Math.atan2(XL - XC, R1) * (180 / Math.PI);

        freqVector.push(f);
        magDbVector.push(20 * Math.log10(Math.max(1e-4, gain)));
        phaseDegVector.push(phase);
      }

      // Transient response to step
      const tMax = Math.min(0.01, 10 / alpha);
      for (let i = 0; i < points; i++) {
        const t = (i / (points - 1)) * tMax;
        timeVector.push(t);
        inputWaveform.push(Vin);
        // Underdamped step response
        let vOutVal = Vin;
        if (omega0 > alpha && omegaD > 0) {
          vOutVal = Vin * (1 - Math.exp(-alpha * t) * (Math.cos(omegaD * t) + (alpha / omegaD) * Math.sin(omegaD * t)));
        } else {
          vOutVal = Vin * (1 - Math.exp(-alpha * t));
        }
        outputWaveform.push(vOutVal);
        currentWaveform.push(Math.exp(-alpha * t) * Math.sin(omegaD * t) * (Vin / (omegaD * L || 1)) * 1000);
      }

      return {
        circuitType: 'RLC Resonance & Transient Analysis',
        timeVector,
        inputWaveform,
        outputWaveform,
        currentWaveform,
        acAnalysis: {
          frequencyVector: freqVector,
          magnitudeDb: magDbVector,
          phaseDeg: phaseDegVector,
          cutoffFrequencyHz: f0,
          peakGainDb: 0,
          bandwidthHz: f0 / (Q || 1),
        },
        metrics: {
          peakToPeakIn: 2 * Vin,
          peakToPeakOut: 2 * Vin * Math.min(Q, 5),
          gain: Q,
          gainDb: 20 * Math.log10(Math.max(1, Q)),
          rmsIn: Vin / Math.SQRT2,
          rmsOut: (Vin * Q) / Math.SQRT2,
          frequencyHz: f0,
          phaseShiftDeg: 0,
        },
        summaryText: `Resonant Frequency fo = 1 / (2π√(LC)) = ${f0.toFixed(1)} Hz. Quality Factor Q = ${Q.toFixed(2)}. Damping: ${alpha > omega0 ? 'Overdamped' : alpha === omega0 ? 'Critically Damped' : 'Underdamped (ringing)'}.`,
      };
    }

    case 'diode_characteristics': {
      // PN Junction Diode Forward and Reverse IV curve
      // Id = Is * (exp(Vd / (n * Vt)) - 1)
      const Is = 1e-12; // 1 pA
      const Vt = 0.026; // 26 mV thermal voltage
      const eta = 1.3;
      const vAxis: number[] = [];
      const iAxis_mA: number[] = [];

      for (let v = -2.0; v <= 0.85; v += 0.01) {
        vAxis.push(v);
        let id = 0;
        if (v < 0) {
          id = -Is;
        } else {
          id = Is * (Math.exp(v / (eta * Vt)) - 1);
          // clamp to realistic max 200mA
          id = Math.min(id, 0.2);
        }
        iAxis_mA.push(id * 1000);
      }

      return {
        circuitType: 'PN Junction Diode Forward & Reverse Characteristics',
        timeVector: vAxis, // Vd voltage
        inputWaveform: vAxis,
        outputWaveform: iAxis_mA, // Id (mA)
        metrics: {
          peakToPeakIn: 2.85,
          peakToPeakOut: Math.max(...iAxis_mA),
          gain: 1,
          gainDb: 0,
          rmsIn: 0.7,
          rmsOut: 50,
          frequencyHz: 0,
          phaseShiftDeg: 0,
        },
        summaryText: 'Knee / Cut-in Voltage Vγ ≈ 0.65V - 0.7V for Silicon. Below cut-in, conduction is negligible. Dynamic resistance rd = ΔVd / ΔId ≈ 26mV / Id.',
      };
    }

    case 'zener_regulator': {
      // Zener Diode Voltage Regulation
      const Vz = params.zenerVoltage || 5.1;
      const R_series = R1;
      const R_load = params.loadResistance || 1000;

      // Sweeping Vin from 0 to 20V
      const vinSweep: number[] = [];
      const voutSweep: number[] = [];
      const izSweep: number[] = [];

      for (let v = 0; v <= 20; v += 0.2) {
        vinSweep.push(v);
        const unregV = v * (R_load / (R_series + R_load));
        if (unregV < Vz) {
          voutSweep.push(unregV);
          izSweep.push(0);
        } else {
          voutSweep.push(Vz);
          const iTotal = (v - Vz) / R_series;
          const iLoad = Vz / R_load;
          izSweep.push(Math.max(0, (iTotal - iLoad) * 1000));
        }
      }

      return {
        circuitType: 'Zener Diode Voltage Regulator (Line Regulation)',
        timeVector: vinSweep,
        inputWaveform: vinSweep,
        outputWaveform: voutSweep,
        currentWaveform: izSweep,
        metrics: {
          peakToPeakIn: 20,
          peakToPeakOut: Vz,
          gain: Vz / Vin,
          gainDb: 20 * Math.log10(Vz / Vin),
          rmsIn: 10,
          rmsOut: Vz,
          frequencyHz: 0,
          phaseShiftDeg: 0,
        },
        summaryText: `Zener Breakdown Voltage Vz = ${Vz}V. Output clamps firmly at ${Vz}V for Vin > ${(Vz * (1 + R_series / R_load)).toFixed(1)}V. Excellent line regulation.`,
      };
    }

    case 'half_wave_rectifier': {
      // Half-wave rectifier with optional C filter
      const C_filt = (params.capacitorFilter || 0) * 1e-6;
      const RL = params.loadResistance || 1000;
      const Vf = 0.7; // diode drop
      const tMax = period * 3;

      let vCap = 0;
      for (let i = 0; i < points; i++) {
        const t = (i / (points - 1)) * tMax;
        timeVector.push(t);
        const vinVal = Vin * Math.sin(omega * t);
        inputWaveform.push(vinVal);

        let vOutVal = 0;
        if (C_filt > 0) {
          // With capacitor filter
          const vPeak = Math.max(0, vinVal - Vf);
          if (vPeak > vCap) {
            vCap = vPeak; // charging
          } else {
            // discharging: vCap = vCap * exp(-dt / (RL * C))
            const dt = tMax / (points - 1);
            vCap = vCap * Math.exp(-dt / (RL * C_filt));
          }
          vOutVal = vCap;
        } else {
          // Unfiltered
          vOutVal = vinVal > Vf ? vinVal - Vf : 0;
        }

        outputWaveform.push(vOutVal);
        currentWaveform.push((vOutVal / RL) * 1000);
      }

      const Vdc = C_filt > 0 ? (Vin - Vf) - ((Vin - Vf) / (2 * freq * RL * C_filt)) : (Vin - Vf) / Math.PI;
      const rippleFactor = C_filt > 0 ? 1 / (2 * Math.SQRT2 * freq * RL * C_filt) : 1.21;

      return {
        circuitType: 'Half-Wave Rectifier' + (C_filt > 0 ? ' with C-Filter' : ''),
        timeVector,
        inputWaveform,
        outputWaveform,
        currentWaveform,
        metrics: {
          peakToPeakIn: 2 * Vin,
          peakToPeakOut: Math.max(...outputWaveform) - Math.min(...outputWaveform),
          gain: Vdc / Vin,
          gainDb: 20 * Math.log10(Math.max(1e-4, Vdc / Vin)),
          rmsIn: Vin / Math.SQRT2,
          rmsOut: Vdc,
          frequencyHz: freq,
          phaseShiftDeg: 0,
        },
        summaryText: `DC Output Voltage Vdc = ${Vdc.toFixed(2)}V. Ripple Factor γ = ${rippleFactor.toFixed(3)}. Peak Inverse Voltage PIV = ${Vin.toFixed(1)}V. Rectification efficiency η = ${C_filt > 0 ? '78%' : '40.6%'}.`,
      };
    }

    case 'full_wave_rectifier': {
      // Full-wave bridge rectifier
      const C_filt = (params.capacitorFilter || 0) * 1e-6;
      const RL = params.loadResistance || 1000;
      const Vf2 = 1.4; // 2 diode drops for bridge
      const tMax = period * 3;

      let vCap = 0;
      for (let i = 0; i < points; i++) {
        const t = (i / (points - 1)) * tMax;
        timeVector.push(t);
        const vinVal = Vin * Math.sin(omega * t);
        inputWaveform.push(vinVal);

        const vRectified = Math.max(0, Math.abs(vinVal) - Vf2);
        let vOutVal = 0;
        if (C_filt > 0) {
          if (vRectified > vCap) {
            vCap = vRectified;
          } else {
            const dt = tMax / (points - 1);
            vCap = vCap * Math.exp(-dt / (RL * C_filt));
          }
          vOutVal = vCap;
        } else {
          vOutVal = vRectified;
        }

        outputWaveform.push(vOutVal);
        currentWaveform.push((vOutVal / RL) * 1000);
      }

      const Vdc = C_filt > 0 ? (Vin - Vf2) - ((Vin - Vf2) / (4 * freq * RL * C_filt)) : (2 * (Vin - Vf2)) / Math.PI;
      const rippleFactor = C_filt > 0 ? 1 / (4 * Math.SQRT2 * freq * RL * C_filt) : 0.482;

      return {
        circuitType: 'Full-Wave Bridge Rectifier' + (C_filt > 0 ? ' with C-Filter' : ''),
        timeVector,
        inputWaveform,
        outputWaveform,
        currentWaveform,
        metrics: {
          peakToPeakIn: 2 * Vin,
          peakToPeakOut: Math.max(...outputWaveform) - Math.min(...outputWaveform),
          gain: Vdc / Vin,
          gainDb: 20 * Math.log10(Math.max(1e-4, Vdc / Vin)),
          rmsIn: Vin / Math.SQRT2,
          rmsOut: Vdc,
          frequencyHz: 2 * freq, // Ripple frequency is doubled!
          phaseShiftDeg: 0,
        },
        summaryText: `Full-Wave Bridge DC Voltage Vdc = ${Vdc.toFixed(2)}V. Output ripple frequency = 2 × fin = ${2 * freq} Hz. Ripple Factor γ = ${rippleFactor.toFixed(3)}. Efficiency η = ${C_filt > 0 ? '88%' : '81.2%'}.`,
      };
    }

    case 'bjt_ce_amplifier': {
      // BJT Common Emitter Amplifier
      const Vcc = 12;
      const Rc = R1 || 2200;
      const Re = 470;
      const R_b1 = 47000;
      const R_b2 = 10000;
      const beta = params.beta || 150;

      // DC Bias Point (Q-Point)
      const Vth = Vcc * (R_b2 / (R_b1 + R_b2));
      const Rth = (R_b1 * R_b2) / (R_b1 + R_b2);
      const Ib = (Vth - 0.7) / (Rth + (beta + 1) * Re);
      const Ic = beta * Ib;
      const Vce = Vcc - Ic * (Rc + Re);
      const gm = Ic / 0.026; // transconductance A/V
      const r_pi = beta / gm;
      const Av = -gm * Rc; // Inverting AC Gain!

      // Transient simulation with small AC signal
      const v_ac_in = 0.02; // 20 mV pk input
      const tMax = period * 3;
      for (let i = 0; i < points; i++) {
        const t = (i / (points - 1)) * tMax;
        timeVector.push(t);
        const vinVal = v_ac_in * Math.sin(omega * t);
        // Output inverted and amplified + DC offset
        const vOutVal = Vce + Av * vinVal;
        inputWaveform.push(vinVal * 1000); // in mV
        outputWaveform.push(vOutVal); // in V
        currentWaveform.push((Ic + gm * vinVal) * 1000); // in mA
      }

      // Bode plot AC sweep
      const freqVector: number[] = [];
      const magDbVector: number[] = [];
      const phaseDegVector: number[] = [];
      const f_low = 100;
      const f_high = 200000;

      for (let f = 10; f <= 1000000; f *= 1.3) {
        freqVector.push(f);
        // 3-pole bandwidth rolloff model
        const lowCut = 1 / Math.sqrt(1 + Math.pow(f_low / f, 2));
        const highCut = 1 / Math.sqrt(1 + Math.pow(f / f_high, 2));
        const gainAtF = Math.abs(Av) * lowCut * highCut;
        magDbVector.push(20 * Math.log10(Math.max(1e-3, gainAtF)));
        phaseDegVector.push(-180 + Math.atan(f_low / f) * (180 / Math.PI) - Math.atan(f / f_high) * (180 / Math.PI));
      }

      return {
        circuitType: 'BJT Common Emitter (CE) Amplifier',
        timeVector,
        inputWaveform,
        outputWaveform,
        currentWaveform,
        dcOperatingPoints: {
          nodeVoltages: { 'V_Base': Vth, 'V_Collector (Q)': Vce, 'V_Emitter': Ic * Re, 'Vcc': Vcc },
          branchCurrents: { 'Ic_Q': Ic * 1000, 'Ib_Q': Ib * 1e6 },
          componentPower: { 'P_Transistor': Vce * Ic },
        },
        acAnalysis: {
          frequencyVector: freqVector,
          magnitudeDb: magDbVector,
          phaseDeg: phaseDegVector,
          bandwidthHz: f_high - f_low,
          peakGainDb: 20 * Math.log10(Math.abs(Av)),
        },
        metrics: {
          peakToPeakIn: 2 * v_ac_in * 1000, // mV
          peakToPeakOut: 2 * Math.abs(Av) * v_ac_in, // V
          gain: Math.abs(Av),
          gainDb: 20 * Math.log10(Math.abs(Av)),
          rmsIn: (v_ac_in * 1000) / Math.SQRT2,
          rmsOut: (Math.abs(Av) * v_ac_in) / Math.SQRT2,
          frequencyHz: freq,
          phaseShiftDeg: 180, // 180 degree phase reversal
        },
        summaryText: `Q-Point: Vce = ${Vce.toFixed(2)}V, Ic = ${(Ic * 1000).toFixed(2)} mA. AC Voltage Gain Av = ${Av.toFixed(1)} (${(20 * Math.log10(Math.abs(Av))).toFixed(1)} dB). Inverting 180° phase shift. Bandwidth = ${((f_high - f_low) / 1000).toFixed(1)} kHz.`,
      };
    }

    case 'astable_multivibrator': {
      // 555 Timer Astable Multivibrator
      const Ra = R1 || 4700;
      const Rb = R2 || 10000;
      const T1 = 0.693 * (Ra + Rb) * C; // High time
      const T2 = 0.693 * Rb * C; // Low time
      const totalPeriod = T1 + T2;
      const oscFreq = 1.44 / ((Ra + 2 * Rb) * C);
      const dutyCyclePercent = ((Ra + Rb) / (Ra + 2 * Rb)) * 100;

      const tMax = totalPeriod * 3;
      for (let i = 0; i < points; i++) {
        const t = (i / (points - 1)) * tMax;
        timeVector.push(t);
        const tMod = t % totalPeriod;

        // Capacitor voltage charges between 1/3 Vcc and 2/3 Vcc
        let vCap = 0;
        let vOut = 0;
        if (tMod < T1) {
          // Charging towards Vcc
          vCap = (Vin / 3) + (Vin * 2 / 3) * (1 - Math.exp(-tMod / ((Ra + Rb) * C)));
          vOut = Vin;
        } else {
          // Discharging towards GND
          const tDischarge = tMod - T1;
          vCap = (Vin * 2 / 3) * Math.exp(-tDischarge / (Rb * C));
          vOut = 0;
        }

        inputWaveform.push(vCap); // Capacitor triangle waveform
        outputWaveform.push(vOut); // Square wave output
        currentWaveform.push((vOut / 1000) * 1000);
      }

      return {
        circuitType: '555 Timer Astable Multivibrator (Free Running Oscillator)',
        timeVector,
        inputWaveform, // V_capacitor
        outputWaveform, // V_out
        metrics: {
          peakToPeakIn: Vin * (2 / 3 - 1 / 3),
          peakToPeakOut: Vin,
          gain: 1,
          gainDb: 0,
          rmsIn: Vin / 2,
          rmsOut: Vin * Math.sqrt(dutyCyclePercent / 100),
          frequencyHz: oscFreq,
          phaseShiftDeg: 0,
        },
        summaryText: `Oscillation Frequency f = 1.44 / [(Ra + 2Rb) × C] = ${oscFreq.toFixed(1)} Hz. Duty Cycle = ${dutyCyclePercent.toFixed(1)}%. Charging High Time T1 = ${(T1 * 1000).toFixed(2)} ms, Discharging Low Time T2 = ${(T2 * 1000).toFixed(2)} ms.`,
      };
    }

    case 'rc_filter_lowpass':
    default: {
      // Passive RC Low-Pass Filter
      const fc = 1 / (2 * Math.PI * R1 * C);
      const tMax = period * 3;

      for (let i = 0; i < points; i++) {
        const t = (i / (points - 1)) * tMax;
        timeVector.push(t);
        const vinVal = Vin * Math.sin(omega * t);
        // Transfer function H(jw) = 1 / (1 + j*w*R*C)
        const mag = 1 / Math.sqrt(1 + Math.pow(freq / fc, 2));
        const phase = -Math.atan(freq / fc);
        const vOutVal = Vin * mag * Math.sin(omega * t + phase);

        inputWaveform.push(vinVal);
        outputWaveform.push(vOutVal);
        currentWaveform.push((vinVal / R1) * 1000);
      }

      // AC Sweep Bode Plot
      const freqVector: number[] = [];
      const magDbVector: number[] = [];
      const phaseDegVector: number[] = [];

      for (let f = 10; f <= 100000; f *= 1.25) {
        freqVector.push(f);
        const mag = 1 / Math.sqrt(1 + Math.pow(f / fc, 2));
        magDbVector.push(20 * Math.log10(mag));
        phaseDegVector.push(-Math.atan(f / fc) * (180 / Math.PI));
      }

      return {
        circuitType: 'Passive 1st-Order RC Low-Pass Filter',
        timeVector,
        inputWaveform,
        outputWaveform,
        currentWaveform,
        acAnalysis: {
          frequencyVector: freqVector,
          magnitudeDb: magDbVector,
          phaseDeg: phaseDegVector,
          cutoffFrequencyHz: fc,
          peakGainDb: 0,
        },
        metrics: {
          peakToPeakIn: 2 * Vin,
          peakToPeakOut: 2 * Vin / Math.sqrt(1 + Math.pow(freq / fc, 2)),
          gain: 1 / Math.sqrt(1 + Math.pow(freq / fc, 2)),
          gainDb: 20 * Math.log10(1 / Math.sqrt(1 + Math.pow(freq / fc, 2))),
          rmsIn: Vin / Math.SQRT2,
          rmsOut: (Vin / Math.sqrt(1 + Math.pow(freq / fc, 2))) / Math.SQRT2,
          frequencyHz: freq,
          phaseShiftDeg: -Math.atan(freq / fc) * (180 / Math.PI),
        },
        summaryText: `Cutoff Frequency fc = 1 / (2πRC) = ${fc.toFixed(1)} Hz. At fc, gain drops by -3 dB (0.707) and phase lags by -45°. High frequencies roll off at -20 dB/decade.`,
      };
    }
  }
}

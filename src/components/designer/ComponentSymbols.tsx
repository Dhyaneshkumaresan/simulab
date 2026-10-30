import React from 'react';
import { PlacedComponent } from '../../types/circuit';

interface SymbolProps {
  component: PlacedComponent;
  isSelected?: boolean;
  isSimulating?: boolean;
  liveState?: any;
}

export const ComponentSymbol: React.FC<SymbolProps> = ({
  component,
  isSelected = false,
  isSimulating = false,
  liveState,
}) => {
  const { type, values, label } = component;
  const strokeColor = isSelected ? '#38bdf8' : '#94a3b8';
  const fillColor = 'none';

  switch (type) {
    case 'resistor':
      return (
        <svg width="80" height="40" viewBox="0 0 80 40">
          <line x1="0" y1="20" x2="15" y2="20" stroke={strokeColor} strokeWidth="2" />
          <path
            d="M 15 20 L 20 8 L 28 32 L 36 8 L 44 32 L 52 8 L 60 32 L 65 20"
            fill="none"
            stroke={strokeColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <line x1="65" y1="20" x2="80" y2="20" stroke={strokeColor} strokeWidth="2" />
          <text x="40" y="38" textAnchor="middle" fill="#38bdf8" fontSize="10" fontWeight="600">
            {values.resistance ? `${values.resistance}Ω` : '1kΩ'}
          </text>
        </svg>
      );

    case 'capacitor':
      return (
        <svg width="80" height="40" viewBox="0 0 80 40">
          <line x1="0" y1="20" x2="35" y2="20" stroke={strokeColor} strokeWidth="2" />
          <line x1="35" y1="6" x2="35" y2="34" stroke={strokeColor} strokeWidth="3" />
          <line x1="45" y1="6" x2="45" y2="34" stroke={strokeColor} strokeWidth="3" />
          <line x1="45" y1="20" x2="80" y2="20" stroke={strokeColor} strokeWidth="2" />
          <text x="40" y="38" textAnchor="middle" fill="#38bdf8" fontSize="10" fontWeight="600">
            {values.capacitance ? `${values.capacitance}µF` : '10µF'}
          </text>
        </svg>
      );

    case 'inductor':
      return (
        <svg width="80" height="40" viewBox="0 0 80 40">
          <line x1="0" y1="20" x2="16" y2="20" stroke={strokeColor} strokeWidth="2" />
          <path
            d="M 16 20 A 8 8 0 0 1 32 20 A 8 8 0 0 1 48 20 A 8 8 0 0 1 64 20"
            fill="none"
            stroke={strokeColor}
            strokeWidth="2.5"
          />
          <line x1="64" y1="20" x2="80" y2="20" stroke={strokeColor} strokeWidth="2" />
          <text x="40" y="38" textAnchor="middle" fill="#38bdf8" fontSize="10" fontWeight="600">
            {values.inductance ? `${values.inductance}mH` : '10mH'}
          </text>
        </svg>
      );

    case 'potentiometer':
      return (
        <svg width="80" height="60" viewBox="0 0 80 60">
          <line x1="0" y1="40" x2="15" y2="40" stroke={strokeColor} strokeWidth="2" />
          <path
            d="M 15 40 L 20 28 L 28 52 L 36 28 L 44 52 L 52 28 L 60 52 L 65 40"
            fill="none"
            stroke={strokeColor}
            strokeWidth="2"
          />
          <line x1="65" y1="40" x2="80" y2="40" stroke={strokeColor} strokeWidth="2" />
          {/* Wiper arrow */}
          <line x1="40" y1="0" x2="40" y2="22" stroke="#38bdf8" strokeWidth="2" />
          <polygon points="40,30 36,22 44,22" fill="#38bdf8" />
          <text x="40" y="58" textAnchor="middle" fill="#38bdf8" fontSize="9">
            {values.wiperPosition ?? 50}%
          </text>
        </svg>
      );

    case 'transformer':
      return (
        <svg width="80" height="80" viewBox="0 0 80 80">
          <line x1="0" y1="20" x2="20" y2="20" stroke={strokeColor} strokeWidth="2" />
          <line x1="0" y1="60" x2="20" y2="60" stroke={strokeColor} strokeWidth="2" />
          <path d="M 20 20 A 7 7 0 0 1 20 34 A 7 7 0 0 1 20 48 A 7 7 0 0 1 20 62" fill="none" stroke={strokeColor} strokeWidth="2.5" />
          {/* Core */}
          <line x1="38" y1="14" x2="38" y2="66" stroke="#64748b" strokeWidth="2" strokeDasharray="3 2" />
          <line x1="42" y1="14" x2="42" y2="66" stroke="#64748b" strokeWidth="2" strokeDasharray="3 2" />
          <path d="M 60 20 A 7 7 0 0 0 60 34 A 7 7 0 0 0 60 48 A 7 7 0 0 0 60 62" fill="none" stroke={strokeColor} strokeWidth="2.5" />
          <line x1="60" y1="20" x2="80" y2="20" stroke={strokeColor} strokeWidth="2" />
          <line x1="60" y1="60" x2="80" y2="60" stroke={strokeColor} strokeWidth="2" />
          <text x="40" y="78" textAnchor="middle" fill="#38bdf8" fontSize="9">{values.turnsRatio || '10'}:1</text>
        </svg>
      );

    case 'diode':
      return (
        <svg width="80" height="40" viewBox="0 0 80 40">
          <line x1="0" y1="20" x2="30" y2="20" stroke={strokeColor} strokeWidth="2" />
          <polygon points="30,8 30,32 52,20" fill={isSelected ? '#0284c7' : '#1e293b'} stroke={strokeColor} strokeWidth="2" />
          <line x1="52" y1="8" x2="52" y2="32" stroke={strokeColor} strokeWidth="2.5" />
          <line x1="52" y1="20" x2="80" y2="20" stroke={strokeColor} strokeWidth="2" />
          <text x="40" y="38" textAnchor="middle" fill="#94a3b8" fontSize="9">1N4007</text>
        </svg>
      );

    case 'zener_diode':
      return (
        <svg width="80" height="40" viewBox="0 0 80 40">
          <line x1="0" y1="20" x2="30" y2="20" stroke={strokeColor} strokeWidth="2" />
          <polygon points="30,8 30,32 52,20" fill={isSelected ? '#0284c7' : '#1e293b'} stroke={strokeColor} strokeWidth="2" />
          {/* Zener cathode wings */}
          <path d="M 48 8 L 52 8 L 52 32 L 56 32" fill="none" stroke={strokeColor} strokeWidth="2" />
          <line x1="52" y1="20" x2="80" y2="20" stroke={strokeColor} strokeWidth="2" />
          <text x="40" y="38" textAnchor="middle" fill="#38bdf8" fontSize="9">{values.zenerVoltage || '5.1'}V</text>
        </svg>
      );

    case 'led':
      const isLit = Boolean(liveState?.isLit || (isSimulating && (values.state === 1 || values.state === '1')));
      return (
        <svg width="80" height="40" viewBox="0 0 80 40">
          <line x1="0" y1="20" x2="30" y2="20" stroke={strokeColor} strokeWidth="2" />
          <polygon
            points="30,10 30,30 50,20"
            fill={isLit ? '#06b6d4' : '#1e293b'}
            stroke={isLit ? '#22d3ee' : strokeColor}
            strokeWidth="2"
            filter={isLit ? 'drop-shadow(0 0 6px #06b6d4)' : undefined}
          />
          <line x1="50" y1="10" x2="50" y2="30" stroke={strokeColor} strokeWidth="2.5" />
          <line x1="50" y1="20" x2="80" y2="20" stroke={strokeColor} strokeWidth="2" />
          {/* Light rays */}
          <line x1="36" y1="8" x2="44" y2="1" stroke="#38bdf8" strokeWidth="1.5" />
          <polygon points="45,0 40,3 43,6" fill="#38bdf8" />
          <line x1="44" y1="11" x2="52" y2="4" stroke="#38bdf8" strokeWidth="1.5" />
          <polygon points="53,3 48,6 51,9" fill="#38bdf8" />
        </svg>
      );

    case 'bjt_npn':
      return (
        <svg width="80" height="80" viewBox="0 0 80 80">
          <line x1="0" y1="40" x2="35" y2="40" stroke={strokeColor} strokeWidth="2" />
          {/* Base bar */}
          <line x1="35" y1="20" x2="35" y2="60" stroke={strokeColor} strokeWidth="3" />
          {/* Collector */}
          <line x1="35" y1="30" x2="60" y2="10" stroke={strokeColor} strokeWidth="2" />
          <line x1="60" y1="10" x2="60" y2="0" stroke={strokeColor} strokeWidth="2" />
          {/* Emitter with outward arrow */}
          <line x1="35" y1="50" x2="60" y2="70" stroke={strokeColor} strokeWidth="2" />
          <polygon points="58,68 47,60 52,56" fill="#38bdf8" />
          <line x1="60" y1="70" x2="60" y2="80" stroke={strokeColor} strokeWidth="2" />
          <circle cx="45" cy="40" r="28" fill="none" stroke="#475569" strokeWidth="1" strokeDasharray="3 3" />
          <text x="45" y="76" textAnchor="middle" fill="#94a3b8" fontSize="8">β={values.beta || 150}</text>
        </svg>
      );

    case 'bjt_pnp':
      return (
        <svg width="80" height="80" viewBox="0 0 80 80">
          <line x1="0" y1="40" x2="35" y2="40" stroke={strokeColor} strokeWidth="2" />
          <line x1="35" y1="20" x2="35" y2="60" stroke={strokeColor} strokeWidth="3" />
          {/* Emitter with inward arrow */}
          <line x1="35" y1="30" x2="60" y2="10" stroke={strokeColor} strokeWidth="2" />
          <polygon points="38,28 48,22 47,30" fill="#38bdf8" />
          <line x1="60" y1="10" x2="60" y2="0" stroke={strokeColor} strokeWidth="2" />
          {/* Collector */}
          <line x1="35" y1="50" x2="60" y2="70" stroke={strokeColor} strokeWidth="2" />
          <line x1="60" y1="70" x2="60" y2="80" stroke={strokeColor} strokeWidth="2" />
          <circle cx="45" cy="40" r="28" fill="none" stroke="#475569" strokeWidth="1" strokeDasharray="3 3" />
          <text x="45" y="76" textAnchor="middle" fill="#94a3b8" fontSize="8">PNP β={values.beta || 150}</text>
        </svg>
      );

    case 'mosfet_n':
      return (
        <svg width="80" height="80" viewBox="0 0 80 80">
          <line x1="0" y1="40" x2="30" y2="40" stroke={strokeColor} strokeWidth="2" />
          {/* Gate plate */}
          <line x1="30" y1="20" x2="30" y2="60" stroke={strokeColor} strokeWidth="2.5" />
          {/* Channel plates */}
          <line x1="38" y1="18" x2="38" y2="30" stroke={strokeColor} strokeWidth="2.5" />
          <line x1="38" y1="35" x2="38" y2="45" stroke={strokeColor} strokeWidth="2.5" />
          <line x1="38" y1="50" x2="38" y2="62" stroke={strokeColor} strokeWidth="2.5" />
          {/* Drain & Source */}
          <line x1="38" y1="24" x2="60" y2="24" stroke={strokeColor} strokeWidth="2" />
          <line x1="60" y1="24" x2="60" y2="0" stroke={strokeColor} strokeWidth="2" />
          <line x1="38" y1="56" x2="60" y2="56" stroke={strokeColor} strokeWidth="2" />
          <line x1="60" y1="56" x2="60" y2="80" stroke={strokeColor} strokeWidth="2" />
          {/* Substrate inward arrow */}
          <line x1="38" y1="40" x2="60" y2="40" stroke={strokeColor} strokeWidth="2" />
          <polygon points="42,40 50,36 50,44" fill="#38bdf8" />
          <text x="40" y="76" textAnchor="middle" fill="#94a3b8" fontSize="8">NMOS</text>
        </svg>
      );

    case 'opamp':
      return (
        <svg width="100" height="80" viewBox="0 0 100 80">
          <polygon points="20,10 20,70 80,40" fill="#0f172a" stroke={strokeColor} strokeWidth="2" />
          {/* Inputs */}
          <line x1="0" y1="25" x2="20" y2="25" stroke={strokeColor} strokeWidth="2" />
          <line x1="0" y1="55" x2="20" y2="55" stroke={strokeColor} strokeWidth="2" />
          <text x="26" y="29" fill="#94a3b8" fontSize="12" fontWeight="bold">-</text>
          <text x="26" y="59" fill="#94a3b8" fontSize="12" fontWeight="bold">+</text>
          {/* Output */}
          <line x1="80" y1="40" x2="100" y2="40" stroke={strokeColor} strokeWidth="2" />
          <text x="46" y="44" fill="#38bdf8" fontSize="10" fontWeight="600">LM741</text>
        </svg>
      );

    case 'dc_source':
      return (
        <svg width="80" height="60" viewBox="0 0 80 60">
          <line x1="0" y1="30" x2="24" y2="30" stroke={strokeColor} strokeWidth="2" />
          <circle cx="40" cy="30" r="16" fill="#0f172a" stroke={strokeColor} strokeWidth="2" />
          <text x="32" y="34" fill="#38bdf8" fontSize="12" fontWeight="bold">+</text>
          <text x="46" y="34" fill="#94a3b8" fontSize="12" fontWeight="bold">-</text>
          <line x1="56" y1="30" x2="80" y2="30" stroke={strokeColor} strokeWidth="2" />
          <text x="40" y="56" textAnchor="middle" fill="#38bdf8" fontSize="9" fontWeight="600">
            {values.voltage ? `${values.voltage}V` : '5V'}
          </text>
        </svg>
      );

    case 'ac_source':
      return (
        <svg width="80" height="60" viewBox="0 0 80 60">
          <line x1="0" y1="30" x2="24" y2="30" stroke={strokeColor} strokeWidth="2" />
          <circle cx="40" cy="30" r="16" fill="#0f172a" stroke={strokeColor} strokeWidth="2" />
          {/* Sine wave inside */}
          <path d="M 32 30 Q 36 22 40 30 T 48 30" fill="none" stroke="#38bdf8" strokeWidth="2" />
          <line x1="56" y1="30" x2="80" y2="30" stroke={strokeColor} strokeWidth="2" />
          <text x="40" y="56" textAnchor="middle" fill="#38bdf8" fontSize="9" fontWeight="600">
            {values.amplitude || 5}V~ {values.frequency || 1000}Hz
          </text>
        </svg>
      );

    case 'pulse_source':
      return (
        <svg width="80" height="60" viewBox="0 0 80 60">
          <line x1="0" y1="30" x2="24" y2="30" stroke={strokeColor} strokeWidth="2" />
          <circle cx="40" cy="30" r="16" fill="#0f172a" stroke={strokeColor} strokeWidth="2" />
          {/* Square wave inside */}
          <path d="M 32 34 L 32 26 L 40 26 L 40 34 L 48 34" fill="none" stroke="#38bdf8" strokeWidth="1.8" />
          <line x1="56" y1="30" x2="80" y2="30" stroke={strokeColor} strokeWidth="2" />
          <text x="40" y="56" textAnchor="middle" fill="#38bdf8" fontSize="9">
            {values.frequency || 1000}Hz
          </text>
        </svg>
      );

    case 'current_source':
      return (
        <svg width="80" height="60" viewBox="0 0 80 60">
          <line x1="0" y1="30" x2="24" y2="30" stroke={strokeColor} strokeWidth="2" />
          <circle cx="40" cy="30" r="16" fill="#0f172a" stroke={strokeColor} strokeWidth="2" />
          <line x1="30" y1="30" x2="50" y2="30" stroke="#38bdf8" strokeWidth="2" />
          <polygon points="50,30 44,26 44,34" fill="#38bdf8" />
          <line x1="56" y1="30" x2="80" y2="30" stroke={strokeColor} strokeWidth="2" />
          <text x="40" y="56" textAnchor="middle" fill="#38bdf8" fontSize="9">{values.current || 10}mA</text>
        </svg>
      );

    case 'ground':
      return (
        <svg width="40" height="40" viewBox="0 0 40 40">
          <line x1="20" y1="0" x2="20" y2="16" stroke={strokeColor} strokeWidth="2" />
          <line x1="6" y1="16" x2="34" y2="16" stroke={strokeColor} strokeWidth="2.5" />
          <line x1="11" y1="22" x2="29" y2="22" stroke={strokeColor} strokeWidth="2" />
          <line x1="16" y1="28" x2="24" y2="28" stroke={strokeColor} strokeWidth="1.5" />
          <text x="20" y="38" textAnchor="middle" fill="#64748b" fontSize="8">GND</text>
        </svg>
      );

    // DIGITAL GATES
    case 'and_gate':
      return (
        <svg width="80" height="50" viewBox="0 0 80 50">
          <line x1="0" y1="15" x2="20" y2="15" stroke={strokeColor} strokeWidth="2" />
          <line x1="0" y1="35" x2="20" y2="35" stroke={strokeColor} strokeWidth="2" />
          <path d="M 20 5 L 42 5 A 20 20 0 0 1 42 45 L 20 45 Z" fill="#0f172a" stroke={strokeColor} strokeWidth="2" />
          <line x1="62" y1="25" x2="80" y2="25" stroke={strokeColor} strokeWidth="2" />
          <text x="34" y="28" fill="#38bdf8" fontSize="10" fontWeight="bold">&amp;</text>
        </svg>
      );

    case 'or_gate':
      return (
        <svg width="80" height="50" viewBox="0 0 80 50">
          <line x1="0" y1="15" x2="24" y2="15" stroke={strokeColor} strokeWidth="2" />
          <line x1="0" y1="35" x2="24" y2="35" stroke={strokeColor} strokeWidth="2" />
          <path d="M 20 5 Q 32 25 20 45 Q 48 45 62 25 Q 48 5 20 5 Z" fill="#0f172a" stroke={strokeColor} strokeWidth="2" />
          <line x1="62" y1="25" x2="80" y2="25" stroke={strokeColor} strokeWidth="2" />
          <text x="36" y="28" fill="#38bdf8" fontSize="9" fontWeight="bold">≥1</text>
        </svg>
      );

    case 'not_gate':
      return (
        <svg width="80" height="40" viewBox="0 0 80 40">
          <line x1="0" y1="20" x2="24" y2="20" stroke={strokeColor} strokeWidth="2" />
          <polygon points="24,8 24,32 54,20" fill="#0f172a" stroke={strokeColor} strokeWidth="2" />
          <circle cx="58" cy="20" r="4" fill="#0f172a" stroke={strokeColor} strokeWidth="2" />
          <line x1="62" y1="20" x2="80" y2="20" stroke={strokeColor} strokeWidth="2" />
        </svg>
      );

    case 'nand_gate':
      return (
        <svg width="80" height="50" viewBox="0 0 80 50">
          <line x1="0" y1="15" x2="20" y2="15" stroke={strokeColor} strokeWidth="2" />
          <line x1="0" y1="35" x2="20" y2="35" stroke={strokeColor} strokeWidth="2" />
          <path d="M 20 5 L 40 5 A 20 20 0 0 1 40 45 L 20 45 Z" fill="#0f172a" stroke={strokeColor} strokeWidth="2" />
          <circle cx="63" cy="25" r="3.5" fill="#0f172a" stroke={strokeColor} strokeWidth="1.8" />
          <line x1="67" y1="25" x2="80" y2="25" stroke={strokeColor} strokeWidth="2" />
          <text x="33" y="28" fill="#38bdf8" fontSize="8" fontWeight="bold">NAND</text>
        </svg>
      );

    case 'nor_gate':
      return (
        <svg width="80" height="50" viewBox="0 0 80 50">
          <line x1="0" y1="15" x2="24" y2="15" stroke={strokeColor} strokeWidth="2" />
          <line x1="0" y1="35" x2="24" y2="35" stroke={strokeColor} strokeWidth="2" />
          <path d="M 20 5 Q 32 25 20 45 Q 46 45 58 25 Q 46 5 20 5 Z" fill="#0f172a" stroke={strokeColor} strokeWidth="2" />
          <circle cx="62" cy="25" r="3.5" fill="#0f172a" stroke={strokeColor} strokeWidth="1.8" />
          <line x1="66" y1="25" x2="80" y2="25" stroke={strokeColor} strokeWidth="2" />
          <text x="34" y="28" fill="#38bdf8" fontSize="8" fontWeight="bold">NOR</text>
        </svg>
      );

    case 'xor_gate':
      return (
        <svg width="80" height="50" viewBox="0 0 80 50">
          <line x1="0" y1="15" x2="18" y2="15" stroke={strokeColor} strokeWidth="2" />
          <line x1="0" y1="35" x2="18" y2="35" stroke={strokeColor} strokeWidth="2" />
          <path d="M 16 5 Q 28 25 16 45" fill="none" stroke={strokeColor} strokeWidth="2" />
          <path d="M 22 5 Q 34 25 22 45 Q 48 45 62 25 Q 48 5 22 5 Z" fill="#0f172a" stroke={strokeColor} strokeWidth="2" />
          <line x1="62" y1="25" x2="80" y2="25" stroke={strokeColor} strokeWidth="2" />
          <text x="36" y="28" fill="#38bdf8" fontSize="9" fontWeight="bold">=1</text>
        </svg>
      );

    case 'xnor_gate':
      return (
        <svg width="80" height="50" viewBox="0 0 80 50">
          <line x1="0" y1="15" x2="18" y2="15" stroke={strokeColor} strokeWidth="2" />
          <line x1="0" y1="35" x2="18" y2="35" stroke={strokeColor} strokeWidth="2" />
          <path d="M 16 5 Q 28 25 16 45" fill="none" stroke={strokeColor} strokeWidth="2" />
          <path d="M 22 5 Q 34 25 22 45 Q 46 45 58 25 Q 46 5 22 5 Z" fill="#0f172a" stroke={strokeColor} strokeWidth="2" />
          <circle cx="62" cy="25" r="3.5" fill="#0f172a" stroke={strokeColor} strokeWidth="1.8" />
          <line x1="66" y1="25" x2="80" y2="25" stroke={strokeColor} strokeWidth="2" />
        </svg>
      );

    case 'logic_switch':
      const swState = liveState?.state ?? values.state ?? 0;
      return (
        <svg width="70" height="40" viewBox="0 0 70 40">
          <rect x="6" y="6" width="48" height="28" rx="6" fill={swState ? '#0369a1' : '#1e293b'} stroke={strokeColor} strokeWidth="2" />
          <circle cx={swState ? 40 : 18} cy="20" r="8" fill={swState ? '#38bdf8' : '#64748b'} />
          <line x1="54" y1="20" x2="70" y2="20" stroke={strokeColor} strokeWidth="2" />
          <text x="28" y="23" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">{swState ? '1' : '0'}</text>
        </svg>
      );

    case 'logic_led':
      const ledActive = liveState?.active || values.state === 1;
      return (
        <svg width="50" height="50" viewBox="0 0 50 50">
          <line x1="0" y1="25" x2="14" y2="25" stroke={strokeColor} strokeWidth="2" />
          <circle
            cx="28"
            cy="25"
            r="14"
            fill={ledActive ? '#06b6d4' : '#1e293b'}
            stroke={ledActive ? '#67e8f9' : strokeColor}
            strokeWidth="2.5"
            filter={ledActive ? 'drop-shadow(0 0 8px #06b6d4)' : undefined}
          />
          <circle cx="28" cy="25" r="6" fill={ledActive ? '#ffffff' : '#334155'} />
        </svg>
      );

    case 'jk_flipflop':
    case 'd_flipflop':
    case 't_flipflop':
    case 'half_adder':
    case 'full_adder':
    case 'mux_4to1':
    case 'demux_1to4':
    case 'ripple_counter_4bit':
      // Generic IC representation with pin labels
      return (
        <svg width="100" height="80" viewBox="0 0 100 80">
          <rect x="15" y="5" width="70" height="70" rx="4" fill="#0f172a" stroke={strokeColor} strokeWidth="2" />
          <circle cx="50" cy="5" r="4" fill="#1e293b" stroke={strokeColor} strokeWidth="1" />
          <text x="50" y="44" textAnchor="middle" fill="#38bdf8" fontSize="11" fontWeight="bold">
            {type.toUpperCase().replace('_', ' ')}
          </text>
        </svg>
      );

    case 'voltmeter':
      return (
        <svg width="70" height="60" viewBox="0 0 70 60">
          <line x1="0" y1="30" x2="16" y2="30" stroke={strokeColor} strokeWidth="2" />
          <circle cx="35" cy="30" r="18" fill="#0f172a" stroke={strokeColor} strokeWidth="2" />
          <text x="35" y="36" textAnchor="middle" fill="#38bdf8" fontSize="16" fontWeight="bold">V</text>
          <line x1="54" y1="30" x2="70" y2="30" stroke={strokeColor} strokeWidth="2" />
          <text x="35" y="56" textAnchor="middle" fill="#22c55e" fontSize="9">{values.reading ?? '0.00'} V</text>
        </svg>
      );

    case 'ammeter':
      return (
        <svg width="70" height="60" viewBox="0 0 70 60">
          <line x1="0" y1="30" x2="16" y2="30" stroke={strokeColor} strokeWidth="2" />
          <circle cx="35" cy="30" r="18" fill="#0f172a" stroke={strokeColor} strokeWidth="2" />
          <text x="35" y="36" textAnchor="middle" fill="#38bdf8" fontSize="16" fontWeight="bold">A</text>
          <line x1="54" y1="30" x2="70" y2="30" stroke={strokeColor} strokeWidth="2" />
          <text x="35" y="56" textAnchor="middle" fill="#22c55e" fontSize="9">{values.reading ?? '0.00'} mA</text>
        </svg>
      );

    default:
      return (
        <svg width="80" height="40" viewBox="0 0 80 40">
          <rect x="10" y="5" width="60" height="30" rx="3" fill="#0f172a" stroke={strokeColor} strokeWidth="2" />
          <text x="40" y="24" textAnchor="middle" fill="#94a3b8" fontSize="10">{label || type}</text>
        </svg>
      );
  }
};

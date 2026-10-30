import { Experiment } from '../types/circuit';

export const EXPERIMENTS_DATABASE: Experiment[] = [
  {
    id: 'exp_ohms_law',
    title: "Verification of Ohm's Law and Kirchhoff's Laws",
    category: 'network_theory',
    aim: "To verify Ohm's Law (V = IR) and verify Kirchhoff's Voltage Law (KVL) and Current Law (KCL) in a multi-loop resistive network.",
    apparatus: [
      'Regulated DC Power Supply (0-30V)',
      'Digital Multimeter (DMM)',
      'Resistors (100Ω, 220Ω, 470Ω, 1kΩ)',
      'Breadboard & Jumper Wires',
    ],
    theory:
      "Ohm's Law states that at constant temperature, current flowing through a conductor is directly proportional to the potential difference across it. KVL states the algebraic sum of all branch voltages around any closed loop is zero (ΣV = 0). KCL states the sum of currents entering a node equals currents leaving (ΣI = 0).",
    formulas: [
      { label: "Ohm's Law", formula: 'V = I × R', explanation: 'Relates potential difference, current, and resistance.' },
      { label: "Kirchhoff's Voltage Law", formula: '∑ V_loop = 0', explanation: 'Energy conservation in closed electric loops.' },
      { label: "Kirchhoff's Current Law", formula: '∑ I_in = ∑ I_out', explanation: 'Charge conservation at any circuit node.' },
    ],
    procedure: [
      'Connect the resistor in series with an ammeter and across the DC variable supply.',
      'Vary DC input voltage in steps from 0V to 10V in increments of 1V.',
      'Record corresponding current reading in the observation table.',
      'Plot V vs I graph and calculate slope (ΔV / ΔI) to determine experimental resistance.',
      'Verify that the slope matches the nominal resistor color code.',
    ],
    observationColumns: [
      { key: 'voltage', label: 'Applied Voltage (V)', unit: 'V' },
      { key: 'current', label: 'Measured Current (I)', unit: 'mA' },
      { key: 'calculatedR', label: 'Calculated R (V/I)', unit: 'Ω' },
      { key: 'power', label: 'Power Dissipated', unit: 'mW' },
    ],
    vivaQuestions: [
      {
        question: "What are the key limitations of Ohm's law?",
        answer: "Ohm's law is not applicable to non-linear devices (diodes, transistors, vacuum tubes) or unilateral networks, and fails under varying temperature conditions.",
        concept: "Ohmic vs Non-Ohmic conductors",
      },
      {
        question: 'On which conservation principles are KVL and KCL based?',
        answer: 'KVL is based on the law of conservation of energy. KCL is based on the law of conservation of electric charge.',
        concept: 'Conservation Laws in Physics',
      },
      {
        question: 'Why does an ideal ammeter have zero internal resistance?',
        answer: 'Because an ammeter is connected in series; zero resistance ensures it causes zero voltage drop and does not alter the circuit current being measured.',
        concept: 'Instrument Loading Effect',
      },
    ],
    defaultCircuit: {
      id: 'c_ohms',
      name: "Ohm's Law Verification Circuit",
      description: 'DC Source connected across 1kΩ Resistor with Voltmeter and Ammeter',
      components: [
        { id: 'v1', type: 'dc_source', label: 'V1 (DC Source)', x: 120, y: 150, rotation: 0, values: { voltage: 5 } },
        { id: 'r1', type: 'resistor', label: 'R1 (Load)', x: 300, y: 150, rotation: 0, values: { resistance: 1000 } },
        { id: 'gnd', type: 'ground', label: 'GND', x: 210, y: 270, rotation: 0, values: {} },
      ],
      wires: [
        { id: 'w1', fromComponentId: 'v1', fromTerminalId: 'positive', toComponentId: 'r1', toTerminalId: 't1' },
        { id: 'w2', fromComponentId: 'r1', fromTerminalId: 't2', toComponentId: 'v1', toTerminalId: 'negative' },
        { id: 'w3', fromComponentId: 'v1', fromTerminalId: 'negative', toComponentId: 'gnd', toTerminalId: 'gnd' },
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  },
  {
    id: 'exp_pn_diode',
    title: 'Forward and Reverse Characteristics of PN Junction Diode',
    category: 'analog',
    aim: 'To plot the static V-I characteristics of a Silicon PN junction diode and determine knee voltage, forward static resistance, and dynamic resistance.',
    apparatus: [
      'Silicon Diode (1N4007)',
      'Variable DC Power Supply (0-15V)',
      'Resistor 1kΩ (current limiting)',
      'Milliammeter (0-100mA) & Microammeter (0-100µA)',
      'Digital Voltmeter',
    ],
    theory:
      'A PN junction diode conducts easily in the forward bias condition once applied voltage exceeds the barrier potential (approx. 0.7V for Silicon, 0.3V for Germanium). Under reverse bias, a negligible reverse saturation current (Is) flows until the breakdown voltage is reached.',
    formulas: [
      { label: 'Shockley Diode Equation', formula: 'I_D = I_S · [exp(V_D / ηV_T) - 1]', explanation: 'Describes current through a p–n junction as an exponential function of diode voltage.' },
      { label: 'Dynamic Forward Resistance', formula: 'r_d = ΔV_D / ΔI_D', explanation: 'Reciprocal of slope in the forward conducting region (≈ 26mV / ID).' },
      { label: 'Static Resistance', formula: 'R_dc = V_D / I_D', explanation: 'Ratio of DC voltage across diode to DC current through it at a specific operating point.' },
    ],
    procedure: [
      'Connect the diode in forward bias with the anode connected to positive supply through 1kΩ current limiting resistor.',
      'Increase supply voltage in small increments (0.1V steps near cut-in 0.6V to 0.8V).',
      'Record diode voltage (VD) and current (ID) in forward bias table.',
      'Reverse diode polarity for reverse bias, measure microampere leakage current.',
      'Plot graph of VD vs ID and identify knee voltage VK.',
    ],
    observationColumns: [
      { key: 'v_diode', label: 'Diode Voltage VD', unit: 'V' },
      { key: 'i_diode', label: 'Diode Current ID', unit: 'mA' },
      { key: 'r_dyn', label: 'Dynamic Resistance rd', unit: 'Ω' },
    ],
    vivaQuestions: [
      {
        question: 'What causes the barrier potential in a PN junction?',
        answer: 'Uncompensated immobile donor ions (N-side) and acceptor ions (P-side) left behind in the depletion layer create a built-in electric field that opposes further majority carrier diffusion.',
        concept: 'Depletion Layer Physics',
      },
      {
        question: 'Why does reverse saturation current double for every 10°C rise in temperature?',
        answer: 'Reverse saturation current is caused by thermally generated minority charge carriers whose concentration increases exponentially with thermal energy.',
        concept: 'Temperature Coefficient of Semiconductors',
      },
    ],
    defaultCircuit: {
      id: 'c_diode',
      name: 'PN Diode Characteristics Circuit',
      description: 'DC Source with 1k resistor and 1N4007 Diode in forward bias',
      components: [
        { id: 'v1', type: 'dc_source', label: 'V_supply', x: 100, y: 150, rotation: 0, values: { voltage: 3 } },
        { id: 'r1', type: 'resistor', label: 'R_limit', x: 250, y: 150, rotation: 0, values: { resistance: 1000 } },
        { id: 'd1', type: 'diode', label: '1N4007', x: 400, y: 150, rotation: 0, values: { forwardVoltage: 0.7 } },
        { id: 'gnd', type: 'ground', label: 'GND', x: 250, y: 250, rotation: 0, values: {} },
      ],
      wires: [
        { id: 'w1', fromComponentId: 'v1', fromTerminalId: 'positive', toComponentId: 'r1', toTerminalId: 't1' },
        { id: 'w2', fromComponentId: 'r1', fromTerminalId: 't2', toComponentId: 'd1', toTerminalId: 'anode' },
        { id: 'w3', fromComponentId: 'd1', fromTerminalId: 'cathode', toComponentId: 'v1', toTerminalId: 'negative' },
        { id: 'w4', fromComponentId: 'v1', fromTerminalId: 'negative', toComponentId: 'gnd', toTerminalId: 'gnd' },
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  },
  {
    id: 'exp_zener',
    title: 'Zener Diode Voltage Regulator (Line & Load Regulation)',
    category: 'analog',
    aim: 'To plot reverse breakdown characteristics of a Zener diode and evaluate percentage line regulation and load regulation.',
    apparatus: ['Zener Diode (5.1V)', 'Variable DC Supply (0-20V)', 'Series Resistor Rs (470Ω)', 'Variable Decade Load Resistor RL', 'DMM'],
    theory:
      'A Zener diode is heavily doped so that it undergoes reversible avalanche or Zener breakdown at a sharp specified voltage (Vz). When reverse biased in breakdown, terminal voltage remains virtually constant even for large changes in reverse current.',
    formulas: [
      { label: 'Line Regulation %', formula: '(% Line Reg) = (ΔV_out / ΔV_in) × 100%', explanation: 'Change in regulated output per volt change in unregulated input voltage.' },
      { label: 'Load Regulation %', formula: '(% Load Reg) = [(V_NL - V_FL) / V_FL] × 100%', explanation: 'Stability of output voltage when load varies from no load (NL) to full load (FL).' },
      { label: 'Series Resistor Sizing', formula: 'R_s = (V_in_min - V_z) / (I_L_max + I_z_min)', explanation: 'Ensures minimum Zener holding current under maximum load.' },
    ],
    procedure: [
      'Line Regulation: Fix RL at 1kΩ. Vary Vin from 0V to 15V. Measure Vout and Zener current Iz.',
      'Load Regulation: Fix Vin at 12V. Vary RL from 200Ω to 5kΩ. Measure Vout.',
      'Plot Vout vs Vin and Vout vs IL curves.',
    ],
    observationColumns: [
      { key: 'vin', label: 'Input Vin', unit: 'V' },
      { key: 'vout', label: 'Output Vout', unit: 'V' },
      { key: 'iz', label: 'Zener Current Iz', unit: 'mA' },
      { key: 'il', label: 'Load Current IL', unit: 'mA' },
    ],
    vivaQuestions: [
      {
        question: 'What is the physical difference between Avalanche and Zener breakdown?',
        answer: 'Zener breakdown occurs in heavily doped diodes at low voltages (< 5V) due to direct quantum mechanical valence-to-conduction band tunneling under high electric fields. Avalanche breakdown occurs in lightly doped diodes at > 6V due to impact ionization collision multiplication.',
        concept: 'Semiconductor Breakdown Mechanisms',
      },
    ],
    defaultCircuit: {
      id: 'c_zener',
      name: 'Zener Regulator Circuit',
      description: 'DC Input through Rs to parallel Zener and RL',
      components: [
        { id: 'v1', type: 'dc_source', label: 'Vin', x: 100, y: 150, rotation: 0, values: { voltage: 12 } },
        { id: 'rs', type: 'resistor', label: 'Rs', x: 230, y: 150, rotation: 0, values: { resistance: 470 } },
        { id: 'zd', type: 'zener_diode', label: '5.1V Zener', x: 370, y: 150, rotation: 90, values: { zenerVoltage: 5.1 } },
        { id: 'rl', type: 'resistor', label: 'RL', x: 490, y: 150, rotation: 90, values: { resistance: 1000 } },
        { id: 'gnd', type: 'ground', label: 'GND', x: 300, y: 280, rotation: 0, values: {} },
      ],
      wires: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  },
  {
    id: 'exp_ce_amplifier',
    title: 'BJT Common Emitter (CE) Amplifier Characteristics & Frequency Response',
    category: 'analog',
    aim: 'To design a voltage divider biased BJT Common Emitter amplifier, determine the DC operating Q-point (Vce, Ic), calculate voltage gain Av, and plot the frequency response to find 3dB bandwidth.',
    apparatus: ['NPN Transistor BC107 / 2N2222', 'Function Generator', 'Dual Trace Oscilloscope', 'Resistors', 'Capacitors', '12V DC Supply'],
    theory:
      'The Common Emitter amplifier provides both high voltage gain and high current gain, resulting in the highest power gain among BJT configurations. A 180° phase inversion occurs between base input and collector output.',
    formulas: [
      { label: 'Voltage Gain', formula: 'A_v = - g_m · R_C = - (I_C / V_T) · R_C', explanation: 'AC small signal voltage gain with emitter bypass capacitor CE connected.' },
      { label: 'Bandwidth', formula: 'BW = f_H - f_L', explanation: 'Frequency band between lower and upper half-power (-3dB) cutoff frequencies.' },
      { label: 'Emitter Bypass Cutoff', formula: 'f_L ≈ 1 / [2π · (R_E || (r_π/(β+1))) · C_E]', explanation: 'Determines low-frequency rolloff.' },
    ],
    procedure: [
      'Assemble the voltage divider bias circuit (R1=47kΩ, R2=10kΩ, Rc=2.2kΩ, Re=470Ω).',
      'Measure DC quiescent voltages: Vb, Ve, Vc to verify active region bias (Vce > 2V).',
      'Apply 20mV peak-to-peak sinusoidal input at 1kHz from function generator.',
      'Observe amplified inverted output on CRO and measure peak-to-peak voltage to compute gain Av = Vout / Vin.',
      'Vary frequency from 20Hz to 1MHz and record output voltage to plot frequency response.',
    ],
    observationColumns: [
      { key: 'freq', label: 'Frequency', unit: 'Hz' },
      { key: 'vin', label: 'Input Vin', unit: 'mV' },
      { key: 'vout', label: 'Output Vout', unit: 'V' },
      { key: 'gain', label: 'Voltage Gain Av', unit: 'V/V' },
      { key: 'gain_db', label: 'Gain in dB (20 log Av)', unit: 'dB' },
    ],
    vivaQuestions: [
      {
        question: 'Why is there a 180-degree phase shift in a Common Emitter amplifier?',
        answer: 'When input base voltage increases, base current Ib increases, causing collector current Ic to increase. The higher voltage drop across Rc (Ic × Rc) causes the collector voltage Vc = Vcc - IcRc to decrease, inverting the signal.',
        concept: 'Transistor Amplification Principle',
      },
    ],
    defaultCircuit: {
      id: 'c_ce',
      name: 'Common Emitter Amplifier',
      description: 'Single stage CE BJT Amplifier with voltage divider bias',
      components: [
        { id: 'q1', type: 'bjt_npn', label: '2N2222', x: 300, y: 180, rotation: 0, values: { beta: 150 } },
        { id: 'rc', type: 'resistor', label: 'Rc (2.2k)', x: 340, y: 80, rotation: 90, values: { resistance: 2200 } },
        { id: 're', type: 'resistor', label: 'Re (470)', x: 340, y: 280, rotation: 90, values: { resistance: 470 } },
        { id: 'r1', type: 'resistor', label: 'R1 (47k)', x: 220, y: 80, rotation: 90, values: { resistance: 47000 } },
        { id: 'r2', type: 'resistor', label: 'R2 (10k)', x: 220, y: 280, rotation: 90, values: { resistance: 10000 } },
        { id: 'vcc', type: 'dc_source', label: '12V Vcc', x: 100, y: 80, rotation: 0, values: { voltage: 12 } },
        { id: 'gnd', type: 'ground', label: 'GND', x: 220, y: 380, rotation: 0, values: {} },
      ],
      wires: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  },
  {
    id: 'exp_logic_gates',
    title: 'Study of Logic Gates & Universal Gate Realization',
    category: 'digital',
    aim: 'To verify the truth tables of AND, OR, NOT, NAND, NOR, XOR gates and realize basic gates using only NAND or NOR gates.',
    apparatus: ['Digital IC Trainer Kit', 'ICs 7408 (AND), 7432 (OR), 7404 (NOT), 7400 (NAND), 7402 (NOR), 7486 (XOR)', 'LED Indicators'],
    theory:
      'Logic gates are fundamental building blocks of digital electronic circuits. NAND and NOR gates are universal gates because any combinational Boolean function can be implemented using only NAND gates or only NOR gates via De Morgan’s Theorems.',
    formulas: [
      { label: "De Morgan's Theorem 1", formula: '(A · B)̅ = A̅ + B̅', explanation: 'NAND is equivalent to Invert-OR.' },
      { label: "De Morgan's Theorem 2", formula: '(A + B)̅ = A̅ · B̅', explanation: 'NOR is equivalent to Invert-AND.' },
    ],
    procedure: [
      'Insert IC 7400 (Quad 2-Input NAND) into the digital breadboard.',
      'Connect VCC (Pin 14) to +5V and GND (Pin 7) to 0V.',
      'Connect inputs to toggle switches and output to LED indicators.',
      'Cycle through input states (00, 01, 10, 11) and record output logic levels.',
      'Connect both inputs of a NAND gate together to verify inverter (NOT) behavior.',
    ],
    observationColumns: [
      { key: 'a', label: 'Input A', unit: '0/1' },
      { key: 'b', label: 'Input B', unit: '0/1' },
      { key: 'y_nand', label: 'NAND Output', unit: '0/1' },
      { key: 'y_and', label: 'Realized AND', unit: '0/1' },
      { key: 'y_or', label: 'Realized OR', unit: '0/1' },
    ],
    vivaQuestions: [
      {
        question: 'Why are NAND and NOR gates called Universal Gates?',
        answer: 'Because any arbitrary Boolean expression and any other fundamental gate (NOT, AND, OR, XOR, XNOR) can be implemented solely using NAND gates or solely using NOR gates without any other components.',
        concept: 'Universal Logic Completeness',
      },
    ],
    defaultCircuit: {
      id: 'c_gates',
      name: 'NAND Universal Gate Realization',
      description: 'NAND gates wired to realize AND and OR functions',
      components: [
        { id: 'sw1', type: 'logic_switch', label: 'Switch A', x: 100, y: 120, rotation: 0, values: { state: 0 } },
        { id: 'sw2', type: 'logic_switch', label: 'Switch B', x: 100, y: 200, rotation: 0, values: { state: 0 } },
        { id: 'g1', type: 'nand_gate', label: 'NAND 1', x: 260, y: 150, rotation: 0, values: {} },
        { id: 'g2', type: 'nand_gate', label: 'NAND 2 (Inverter)', x: 400, y: 150, rotation: 0, values: {} },
        { id: 'led1', type: 'logic_led', label: 'Output LED', x: 540, y: 150, rotation: 0, values: {} },
      ],
      wires: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  },
  {
    id: 'exp_embedded_adc_pwm',
    title: 'Embedded Systems: ADC Reading & PWM Control',
    category: 'embedded',
    aim: 'To interface an analog potentiometer with an Arduino/ESP32 microcontroller, sample analog voltage with a 10-bit ADC, and modulate LED brightness proportionally using Pulse Width Modulation (PWM).',
    apparatus: ['Arduino Uno Development Board', '10kΩ Linear Potentiometer', 'Diffused 5mm LED', '220Ω Resistor', 'Connecting Jumper Wires'],
    theory:
      'Microcontrollers sample continuous voltages using an internal Successive Approximation Register (SAR) ADC. The 10-bit ADC maps 0-5V to 1024 discrete steps (0 to 1023). PWM creates an analog-like average voltage by switching a digital pin between 0V and 5V at a high frequency with varying duty cycle (0 to 255).',
    formulas: [
      { label: 'ADC Resolution', formula: 'Resolution = V_ref / (2^N - 1) = 5.0V / 1023 ≈ 4.887 mV/bit', explanation: 'Minimum voltage change detectable by the ADC.' },
      { label: 'Average PWM Voltage', formula: 'V_avg = V_cc × (Duty Cycle / 255)', explanation: 'Effective DC voltage delivered to load.' },
    ],
    procedure: [
      'Connect potentiometer outer legs to 5V and GND; connect wiper to Analog Pin A0.',
      'Connect anode of LED to digital PWM pin 9 through 220Ω current limiting resistor.',
      'Flash firmware to microcontroller and open Serial Monitor at 9600 baud.',
      'Rotate potentiometer wiper across full 0-100% range and observe LED brightness and serial ADC output.',
    ],
    observationColumns: [
      { key: 'pot_angle', label: 'Potentiometer Wiper %', unit: '%' },
      { key: 'analog_val', label: 'Raw ADC Value', unit: '0-1023' },
      { key: 'input_voltage', label: 'Input Voltage', unit: 'V' },
      { key: 'pwm_val', label: 'PWM Duty Byte', unit: '0-255' },
      { key: 'avg_voltage', label: 'Effective PWM Voltage', unit: 'V' },
    ],
    vivaQuestions: [
      {
        question: 'What is the sampling rate of the Arduino Uno ATmega328P ADC?',
        answer: 'The standard Arduino analogRead() function takes approximately 100 microseconds (10,000 samples/sec), clocked at 125 kHz with 13 ADC clock cycles per conversion.',
        concept: 'Microcontroller Peripheral Architecture',
      },
    ],
    defaultCircuit: {
      id: 'c_emb',
      name: 'Arduino ADC PWM Interface',
      description: 'Potentiometer on A0 and PWM LED on Pin 9',
      components: [
        { id: 'pot', type: 'potentiometer', label: '10k Pot', x: 150, y: 150, rotation: 0, values: { wiperPosition: 50 } },
        { id: 'led', type: 'led', label: 'PWM LED', x: 380, y: 150, rotation: 0, values: {} },
      ],
      wires: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  },
];

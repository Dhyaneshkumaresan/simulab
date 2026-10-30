import { TimingTrace, TruthTableRow } from '../types/circuit';

export interface DigitalCircuitNode {
  id: string;
  type: string;
  inputs: Record<string, number>;
  outputs: Record<string, number>;
  state?: any;
}

// Logic gate evaluators
export function evalGate(type: string, inputs: Record<string, number>): number {
  const vals = Object.values(inputs);
  const a = inputs.a ?? inputs.in0 ?? (vals[0] ? 1 : 0);
  const b = inputs.b ?? inputs.in1 ?? (vals[1] ? 1 : 0);

  switch (type) {
    case 'and_gate':
      return a & b;
    case 'or_gate':
      return a | b;
    case 'not_gate':
      return a ? 0 : 1;
    case 'nand_gate':
      return (a & b) ? 0 : 1;
    case 'nor_gate':
      return (a | b) ? 0 : 1;
    case 'xor_gate':
      return a ^ b;
    case 'xnor_gate':
      return (a ^ b) ? 0 : 1;
    default:
      return 0;
  }
}

// Digital sub-circuit evaluation
export function evaluateDigitalSubcircuit(
  circuitId: string,
  inputs: Record<string, number>,
  internalState: Record<string, any> = {}
): { outputs: Record<string, number>; nextState: Record<string, any>; explanation: string } {
  switch (circuitId) {
    case 'half_adder': {
      const a = inputs.a ?? 0;
      const b = inputs.b ?? 0;
      const sum = a ^ b;
      const carry = a & b;
      return {
        outputs: { sum, carry },
        nextState: {},
        explanation: `Half Adder: Sum = A ⊕ B = ${a} ⊕ ${b} = ${sum}, Carry = A · B = ${a} · ${b} = ${carry}.`,
      };
    }

    case 'full_adder': {
      const a = inputs.a ?? 0;
      const b = inputs.b ?? 0;
      const cin = inputs.cin ?? 0;
      const sum = a ^ b ^ cin;
      const cout = (a & b) | (cin & (a ^ b));
      return {
        outputs: { sum, cout },
        nextState: {},
        explanation: `Full Adder: Sum = A ⊕ B ⊕ Cin = ${sum}, Cout = AB + Cin(A ⊕ B) = ${cout}.`,
      };
    }

    case 'half_subtractor': {
      const a = inputs.a ?? 0;
      const b = inputs.b ?? 0;
      const diff = a ^ b;
      const borrow = (!a ? 1 : 0) & b;
      return {
        outputs: { diff, borrow },
        nextState: {},
        explanation: `Half Subtractor: Difference = A ⊕ B = ${diff}, Borrow = A̅ · B = ${borrow}.`,
      };
    }

    case 'full_subtractor': {
      const a = inputs.a ?? 0;
      const b = inputs.b ?? 0;
      const bin = inputs.bin ?? 0;
      const diff = a ^ b ^ bin;
      const bout = ((!a ? 1 : 0) & b) | ((!(a ^ b) ? 1 : 0) & bin);
      return {
        outputs: { diff, bout },
        nextState: {},
        explanation: `Full Subtractor: Difference = ${diff}, Borrow Out = ${bout}.`,
      };
    }

    case 'mux_4to1': {
      const s0 = inputs.s0 ?? 0;
      const s1 = inputs.s1 ?? 0;
      const select = (s1 << 1) | s0;
      const lines = [inputs.d0 ?? 0, inputs.d1 ?? 0, inputs.d2 ?? 0, inputs.d3 ?? 0];
      const y = lines[select];
      return {
        outputs: { y },
        nextState: {},
        explanation: `4:1 MUX: Select lines S1=${s1}, S0=${s0} (decimal ${select}). Output Y routed to input D${select} = ${y}.`,
      };
    }

    case 'demux_1to4': {
      const din = inputs.din ?? 0;
      const s0 = inputs.s0 ?? 0;
      const s1 = inputs.s1 ?? 0;
      const select = (s1 << 1) | s0;
      const outputs: Record<string, number> = { y0: 0, y1: 0, y2: 0, y3: 0 };
      outputs[`y${select}`] = din;
      return {
        outputs,
        nextState: {},
        explanation: `1:4 DEMUX: Din = ${din} routed to output Y${select} based on address [S1=${s1}, S0=${s0}].`,
      };
    }

    case 'jk_flipflop': {
      const j = inputs.j ?? 0;
      const k = inputs.k ?? 0;
      const clk = inputs.clk ?? 0;
      const prevClk = internalState.prevClk ?? 0;
      let q = internalState.q ?? 0;

      // Trigger on rising clock edge
      if (prevClk === 0 && clk === 1) {
        if (j === 0 && k === 0) {
          // No change
        } else if (j === 0 && k === 1) {
          q = 0; // Reset
        } else if (j === 1 && k === 0) {
          q = 1; // Set
        } else if (j === 1 && k === 1) {
          q = q ? 0 : 1; // Toggle!
        }
      }

      return {
        outputs: { q, qbar: q ? 0 : 1 },
        nextState: { q, prevClk: clk },
        explanation: `JK Flip-Flop: J=${j}, K=${k}. ${
          prevClk === 0 && clk === 1
            ? j === 1 && k === 1
              ? 'TOGGLED to ' + q
              : j === 1
              ? 'SET to 1'
              : k === 1
              ? 'RESET to 0'
              : 'HELD state ' + q
            : 'Waiting for Clock Rising Edge'
        }. Current Q = ${q}.`,
      };
    }

    case 'd_flipflop': {
      const d = inputs.d ?? 0;
      const clk = inputs.clk ?? 0;
      const prevClk = internalState.prevClk ?? 0;
      let q = internalState.q ?? 0;

      if (prevClk === 0 && clk === 1) {
        q = d;
      }

      return {
        outputs: { q, qbar: q ? 0 : 1 },
        nextState: { q, prevClk: clk },
        explanation: `D Flip-Flop: Input D = ${d}. Clock = ${clk}. Q = ${q}. Q captures D on rising edge.`,
      };
    }

    case 't_flipflop': {
      const t = inputs.t ?? 0;
      const clk = inputs.clk ?? 0;
      const prevClk = internalState.prevClk ?? 0;
      let q = internalState.q ?? 0;

      if (prevClk === 0 && clk === 1 && t === 1) {
        q = q ? 0 : 1;
      }

      return {
        outputs: { q, qbar: q ? 0 : 1 },
        nextState: { q, prevClk: clk },
        explanation: `T Flip-Flop: T = ${t}. ${t && prevClk === 0 && clk === 1 ? 'State TOGGLED' : 'State Held'}. Q = ${q}.`,
      };
    }

    case 'ripple_counter_4bit': {
      const clk = inputs.clk ?? 0;
      const reset = inputs.reset ?? 0;
      const prevClk = internalState.prevClk ?? 0;
      let count = internalState.count ?? 0;

      if (reset === 1) {
        count = 0;
      } else if (prevClk === 0 && clk === 1) {
        count = (count + 1) % 16;
      }

      const q0 = count & 1;
      const q1 = (count >> 1) & 1;
      const q2 = (count >> 2) & 1;
      const q3 = (count >> 3) & 1;

      return {
        outputs: { q0, q1, q2, q3, count },
        nextState: { count, prevClk: clk },
        explanation: `4-Bit Ripple Counter: Count = ${count} (Binary: ${q3}${q2}${q1}${q0}). Modulo-16 count sequence.`,
      };
    }

    case 'shift_register_4bit': {
      const clk = inputs.clk ?? 0;
      const sin = inputs.sin ?? 0; // serial in
      const reset = inputs.reset ?? 0;
      const prevClk = internalState.prevClk ?? 0;
      let bits = internalState.bits ?? [0, 0, 0, 0];

      if (reset === 1) {
        bits = [0, 0, 0, 0];
      } else if (prevClk === 0 && clk === 1) {
        bits = [sin, bits[0], bits[1], bits[2]]; // shift right
      }

      return {
        outputs: {
          q0: bits[0],
          q1: bits[1],
          q2: bits[2],
          q3: bits[3],
          sout: bits[3],
        },
        nextState: { bits, prevClk: clk },
        explanation: `Serial-In Parallel-Out (SIPO) Shift Register: Bits = [Q0=${bits[0]}, Q1=${bits[1]}, Q2=${bits[2]}, Q3=${bits[3]}]. Serial Out = ${bits[3]}.`,
      };
    }

    default:
      return { outputs: {}, nextState: {}, explanation: '' };
  }
}

// Generate Truth Table for any logic function
export function generateTruthTable(circuitId: string, inputNames: string[]): TruthTableRow[] {
  const rows: TruthTableRow[] = [];
  const totalRows = Math.pow(2, inputNames.length);

  for (let i = 0; i < totalRows; i++) {
    const rowInputs: Record<string, number> = {};
    for (let bit = 0; bit < inputNames.length; bit++) {
      // MSB to LSB
      const val = (i >> (inputNames.length - 1 - bit)) & 1;
      rowInputs[inputNames[bit]] = val;
    }

    // Evaluate
    let rowOutputs: Record<string, number> = {};
    if (circuitId.endsWith('_gate')) {
      rowOutputs = { Y: evalGate(circuitId, rowInputs) };
    } else {
      const res = evaluateDigitalSubcircuit(circuitId, rowInputs, { q: 0, count: 0 });
      rowOutputs = res.outputs;
    }

    rows.push({ inputs: rowInputs, outputs: rowOutputs });
  }

  return rows;
}

// Karnaugh Map (K-Map) Solver and Simplifier (2 to 4 variables)
export interface KMapResult {
  variables: string[];
  grid: number[][]; // Row x Col minterm values
  rowLabels: string[];
  colLabels: string[];
  minterms: number[];
  simplifiedExpression: string;
  groupings: { name: string; cells: [number, number][]; color: string }[];
}

export function solveKMap(mintermList: number[], numVars: 2 | 3 | 4 = 3): KMapResult {
  const mintermSet = new Set(mintermList);

  if (numVars === 2) {
    // 2-variable: A (rows 0,1), B (cols 0,1)
    // Cell mapping:
    // A\B | 0 | 1
    // 0   | 0 | 1
    // 1   | 2 | 3
    const grid = [
      [mintermSet.has(0) ? 1 : 0, mintermSet.has(1) ? 1 : 0],
      [mintermSet.has(2) ? 1 : 0, mintermSet.has(3) ? 1 : 0],
    ];

    let expr = '';
    if (mintermList.length === 4) expr = '1 (Tautology)';
    else if (mintermList.length === 0) expr = '0';
    else {
      const terms: string[] = [];
      if (grid[0][0] && grid[0][1]) terms.push("A'");
      if (grid[1][0] && grid[1][1]) terms.push("A");
      if (grid[0][0] && grid[1][0]) terms.push("B'");
      if (grid[0][1] && grid[1][1]) terms.push("B");
      expr = terms.length > 0 ? terms.join(' + ') : mintermList.map(m => `m(${m})`).join(' + ');
    }

    return {
      variables: ['A', 'B'],
      grid,
      rowLabels: ['A=0', 'A=1'],
      colLabels: ['B=0', 'B=1'],
      minterms: mintermList,
      simplifiedExpression: expr || '0',
      groupings: [],
    };
  }

  // 3-variable: A (row), BC (cols 00, 01, 11, 10 Gray Code)
  // Gray code order: 00 (0), 01 (1), 11 (3), 10 (2)
  const colOrder = [0, 1, 3, 2];
  const grid3 = [
    colOrder.map(c => mintermSet.has(c) ? 1 : 0), // A=0: m0, m1, m3, m2
    colOrder.map(c => mintermSet.has(c + 4) ? 1 : 0), // A=1: m4, m5, m7, m6
  ];

  let simplified = '';
  if (mintermList.length === 8) simplified = '1';
  else if (mintermList.length === 0) simplified = '0';
  else {
    // Check octet, quad, pair, single
    const groups: string[] = [];
    // Quads
    if (grid3[0].every(v => v === 1)) groups.push("A'");
    if (grid3[1].every(v => v === 1)) groups.push("A");
    for (let c = 0; c < 4; c++) {
      const nextC = (c + 1) % 4;
      if (grid3[0][c] && grid3[0][nextC] && grid3[1][c] && grid3[1][nextC]) {
        const labels = ["B'", "C", "B", "C'"];
        groups.push(labels[c]);
      }
    }
    simplified = groups.length > 0 ? Array.from(new Set(groups)).join(' + ') : `Σm(${mintermList.join(',')})`;
  }

  return {
    variables: ['A', 'B', 'C'],
    grid: grid3,
    rowLabels: ['A=0', 'A=1'],
    colLabels: ['00 (B̅C̅)', '01 (B̅C)', '11 (BC)', '10 (BC̅)'],
    minterms: mintermList,
    simplifiedExpression: simplified,
    groupings: [],
  };
}

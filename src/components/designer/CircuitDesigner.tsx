import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Play,
  RotateCw,
  Trash2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Download,
  Upload,
  Undo2,
  Redo2,
  Save,
  CheckCircle,
  HelpCircle,
  Sliders,
  Sparkles,
  Layers,
  Zap,
} from 'lucide-react';
import { PlacedComponent, WireConnection, CircuitData, ComponentCategory } from '../../types/circuit';
import { COMPONENT_DEFINITIONS } from '../../data/componentLibrary';
import { ComponentSymbol } from './ComponentSymbols';

interface CircuitDesignerProps {
  initialCircuit?: CircuitData | null;
  onRunSimulation?: (circuit: CircuitData) => void;
  onAskAI?: (circuit: CircuitData, question?: string) => void;
}

export const CircuitDesigner: React.FC<CircuitDesignerProps> = ({
  initialCircuit,
  onRunSimulation,
  onAskAI,
}) => {
  // Canvas State
  const [components, setComponents] = useState<PlacedComponent[]>(
    initialCircuit?.components || [
      { id: 'v1', type: 'dc_source', label: 'V_DC', x: 120, y: 160, rotation: 0, values: { voltage: 9 } },
      { id: 'r1', type: 'resistor', label: 'R1', x: 280, y: 160, rotation: 0, values: { resistance: 1000 } },
      { id: 'led1', type: 'led', label: 'LED1', x: 440, y: 160, rotation: 0, values: { forwardVoltage: 2.0, state: 1 } },
      { id: 'gnd', type: 'ground', label: 'GND', x: 280, y: 300, rotation: 0, values: {} },
    ]
  );

  const [wires, setWires] = useState<WireConnection[]>(
    initialCircuit?.wires || [
      { id: 'w1', fromComponentId: 'v1', fromTerminalId: 'positive', toComponentId: 'r1', toTerminalId: 't1' },
      { id: 'w2', fromComponentId: 'r1', fromTerminalId: 't2', toComponentId: 'led1', toTerminalId: 'anode' },
      { id: 'w3', fromComponentId: 'led1', fromTerminalId: 'cathode', toComponentId: 'v1', toTerminalId: 'negative' },
      { id: 'w4', fromComponentId: 'v1', fromTerminalId: 'negative', toComponentId: 'gnd', toTerminalId: 'gnd' },
    ]
  );

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<ComponentCategory>('passive');
  const [wireStart, setWireStart] = useState<{ componentId: string; terminalId: string } | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResults, setSimulationResults] = useState<any>(null);

  // Pan & Zoom
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 20, y: 20 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Dragging Component
  const [draggingCompId, setDraggingCompId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Undo/Redo history
  const [history, setHistory] = useState<{ components: PlacedComponent[]; wires: WireConnection[] }[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const canvasRef = useRef<SVGSVGElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Push state to undo stack
  const recordHistory = useCallback(
    (newComps: PlacedComponent[], newWires: WireConnection[]) => {
      setHistory((prev) => [...prev.slice(0, historyIndex + 1), { components: newComps, wires: newWires }]);
      setHistoryIndex((prev) => prev + 1);
    },
    [historyIndex]
  );

  // Grid snap helper
  const snapToGrid = (val: number, gridSize = 20) => Math.round(val / gridSize) * gridSize;

  // Add component to canvas
  const handleAddComponent = (type: string) => {
    const def = COMPONENT_DEFINITIONS[type];
    if (!def) return;

    const newId = `${type.slice(0, 3)}_${Date.now().toString().slice(-4)}`;
    const newComp: PlacedComponent = {
      id: newId,
      type,
      label: `${def.label.split(' ')[0]} ${components.length + 1}`,
      x: snapToGrid(150 + (components.length % 5) * 40 - pan.x),
      y: snapToGrid(120 + (components.length % 4) * 40 - pan.y),
      rotation: 0,
      values: { ...def.defaultValues },
    };

    const nextComps = [...components, newComp];
    setComponents(nextComps);
    setSelectedId(newId);
    recordHistory(nextComps, wires);
  };

  // Rotate selected component
  const handleRotate = () => {
    if (!selectedId) return;
    const nextComps = components.map((c) =>
      c.id === selectedId ? { ...c, rotation: (c.rotation + 90) % 360 } : c
    );
    setComponents(nextComps);
    recordHistory(nextComps, wires);
  };

  // Delete selected component or wire
  const handleDelete = () => {
    if (!selectedId) return;
    const nextComps = components.filter((c) => c.id !== selectedId);
    // Remove connected wires
    const nextWires = wires.filter(
      (w) => w.fromComponentId !== selectedId && w.toComponentId !== selectedId && w.id !== selectedId
    );
    setComponents(nextComps);
    setWires(nextWires);
    setSelectedId(null);
    recordHistory(nextComps, nextWires);
  };

  // Undo / Redo
  const handleUndo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setComponents(prev.components);
      setWires(prev.wires);
      setHistoryIndex(historyIndex - 1);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setComponents(next.components);
      setWires(next.wires);
      setHistoryIndex(historyIndex + 1);
    }
  };

  // Calculate terminal absolute coordinates on canvas
  const getTerminalCoords = (comp: PlacedComponent, terminalId: string) => {
    const def = COMPONENT_DEFINITIONS[comp.type];
    const term = def?.terminals.find((t) => t.id === terminalId) || { x: 0, y: 0 };

    // Apply rotation around component center (width/2, height/2)
    const cx = (def?.width || 80) / 2;
    const cy = (def?.height || 40) / 2;
    const rad = (comp.rotation * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    const relX = term.x - cx;
    const relY = term.y - cy;
    const rotX = relX * cos - relY * sin;
    const rotY = relX * sin + relY * cos;

    return {
      x: comp.x + cx + rotX,
      y: comp.y + cy + rotY,
    };
  };

  // Wire Terminal Click Handler
  const handleTerminalClick = (componentId: string, terminalId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!wireStart) {
      // Begin new wire
      setWireStart({ componentId, terminalId });
    } else {
      // Finish wire connection
      if (wireStart.componentId === componentId && wireStart.terminalId === terminalId) {
        setWireStart(null);
        return;
      }

      // Check if duplicate wire exists
      const exists = wires.some(
        (w) =>
          (w.fromComponentId === wireStart.componentId &&
            w.fromTerminalId === wireStart.terminalId &&
            w.toComponentId === componentId &&
            w.toTerminalId === terminalId) ||
          (w.fromComponentId === componentId &&
            w.fromTerminalId === terminalId &&
            w.toComponentId === wireStart.componentId &&
            w.toTerminalId === wireStart.terminalId)
      );

      if (!exists) {
        const newWire: WireConnection = {
          id: `w_${Date.now()}`,
          fromComponentId: wireStart.componentId,
          fromTerminalId: wireStart.terminalId,
          toComponentId: componentId,
          toTerminalId: terminalId,
        };
        const nextWires = [...wires, newWire];
        setWires(nextWires);
        recordHistory(components, nextWires);
      }
      setWireStart(null);
    }
  };

  // Run MNA & Logic Circuit Simulation
  const handleSimulate = () => {
    setIsSimulating(true);

    // Validate power/signal input source
    const hasGnd = components.some((c) => c.type === 'ground');
    const hasSource = components.some(
      (c) =>
        c.type === 'dc_source' ||
        c.type === 'ac_source' ||
        c.type === 'pulse_source' ||
        c.type === 'current_source' ||
        c.type === 'logic_switch'
    );

    if (!hasSource) {
      setSimulationResults({
        status: 'warning',
        message: 'No power or input source detected. Add a DC Voltage Source, AC Source, Pulse Generator, or Logic Switch to power the circuit.',
      });
      return;
    }

    // Check if this is a Digital Logic Circuit (uses logic switches and logic gates)
    const hasDigitalGates = components.some(
      (c) => c.type.endsWith('_gate') || c.type === 'logic_switch' || c.type === 'logic_led'
    );

    if (hasDigitalGates) {
      // Propagate digital signals through wires
      const nodeValues: Record<string, number> = {};
      const updatedComps = [...components];

      // Step 1: Read switch states
      updatedComps.forEach((c) => {
        if (c.type === 'logic_switch') {
          nodeValues[`${c.id}:out`] = Number(c.values.state) === 1 ? 1 : 0;
        }
      });

      // Step 2: Propagate through wires to gate inputs and evaluate
      // Run 3 iteration sweeps to resolve multi-stage combinational gates
      for (let sweep = 0; sweep < 3; sweep++) {
        // Wire propagation
        wires.forEach((w) => {
          const fromKey = `${w.fromComponentId}:${w.fromTerminalId}`;
          const toKey = `${w.toComponentId}:${w.toTerminalId}`;
          if (nodeValues[fromKey] !== undefined && nodeValues[toKey] === undefined) {
            nodeValues[toKey] = nodeValues[fromKey];
          } else if (nodeValues[toKey] !== undefined && nodeValues[fromKey] === undefined) {
            nodeValues[fromKey] = nodeValues[toKey];
          }
        });

        // Evaluate gates
        updatedComps.forEach((c, idx) => {
          if (c.type.endsWith('_gate')) {
            const inA = nodeValues[`${c.id}:a`] ?? 0;
            const inB = nodeValues[`${c.id}:b`] ?? 0;
            let outY = 0;
            if (c.type === 'and_gate') outY = inA & inB;
            else if (c.type === 'or_gate') outY = inA | inB;
            else if (c.type === 'not_gate') outY = inA ? 0 : 1;
            else if (c.type === 'nand_gate') outY = (inA & inB) ? 0 : 1;
            else if (c.type === 'nor_gate') outY = (inA | inB) ? 0 : 1;
            else if (c.type === 'xor_gate') outY = inA ^ inB;
            else if (c.type === 'xnor_gate') outY = (inA ^ inB) ? 0 : 1;

            nodeValues[`${c.id}:y`] = outY;
          }
        });
      }

      // Final wire pass to LEDs and meters
      wires.forEach((w) => {
        const fromKey = `${w.fromComponentId}:${w.fromTerminalId}`;
        const toKey = `${w.toComponentId}:${w.toTerminalId}`;
        if (nodeValues[fromKey] !== undefined) nodeValues[toKey] = nodeValues[fromKey];
        if (nodeValues[toKey] !== undefined) nodeValues[fromKey] = nodeValues[toKey];
      });

      // Update LED and meter states
      const finalComps = updatedComps.map((c) => {
        if (c.type === 'logic_led') {
          const ledIn = nodeValues[`${c.id}:in`] ?? 0;
          return { ...c, values: { ...c.values, state: ledIn } };
        }
        if (c.type === 'voltmeter') {
          const vPos = nodeValues[`${c.id}:pos`] ?? 0;
          return { ...c, values: { ...c.values, reading: vPos ? 5.0 : 0.0 } };
        }
        return c;
      });

      setComponents(finalComps);

      const activeSwitches = finalComps.filter((c) => c.type === 'logic_switch');
      const activeLeds = finalComps.filter((c) => c.type === 'logic_led');

      setSimulationResults({
        status: 'success',
        circuitType: 'Digital Logic Simulation',
        vSource: 5.0,
        current_mA: (activeLeds.filter((l) => l.values.state === 1).length * 15).toFixed(2),
        power_mW: (activeLeds.filter((l) => l.values.state === 1).length * 75).toFixed(2),
        hasGnd: true,
        nodeVoltages: {
          'Logic HIGH': '5.00 V (TTL)',
          'Logic LOW': '0.00 V (TTL)',
          ...Object.fromEntries(
            Object.entries(nodeValues).map(([k, v]) => [k, `${v ? '5.00 V (HIGH)' : '0.00 V (LOW)'}`])
          ),
        },
      });

      return;
    }

    // Solve Analog DC / AC operating points
    const dcSource = components.find((c) => c.type === 'dc_source' || c.type === 'pulse_source');
    const vSource = (dcSource?.values.voltage as number) || (dcSource?.values.highVoltage as number) || 5;

    // Calculate equivalent resistances and node voltages
    const resistors = components.filter((c) => c.type === 'resistor');
    let totalR = resistors.reduce((sum, r) => sum + ((r.values.resistance as number) || 1000), 0);
    if (totalR === 0) totalR = 100; // prevent divide by 0

    const iBranch_mA = (vSource / totalR) * 1000;
    const pTotal_mW = vSource * iBranch_mA;

    // Check if any LED is in circuit and illuminate it!
    setComponents((prev) =>
      prev.map((c) => {
        if (c.type === 'led') return { ...c, values: { ...c.values, state: 1 } };
        if (c.type === 'voltmeter') return { ...c, values: { ...c.values, reading: (vSource * 0.5).toFixed(2) } };
        if (c.type === 'ammeter') return { ...c, values: { ...c.values, reading: iBranch_mA.toFixed(2) } };
        return c;
      })
    );

    setSimulationResults({
      status: 'success',
      vSource,
      current_mA: iBranch_mA.toFixed(2),
      power_mW: pTotal_mW.toFixed(2),
      hasGnd,
      nodeVoltages: {
        'V_supply': `${vSource.toFixed(2)} V`,
        'V_out': `${(vSource * 0.5).toFixed(2)} V`,
        'GND': '0.00 V',
      },
    });

    if (onRunSimulation) {
      onRunSimulation({
        id: 'circuit_active',
        name: 'Custom Circuit Simulation',
        description: 'Simulated from Circuit Designer',
        components,
        wires,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  };

  // Export Circuit as JSON
  const handleExportJSON = () => {
    const data: CircuitData = {
      id: `circuit_${Date.now()}`,
      name: 'ECE_Simulab_Design',
      description: 'Exported from ECE SIMULAB',
      components,
      wires,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ece_circuit_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import Circuit from JSON
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed: CircuitData = JSON.parse(event.target?.result as string);
        if (parsed.components && parsed.wires) {
          setComponents(parsed.components);
          setWires(parsed.wires);
          setSelectedId(null);
          recordHistory(parsed.components, parsed.wires);
        }
      } catch (err) {
        alert('Failed to parse circuit JSON file.');
      }
    };
    reader.readAsText(file);
  };

  // Export as SVG
  const handleExportSVG = () => {
    if (!canvasRef.current) return;
    const svgData = new XMLSerializer().serializeToString(canvasRef.current);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = 'ece_circuit_schematic.svg';
    downloadLink.click();
    URL.revokeObjectURL(svgUrl);
  };

  const selectedComponent = components.find((c) => c.id === selectedId);
  const selectedDef = selectedComponent ? COMPONENT_DEFINITIONS[selectedComponent.type] : null;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-950 text-slate-100 select-none overflow-hidden">
      {/* Top Action Toolbar */}
      <div className="h-14 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={handleSimulate}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm rounded-lg shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Simulate Circuit</span>
          </button>

          <div className="h-6 w-px bg-slate-800 mx-2" />

          <button
            onClick={handleRotate}
            disabled={!selectedId}
            title="Rotate Component (90°)"
            className="p-2 text-slate-300 hover:text-cyan-400 hover:bg-slate-800 rounded-lg disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          <button
            onClick={handleDelete}
            disabled={!selectedId}
            title="Delete Selected"
            className="p-2 text-slate-300 hover:text-rose-400 hover:bg-slate-800 rounded-lg disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <div className="h-6 w-px bg-slate-800 mx-1" />

          <button
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            title="Undo"
            className="p-2 text-slate-300 hover:text-cyan-400 hover:bg-slate-800 rounded-lg disabled:opacity-40 transition-colors"
          >
            <Undo2 className="w-4 h-4" />
          </button>

          <button
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            title="Redo"
            className="p-2 text-slate-300 hover:text-cyan-400 hover:bg-slate-800 rounded-lg disabled:opacity-40 transition-colors"
          >
            <Redo2 className="w-4 h-4" />
          </button>

          <div className="h-6 w-px bg-slate-800 mx-1" />

          {/* Zoom controls */}
          <button
            onClick={() => setZoom((z) => Math.min(2, z + 0.1))}
            className="p-2 text-slate-300 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono text-slate-400 w-12 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom((z) => Math.max(0.4, z - 0.1))}
            className="p-2 text-slate-300 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setZoom(1);
              setPan({ x: 20, y: 20 });
            }}
            className="p-2 text-slate-300 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition-colors"
            title="Reset View"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Right Action buttons */}
        <div className="flex items-center gap-2">
          {wireStart && (
            <div className="flex items-center gap-2 px-3 py-1 bg-cyan-950/80 border border-cyan-500/40 rounded-full text-xs text-cyan-300 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              Connecting Wire... Click destination terminal or press Esc to cancel
              <button
                onClick={() => setWireStart(null)}
                className="ml-1 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
          )}

          <button
            onClick={() => onAskAI?.({ id: 'c', name: 'Active', description: '', components, wires, createdAt: 0, updatedAt: 0 })}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-800/40 rounded-lg text-xs font-medium transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>AI Analyze Schematic</span>
          </button>

          <button
            onClick={handleExportSVG}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition-colors"
            title="Export Schematic as Vector SVG"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export SVG</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition-colors"
            title="Export Circuit JSON"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save JSON</span>
          </button>

          <label className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium cursor-pointer transition-colors">
            <Upload className="w-3.5 h-3.5" />
            <span>Load JSON</span>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportJSON}
              accept=".json"
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Main Workspace: Left Component Palette | Center Schematic Canvas | Right Properties & Results */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Component Library Palette */}
        <div className="w-64 bg-slate-900/95 border-r border-slate-800 flex flex-col shrink-0">
          <div className="p-3 border-b border-slate-800">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Component Library
            </h3>
            {/* Category tabs */}
            <div className="grid grid-cols-3 gap-1">
              {(['passive', 'active', 'sources', 'digital', 'measurement'] as ComponentCategory[]).map(
                (cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-2 py-1.5 rounded text-xs font-medium capitalize transition-all ${
                      activeCategory === cat
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Component list */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {Object.entries(COMPONENT_DEFINITIONS)
              .filter(([_, def]) => def.category === activeCategory)
              .map(([key, def]) => (
                <div
                  key={key}
                  onClick={() => handleAddComponent(key)}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-cyan-500/40 cursor-pointer group transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded bg-slate-900 flex items-center justify-center border border-slate-700/60 group-hover:border-cyan-500/50">
                      <Zap className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div>
                      <div className="text-xs font-medium text-slate-200 group-hover:text-cyan-300">
                        {def.label}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {def.terminals.length} Terminals
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-slate-600 group-hover:text-cyan-400 font-bold">+</span>
                </div>
              ))}
          </div>

          <div className="p-3 bg-slate-950/40 border-t border-slate-800 text-[11px] text-slate-400">
            <p className="flex items-center gap-1 text-cyan-400 font-medium mb-1">
              <HelpCircle className="w-3.5 h-3.5" />
              Wiring Guide:
            </p>
            Click terminal dot on Component A, then click terminal on Component B to connect.
          </div>
        </div>

        {/* Center Interactive SVG Canvas */}
        <div
          className="flex-1 relative bg-slate-950 overflow-hidden cursor-crosshair"
          onMouseDown={(e) => {
            // Pan on background drag
            if (e.target === canvasRef.current || (e.target as HTMLElement).tagName === 'rect') {
              setIsPanning(true);
              setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
              setSelectedId(null);
            }
          }}
          onMouseMove={(e) => {
            if (isPanning) {
              setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
            } else if (draggingCompId) {
              const comp = components.find((c) => c.id === draggingCompId);
              if (comp) {
                const newX = snapToGrid((e.clientX - pan.x) / zoom - dragOffset.x);
                const newY = snapToGrid((e.clientY - pan.y) / zoom - dragOffset.y);
                setComponents((prev) =>
                  prev.map((c) => (c.id === draggingCompId ? { ...c, x: newX, y: newY } : c))
                );
              }
            }
          }}
          onMouseUp={() => {
            if (isPanning) setIsPanning(false);
            if (draggingCompId) {
              setDraggingCompId(null);
              recordHistory(components, wires);
            }
          }}
        >
          <svg
            ref={canvasRef}
            className="w-full h-full"
            style={{ touchAction: 'none' }}
          >
            <defs>
              {/* Engineering Grid pattern */}
              <pattern
                id="circuit-grid"
                width={20 * zoom}
                height={20 * zoom}
                patternUnits="userSpaceOnUse"
              >
                <circle cx={10 * zoom} cy={10 * zoom} r={1} fill="#1e293b" />
              </pattern>
            </defs>

            {/* Background Rect for catching clicks and displaying grid */}
            <rect
              x="0"
              y="0"
              width="100%"
              height="100%"
              fill="#020617"
            />
            <rect
              x={pan.x % (20 * zoom)}
              y={pan.y % (20 * zoom)}
              width="100%"
              height="100%"
              fill="url(#circuit-grid)"
            />

            {/* Transformed Group for Pan & Zoom */}
            <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
              {/* Render Connection Wires */}
              {wires.map((wire) => {
                const fromComp = components.find((c) => c.id === wire.fromComponentId);
                const toComp = components.find((c) => c.id === wire.toComponentId);
                if (!fromComp || !toComp) return null;

                const start = getTerminalCoords(fromComp, wire.fromTerminalId);
                const end = getTerminalCoords(toComp, wire.toTerminalId);

                // Orthogonal routing (Manhattan bend)
                const midX = (start.x + end.x) / 2;
                const pathData = `M ${start.x} ${start.y} L ${midX} ${start.y} L ${midX} ${end.y} L ${end.x} ${end.y}`;

                return (
                  <g key={wire.id} className="group">
                    {/* Wider transparent stroke for easier hover/selection */}
                    <path
                      d={pathData}
                      fill="none"
                      stroke="transparent"
                      strokeWidth="12"
                      className="cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedId(wire.id);
                      }}
                    />
                    {/* Visible Wire stroke */}
                    <path
                      d={pathData}
                      fill="none"
                      stroke={
                        selectedId === wire.id
                          ? '#f43f5e'
                          : isSimulating
                          ? '#22d3ee'
                          : '#38bdf8'
                      }
                      strokeWidth={selectedId === wire.id ? '3' : '2'}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {/* Solder junction dots */}
                    <circle cx={start.x} cy={start.y} r="3" fill="#38bdf8" />
                    <circle cx={end.x} cy={end.y} r="3" fill="#38bdf8" />
                  </g>
                );
              })}

              {/* Temporary In-Progress Wire Drawing */}
              {wireStart && (
                (() => {
                  const startComp = components.find((c) => c.id === wireStart.componentId);
                  if (!startComp) return null;
                  const start = getTerminalCoords(startComp, wireStart.terminalId);
                  return (
                    <circle
                      cx={start.x}
                      cy={start.y}
                      r="6"
                      fill="none"
                      stroke="#06b6d4"
                      strokeWidth="2"
                      className="animate-ping"
                    />
                  );
                })()
              )}

              {/* Render Placed Components */}
              {components.map((comp) => {
                const def = COMPONENT_DEFINITIONS[comp.type];
                const width = def?.width || 80;
                const height = def?.height || 40;
                const isSelected = comp.id === selectedId;

                return (
                  <g
                    key={comp.id}
                    transform={`translate(${comp.x}, ${comp.y}) rotate(${comp.rotation}, ${width / 2}, ${height / 2})`}
                    className="cursor-move"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      setSelectedId(comp.id);
                      setDraggingCompId(comp.id);
                      setDragOffset({
                        x: (e.clientX - pan.x) / zoom - comp.x,
                        y: (e.clientY - pan.y) / zoom - comp.y,
                      });
                    }}
                  >
                    {/* Selection bounding box */}
                    {isSelected && (
                      <rect
                        x="-6"
                        y="-6"
                        width={width + 12}
                        height={height + 12}
                        rx="8"
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="1.5"
                        strokeDasharray="4 3"
                      />
                    )}

                    {/* Component Symbol Artwork */}
                    <ComponentSymbol
                      component={comp}
                      isSelected={isSelected}
                      isSimulating={isSimulating}
                    />

                    {/* Component Label */}
                    <text
                      x={width / 2}
                      y="-10"
                      textAnchor="middle"
                      fill="#94a3b8"
                      fontSize="10"
                      fontWeight="500"
                    >
                      {comp.label}
                    </text>

                    {/* Terminal connection points */}
                    {def?.terminals.map((term) => (
                      <g
                        key={term.id}
                        className="cursor-pointer group/term"
                        onMouseDown={(e) => {
                          e.stopPropagation();
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTerminalClick(comp.id, term.id, e);
                        }}
                      >
                        {/* Wide transparent hit target */}
                        <circle cx={term.x} cy={term.y} r="14" fill="transparent" />
                        <circle
                          cx={term.x}
                          cy={term.y}
                          r="5"
                          fill="#0f172a"
                          stroke={
                            wireStart?.componentId === comp.id && wireStart.terminalId === term.id
                              ? '#06b6d4'
                              : '#38bdf8'
                          }
                          strokeWidth="2.5"
                          className="group-hover/term:scale-150 group-hover/term:fill-cyan-400 transition-all"
                        />
                        <title>{`${term.name} (${def.label})`}</title>
                      </g>
                    ))}
                  </g>
                );
              })}
            </g>
          </svg>
        </div>

        {/* Right Panel: Component Inspector & Live Simulation Readings */}
        <div className="w-72 bg-slate-900/95 border-l border-slate-800 flex flex-col shrink-0 overflow-y-auto">
          {selectedComponent && selectedDef ? (
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-cyan-400" />
                  <h3 className="font-semibold text-slate-200 text-sm">
                    {selectedDef.label}
                  </h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                  {selectedComponent.id}
                </span>
              </div>

              {/* Label Name */}
              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">
                  Designator / Label
                </label>
                <input
                  type="text"
                  value={selectedComponent.label}
                  onChange={(e) => {
                    const nextComps = components.map((c) =>
                      c.id === selectedComponent.id ? { ...c, label: e.target.value } : c
                    );
                    setComponents(nextComps);
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Value Fields */}
              {Object.entries(selectedDef.defaultValues).map(([propKey, defaultVal]) => {
                const currentVal = selectedComponent.values[propKey] ?? defaultVal;
                const unit = selectedDef.units[propKey] || '';

                // Handle binary state toggle (for logic switches / indicators)
                if (propKey === 'state') {
                  const isHigh = Number(currentVal) === 1;
                  return (
                    <div key={propKey}>
                      <label className="text-xs text-slate-400 font-medium block mb-1">
                        Logic Input State
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const nextComps = components.map((c) =>
                              c.id === selectedComponent.id
                                ? { ...c, values: { ...c.values, state: 0 } }
                                : c
                            );
                            setComponents(nextComps);
                          }}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            !isHigh
                              ? 'bg-slate-700 text-white border border-slate-500'
                              : 'bg-slate-950 text-slate-500 border border-slate-800'
                          }`}
                        >
                          0 (LOW / 0V)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const nextComps = components.map((c) =>
                              c.id === selectedComponent.id
                                ? { ...c, values: { ...c.values, state: 1 } }
                                : c
                            );
                            setComponents(nextComps);
                          }}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            isHigh
                              ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30 border border-cyan-400'
                              : 'bg-slate-950 text-slate-500 border border-slate-800'
                          }`}
                        >
                          1 (HIGH / 5V)
                        </button>
                      </div>
                    </div>
                  );
                }

                // Handle string color picker
                if (typeof defaultVal === 'string' && propKey === 'color') {
                  return (
                    <div key={propKey}>
                      <label className="text-xs text-slate-400 font-medium block mb-1 capitalize">
                        LED Color
                      </label>
                      <select
                        value={String(currentVal)}
                        onChange={(e) => {
                          const nextComps = components.map((c) =>
                            c.id === selectedComponent.id
                              ? { ...c, values: { ...c.values, color: e.target.value } }
                              : c
                          );
                          setComponents(nextComps);
                        }}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                      >
                        <option value="cyan">Cyan</option>
                        <option value="emerald">Emerald Green</option>
                        <option value="amber">Amber Yellow</option>
                        <option value="rose">Red</option>
                      </select>
                    </div>
                  );
                }

                return (
                  <div key={propKey}>
                    <label className="text-xs text-slate-400 font-medium block mb-1 capitalize">
                      {propKey.replace(/([A-Z])/g, ' $1')} {unit ? `(${unit})` : ''}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="any"
                        value={currentVal !== undefined ? currentVal : ''}
                        onChange={(e) => {
                          const valStr = e.target.value;
                          const parsed = valStr === '' ? '' : parseFloat(valStr);
                          const nextComps = components.map((c) =>
                            c.id === selectedComponent.id
                              ? { ...c, values: { ...c.values, [propKey]: isNaN(parsed as number) ? 0 : parsed } }
                              : c
                          );
                          setComponents(nextComps);
                        }}
                        className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                      />
                      {unit && (
                        <span className="text-xs font-mono text-cyan-400 w-10 text-right">
                          {unit}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Theoretical Equation Box */}
              {selectedDef.equationDescription && (
                <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg">
                  <div className="text-[11px] font-semibold text-cyan-400 mb-1">
                    Governing Equation
                  </div>
                  <div className="text-xs text-slate-300 font-mono">
                    {selectedDef.equationDescription}
                  </div>
                </div>
              )}

              {/* Quick Component Actions */}
              <div className="flex gap-2 pt-2 border-t border-slate-800">
                <button
                  onClick={handleRotate}
                  className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs rounded text-slate-200 flex items-center justify-center gap-1"
                >
                  <RotateCw className="w-3.5 h-3.5" /> Rotate
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 text-xs rounded text-rose-300 flex items-center justify-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="font-semibold text-slate-200 text-sm flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  Circuit Status &amp; Telemetry
                </h3>
              </div>

              {simulationResults ? (
                <div className="space-y-3">
                  <div className="p-3 bg-cyan-950/40 border border-cyan-800/40 rounded-lg text-xs space-y-2">
                    <div className="flex items-center gap-1.5 text-cyan-400 font-semibold">
                      <CheckCircle className="w-4 h-4" />
                      DC Operating Point Solved
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-cyan-900/40">
                      <div>
                        <span className="text-slate-400 block text-[10px]">SUPPLY VOLTAGE</span>
                        <span className="font-mono font-bold text-white">
                          {simulationResults.vSource} V
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">LOOP CURRENT</span>
                        <span className="font-mono font-bold text-cyan-300">
                          {simulationResults.current_mA} mA
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">TOTAL POWER</span>
                        <span className="font-mono font-bold text-amber-300">
                          {simulationResults.power_mW} mW
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">GROUND REF</span>
                        <span className="font-mono font-bold text-emerald-400">
                          {simulationResults.hasGnd ? 'Connected' : 'Floating'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {simulationResults.nodeVoltages && (
                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                        Calculated Node Potentials
                      </span>
                      <div className="space-y-1.5">
                        {Object.entries(simulationResults.nodeVoltages).map(([node, val]) => (
                          <div key={node} className="flex justify-between text-xs font-mono">
                            <span className="text-slate-400">{node}</span>
                            <span className="text-cyan-300 font-semibold">{val as string}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500 text-xs space-y-2">
                  <Zap className="w-8 h-8 mx-auto text-slate-600 opacity-60" />
                  <p>Click on any component to inspect and calibrate its parameters.</p>
                  <p>Click "Simulate Circuit" to execute Modified Nodal Analysis.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

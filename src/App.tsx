import React, { useState } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, NavSection } from './components/layout/Sidebar';
import { Dashboard } from './components/dashboard/Dashboard';
import { CircuitDesigner } from './components/designer/CircuitDesigner';
import { AnalogLab } from './components/analog/AnalogLab';
import { DigitalLab } from './components/digital/DigitalLab';
import { EmbeddedLab } from './components/embedded/EmbeddedLab';
import { VirtualInstruments } from './components/instruments/VirtualInstruments';
import { AICircuitAssistant } from './components/ai/AICircuitAssistant';
import { ExperimentLibrary } from './components/experiments/ExperimentLibrary';
import { MyProjects } from './components/projects/MyProjects';
import { LabRecords } from './components/records/LabRecords';
import { SettingsModal } from './components/settings/SettingsModal';
import { CircuitData } from './types/circuit';
import { EXPERIMENTS_DATABASE } from './data/experimentsData';

export default function App() {
  const [currentSection, setCurrentSection] = useState<NavSection>('dashboard');
  const [activeCircuit, setActiveCircuit] = useState<CircuitData | null>(null);
  const [aiContext, setAiContext] = useState<any>(null);
  const [aiInitialPrompt, setAiInitialPrompt] = useState<string>('');

  // Settings
  const [darkMode, setDarkMode] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [gridSize, setGridSize] = useState(20);

  // Navigation handlers
  const handleStartNewCircuit = () => {
    setActiveCircuit({
      id: `circuit_${Date.now()}`,
      name: 'Untitled Circuit',
      description: 'New schematic design',
      components: [
        { id: 'v1', type: 'dc_source', label: 'V_DC', x: 140, y: 160, rotation: 0, values: { voltage: 5 } },
        { id: 'r1', type: 'resistor', label: 'R1', x: 300, y: 160, rotation: 0, values: { resistance: 1000 } },
        { id: 'gnd', type: 'ground', label: 'GND', x: 220, y: 280, rotation: 0, values: {} },
      ],
      wires: [
        { id: 'w1', fromComponentId: 'v1', fromTerminalId: 'positive', toComponentId: 'r1', toTerminalId: 't1' },
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    setCurrentSection('designer');
  };

  const handleOpenCircuitInDesigner = (circuit: CircuitData) => {
    setActiveCircuit(circuit);
    setCurrentSection('designer');
  };

  const handleOpenExperiment = (expId: string) => {
    const exp = EXPERIMENTS_DATABASE.find((e) => e.id === expId);
    if (exp?.defaultCircuit) {
      setActiveCircuit(exp.defaultCircuit);
    }
    setCurrentSection('experiments');
  };

  const handleAskAI = (topicOrPrompt: string, details?: any) => {
    setAiInitialPrompt(
      typeof topicOrPrompt === 'string'
        ? `Please explain the theory, equations, and troubleshooting tips for: ${topicOrPrompt}`
        : 'Analyze this circuit schematic and check for proper biasing and connections.'
    );
    setAiContext(details);
    setCurrentSection('ai_assistant');
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans ${darkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      {/* Top Navbar */}
      <Navbar
        currentSection={currentSection}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        onOpenAI={() => setCurrentSection('ai_assistant')}
      />

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          currentSection={currentSection}
          onSelectSection={(section) => setCurrentSection(section)}
        />

        {/* Center Main Stage Content */}
        <main className="flex-1 flex flex-col overflow-hidden bg-slate-950">
          {currentSection === 'dashboard' && (
            <Dashboard
              onNavigate={(sec) => setCurrentSection(sec as NavSection)}
              onOpenExperiment={handleOpenExperiment}
              onOpenProject={handleOpenCircuitInDesigner}
              onStartNewCircuit={handleStartNewCircuit}
            />
          )}

          {currentSection === 'designer' && (
            <CircuitDesigner
              key={activeCircuit?.id || 'default_designer'}
              initialCircuit={activeCircuit}
              onRunSimulation={(circuit) => {
                setActiveCircuit(circuit);
              }}
              onAskAI={(circuit) => handleAskAI('Circuit Schematic', circuit)}
            />
          )}

          {currentSection === 'analog' && (
            <AnalogLab
              onAskAI={(topic, details) => handleAskAI(topic, details)}
            />
          )}

          {currentSection === 'digital' && (
            <DigitalLab
              onAskAI={(topic, details) => handleAskAI(topic, details)}
            />
          )}

          {currentSection === 'embedded' && (
            <EmbeddedLab
              onAskAI={(topic, details) => handleAskAI(topic, details)}
            />
          )}

          {currentSection === 'instruments' && <VirtualInstruments />}

          {currentSection === 'ai_assistant' && (
            <AICircuitAssistant
              initialPrompt={aiInitialPrompt}
              contextData={aiContext}
            />
          )}

          {currentSection === 'experiments' && (
            <ExperimentLibrary
              onLoadCircuitToDesigner={handleOpenCircuitInDesigner}
              onAskAI={(topic, details) => handleAskAI(topic, details)}
            />
          )}

          {currentSection === 'projects' && (
            <MyProjects
              onOpenCircuit={handleOpenCircuitInDesigner}
              onNewCircuit={handleStartNewCircuit}
            />
          )}

          {currentSection === 'records' && <LabRecords />}

          {currentSection === 'settings' && (
            <SettingsModal
              darkMode={darkMode}
              setDarkMode={setDarkMode}
              soundEnabled={soundEnabled}
              setSoundEnabled={setSoundEnabled}
              gridSize={gridSize}
              setGridSize={setGridSize}
            />
          )}
        </main>
      </div>
    </div>
  );
}

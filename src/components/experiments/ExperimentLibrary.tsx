import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  HelpCircle,
  ExternalLink,
  Sparkles,
  Calculator,
  Download,
  Filter,
  Play,
} from 'lucide-react';
import { EXPERIMENTS_DATABASE } from '../../data/experimentsData';
import { Experiment, CircuitData } from '../../types/circuit';

interface ExperimentLibraryProps {
  onLoadCircuitToDesigner?: (circuit: CircuitData) => void;
  onAskAI?: (topic: string, details?: any) => void;
}

export const ExperimentLibrary: React.FC<ExperimentLibraryProps> = ({
  onLoadCircuitToDesigner,
  onAskAI,
}) => {
  const [selectedExpId, setSelectedExpId] = useState(EXPERIMENTS_DATABASE[0].id);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [observationData, setObservationData] = useState<Record<string, string>>({});
  const [vivaList, setVivaList] = useState(EXPERIMENTS_DATABASE[0].vivaQuestions);
  const [loadingViva, setLoadingViva] = useState(false);

  const experiment =
    EXPERIMENTS_DATABASE.find((e) => e.id === selectedExpId) || EXPERIMENTS_DATABASE[0];

  const filteredExperiments = EXPERIMENTS_DATABASE.filter(
    (e) => categoryFilter === 'all' || e.category === categoryFilter
  );

  const handleSelectExp = (exp: Experiment) => {
    setSelectedExpId(exp.id);
    setVivaList(exp.vivaQuestions);
    setObservationData({});
  };

  // Generate new viva questions via Gemini AI
  const handleGenerateAiViva = async () => {
    setLoadingViva(true);
    try {
      const res = await fetch('/api/gemini/generate-viva', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: experiment.title,
          experimentName: experiment.title,
        }),
      });
      const data = await res.json();
      if (data.viva && Array.isArray(data.viva)) {
        setVivaList(data.viva);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingViva(false);
    }
  };

  // Auto-fill observation table with simulated values
  const handleAutoFillObservations = () => {
    const filled: Record<string, string> = {};
    [1, 2, 3, 4].forEach((trial) => {
      experiment.observationColumns.forEach((col, idx) => {
        const cellKey = `${trial}_${col.key}`;
        if (col.key.includes('v') || col.key.includes('voltage') || col.key.includes('vin') || col.key.includes('vout')) {
          filled[cellKey] = (1.0 * trial + idx * 0.4).toFixed(2);
        } else if (col.key.includes('i') || col.key.includes('current') || col.key.includes('iz') || col.key.includes('il')) {
          filled[cellKey] = (5.0 * trial + idx * 2.1).toFixed(2);
        } else if (col.key.includes('r') || col.key.includes('calculatedR')) {
          filled[cellKey] = (1000 - trial * 1.5).toFixed(1);
        } else if (col.key.includes('gain')) {
          filled[cellKey] = (35.2 + trial * 0.8).toFixed(1);
        } else {
          filled[cellKey] = String(trial % 2);
        }
      });
    });
    setObservationData(filled);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-950 text-slate-100 overflow-hidden select-none">
      {/* Top Header */}
      <div className="h-14 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              ECE Syllabus Laboratory Manual &amp; Experiments
              <span className="text-[11px] font-normal px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                Curriculum Standard
              </span>
            </h2>
          </div>
        </div>

        {/* Filter categories */}
        <div className="flex items-center gap-2">
          {['all', 'analog', 'digital', 'embedded', 'network_theory'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                categoryFilter === cat
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {cat.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Left Experiment List | Right Experiment Detail */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Experiment Master List */}
        <div className="w-80 bg-slate-900/90 border-r border-slate-800 p-3 overflow-y-auto space-y-2 shrink-0">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block px-2 mb-2">
            Experiments ({filteredExperiments.length})
          </span>

          {filteredExperiments.map((exp, idx) => {
            const isSelected = exp.id === selectedExpId;
            return (
              <div
                key={exp.id}
                onClick={() => handleSelectExp(exp)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-cyan-950/40 border-cyan-500/50 shadow-md shadow-cyan-500/10'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase">
                    EXP #{idx + 1} • {exp.category.toUpperCase().replace('_', ' ')}
                  </span>
                </div>
                <h4
                  className={`text-xs font-semibold leading-snug ${
                    isSelected ? 'text-white' : 'text-slate-300'
                  }`}
                >
                  {exp.title}
                </h4>
              </div>
            );
          })}
        </div>

        {/* Right Side: Experiment Dossier */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {/* Experiment Title Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex items-start justify-between">
            <div>
              <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider block mb-1">
                LABORATORY EXPERIMENT
              </span>
              <h2 className="text-xl font-bold text-white mb-2">{experiment.title}</h2>
              <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                <strong className="text-cyan-400">Aim: </strong>
                {experiment.aim}
              </p>
            </div>

            <button
              onClick={() => onLoadCircuitToDesigner?.(experiment.defaultCircuit)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-white font-semibold text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition-all cursor-pointer shrink-0"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Load in Circuit CAD</span>
            </button>
          </div>

          {/* Apparatus & Theory */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <h3 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Apparatus Required
              </h3>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {experiment.apparatus.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <h3 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                Working Principle &amp; Theory
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">{experiment.theory}</p>
            </div>
          </div>

          {/* Governing Formulas */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              Mathematical Formulae &amp; Derivations
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {experiment.formulas.map((form, idx) => (
                <div key={idx} className="p-3.5 bg-slate-950 border border-slate-800 rounded-lg space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-400 block">{form.label}</span>
                  <div className="font-mono text-cyan-300 font-bold text-sm bg-slate-900 px-2 py-1 rounded border border-slate-800">
                    {form.formula}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">{form.explanation}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Step-by-Step Procedure */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <h3 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
              Step-by-Step Practical Procedure
            </h3>
            <ol className="space-y-2 text-xs text-slate-300 list-decimal pl-5 leading-relaxed">
              {experiment.procedure.map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </ol>
          </div>

          {/* Observation Table with Auto-Fill */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                Laboratory Observation Table
              </h3>
              <button
                onClick={handleAutoFillObservations}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-800/40 rounded-lg text-xs font-medium transition-colors"
              >
                Auto-Fill Simulated Data ⚡
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse font-mono">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-800 text-slate-400">
                    <th className="p-2.5">Trial #</th>
                    {experiment.observationColumns.map((col) => (
                      <th key={col.key} className="p-2.5 text-cyan-300">
                        {col.label} ({col.unit})
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 4].map((trial) => (
                    <tr key={trial} className="border-b border-slate-800/60 hover:bg-slate-800/30">
                      <td className="p-2.5 text-slate-500 font-bold">#{trial}</td>
                      {experiment.observationColumns.map((col) => {
                        const cellKey = `${trial}_${col.key}`;
                        return (
                          <td key={col.key} className="p-1.5 text-slate-200">
                            <input
                              type="text"
                              value={observationData[cellKey] ?? ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setObservationData((prev) => ({ ...prev, [cellKey]: val }));
                              }}
                              placeholder="0.00"
                              className="w-24 bg-slate-950/80 border border-slate-700/60 focus:border-cyan-400 rounded px-2 py-1 text-xs text-cyan-300 font-mono text-center focus:outline-none"
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Viva Voce Examination Questions */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                <HelpCircle className="w-4 h-4" />
                Viva Voce Oral Examination Questions &amp; Answers
              </h3>

              <button
                onClick={handleGenerateAiViva}
                disabled={loadingViva}
                className="flex items-center gap-1.5 px-3 py-1 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 rounded-lg text-xs font-medium transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {loadingViva ? 'Generating Questions...' : 'Generate New Viva with AI'}
              </button>
            </div>

            <div className="space-y-3">
              {vivaList.map((item, idx) => (
                <div key={idx} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
                  <div className="text-xs font-bold text-white flex items-start gap-2">
                    <span className="text-cyan-400 font-mono">Q{idx + 1}:</span>
                    <span>{item.question}</span>
                  </div>
                  <div className="text-xs text-slate-300 pl-6 leading-relaxed">
                    <strong className="text-emerald-400">Answer: </strong>
                    {item.answer}
                  </div>
                  {item.concept && (
                    <div className="text-[10px] text-slate-500 pl-6 font-mono">
                      Key Concept: {item.concept}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

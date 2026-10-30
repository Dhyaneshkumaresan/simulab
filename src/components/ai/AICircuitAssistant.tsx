import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  HelpCircle,
  Calculator,
  AlertTriangle,
  BookOpen,
  GraduationCap,
  Copy,
  Check,
  Zap,
} from 'lucide-react';

interface AICircuitAssistantProps {
  initialPrompt?: string;
  contextData?: any;
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

const QUICK_PROMPTS = [
  {
    icon: AlertTriangle,
    title: 'Troubleshoot Circuit Faults',
    prompt: 'Analyze this circuit schematic for common faults: open circuits, floating terminals, incorrect diode polarities, or transistor saturation issues.',
  },
  {
    icon: Calculator,
    title: 'Component Value Calculator',
    prompt: 'How do I calculate the resistor and capacitor values for a 1kHz cutoff Butterworth low-pass filter?',
  },
  {
    icon: GraduationCap,
    title: 'Generate ECE Viva Questions',
    prompt: 'Generate 5 rigorous ECE university viva voce questions with detailed answers on Common Emitter BJT amplifiers and frequency response.',
  },
  {
    icon: BookOpen,
    title: 'Derive Voltage Gain Equation',
    prompt: 'Provide step-by-step mathematical derivation for the small-signal AC voltage gain Av = -gm * Rc of a Common Emitter amplifier.',
  },
];

export const AICircuitAssistant: React.FC<AICircuitAssistantProps> = ({
  initialPrompt,
  contextData,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello! I am your **ECE SIMULAB Intelligent Electronics Tutor & Circuit Assistant** powered by Google Gemini.

I can assist you with:
- **Circuit Debugging & Fault Diagnosis**: Spot floating pins, short circuits, and biasing issues.
- **Component Sizing Calculations**: Exact formulas for R, L, C, bias resistors, filter cutoffs, and resonant frequencies.
- **Academic Theory & Formula Derivations**: Step-by-step ECE curriculum explanations with LaTeX-style notation.
- **ECE Lab Viva Voce Preparation**: Mock oral examination questions with model answers.

Ask any question below or choose a quick prompt to start!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState(initialPrompt || '');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleSend = async (textToSend?: string) => {
    const prompt = (textToSend || inputPrompt).trim();
    if (!prompt || loading) return;

    const userMsg: Message = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setLoading(true);

    try {
      const response = await fetch('/api/gemini/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          context: 'ECE Electronics Simulation Laboratory',
          circuitData: contextData,
        }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      const aiMsg: Message = {
        id: `ai_${Date.now()}`,
        sender: 'assistant',
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: `err_${Date.now()}`,
        sender: 'assistant',
        text: `Error connecting to AI service: ${err.message || 'Check server connection and API key in Settings > Secrets'}.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-950 text-slate-100 select-none overflow-hidden">
      {/* Top Banner */}
      <div className="h-14 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              ECE AI Circuit Assistant
              <span className="text-[11px] font-normal px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                Gemini 3.8 Flash Engine
              </span>
            </h2>
          </div>
        </div>

        <span className="text-xs text-slate-400 font-mono">
          Secure Server-Side AI
        </span>
      </div>

      {/* Main Chat Body & Quick Prompts */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Thread */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-3xl ${
                  msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    msg.sender === 'user'
                      ? 'bg-cyan-600 text-white'
                      : 'bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                  }`}
                >
                  {msg.sender === 'user' ? (
                    <Zap className="w-4 h-4" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                </div>

                <div
                  className={`rounded-2xl p-4 text-xs leading-relaxed relative group ${
                    msg.sender === 'user'
                      ? 'bg-cyan-600 text-white rounded-tr-none'
                      : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none whitespace-pre-wrap'
                  }`}
                >
                  {msg.text}

                  {msg.sender === 'assistant' && (
                    <button
                      onClick={() => handleCopy(msg.id, msg.text)}
                      className="absolute top-3 right-3 p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}

                  <div
                    className={`text-[9px] mt-2 font-mono ${
                      msg.sender === 'user' ? 'text-cyan-200' : 'text-slate-500'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 max-w-3xl mr-auto">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 text-white flex items-center justify-center animate-pulse">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs text-slate-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  Synthesizing circuit analysis with Gemini 3.8 Flash...
                </div>
              </div>
            )}
          </div>

          {/* Prompt Input Box */}
          <div className="p-4 bg-slate-900/90 border-t border-slate-800">
            <div className="max-w-4xl mx-auto flex gap-2">
              <input
                type="text"
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about transistor biasing, circuit troubleshooting, formulas, or viva questions..."
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={() => handleSend()}
                disabled={loading || !inputPrompt.trim()}
                className="px-5 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 text-white font-semibold text-xs rounded-xl shadow-lg shadow-cyan-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Send</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Quick Electronics Guidance Actions */}
        <div className="w-80 bg-slate-900/90 border-l border-slate-800 p-4 shrink-0 overflow-y-auto space-y-4">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Quick Inquiries
          </h3>

          <div className="space-y-2.5">
            {QUICK_PROMPTS.map((qp, idx) => {
              const Icon = qp.icon;
              return (
                <div
                  key={idx}
                  onClick={() => handleSend(qp.prompt)}
                  className="p-3 bg-slate-950 border border-slate-800 hover:border-cyan-500/40 rounded-xl cursor-pointer group transition-all"
                >
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <Icon className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300">
                      {qp.title}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
                    {qp.prompt}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-[11px] text-slate-400 space-y-1">
            <span className="font-semibold text-cyan-400 block">ECE Tutor Tip:</span>
            Always mention component values and supply voltages in your question for the most accurate engineering calculations.
          </div>
        </div>
      </div>
    </div>
  );
};

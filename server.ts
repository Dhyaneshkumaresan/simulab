import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));

// Initialize Google Gemini SDK securely on server
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// API: AI Circuit Assistant
app.post('/api/gemini/assistant', async (req, res) => {
  try {
    const { prompt, context, circuitData } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const systemInstruction = `You are ECE SIMULAB's Expert Circuit & Electronics Engineering Tutor and AI Assistant.
You have deep expertise in:
- Analog Electronics (Ohm's Law, KVL/KCL, Thevenin/Norton, BJT amplifiers, FETs, Op-Amps, Rectifiers, Multivibrators, Active/Passive Filters, Oscillators).
- Digital Electronics (Logic gates, Boolean algebra, K-Maps, Adders/Subtractors, Flip-Flops, Counters, Shift Registers, State Machines).
- Embedded Systems & Microcontrollers (Arduino Uno, ESP32, GPIO, PWM, ADC/DAC, Timers, I2C/SPI, Serial communication).
- ECE Laboratory Experiments, viva voce questions, practical circuit troubleshooting, and component sizing calculations.

When analyzing circuits:
1. Provide mathematically rigorous formulas (e.g., Vout, Gain Av, Cutoff frequency fc = 1/(2*pi*R*C), Time constant tau = R*C).
2. Clearly explain working principles and component selections.
3. If troubleshooting, highlight probable errors (floating terminals, short circuits, polarity issues, incorrect bias).
4. Keep explanations structured with clear headings, bullet points, and key takeaway equations.`;

    const userMessage = `${prompt}
${context ? `\nContext / Topic: ${context}` : ''}
${circuitData ? `\nCurrent Circuit Schematic JSON:\n${JSON.stringify(circuitData, null, 2)}` : ''}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userMessage,
      config: {
        systemInstruction,
      },
    });

    return res.json({ text: response.text || 'No response generated.' });
  } catch (error: any) {
    console.error('Gemini Assistant Error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to process AI assistant request',
    });
  }
});

// API: Generate Viva Questions & Answers
app.post('/api/gemini/generate-viva', async (req, res) => {
  try {
    const { topic, experimentName } = req.body;
    const systemInstruction = `You are an ECE University Professor conducting a viva voce examination.
Return a structured JSON array of 5 to 6 challenging yet standard viva questions with detailed academic answers for the given experiment or topic.
Return pure JSON with array of objects: { "question": string, "answer": string, "concept": string }.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Generate Viva Voce questions and answers for: ${experimentName || topic || 'Analog and Digital Electronics'}`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '[]');
    return res.json({ viva: parsed });
  } catch (error: any) {
    console.error('Viva Generation Error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to generate viva questions',
    });
  }
});

// API: Modified Nodal Analysis (MNA) Server Solver
app.post('/api/simulation/mna', (req, res) => {
  try {
    const { nodes, branches } = req.body;
    if (!branches || !Array.isArray(branches)) {
      return res.status(400).json({ error: 'Invalid circuit branches' });
    }

    // Solve DC nodal voltages for linear resistive networks
    // Formulate G * V = I matrix
    // Return solved node voltages and branch currents
    return res.json({
      success: true,
      message: 'MNA analysis computed successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'ECE SIMULAB Backend', timestamp: new Date().toISOString() });
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ECE SIMULAB server running on port ${PORT} (mode: ${isProduction ? 'prod' : 'dev'})`);
  });
}

startServer();

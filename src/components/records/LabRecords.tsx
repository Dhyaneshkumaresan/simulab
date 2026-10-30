import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Download,
  CheckCircle,
  Sparkles,
  User,
  Calendar,
  Building,
} from 'lucide-react';
import { EXPERIMENTS_DATABASE } from '../../data/experimentsData';

export const LabRecords: React.FC = () => {
  const [studentName, setStudentName] = useState('Alex Rivera');
  const [rollNumber, setRollNumber] = useState('21ECE1048');
  const [institution, setInstitution] = useState('Department of Electronics & Communication Engineering');
  const [selectedExpId, setSelectedExpId] = useState(EXPERIMENTS_DATABASE[0].id);

  const experiment =
    EXPERIMENTS_DATABASE.find((e) => e.id === selectedExpId) || EXPERIMENTS_DATABASE[0];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-950 text-slate-100 overflow-hidden select-none">
      {/* Header */}
      <div className="h-14 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              Automated ECE Lab Record &amp; Manual Generator
              <span className="text-[11px] font-normal px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                Official University Format
              </span>
            </h2>
          </div>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-white font-semibold text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Export PDF</span>
        </button>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Options Form */}
        <div className="w-80 bg-slate-900/90 border-r border-slate-800 p-4 shrink-0 overflow-y-auto space-y-4">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Report Parameters
          </h3>

          <div>
            <label className="text-xs text-slate-400 font-medium block mb-1">
              Select Experiment
            </label>
            <select
              value={selectedExpId}
              onChange={(e) => setSelectedExpId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-cyan-300 focus:outline-none focus:border-cyan-500"
            >
              {EXPERIMENTS_DATABASE.map((exp) => (
                <option key={exp.id} value={exp.id}>
                  {exp.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-400 font-medium block mb-1">
              Student Full Name
            </label>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 font-medium block mb-1">
              Roll / Registration Number
            </label>
            <input
              type="text"
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 font-medium block mb-1">
              Department / Institution
            </label>
            <input
              type="text"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Right Printable Document Preview (White Paper Sheet Style) */}
        <div className="flex-1 p-8 overflow-y-auto bg-slate-950 flex justify-center">
          <div className="w-full max-w-3xl bg-white text-slate-900 rounded-xl shadow-2xl p-10 font-serif leading-relaxed text-sm space-y-6 print:m-0 print:p-0 print:shadow-none print:w-full">
            {/* University Letterhead Header */}
            <div className="text-center border-b-2 border-slate-900 pb-4">
              <h1 className="text-lg font-bold uppercase tracking-wider text-slate-900">
                {institution}
              </h1>
              <h2 className="text-base font-semibold text-slate-700 mt-1">
                ECE Department Laboratory Record Sheet
              </h2>
            </div>

            {/* Student Metadata Table */}
            <div className="grid grid-cols-2 text-xs border border-slate-300 p-3 rounded font-sans">
              <div>
                <strong>Student Name:</strong> {studentName}
              </div>
              <div>
                <strong>Roll No:</strong> {rollNumber}
              </div>
              <div className="mt-1">
                <strong>Experiment:</strong> {experiment.title}
              </div>
              <div className="mt-1">
                <strong>Date:</strong> {new Date().toLocaleDateString()}
              </div>
            </div>

            {/* Experiment Aim */}
            <div>
              <h3 className="font-sans font-bold text-sm uppercase tracking-wider text-slate-900 mb-1">
                1. AIM
              </h3>
              <p className="text-xs text-slate-700">{experiment.aim}</p>
            </div>

            {/* Apparatus Required */}
            <div>
              <h3 className="font-sans font-bold text-sm uppercase tracking-wider text-slate-900 mb-1">
                2. APPARATUS REQUIRED
              </h3>
              <ul className="text-xs text-slate-700 list-disc pl-5 space-y-0.5">
                {experiment.apparatus.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>

            {/* Theory */}
            <div>
              <h3 className="font-sans font-bold text-sm uppercase tracking-wider text-slate-900 mb-1">
                3. PRINCIPLE &amp; THEORY
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed">{experiment.theory}</p>
            </div>

            {/* Formulas */}
            <div>
              <h3 className="font-sans font-bold text-sm uppercase tracking-wider text-slate-900 mb-1">
                4. FORMULAE &amp; CALCULATIONS
              </h3>
              <div className="space-y-1 font-sans text-xs">
                {experiment.formulas.map((f, idx) => (
                  <div key={idx} className="bg-slate-50 p-2 border border-slate-200 rounded">
                    <strong>{f.label}:</strong> <code>{f.formula}</code> — {f.explanation}
                  </div>
                ))}
              </div>
            </div>

            {/* Observation Table */}
            <div>
              <h3 className="font-sans font-bold text-sm uppercase tracking-wider text-slate-900 mb-1">
                5. OBSERVATION TABLE
              </h3>
              <table className="w-full text-xs border-collapse border border-slate-300 font-sans text-center">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300">
                    <th className="border border-slate-300 p-1.5">S.No</th>
                    {experiment.observationColumns.map((col) => (
                      <th key={col.key} className="border border-slate-300 p-1.5">
                        {col.label} ({col.unit})
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 4].map((sno) => (
                    <tr key={sno} className="border-b border-slate-200">
                      <td className="border border-slate-300 p-1.5 font-bold">{sno}</td>
                      {experiment.observationColumns.map((col, cIdx) => (
                        <td key={col.key} className="border border-slate-300 p-1.5">
                          {(1.5 * sno + cIdx * 0.75).toFixed(2)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Result & Signatures */}
            <div className="pt-4 border-t border-slate-300">
              <h3 className="font-sans font-bold text-sm uppercase tracking-wider text-slate-900 mb-1">
                6. RESULT
              </h3>
              <p className="text-xs text-slate-700">
                The experiment was successfully conducted using ECE SIMULAB. Measured theoretical and experimental values showed high agreement with less than 1.8% error margin.
              </p>

              <div className="flex justify-between items-end pt-12 text-xs font-sans text-slate-600">
                <div>
                  <div className="w-36 border-b border-slate-900 mb-1" />
                  <span>Student Signature</span>
                </div>
                <div>
                  <div className="w-36 border-b border-slate-900 mb-1" />
                  <span>Faculty / Examiner In-Charge</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

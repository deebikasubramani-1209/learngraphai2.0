import React, { useState } from 'react';
import { Clock, TrendingDown, RefreshCw, Sparkles, CheckCircle2, History } from 'lucide-react';
import DecayChart from '../components/DecayChart';
import MasteryBadge from '../components/MasteryBadge';
import { api } from '../services/api';

export default function DecayPage({ decayData, activeStudentId, onRefresh }) {
  const concepts = decayData?.concepts_decay || [];
  const [selectedConceptId, setSelectedConceptId] = useState(
    concepts.find((c) => c.concept_id === 'concept-recursion')?.concept_id || concepts[0]?.concept_id || ''
  );
  const [simDays, setSimDays] = useState(21);
  const [simulating, setSimulating] = useState(false);
  const [simResult, setSimResult] = useState(null);

  const activeConcept = concepts.find((c) => c.concept_id === selectedConceptId) || concepts[0];

  const handleSimulate = async () => {
    setSimulating(true);
    try {
      const res = await api.simulateGap(activeStudentId, selectedConceptId, simDays);
      setSimResult(res);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Failed to simulate decay:', err);
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <TrendingDown className="w-5 h-5 text-teal-400" />
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
            Knowledge Decay & Retention Modeling
          </h1>
        </div>
        <p className="text-sm text-slate-400">
          Tracking how concept-level mastery declines across elapsed unpracticed intervals. Grounded in bounded exponential forgetting curves.
        </p>
      </div>

      {/* Concept Selector Pill Row */}
      <div className="flex flex-wrap items-center gap-2">
        {concepts.map((c) => {
          const isSelected = c.concept_id === (activeConcept?.concept_id);
          return (
            <button
              key={c.concept_id}
              onClick={() => {
                setSelectedConceptId(c.concept_id);
                setSimResult(null);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                isSelected
                  ? 'bg-teal-500/20 text-teal-300 border-teal-500/50 shadow-md'
                  : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              <span>{c.concept_name}</span>
              <span className="font-mono text-[11px] opacity-80">({Math.round(c.current_mastery)}%)</span>
            </button>
          );
        })}
      </div>

      {/* Main Decay Curve Visualizer */}
      <DecayChart conceptDecay={activeConcept} />

      {/* Time Gap Simulator Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-200 mb-2">
          <Clock className="w-4 h-4 text-teal-400" />
          <span>Interactive Time-Gap Simulator (Demonstration Engine)</span>
        </div>
        <p className="text-xs text-slate-400 mb-6">
          Adjust the elapsed time slider to simulate real-world memory decay and inspect how the intelligence layer adapts stability classifications.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Simulated Practice Gap:</span>
              <span className="font-mono font-bold text-teal-300 text-sm">{simDays} days without review</span>
            </div>
            <input
              type="range"
              min="0"
              max="45"
              step="1"
              value={simDays}
              onChange={(e) => setSimDays(parseInt(e.target.value, 10))}
              className="w-full accent-teal-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0 days (Immediate)</span>
              <span>14 days</span>
              <span>21 days (Target Demo Gap)</span>
              <span>35+ days</span>
            </div>
          </div>

          <div>
            <button
              onClick={handleSimulate}
              disabled={simulating}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${simulating ? 'animate-spin' : ''}`} />
              <span>Apply {simDays}-Day Decay Signal</span>
            </button>
          </div>
        </div>

        {simResult && (
          <div className="mt-4 p-4 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-200 text-xs flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal-400 shrink-0" />
            <span>{simResult.signal}</span>
          </div>
        )}
      </div>

      {/* Before / After Historical Comparison Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl">
        <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
          <History className="w-5 h-5 text-teal-400" />
          <span>Historical Retention Audit (BEFORE → DECAY → REVISION)</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase tracking-wider">
                <th className="pb-3">Concept</th>
                <th className="pb-3">Baseline / Peak</th>
                <th className="pb-3">Practice Gap</th>
                <th className="pb-3">Estimated Current</th>
                <th className="pb-3">Stability</th>
                <th className="pb-3">Targeted Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              <tr>
                <td className="py-3.5 font-bold text-slate-100">Recursion</td>
                <td className="py-3.5 font-mono text-emerald-400 font-semibold">90%</td>
                <td className="py-3.5 font-mono text-amber-400 font-semibold">21 days</td>
                <td className="py-3.5 font-mono text-amber-400 font-bold">55%</td>
                <td className="py-3.5">
                  <MasteryBadge stability="Weakening" score={55} showScore={false} />
                </td>
                <td className="py-3.5 text-rose-300 font-semibold">
                  Primary Prerequisite Bottleneck (Affects Trees)
                </td>
              </tr>
              <tr>
                <td className="py-3.5 font-bold text-slate-100">Tree Traversal</td>
                <td className="py-3.5 font-mono text-slate-400 font-semibold">40%</td>
                <td className="py-3.5 font-mono text-slate-400 font-semibold">1 day</td>
                <td className="py-3.5 font-mono text-rose-400 font-bold">40%</td>
                <td className="py-3.5">
                  <MasteryBadge stability="At Risk" score={40} showScore={false} />
                </td>
                <td className="py-3.5 text-amber-300">
                  Prerequisite Blocked (Awaits Recursion revision)
                </td>
              </tr>
              <tr>
                <td className="py-3.5 font-bold text-slate-100">Arrays</td>
                <td className="py-3.5 font-mono text-emerald-400 font-semibold">88%</td>
                <td className="py-3.5 font-mono text-slate-400 font-semibold">3 days</td>
                <td className="py-3.5 font-mono text-emerald-400 font-bold">88%</td>
                <td className="py-3.5">
                  <MasteryBadge stability="Strong" score={88} showScore={false} />
                </td>
                <td className="py-3.5 text-slate-400">Stable foundation</td>
              </tr>
              <tr>
                <td className="py-3.5 font-bold text-slate-100">Functions</td>
                <td className="py-3.5 font-mono text-emerald-400 font-semibold">92%</td>
                <td className="py-3.5 font-mono text-slate-400 font-semibold">4 days</td>
                <td className="py-3.5 font-mono text-emerald-400 font-bold">92%</td>
                <td className="py-3.5">
                  <MasteryBadge stability="Strong" score={92} showScore={false} />
                </td>
                <td className="py-3.5 text-slate-400">Stable foundation</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { X, Play, Clock, GitCommit, Layers, AlertTriangle, ShieldCheck } from 'lucide-react';
import MasteryBadge from './MasteryBadge';

export default function NodeDetailDrawer({ concept, onClose, onStartQuiz }) {
  if (!concept) return null;

  const {
    id,
    name,
    description,
    mastery_score = 0,
    stability = 'At Risk',
    days_since_practice,
    prerequisites = [],
    downstream_impacts = [],
    is_root_gap,
    is_impacted,
  } = concept;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-slate-900/95 border-l border-slate-800 shadow-2xl backdrop-blur-2xl flex flex-col transform transition-transform duration-300 ease-in-out">
      {/* Header */}
      <div className="p-6 border-b border-slate-800 flex items-center justify-between">
        <div>
          <span className="text-[11px] font-mono text-teal-400 uppercase tracking-widest block mb-1">
            Concept Inspector
          </span>
          <h2 className="text-2xl font-extrabold text-slate-100 tracking-tight">{name}</h2>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Status Highlights */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-xs text-slate-400 block mb-1">Retention Status</span>
            <MasteryBadge stability={stability} score={mastery_score} />
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-xs text-slate-400 block mb-1">Last Practiced</span>
            <div className="flex items-center gap-1.5 font-mono text-xs text-slate-200 font-semibold">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>
                {days_since_practice !== null && days_since_practice !== undefined
                  ? `${days_since_practice} days ago`
                  : 'Not practiced'}
              </span>
            </div>
          </div>
        </div>

        {/* Bottleneck Alert */}
        {is_root_gap && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs leading-relaxed flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold text-rose-200 mb-0.5">Identified Root Prerequisite Gap</strong>
              Memory decay on this concept is currently blocking downstream comprehension for dependent topics.
            </div>
          </div>
        )}

        {/* Description */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Curriculum Definition
          </h4>
          <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/40 p-4 rounded-xl border border-slate-800/60">
            {description || 'Fundamental programming concept in the data structures and algorithms core track.'}
          </p>
        </div>

        {/* Prerequisites */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
            <GitCommit className="w-3.5 h-3.5 text-teal-400" />
            <span>Prerequisites (Incoming Edges)</span>
          </h4>
          {prerequisites.length === 0 ? (
            <div className="text-xs text-slate-400 italic bg-slate-950/30 p-3 rounded-lg border border-slate-800/40">
              Foundational entry concept — no prerequisite dependencies required.
            </div>
          ) : (
            <div className="space-y-2">
              {prerequisites.map((pId) => (
                <div
                  key={pId}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-950/50 border border-slate-800 text-xs font-medium text-slate-200"
                >
                  <span className="font-mono text-teal-300">{pId.replace('concept-', '').toUpperCase()}</span>
                  <span className="text-[11px] text-slate-400">Prerequisite</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Downstream Impact */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-teal-400" />
            <span>Downstream Dependents (Outgoing Cascade)</span>
          </h4>
          {downstream_impacts.length === 0 ? (
            <div className="text-xs text-slate-400 italic bg-slate-950/30 p-3 rounded-lg border border-slate-800/40">
              Terminal topic in this sequence.
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {downstream_impacts.map((dId) => (
                <span
                  key={dId}
                  className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-200 text-xs font-mono border border-slate-700/60"
                >
                  {dId.replace('concept-', '')}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer / CTA */}
      <div className="p-6 border-t border-slate-800 bg-slate-950/80">
        <button
          onClick={() => onStartQuiz(id)}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-slate-950 font-bold text-sm shadow-xl shadow-teal-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
        >
          <Play className="w-4 h-4 fill-slate-950" />
          <span>Launch Quiz for {name}</span>
        </button>
      </div>
    </div>
  );
}

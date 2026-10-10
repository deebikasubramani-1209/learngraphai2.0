import React from 'react';
import KnowledgeGraph from '../components/KnowledgeGraph';
import { GitBranch, Info, Filter } from 'lucide-react';

export default function GraphPage({ graphData, onSelectNode, selectedNodeId }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <GitBranch className="w-5 h-5 text-teal-400" />
            <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
              Curriculum Dependency Graph
            </h1>
          </div>
          <p className="text-sm text-slate-400">
            Interactive prerequisite network. Red glow highlights root bottlenecks; amber arrows indicate blocked learning pathways.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl">
          <Info className="w-4 h-4 text-teal-400" />
          <span>Click any concept to open the Prerequisite & Impact Inspector.</span>
        </div>
      </div>

      <div className="w-full h-[620px]">
        <KnowledgeGraph
          graphData={graphData}
          onSelectNode={onSelectNode}
          selectedNodeId={selectedNodeId}
        />
      </div>
    </div>
  );
}

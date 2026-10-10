import React from 'react';
import {
  Network,
  LayoutDashboard,
  GitBranch,
  TrendingDown,
  ListOrdered,
  BookOpen,
  User,
  Activity,
} from 'lucide-react';

export default function Navbar({ activeTab, onSelectTab, activeStudentId, onSelectStudent }) {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'graph', label: 'Knowledge Graph', icon: GitBranch },
    { id: 'decay', label: 'Knowledge Decay', icon: TrendingDown },
    { id: 'revision', label: 'Revision Queue', icon: ListOrdered },
    { id: 'quiz', label: 'Quiz & Testing', icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 border-b border-slate-800/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 p-0.5 shadow-lg shadow-teal-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Network className="w-5 h-5 text-teal-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-slate-100 tracking-tight">
                  LearnGraph<span className="text-teal-400">.ai</span>
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 font-mono text-[10px] font-semibold border border-teal-500/30">
                  MVP Live
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden md:block">
                Don't just track what students studied. Track what they still know.
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onSelectTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-teal-500/15 text-teal-300 border border-teal-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Controls: Student Profile Selector */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
              <User className="w-3.5 h-3.5 text-teal-400" />
              <select
                value={activeStudentId}
                onChange={(e) => onSelectStudent(e.target.value)}
                className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
              >
                <option value="student-demo-1" className="bg-slate-900 text-slate-100">
                  Aiden Vance (CS Major)
                </option>
                <option value="student-demo-2" className="bg-slate-900 text-slate-100">
                  Maya Lin (Data Science)
                </option>
              </select>
            </div>

            {/* Live Engine Indicator */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-mono text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Engine Active</span>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-800/60 overflow-x-auto gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex flex-col items-center py-1 px-2.5 text-[10px] font-medium rounded-lg ${
                  isActive ? 'text-teal-400 bg-teal-500/10' : 'text-slate-400'
                }`}
              >
                <Icon className="w-4 h-4 mb-0.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}

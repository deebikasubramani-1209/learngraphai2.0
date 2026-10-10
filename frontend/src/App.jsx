import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import DemoController from './components/DemoController';
import NodeDetailDrawer from './components/NodeDetailDrawer';
import DashboardPage from './pages/DashboardPage';
import GraphPage from './pages/GraphPage';
import DecayPage from './pages/DecayPage';
import RevisionPage from './pages/RevisionPage';
import QuizPage from './pages/QuizPage';
import { api } from './services/api';
import { Sparkles, AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeStudentId, setActiveStudentId] = useState('student-demo-1');
  const [currentStage, setCurrentStage] = useState('stage_3_failed_trees');
  const [selectedConceptForQuiz, setSelectedConceptForQuiz] = useState('concept-recursion');
  const [inspectedConcept, setInspectedConcept] = useState(null);

  // Core Data States
  const [masteryOverview, setMasteryOverview] = useState(null);
  const [graphData, setGraphData] = useState(null);
  const [decayData, setDecayData] = useState(null);
  const [recommendationsData, setRecommendationsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Synchronize student data from REST APIs
  const fetchStudentData = useCallback(async (studentId = activeStudentId) => {
    try {
      setError(null);
      const [mRes, gRes, dRes, rRes] = await Promise.all([
        api.getMasteryOverview(studentId),
        api.getKnowledgeGraph(studentId),
        api.getDecayAnalytics(studentId),
        api.getRecommendations(studentId),
      ]);

      setMasteryOverview(mRes);
      setGraphData(gRes);
      setDecayData(dRes);
      setRecommendationsData(rRes);
    } catch (err) {
      console.error('Failed to fetch learning intelligence data:', err);
      setError('Backend service connection error. Please ensure the FastAPI server is running on port 8000.');
    } finally {
      setLoading(false);
    }
  }, [activeStudentId]);

  useEffect(() => {
    fetchStudentData(activeStudentId);
  }, [fetchStudentData, activeStudentId]);

  // Demo Storyboard Stage Changed
  const handleStageChanged = (newStage) => {
    setCurrentStage(newStage);
    fetchStudentData(activeStudentId);
  };

  // Switch Student Profile
  const handleSelectStudent = (studentId) => {
    setActiveStudentId(studentId);
    setLoading(true);
  };

  // Launch Quiz on a Concept
  const handleStartQuiz = (conceptId) => {
    setSelectedConceptForQuiz(conceptId);
    setActiveTab('quiz');
    setInspectedConcept(null);
  };

  // Quiz submission completed callback
  const handleQuizCompleted = () => {
    // Re-fetch all data to propagate updated mastery into graph & dashboard
    fetchStudentData(activeStudentId);
  };

  const topRec = recommendationsData?.recommendations?.[0] || null;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-slate-100 antialiased selection:bg-teal-500/20 selection:text-teal-300">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        activeStudentId={activeStudentId}
        onSelectStudent={handleSelectStudent}
      />

      {/* Interactive Demo Controller Bar */}
      <DemoController
        currentStage={currentStage}
        onStageChanged={handleStageChanged}
        activeStudentId={activeStudentId}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => fetchStudentData(activeStudentId)}
              className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-xs font-bold text-rose-200 transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[450px] space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center animate-spin">
              <Sparkles className="w-6 h-6 text-teal-400" />
            </div>
            <p className="font-mono text-xs text-slate-400 tracking-wider uppercase">
              Analyzing Knowledge Graph & Retention Trajectories...
            </p>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <DashboardPage
                masteryOverview={masteryOverview}
                graphData={graphData}
                topRecommendation={topRec}
                onSelectNode={setInspectedConcept}
                onStartQuiz={handleStartQuiz}
                onNavigateToTab={setActiveTab}
              />
            )}

            {activeTab === 'graph' && (
              <GraphPage
                graphData={graphData}
                onSelectNode={setInspectedConcept}
                selectedNodeId={inspectedConcept?.id}
              />
            )}

            {activeTab === 'decay' && (
              <DecayPage
                decayData={decayData}
                activeStudentId={activeStudentId}
                onRefresh={() => fetchStudentData(activeStudentId)}
              />
            )}

            {activeTab === 'revision' && (
              <RevisionPage
                recommendationsData={recommendationsData}
                onStartQuiz={handleStartQuiz}
              />
            )}

            {activeTab === 'quiz' && (
              <QuizPage
                conceptId={selectedConceptForQuiz}
                activeStudentId={activeStudentId}
                onQuizCompleted={handleQuizCompleted}
                conceptsList={masteryOverview?.concepts || []}
              />
            )}
          </>
        )}
      </main>

      {/* Node Detail Slide-Over Inspector */}
      <NodeDetailDrawer
        concept={inspectedConcept}
        onClose={() => setInspectedConcept(null)}
        onStartQuiz={handleStartQuiz}
      />

      {/* Footer & Responsible AI Notice */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950/80 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-bold text-slate-400">LearnGraph AI</span> — Personalised Student Learning Graph & Knowledge Decay Analyzer.
            <p className="text-[11px] text-slate-600 mt-1">
              "Don't just track what students studied. Track what they still know."
            </p>
          </div>

          <div className="max-w-md text-right text-[11px] text-slate-500">
            <strong className="text-slate-400">Responsible AI Notice:</strong> Mastery estimates and decay signals are formative indicators grounded in deterministic graph traversal, not fixed cognitive judgments.
          </div>
        </div>
      </footer>
    </div>
  );
}

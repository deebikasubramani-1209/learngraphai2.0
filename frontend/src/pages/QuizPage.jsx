import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Sparkles,
  ArrowRight,
  RotateCcw,
  AlertTriangle,
  HelpCircle,
} from 'lucide-react';
import { api } from '../services/api';
import MasteryBadge from '../components/MasteryBadge';

export default function QuizPage({
  conceptId = 'concept-recursion',
  activeStudentId,
  onQuizCompleted,
  conceptsList = [],
}) {
  const [selectedConceptId, setSelectedConceptId] = useState(conceptId);
  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    setSelectedConceptId(conceptId);
  }, [conceptId]);

  useEffect(() => {
    loadQuestions(selectedConceptId);
  }, [selectedConceptId]);

  const loadQuestions = async (cid) => {
    setLoading(true);
    setError(null);
    setResult(null);
    setUserAnswers({});
    try {
      const data = await api.getQuestionsByConcept(cid);
      setQuestions(data);
    } catch (err) {
      console.error('Failed to load questions:', err);
      setError('Unable to load quiz questions. Please verify backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId, optionKey) => {
    if (result) return; // Prevent change after submit
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: optionKey,
    }));
  };

  const handleSubmit = async () => {
    if (Object.keys(userAnswers).length === 0) {
      alert('Please answer at least one question before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      const payloadAnswers = Object.entries(userAnswers).map(([qid, ans]) => ({
        question_id: qid,
        selected_answer: ans,
      }));

      const res = await api.submitQuiz(activeStudentId, selectedConceptId, payloadAnswers);
      setResult(res);
      if (onQuizCompleted) {
        onQuizCompleted(res);
      }
    } catch (err) {
      console.error('Failed to submit quiz:', err);
      alert('Quiz submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const answeredCount = Object.keys(userAnswers).length;
  const totalCount = questions.length;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header with Concept Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-5 h-5 text-teal-400" />
            <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
              Diagnostic & Revision Assessment
            </h1>
          </div>
          <p className="text-sm text-slate-400">
            Real-time mastery updates calculate how revision directly repairs prerequisite foundation.
          </p>
        </div>

        {/* Concept Selector Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono">Topic:</span>
          <select
            value={selectedConceptId}
            onChange={(e) => setSelectedConceptId(e.target.value)}
            disabled={submitting}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 font-bold focus:outline-none focus:border-teal-500"
          >
            <option value="concept-functions">Functions</option>
            <option value="concept-arrays">Arrays</option>
            <option value="concept-recursion">Recursion (Primary Demo)</option>
            <option value="concept-trees">Trees</option>
            <option value="concept-graphs">Graphs</option>
          </select>
        </div>
      </div>

      {loading && (
        <div className="p-16 text-center text-slate-400 font-mono text-sm animate-pulse flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5 animate-spin text-teal-400" />
          <span>Generating targeted question set...</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
          {error}
        </div>
      )}

      {/* QUIZ RESULT PANEL (After Submission) */}
      {result && (
        <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/95 to-teal-950/40 border-2 border-teal-500/50 shadow-2xl backdrop-blur-xl animate-fade-in space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-teal-400 font-bold block mb-1">
                Assessment Outcome
              </span>
              <h2 className="text-2xl font-black text-slate-100">
                {result.concept_name} Revision Results
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <MasteryBadge stability={result.stability} score={result.new_mastery} />
            </div>
          </div>

          {/* Delta Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
              <span className="text-xs text-slate-400 block mb-1">Quiz Score</span>
              <span className="text-2xl font-black font-mono text-slate-100">
                {result.correct_count} / {result.total_questions} ({Math.round(result.score)}%)
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
              <span className="text-xs text-slate-400 block mb-1">Estimated Mastery Change</span>
              <div className="flex items-center justify-center gap-2 text-2xl font-black font-mono">
                <span className="text-slate-400">{Math.round(result.previous_mastery)}%</span>
                <span className="text-teal-400 font-bold">→</span>
                <span className="text-emerald-400">{Math.round(result.new_mastery)}%</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
              <span className="text-xs text-slate-400 block mb-1">Retention Delta</span>
              <span className={`text-2xl font-black font-mono ${result.mastery_delta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {result.mastery_delta >= 0 ? `+${result.mastery_delta}%` : `${result.mastery_delta}%`}
              </span>
            </div>
          </div>

          {/* Feedback & Prerequisite Warning */}
          <p className="text-sm text-slate-200 leading-relaxed bg-slate-950/40 p-4 rounded-xl border border-slate-800">
            {result.feedback_summary}
          </p>

          {result.prerequisite_alert && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs leading-relaxed flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{result.prerequisite_alert}</span>
            </div>
          )}

          {/* Retake Button */}
          <div className="flex justify-end pt-2">
            <button
              onClick={() => loadQuestions(selectedConceptId)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retake / Practice Another Set</span>
            </button>
          </div>
        </div>
      )}

      {/* QUESTIONS LIST */}
      {!loading && questions.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>
              {result ? 'Detailed Breakdown & Explanations' : `Progress: ${answeredCount} of ${totalCount} answered`}
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
              Interactive Diagnostic
            </span>
          </div>

          {questions.map((q, index) => {
            const selectedOpt = userAnswers[q.id];
            const feedbackItem = result?.questions_feedback?.find((f) => f.question_id === q.id);

            return (
              <div
                key={q.id}
                className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg backdrop-blur-xl space-y-4"
              >
                {/* Question Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-800 font-mono text-xs font-bold flex items-center justify-center text-teal-400">
                      {index + 1}
                    </span>
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800/80 text-slate-400">
                      {q.difficulty}
                    </span>
                  </div>

                  {feedbackItem && (
                    <div>
                      {feedbackItem.is_correct ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 text-xs font-bold">
                          <CheckCircle2 className="w-4 h-4" /> Correct
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-400 text-xs font-bold">
                          <XCircle className="w-4 h-4" /> Incorrect
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Question Text */}
                <h3 className="text-base font-semibold text-slate-100 leading-snug">
                  {q.question_text}
                </h3>

                {/* 4 Options */}
                <div className="grid grid-cols-1 gap-2.5 pt-2">
                  {[
                    { key: 'A', text: q.option_a },
                    { key: 'B', text: q.option_b },
                    { key: 'C', text: q.option_c },
                    { key: 'D', text: q.option_d },
                  ].map((opt) => {
                    const isSelected = selectedOpt === opt.key;
                    let optStyle = 'border-slate-800 bg-slate-950/50 text-slate-300 hover:border-slate-700';

                    if (result && feedbackItem) {
                      if (opt.key === feedbackItem.correct_answer) {
                        optStyle = 'border-emerald-500/80 bg-emerald-500/15 text-emerald-200 font-semibold';
                      } else if (isSelected && !feedbackItem.is_correct) {
                        optStyle = 'border-rose-500/80 bg-rose-500/15 text-rose-200 line-through';
                      } else {
                        optStyle = 'opacity-50 border-slate-900 bg-slate-950/20 text-slate-500';
                      }
                    } else if (isSelected) {
                      optStyle = 'border-teal-500 bg-teal-500/15 text-teal-200 font-semibold ring-1 ring-teal-500/50';
                    }

                    return (
                      <button
                        key={opt.key}
                        onClick={() => handleSelectOption(q.id, opt.key)}
                        disabled={!!result}
                        className={`flex items-start gap-3 p-3.5 rounded-xl border text-left text-xs transition-all duration-150 ${optStyle}`}
                      >
                        <span className="w-5 h-5 rounded-lg bg-slate-800/80 font-mono font-bold flex items-center justify-center text-[11px] shrink-0 text-slate-300">
                          {opt.key}
                        </span>
                        <span className="flex-1 leading-relaxed">{opt.text}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Explanation on Post-Submit */}
                {feedbackItem && feedbackItem.explanation && (
                  <div className="mt-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
                    <HelpCircle className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-200 block mb-0.5">Pedagogical Explanation:</strong>
                      {feedbackItem.explanation}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Submit Quiz CTA */}
          {!result && (
            <div className="pt-4 flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={submitting || answeredCount === 0}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 disabled:opacity-50 text-slate-950 font-bold text-sm shadow-xl shadow-teal-500/25 transition-all hover:scale-105 active:scale-95"
              >
                <span>{submitting ? 'Analyzing Responses...' : 'Submit Answers & Calculate Mastery'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

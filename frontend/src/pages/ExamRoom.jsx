// src/pages/ExamRoom.jsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../client/axios.js';
import ExamTimer from '../components/ExamTimer.jsx';
import QuestionNavigator from '../components/QuestionNavigator.jsx';
import {
  ChevronLeft, ChevronRight, Send, Flag, CheckCircle,
  AlertTriangle, X, Menu
} from 'lucide-react';

export default function ExamRoom() {
  const location = useLocation();
  const navigate = useNavigate();

  const { attempt, questions = [], timeLimit = 3600 } = location.state || {};

  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState([]);
  const [showSubmit, setShowSubmit] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const autosaveTimer = useRef(null);
  const pendingSave = useRef({});

  // Guard: redirect if no attempt data
  useEffect(() => {
    if (!attempt || !questions.length) {
      navigate('/exams', { replace: true });
    }
  }, []);

  // Autosave every 30 seconds
  useEffect(() => {
    autosaveTimer.current = setInterval(() => {
      if (Object.keys(pendingSave.current).length > 0) {
        doAutosave(pendingSave.current);
        pendingSave.current = {};
      }
    }, 30000);
    return () => clearInterval(autosaveTimer.current);
  }, []);

  const doAutosave = async (answersToSave) => {
    try {
      const payload = Object.entries(answersToSave).map(([qid, ans]) => ({
        question_id: qid,
        given_answer: ans,
        time_spent_sec: 0,
      }));
      if (payload.length > 0) {
        await api.post(`/attempts/${attempt.id}/autosave`, { answers: payload });
      }
    } catch (err) {
      console.warn('Autosave failed:', err);
    }
  };

  const handleAnswer = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    pendingSave.current[questionId] = value;
  };

  const toggleFlag = (questionId) => {
    setFlagged(prev =>
      prev.includes(questionId) ? prev.filter(id => id !== questionId) : [...prev, questionId]
    );
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // Final autosave of everything
      const finalAnswers = Object.entries(answers).map(([qid, ans]) => ({
        question_id: qid,
        given_answer: ans,
        time_spent_sec: 0,
      }));
      const { data } = await api.post(`/attempts/${attempt.id}/submit`, {
        answers: finalAnswers,
      });
      if (data.success) {
        navigate(`/results/${attempt.id}`, { state: { result: data.data } });
      }
    } catch (err) {
      console.error('Submit error:', err);
      alert(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
      setShowSubmit(false);
    }
  };

  const question = questions[current];
  const answeredCount = Object.values(answers).filter(a => a !== undefined && a !== '').length;

  if (!attempt || !questions.length) return null;

  const renderOptions = (q) => {
    if (q.type === 'mcq') {
      let opts = q.options;
      if (typeof opts === 'string') { try { opts = JSON.parse(opts); } catch { opts = []; } }
      return (
        <div className="space-y-3">
          {(opts || []).map((opt, idx) => {
            const val = typeof opt === 'object' ? opt.value || opt.text || String(idx) : String(opt);
            const label = typeof opt === 'object' ? opt.text || opt.label || val : String(opt);
            const selected = answers[q.id] === val;
            return (
              <label key={idx}
                className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-200
                  ${selected
                    ? 'bg-brand-500/20 border-brand-500/50 text-white'
                    : 'bg-white/5 border-white/10 text-surface-200 hover:bg-white/10 hover:border-white/20'
                  }`}>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors
                  ${selected ? 'border-brand-500 bg-brand-500' : 'border-surface-500'}`}>
                  {selected && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
                <input type="radio" name={`q-${q.id}`} value={val} checked={selected}
                  onChange={() => handleAnswer(q.id, val)} className="sr-only" />
                <span className="text-sm leading-relaxed">{label}</span>
              </label>
            );
          })}
        </div>
      );
    }

    if (q.type === 'true_false') {
      return (
        <div className="flex gap-4">
          {['True', 'False'].map(opt => {
            const selected = answers[q.id] === opt;
            return (
              <button key={opt} onClick={() => handleAnswer(q.id, opt)}
                className={`flex-1 py-4 rounded-xl border font-semibold transition-all duration-200
                  ${selected
                    ? 'bg-brand-500/20 border-brand-500/50 text-brand-300 shadow-glow'
                    : 'bg-white/5 border-white/10 text-surface-200 hover:bg-white/10'
                  }`}>
                {opt}
              </button>
            );
          })}
        </div>
      );
    }

    // short_answer
    return (
      <textarea
        rows={4}
        value={answers[q.id] || ''}
        onChange={e => handleAnswer(q.id, e.target.value)}
        placeholder="Type your answer here..."
        className="input-field resize-none text-sm leading-relaxed"
      />
    );
  };

  return (
    <div className="min-h-screen bg-surface-950 flex flex-col">
      {/* Top Bar */}
      <header className="glass-card rounded-none border-x-0 border-t-0 px-4 md:px-8 py-3 flex items-center justify-between gap-4 sticky top-0 z-30">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={() => setSidebarOpen(!sidebarOpen)}
            className="btn-ghost p-2 md:hidden">
            <Menu className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h1 className="text-white font-semibold text-sm md:text-base truncate">
              {attempt.examTitle || 'Examination'}
            </h1>
            <p className="text-surface-300 text-xs">
              Q {current + 1} of {questions.length} • {answeredCount} answered
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ExamTimer timeLimit={timeLimit} onExpire={handleSubmit} />
          <button onClick={() => setShowSubmit(true)}
            className="btn-primary flex items-center gap-2 text-sm py-2 px-4">
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Submit</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-20 bg-black/60 md:hidden"
            onClick={() => setSidebarOpen(false)} />
        )}

        {/* Question Navigator Sidebar */}
        <aside className={`
          fixed md:relative z-20 md:z-auto inset-y-0 left-0 w-72 
          bg-surface-950 md:bg-transparent border-r border-white/10 md:border-0
          p-4 overflow-y-auto transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          md:w-64 md:p-4 md:flex-shrink-0
        `}>
          <button onClick={() => setSidebarOpen(false)}
            className="md:hidden absolute top-3 right-3 btn-ghost p-1">
            <X className="w-4 h-4" />
          </button>
          <QuestionNavigator
            questions={questions}
            answers={answers}
            currentIndex={current}
            onNavigate={(i) => { setCurrent(i); setSidebarOpen(false); }}
            flagged={flagged}
          />
        </aside>

        {/* Main Question Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-3xl mx-auto">
            <div className="glass-card p-6 md:p-8 animate-fade-in" key={question.id}>
              {/* Question Header */}
              <div className="flex items-start justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-brand-500/20 text-brand-400 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {current + 1}
                  </span>
                  <div className="flex gap-2 flex-wrap">
                    <span className="badge bg-surface-700/50 text-surface-300 border border-surface-600 capitalize">
                      {question.type?.replace('_', ' ')}
                    </span>
                    <span className="badge bg-brand-500/15 text-brand-400 border border-brand-500/20">
                      {question.marks} mark{question.marks !== 1 ? 's' : ''}
                    </span>
                    {question.difficulty && (
                      <span className={`badge capitalize ${
                        question.difficulty === 'easy' ? 'bg-success-500/15 text-success-400 border border-success-500/20' :
                        question.difficulty === 'medium' ? 'bg-warning-500/15 text-warning-400 border border-warning-500/20' :
                        'bg-danger-500/15 text-danger-400 border border-danger-500/20'
                      }`}>
                        {question.difficulty}
                      </span>
                    )}
                  </div>
                </div>
                <button onClick={() => toggleFlag(question.id)}
                  className={`p-2 rounded-lg transition-all flex-shrink-0 ${
                    flagged.includes(question.id)
                      ? 'text-warning-400 bg-warning-500/15'
                      : 'text-surface-300 hover:text-warning-400 hover:bg-warning-500/10'
                  }`}>
                  <Flag className="w-5 h-5" fill={flagged.includes(question.id) ? 'currentColor' : 'none'} />
                </button>
              </div>

              {/* Question Body */}
              <p className="text-white text-base md:text-lg leading-relaxed mb-8 font-medium">
                {question.body}
              </p>

              {/* Answer Options */}
              {renderOptions(question)}

              {/* Navigation */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
                <button onClick={() => setCurrent(c => Math.max(0, c - 1))}
                  disabled={current === 0}
                  className="btn-secondary flex items-center gap-2 disabled:opacity-30">
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>

                {answers[question.id] && (
                  <span className="flex items-center gap-1.5 text-success-400 text-sm">
                    <CheckCircle className="w-4 h-4" /> Saved
                  </span>
                )}

                {current < questions.length - 1 ? (
                  <button onClick={() => setCurrent(c => c + 1)}
                    className="btn-primary flex items-center gap-2 text-sm">
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button onClick={() => setShowSubmit(true)}
                    className="btn-primary flex items-center gap-2 text-sm">
                    <Send className="w-4 h-4" /> Submit Exam
                  </button>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="glass-card p-8 max-w-md w-full animate-scale-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-warning-500/20 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-warning-400" />
              </div>
              <div>
                <h2 className="text-white font-bold text-lg">Submit Exam?</h2>
                <p className="text-surface-300 text-sm">This action cannot be undone</p>
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-4 mb-6 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-surface-300">Total questions</span>
                <span className="text-white font-medium">{questions.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-300">Answered</span>
                <span className="text-success-400 font-medium">{answeredCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-300">Unanswered</span>
                <span className={`font-medium ${questions.length - answeredCount > 0 ? 'text-warning-400' : 'text-surface-300'}`}>
                  {questions.length - answeredCount}
                </span>
              </div>
              {flagged.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-surface-300">Flagged</span>
                  <span className="text-warning-400 font-medium">{flagged.length}</span>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowSubmit(false)}
                className="btn-secondary flex-1" disabled={submitting}>
                Review More
              </button>
              <button onClick={handleSubmit}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
                disabled={submitting}>
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <><Send className="w-4 h-4" /> Confirm Submit</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// src/pages/Results.jsx
import { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import api from '../client/axios.js';
import ResultChart from '../components/ResultChart.jsx';
import {
  CheckCircle, XCircle, MinusCircle, Trophy, Target,
  Clock, BarChart3, ArrowLeft, ChevronDown, ChevronUp
} from 'lucide-react';

export default function Results() {
  const { attemptId } = useParams();
  const location = useLocation();
  const [result, setResult] = useState(location.state?.result || null);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedQ, setExpandedQ] = useState(null);

  useEffect(() => {
    fetchResults();
  }, [attemptId]);

  const fetchResults = async () => {
    try {
      const { data } = await api.get(`/results/${attemptId}`);
      if (data.success) setDetail(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="page-container flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-surface-300 text-lg">Result not found</p>
          <Link to="/dashboard" className="btn-primary mt-4 inline-flex">Go to Dashboard</Link>
        </div>
      </div>
    );
  }

  const { attempt, scorecard, statistics, questions } = detail;
  const pct = scorecard.percentage;
  const pieData = [
    { name: 'Correct', value: statistics.correct },
    { name: 'Incorrect', value: statistics.incorrect },
    { name: 'Unanswered', value: statistics.unanswered },
  ].filter(d => d.value > 0);

  const circumference = 2 * Math.PI * 54;
  const dashOffset = circumference - (pct / 100) * circumference;

  return (
    <div className="page-container py-8">
      {/* Back */}
      <Link to="/dashboard" className="inline-flex items-center gap-2 text-surface-300 hover:text-white transition-colors mb-6 text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      {/* Hero Scorecard */}
      <div className={`glass-card p-8 mb-6 relative overflow-hidden animate-scale-in ${
        scorecard.passed
          ? 'border-success-500/30'
          : 'border-danger-500/30'
      }`}>
        {/* Background glow */}
        <div className={`absolute -top-20 -right-20 w-64 h-64 rounded-full blur-[100px] opacity-20 ${
          scorecard.passed ? 'bg-success-500' : 'bg-danger-500'
        }`} />

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          {/* Circular Progress */}
          <div className="relative w-36 h-36 flex-shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
              <circle cx="60" cy="60" r="54" fill="none"
                stroke={scorecard.passed ? '#22c55e' : '#ef4444'}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-white">{pct}%</span>
              <span className={`text-xs font-semibold ${scorecard.passed ? 'text-success-400' : 'text-danger-400'}`}>
                {scorecard.passed ? 'PASSED' : 'FAILED'}
              </span>
            </div>
          </div>

          {/* Exam Info */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
              <Trophy className={`w-5 h-5 ${scorecard.passed ? 'text-warning-400' : 'text-surface-300'}`} />
              <span className={`font-bold text-lg ${scorecard.passed ? 'text-warning-400' : 'text-surface-300'}`}>
                {scorecard.passed ? 'Congratulations!' : 'Better Luck Next Time'}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">{attempt.examTitle}</h1>
            <p className="text-surface-300 text-sm mb-4">{attempt.subjectName} • {attempt.subjectCode}</p>

            <div className="flex flex-wrap gap-4 justify-center md:justify-start text-sm">
              <div className="text-center">
                <p className="text-white font-bold text-xl">{scorecard.totalScore}</p>
                <p className="text-surface-300 text-xs">Score</p>
              </div>
              <div className="w-px bg-white/10" />
              <div className="text-center">
                <p className="text-white font-bold text-xl">{scorecard.totalMarks}</p>
                <p className="text-surface-300 text-xs">Total Marks</p>
              </div>
              <div className="w-px bg-white/10" />
              <div className="text-center">
                <p className="text-white font-bold text-xl">{scorecard.passingMarks}</p>
                <p className="text-surface-300 text-xs">Passing Marks</p>
              </div>
              {parseFloat(scorecard.negativeMark) > 0 && (
                <>
                  <div className="w-px bg-white/10" />
                  <div className="text-center">
                    <p className="text-warning-400 font-bold text-xl">-{scorecard.negativeMark}</p>
                    <p className="text-surface-300 text-xs">Per Wrong</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { icon: CheckCircle, label: 'Correct', value: statistics.correct, color: 'text-success-400 bg-success-500/15' },
          { icon: XCircle, label: 'Incorrect', value: statistics.incorrect, color: 'text-danger-400 bg-danger-500/15' },
          { icon: MinusCircle, label: 'Unanswered', value: statistics.unanswered, color: 'text-surface-300 bg-white/5' },
          { icon: Target, label: 'Accuracy', value: `${statistics.accuracy}%`, color: 'text-brand-400 bg-brand-500/15' },
        ].map((s, i) => (
          <div key={i} className="glass-card p-5 animate-slide-up" style={{ animationDelay: `${i * 80}ms` }}>
            <div className={`w-9 h-9 rounded-lg ${s.color} flex items-center justify-center mb-3`}>
              <s.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-white">{s.value}</p>
            <p className="text-xs text-surface-300 font-medium mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Chart + Time */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="glass-card p-6 animate-fade-in">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-brand-400" />
            <h2 className="text-white font-semibold">Answer Breakdown</h2>
          </div>
          <ResultChart data={pieData} type="pie" />
        </div>
        <div className="glass-card p-6 animate-fade-in flex flex-col justify-center gap-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-brand-400" />
            <h2 className="text-white font-semibold">Time Analysis</h2>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between py-3 border-b border-white/10">
              <span className="text-surface-300 text-sm">Total Time Spent</span>
              <span className="text-white font-semibold">{formatTime(statistics.totalTimeSpent)}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-white/10">
              <span className="text-surface-300 text-sm">Avg per Question</span>
              <span className="text-white font-semibold">
                {statistics.totalQuestions > 0 ? formatTime(Math.round(statistics.totalTimeSpent / statistics.totalQuestions)) : '0s'}
              </span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-surface-300 text-sm">Questions Attempted</span>
              <span className="text-white font-semibold">{statistics.answered} / {statistics.totalQuestions}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Question-by-Question Review */}
      <div className="glass-card p-6 animate-fade-in">
        <h2 className="text-white font-semibold text-lg mb-4">Detailed Review</h2>
        <div className="space-y-3">
          {questions.map((q, idx) => {
            const isOpen = expandedQ === idx;
            return (
              <div key={idx}
                className={`rounded-xl border transition-all duration-200 ${
                  q.isCorrect === true ? 'border-success-500/30 bg-success-500/5' :
                  q.isCorrect === false ? 'border-danger-500/30 bg-danger-500/5' :
                  'border-white/10 bg-white/5'
                }`}>
                <button
                  onClick={() => setExpandedQ(isOpen ? null : idx)}
                  className="w-full flex items-center gap-3 p-4 text-left">
                  <div className="flex-shrink-0">
                    {q.isCorrect === true
                      ? <CheckCircle className="w-5 h-5 text-success-400" />
                      : q.isCorrect === false
                        ? <XCircle className="w-5 h-5 text-danger-400" />
                        : <MinusCircle className="w-5 h-5 text-surface-400" />
                    }
                  </div>
                  <span className="text-xs text-surface-400 font-semibold w-8">Q{idx + 1}</span>
                  <p className="flex-1 text-sm text-white font-medium line-clamp-1">{q.body}</p>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`text-sm font-bold ${
                      q.marksObtained > 0 ? 'text-success-400' :
                      q.marksObtained < 0 ? 'text-danger-400' : 'text-surface-400'
                    }`}>
                      {q.marksObtained > 0 ? '+' : ''}{q.marksObtained}
                    </span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-surface-300" /> : <ChevronDown className="w-4 h-4 text-surface-300" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 pt-0 space-y-3 border-t border-white/10 mt-0 animate-slide-down">
                    <p className="text-sm text-surface-200 leading-relaxed pt-3">{q.body}</p>
                    <div className="grid sm:grid-cols-2 gap-3 text-sm">
                      <div className="rounded-lg p-3 bg-white/5">
                        <p className="text-surface-400 text-xs mb-1">Your Answer</p>
                        <p className={`font-medium ${
                          q.isCorrect === true ? 'text-success-400' :
                          q.isCorrect === false ? 'text-danger-400' : 'text-surface-300'
                        }`}>
                          {q.givenAnswer || <span className="italic text-surface-400">Not answered</span>}
                        </p>
                      </div>
                      {q.type !== 'short_answer' && (
                        <div className="rounded-lg p-3 bg-success-500/10">
                          <p className="text-surface-400 text-xs mb-1">Correct Answer</p>
                          <p className="text-success-400 font-medium">{q.correctAnswer}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        <Link to="/exams" className="btn-secondary flex-1 text-center">Take Another Exam</Link>
        <Link to="/dashboard" className="btn-primary flex-1 text-center">Back to Dashboard</Link>
      </div>
    </div>
  );
}

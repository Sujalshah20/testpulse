// src/pages/ExamList.jsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../client/axios.js';
import {
  BookOpen, Clock, Award, Calendar, ChevronLeft,
  Play, CheckCircle, AlertCircle, Search, Filter
} from 'lucide-react';

export default function ExamList() {
  const { user, isStudent } = useAuth();
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [starting, setStarting] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const { data } = await api.get('/exams');
      setExams(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const startExam = async (examId) => {
    setStarting(examId);
    setError('');
    try {
      const { data } = await api.post(`/exams/${examId}/attempt`);
      if (data.success) {
        navigate(`/exam-room/${data.data.attempt.id}`, {
          state: {
            attempt: data.data.attempt,
            questions: data.data.questions,
            timeLimit: data.data.timeLimit
          }
        });
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to start exam';
      setError(msg);
    } finally {
      setStarting(null);
    }
  };

  const getStatusInfo = (exam) => {
    const now = new Date();
    const start = new Date(exam.start_time);
    const end = new Date(exam.end_time);

    if (exam.status === 'draft') return { label: 'Draft', class: 'badge-draft', canStart: false };
    if (exam.status === 'completed') return { label: 'Completed', class: 'badge-completed', canStart: false };
    if (now < start) {
      const diff = start - now;
      const hours = Math.floor(diff / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      return {
        label: `Starts in ${hours > 0 ? hours + 'h ' : ''}${mins}m`,
        class: 'badge bg-blue-500/20 text-blue-400 border border-blue-500/30',
        canStart: false
      };
    }
    if (now > end) return { label: 'Window Closed', class: 'badge-completed', canStart: false };
    return { label: 'Live Now', class: 'badge-live', canStart: true };
  };

  const filteredExams = exams
    .filter(e => filter === 'all' || e.status === filter)
    .filter(e => (e.title || '').toLowerCase().includes(search.toLowerCase()) ||
                 (e.subjects?.name || '').toLowerCase().includes(search.toLowerCase()));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <Link to="/dashboard" className="btn-ghost p-2">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h1 className="page-title">Examinations</h1>
      </div>
      <p className="page-subtitle mb-6 ml-12">Browse and start available exams</p>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-danger-500/10 border border-danger-500/20 text-danger-400 text-sm flex items-center gap-2 animate-slide-down">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-300" />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search exams..." className="input-field pl-10"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'live', 'completed'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all capitalize ${
                filter === f
                  ? 'gradient-bg text-white shadow-glow'
                  : 'bg-white/5 text-surface-300 hover:bg-white/10 border border-white/10'
              }`}>
              {f === 'all' ? 'All' : f}
            </button>
          ))}
        </div>
      </div>

      {/* Exam Cards Grid */}
      {filteredExams.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <BookOpen className="w-12 h-12 text-surface-300 mx-auto mb-3" />
          <p className="text-surface-300">No exams found</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredExams.map((exam, i) => {
            const status = getStatusInfo(exam);
            return (
              <div key={exam.id}
                className="glass-card-hover p-6 flex flex-col animate-slide-up"
                style={{ animationDelay: `${i * 60}ms` }}>
                {/* Top */}
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-500/15 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-brand-400" />
                  </div>
                  <span className={status.class}>{status.label}</span>
                </div>

                {/* Content */}
                <h3 className="text-white font-semibold text-lg mb-1">{exam.title}</h3>
                <p className="text-surface-300 text-sm mb-4">{exam.subjects?.name}</p>

                {/* Meta */}
                <div className="grid grid-cols-2 gap-3 mb-5 text-xs">
                  <div className="flex items-center gap-2 text-surface-300">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{exam.duration_mins} minutes</span>
                  </div>
                  <div className="flex items-center gap-2 text-surface-300">
                    <Award className="w-3.5 h-3.5" />
                    <span>{exam.total_marks} marks</span>
                  </div>
                  <div className="flex items-center gap-2 text-surface-300">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Pass: {exam.passing_marks}</span>
                  </div>
                  <div className="flex items-center gap-2 text-surface-300">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(exam.start_time).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Negative marks info */}
                {parseFloat(exam.negative_marks) > 0 && (
                  <p className="text-xs text-warning-400 mb-4 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Negative marking: -{exam.negative_marks} per wrong answer
                  </p>
                )}

                {/* Action */}
                <div className="mt-auto">
                  {isStudent && status.canStart ? (
                    <button
                      onClick={() => startExam(exam.id)}
                      disabled={starting === exam.id}
                      className="btn-primary w-full flex items-center justify-center gap-2 text-sm">
                      {starting === exam.id ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <><Play className="w-4 h-4" /> Start Exam</>
                      )}
                    </button>
                  ) : status.canStart ? (
                    <div className="text-center text-xs text-surface-300 py-2">Admin view only</div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

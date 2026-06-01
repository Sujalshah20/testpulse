// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../client/axios.js';
import ResultChart from '../components/ResultChart.jsx';
import {
  BookOpen, ClipboardCheck, TrendingUp, Award, LogOut, Users,
  FileQuestion, Calendar, ChevronRight, BarChart3, Target
} from 'lucide-react';

export default function Dashboard() {
  const { user, logout, isStudent, isPrivileged } = useAuth();
  const [performance, setPerformance] = useState(null);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [examsRes] = await Promise.all([
        api.get('/exams')
      ]);
      setExams(examsRes.data.data || []);

      if (isStudent && user?.id) {
        try {
          const perfRes = await api.get(`/results/performance/${user.id}`);
          setPerformance(perfRes.data.data);
        } catch (e) {
          // No performance data yet
        }
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const liveExams = exams.filter(e => e.status === 'live');
  const draftExams = exams.filter(e => e.status === 'draft');
  const completedExams = exams.filter(e => e.status === 'completed');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
          <p className="text-surface-300 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const studentStats = [
    {
      icon: ClipboardCheck, label: 'Exams Taken',
      value: performance?.totalExams || 0,
      color: 'text-brand-400 bg-brand-500/15'
    },
    {
      icon: Award, label: 'Passed',
      value: performance?.passed || 0,
      color: 'text-success-400 bg-success-500/15'
    },
    {
      icon: Target, label: 'Pass Rate',
      value: `${performance?.passingRate || 0}%`,
      color: 'text-warning-400 bg-warning-500/15'
    },
    {
      icon: TrendingUp, label: 'Avg Score',
      value: `${performance?.averageScore || 0}%`,
      color: 'text-purple-400 bg-purple-500/15'
    },
  ];

  const adminStats = [
    {
      icon: Calendar, label: 'Live Exams',
      value: liveExams.length,
      color: 'text-success-400 bg-success-500/15'
    },
    {
      icon: FileQuestion, label: 'Draft Exams',
      value: draftExams.length,
      color: 'text-warning-400 bg-warning-500/15'
    },
    {
      icon: ClipboardCheck, label: 'Completed',
      value: completedExams.length,
      color: 'text-brand-400 bg-brand-500/15'
    },
    {
      icon: BookOpen, label: 'Total Exams',
      value: exams.length,
      color: 'text-purple-400 bg-purple-500/15'
    },
  ];

  const stats = isStudent ? studentStats : adminStats;

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="page-title">
            {isStudent ? 'Student Dashboard' : 'Admin Dashboard'}
          </h1>
          <p className="page-subtitle">
            Welcome back, <span className="text-brand-400 font-semibold">{user?.name}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="badge bg-brand-500/20 text-brand-300 border border-brand-500/30 capitalize">
            {user?.role}
          </span>
          <button onClick={logout} className="btn-ghost flex items-center gap-2 text-danger-400 hover:text-danger-400 hover:bg-danger-500/10">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="glass-card p-5 animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
            <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="stat-value">{stat.value}</p>
            <p className="stat-label">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Performance Chart (Students) */}
          {isStudent && performance?.subjectWise?.length > 0 && (
            <div className="glass-card p-6 animate-fade-in">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-brand-400" />
                <h2 className="text-lg font-semibold text-white">Subject Performance</h2>
              </div>
              <ResultChart data={performance.subjectWise.map(s => ({
                name: s.code,
                averagePercentage: s.averagePercentage
              }))} type="bar" />
            </div>
          )}

          {/* Live Exams */}
          <div className="glass-card p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-success-500 animate-pulse" />
                <h2 className="text-lg font-semibold text-white">Live Exams</h2>
              </div>
              <Link to="/exams" className="text-sm text-brand-400 hover:text-brand-300 transition-colors flex items-center gap-1">
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {liveExams.length === 0 ? (
              <p className="text-surface-300 text-sm py-4">No live exams at the moment.</p>
            ) : (
              <div className="space-y-3">
                {liveExams.slice(0, 5).map((exam) => (
                  <Link key={exam.id} to="/exams"
                    className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/15 transition-all duration-200">
                    <div>
                      <h3 className="text-white font-medium">{exam.title}</h3>
                      <p className="text-surface-300 text-xs mt-0.5">
                        {exam.subjects?.name} • {exam.duration_mins} mins • {exam.total_marks} marks
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="badge-live">Live</span>
                      <ChevronRight className="w-4 h-4 text-surface-300" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="glass-card p-6 animate-slide-up animate-delay-200">
            <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <Link to="/exams" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all group">
                <div className="w-9 h-9 rounded-lg bg-brand-500/15 flex items-center justify-center group-hover:bg-brand-500/25 transition-colors">
                  <BookOpen className="w-4 h-4 text-brand-400" />
                </div>
                <span className="text-sm text-surface-200 group-hover:text-white transition-colors">Browse Exams</span>
              </Link>

              {isPrivileged && (
                <>
                  <Link to="/admin/exams" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all group">
                    <div className="w-9 h-9 rounded-lg bg-warning-500/15 flex items-center justify-center group-hover:bg-warning-500/25 transition-colors">
                      <Calendar className="w-4 h-4 text-warning-400" />
                    </div>
                    <span className="text-sm text-surface-200 group-hover:text-white transition-colors">Manage Exams</span>
                  </Link>
                  <Link to="/admin/questions" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all group">
                    <div className="w-9 h-9 rounded-lg bg-purple-500/15 flex items-center justify-center group-hover:bg-purple-500/25 transition-colors">
                      <FileQuestion className="w-4 h-4 text-purple-400" />
                    </div>
                    <span className="text-sm text-surface-200 group-hover:text-white transition-colors">Question Bank</span>
                  </Link>
                </>
              )}
              {user?.role === 'admin' && (
                <Link to="/admin/users" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all group">
                  <div className="w-9 h-9 rounded-lg bg-danger-500/15 flex items-center justify-center group-hover:bg-danger-500/25 transition-colors">
                    <Users className="w-4 h-4 text-danger-400" />
                  </div>
                  <span className="text-sm text-surface-200 group-hover:text-white transition-colors">Manage Users</span>
                </Link>
              )}
            </div>
          </div>

          {/* Recent Results (Students) */}
          {isStudent && performance?.recentAttempts?.length > 0 && (
            <div className="glass-card p-6 animate-slide-up animate-delay-300">
              <h2 className="text-lg font-semibold text-white mb-4">Recent Results</h2>
              <div className="space-y-3">
                {performance.recentAttempts.slice(0, 5).map((attempt) => (
                  <Link key={attempt.id} to={`/results/${attempt.id}`}
                    className="block p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-white font-medium truncate">{attempt.examTitle}</p>
                      <span className={attempt.passed ? 'badge-pass' : 'badge-fail'}>
                        {attempt.passed ? 'Pass' : 'Fail'}
                      </span>
                    </div>
                    <p className="text-xs text-surface-300 mt-1">
                      {attempt.score}/{attempt.totalMarks} marks
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

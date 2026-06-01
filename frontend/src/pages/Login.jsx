// src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { LogIn, UserPlus, Eye, EyeOff, BookOpen, Shield, Zap } from 'lucide-react';
import SEO from '../components/SEO.jsx';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isLogin) {
        const result = await login(form.email, form.password);
        if (result.success) {
          navigate('/dashboard');
        } else {
          setError(result.message || 'Login failed');
        }
      } else {
        if (!form.name.trim()) {
          setError('Name is required');
          setLoading(false);
          return;
        }
        const result = await register(form.name, form.email, form.password, form.role);
        if (result.success) {
          setSuccess('Registration successful! Please log in.');
          setIsLogin(true);
          setForm({ ...form, name: '', password: '' });
        } else {
          setError(result.message || 'Registration failed');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: BookOpen, title: 'Smart Exams', desc: 'AI-randomized question pools' },
    { icon: Shield, title: 'Secure', desc: 'Anti-cheat & duplicate guards' },
    { icon: Zap, title: 'Real-time', desc: 'Auto-save & instant scoring' },
  ];

  return (
    <>
      <SEO 
        title="Sign In or Create Account"
        description="Log in to TestPulse or create a new account to start building and taking secure online exams."
        url="/login"
      />
      <div className="min-h-screen flex relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-surface-950" />
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-brand-500/10 rounded-full blur-[150px] -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[150px] translate-x-1/3 translate-y-1/3" />

        {/* Left Panel — Branding */}
        <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12">
          <div className="relative z-10 max-w-md">
            <div className="flex items-center gap-2 mb-8">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/20">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold gradient-text">TestPulse</span>
            </div>
            <h1 className="text-5xl font-bold text-white mb-4 leading-tight">
              Online Examination
              <span className="block gradient-text">Processing Platform</span>
            </h1>
            <p className="text-surface-300 text-lg mb-10 leading-relaxed">
              A next-generation platform for creating, managing, and taking examinations 
              with real-time analytics and enterprise-grade security.
            </p>

            <div className="space-y-4">
              {features.map((f, i) => (
                <div key={i} className="flex items-center gap-4 glass-card p-4 animate-slide-up"
                     style={{ animationDelay: `${i * 150}ms` }}>
                  <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center flex-shrink-0">
                    <f.icon className="w-5 h-5 text-brand-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-sm">{f.title}</h3>
                    <p className="text-surface-300 text-xs">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel — Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative z-10">
          <div className="w-full max-w-md">
            {/* Mobile logo */}
            <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
              <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center shadow-glow">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">TestPulse</span>
            </div>

            <div className="glass-card p-8 animate-scale-in">
              <h2 className="text-2xl font-bold text-white mb-1">
                {isLogin ? 'Welcome back' : 'Create account'}
              </h2>
              <p className="text-surface-300 text-sm mb-6">
                {isLogin ? 'Sign in to access your dashboard' : 'Register to get started'}
              </p>

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-danger-500/10 border border-danger-500/20 text-danger-400 text-sm animate-slide-down">
                  {error}
                </div>
              )}
              {success && (
                <div className="mb-4 p-3 rounded-xl bg-success-500/10 border border-success-500/20 text-success-400 text-sm animate-slide-down">
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div className="animate-slide-down">
                    <label className="input-label">Full Name</label>
                    <input
                      type="text" name="name" value={form.name}
                      onChange={handleChange} placeholder="John Doe"
                      className="input-field" required={!isLogin}
                    />
                  </div>
                )}

                <div>
                  <label className="input-label">Email Address</label>
                  <input
                    type="email" name="email" value={form.email}
                    onChange={handleChange} placeholder="you@example.com"
                    className="input-field" required
                  />
                </div>

                <div>
                  <label className="input-label">Password</label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'} name="password" value={form.password}
                      onChange={handleChange} placeholder="••••••••"
                      className="input-field pr-12" required minLength={6}
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-300 hover:text-white transition-colors">
                      {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {!isLogin && (
                  <div className="animate-slide-down">
                    <label className="input-label">Role</label>
                    <select name="role" value={form.role} onChange={handleChange} className="input-field">
                      <option value="student">Student</option>
                      <option value="examiner">Examiner</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                )}

                <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : isLogin ? (
                    <><LogIn className="w-4 h-4" /> Sign In</>
                  ) : (
                    <><UserPlus className="w-4 h-4" /> Create Account</>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <button onClick={() => { setIsLogin(!isLogin); setError(''); setSuccess(''); }}
                  className="text-sm text-surface-300 hover:text-brand-400 transition-colors">
                  {isLogin ? "Don't have an account? " : 'Already have an account? '}
                  <span className="font-semibold text-brand-400">{isLogin ? 'Sign up' : 'Sign in'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

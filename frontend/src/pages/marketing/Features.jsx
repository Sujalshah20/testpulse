import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../../components/SEO.jsx';
import { BookOpen, Shield, BarChart3, Clock, Users, Zap, CheckCircle2 } from 'lucide-react';

export default function Features() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Features - TestPulse Exam Management System",
    "description": "Explore the powerful features of TestPulse, the best online assessment tool for educators and businesses."
  };

  const features = [
    { icon: Shield, title: "Advanced Anti-Cheat", desc: "Our secure lockdown browser prevents tab switching, copy-pasting, and multi-screen setups." },
    { icon: BarChart3, title: "Real-time Analytics", desc: "Track student performance instantly. View detailed question-level metrics and average scores." },
    { icon: Zap, title: "Instant Auto-Grading", desc: "No more manual checking. MCQ tests and true/false questions are graded the moment the student hits submit." },
    { icon: Clock, title: "Timed Assessments", desc: "Set strict time limits on exams. The exam auto-submits when the timer reaches zero." },
    { icon: Users, title: "Role-Based Access", desc: "Separate dashboards for Students, Examiners, and Admins. Complete control over your institution." },
    { icon: BookOpen, title: "Question Banks", desc: "Create pools of questions and randomize them for every student to ensure unique tests." }
  ];

  return (
    <>
      <SEO 
        title="Features | Exam Management System"
        description="Discover why TestPulse is the ultimate online assessment tool. Features include AI anti-cheat, auto-grading, and rich analytics."
        keywords="exam management system, online assessment tool, secure exam software"
        url="/features"
        schema={schema}
      />
      
      <div className="min-h-screen bg-surface-950 text-white selection:bg-brand-500/30">
        {/* Navigation */}
        <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-surface-950/80 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">TestPulse</span>
            </Link>
            <div className="hidden md:flex items-center gap-8 text-sm font-medium">
              <Link to="/features" className="text-white">Features</Link>
              <Link to="/how-it-works" className="text-surface-300 hover:text-white transition-colors">How it Works</Link>
              <Link to="/pricing" className="text-surface-300 hover:text-white transition-colors">Pricing</Link>
              <Link to="/blog" className="text-surface-300 hover:text-white transition-colors">Blog</Link>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-sm font-medium hover:text-brand-400 transition-colors">Sign In</Link>
            </div>
          </div>
        </nav>

        <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Everything you need to run <br/><span className="text-brand-400">secure exams</span></h1>
            <p className="text-lg text-surface-300 max-w-2xl mx-auto">
              TestPulse provides a comprehensive suite of tools designed specifically for modern educators and certification bodies.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <div key={i} className="glass-card p-8 hover:border-brand-500/30 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-surface-800 flex items-center justify-center mb-6">
                  <f.icon className="w-6 h-6 text-brand-400" />
                </div>
                <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                <p className="text-surface-300 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-32 p-12 glass-card text-center rounded-3xl bg-gradient-to-b from-brand-900/20 to-transparent border-brand-500/20">
            <h2 className="text-3xl font-bold mb-6">Ready to transform your assessments?</h2>
            <p className="text-surface-300 mb-8 max-w-xl mx-auto">Join thousands of educators who have switched to TestPulse for a seamless, secure testing experience.</p>
            <Link to="/login" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold shadow-lg shadow-brand-500/25 transition-all">
              Start Creating Exams
            </Link>
          </div>
        </main>
      </div>
    </>
  );
}

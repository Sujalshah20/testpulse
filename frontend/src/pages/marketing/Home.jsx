import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../../components/SEO.jsx';
import { BookOpen, CheckCircle, Target, Shield, Zap } from 'lucide-react';

export default function Home() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "TestPulse",
    "applicationCategory": "EducationalApplication",
    "operatingSystem": "Any",
    "description": "An advanced online examination platform built with the MERN stack for creating and managing secure exams.",
    "url": "https://testpulse.vercel.app",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  };

  return (
    <>
      <SEO 
        title="Best Online Examination Platform for Students"
        description="Create an online exam easily with TestPulse. The premier MERN exam platform featuring AI proctoring, auto-grading, and secure lockdown."
        keywords="online exam platform, create online exam, MERN exam platform, free exam software"
        url="/"
        schema={schema}
      />
      
      <div className="min-h-screen bg-surface-950 text-white selection:bg-brand-500/30">
        {/* Navigation */}
        <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-surface-950/80 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">TestPulse</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm font-medium">
              <Link to="/features" className="text-surface-300 hover:text-white transition-colors">Features</Link>
              <Link to="/how-it-works" className="text-surface-300 hover:text-white transition-colors">How it Works</Link>
              <Link to="/pricing" className="text-surface-300 hover:text-white transition-colors">Pricing</Link>
              <Link to="/blog" className="text-surface-300 hover:text-white transition-colors">Blog</Link>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-sm font-medium hover:text-brand-400 transition-colors">Sign In</Link>
              <Link to="/login" className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium transition-all">Get Started</Link>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <main className="pt-32 pb-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm font-medium mb-8">
              <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
              The #1 MERN Exam Platform
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
              Create and manage <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-purple-500">
                secure online exams
              </span>
            </h1>
            <p className="text-lg md:text-xl text-surface-300 mb-10 max-w-2xl mx-auto leading-relaxed">
              TestPulse is the most advanced online assessment tool. Auto-grading, secure lockdown, and real-time analytics in one powerful platform.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/login" className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold shadow-lg shadow-brand-500/25 transition-all text-lg">
                Create Free Account
              </Link>
              <Link to="/features" className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-surface-800 hover:bg-surface-700 text-white font-semibold border border-surface-700 transition-all text-lg">
                View Features
              </Link>
            </div>
          </div>
        </main>

        {/* Feature Highlights */}
        <section className="py-20 bg-surface-900 border-y border-white/5">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-16">Why choose TestPulse for your assessments?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: Zap, title: "Lightning Fast MERN Stack", desc: "Built on MongoDB, Express, React, and Node for unmatched speed and reliability." },
                { icon: Target, title: "Auto-Grading System", desc: "Instantly score MCQ tests online. Save hours of manual grading time." },
                { icon: Shield, title: "Secure Browser Lockdown", desc: "Prevent tab switching and copy-pasting to maintain academic integrity." }
              ].map((f, i) => (
                <div key={i} className="p-6 rounded-2xl bg-surface-800 border border-white/5 hover:border-brand-500/50 transition-colors group">
                  <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <f.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{f.title}</h3>
                  <p className="text-surface-300 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer placeholder */}
        <footer className="py-10 text-center text-surface-400 text-sm border-t border-white/5 mt-20">
          <p>© 2026 TestPulse. All rights reserved. Built for educators worldwide.</p>
        </footer>
      </div>
    </>
  );
}

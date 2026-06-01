import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../../components/SEO.jsx';
import { BookOpen, Check } from 'lucide-react';

export default function Pricing() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "TestPulse Free Tier",
    "description": "Free MERN stack exam platform for educators.",
    "offers": {
      "@type": "Offer",
      "price": "0.00",
      "priceCurrency": "USD"
    }
  };

  return (
    <>
      <SEO 
        title="Pricing | Free Exam Software"
        description="TestPulse is a free MERN stack exam platform. Create MCQ exams online for free with no hidden costs."
        keywords="free exam software, free MERN stack exam platform"
        url="/pricing"
        schema={schema}
      />
      
      <div className="min-h-screen bg-surface-950 text-white selection:bg-brand-500/30">
        <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-surface-950/80 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">TestPulse</span>
            </Link>
            <div className="hidden md:flex items-center gap-8 text-sm font-medium">
              <Link to="/features" className="text-surface-300 hover:text-white transition-colors">Features</Link>
              <Link to="/how-it-works" className="text-surface-300 hover:text-white transition-colors">How it Works</Link>
              <Link to="/pricing" className="text-white">Pricing</Link>
              <Link to="/blog" className="text-surface-300 hover:text-white transition-colors">Blog</Link>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-sm font-medium hover:text-brand-400 transition-colors">Sign In</Link>
            </div>
          </div>
        </nav>

        <main className="pt-32 pb-20 px-6 max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Completely <span className="text-brand-400">Free</span> Exam Software</h1>
          <p className="text-surface-300 mb-16 text-lg max-w-2xl mx-auto">Because education shouldn't have a paywall. TestPulse is an open platform designed for learning.</p>

          <div className="max-w-lg mx-auto glass-card p-10 rounded-3xl border-brand-500/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 px-4 py-1 bg-brand-500 text-white text-xs font-bold rounded-bl-xl">POPULAR</div>
            <h3 className="text-2xl font-bold mb-2">Community Edition</h3>
            <div className="text-5xl font-black mb-8">$0 <span className="text-lg text-surface-400 font-normal">/forever</span></div>
            
            <ul className="space-y-4 mb-10 text-left">
              {['Unlimited Exams', 'Unlimited Students', 'Auto-grading', 'Anti-cheat Browser', 'Real-time Analytics', 'Email Support'].map((feature, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-brand-500/20 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3.5 h-3.5 text-brand-400" />
                  </div>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            
            <Link to="/login" className="block w-full py-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold transition-all">
              Create Free Account
            </Link>
          </div>
        </main>
      </div>
    </>
  );
}

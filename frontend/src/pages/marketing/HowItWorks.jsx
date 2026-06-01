import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../../components/SEO.jsx';
import { BookOpen } from 'lucide-react';

export default function HowItWorks() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How do I create an online exam?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Simply log in as an Examiner, navigate to 'Manage Exams', click 'New Exam', and enter your exam details like title, duration, and subject. Then add questions to the exam."
        }
      },
      {
        "@type": "Question",
        "name": "Is there a free MCQ exam maker?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, TestPulse allows you to create MCQ exams online for free with auto-grading and secure lockdown features built right in."
        }
      }
    ]
  };

  const steps = [
    { num: "01", title: "Create an Account", desc: "Register as an Examiner on the platform in seconds." },
    { num: "02", title: "Build Your Question Bank", desc: "Add multiple-choice, true/false, or short-answer questions to your secure database." },
    { num: "03", title: "Configure the Exam", desc: "Set the duration, passing marks, negative marking, and randomization settings." },
    { num: "04", title: "Publish & Invite", desc: "Hit publish and your students will instantly see the exam on their dashboard." }
  ];

  return (
    <>
      <SEO 
        title="How to Create an Online Exam | TestPulse"
        description="Learn how to create an online MCQ exam for free. A simple step-by-step guide to using the TestPulse exam platform."
        keywords="create online exam, create MCQ exam online free, how to make an online test"
        url="/how-it-works"
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
              <Link to="/how-it-works" className="text-white">How it Works</Link>
              <Link to="/pricing" className="text-surface-300 hover:text-white transition-colors">Pricing</Link>
              <Link to="/blog" className="text-surface-300 hover:text-white transition-colors">Blog</Link>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-sm font-medium hover:text-brand-400 transition-colors">Sign In</Link>
            </div>
          </div>
        </nav>

        <main className="pt-32 pb-20 px-6 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-6">How to create an online exam</h1>
          <p className="text-center text-surface-300 mb-16 text-lg">Four simple steps to launch your first secure assessment.</p>

          <div className="space-y-8">
            {steps.map((step, i) => (
              <div key={i} className="flex gap-6 glass-card p-8 rounded-3xl">
                <div className="text-5xl font-black text-brand-500/20">{step.num}</div>
                <div className="pt-2">
                  <h3 className="text-2xl font-bold mb-2">{step.title}</h3>
                  <p className="text-surface-300 text-lg">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </>
  );
}

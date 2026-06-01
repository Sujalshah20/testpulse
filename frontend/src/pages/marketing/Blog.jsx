import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../../components/SEO.jsx';
import { BookOpen } from 'lucide-react';

export const BLOG_POSTS = [
  {
    slug: 'how-to-prevent-cheating-online-exams',
    title: 'How to Prevent Cheating in Online Exams',
    excerpt: 'Discover the top strategies for maintaining academic integrity during online assessments.',
    date: 'Oct 15, 2026',
    author: 'TestPulse Team'
  },
  {
    slug: 'benefits-of-mern-stack-exam-platform',
    title: 'Benefits of using a MERN Stack Exam Platform',
    excerpt: 'Why MongoDB, Express, React, and Node are the perfect combination for real-time exam software.',
    date: 'Oct 22, 2026',
    author: 'TestPulse Team'
  }
];

export default function Blog() {
  return (
    <>
      <SEO 
        title="Blog | TestPulse Educational Resources"
        description="Read our latest articles on online exam with auto grading, cheating prevention, and educational technology."
        url="/blog"
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
              <Link to="/pricing" className="text-surface-300 hover:text-white transition-colors">Pricing</Link>
              <Link to="/blog" className="text-white">Blog</Link>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-sm font-medium hover:text-brand-400 transition-colors">Sign In</Link>
            </div>
          </div>
        </nav>

        <main className="pt-32 pb-20 px-6 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-12">Latest Articles</h1>
          <div className="grid gap-6">
            {BLOG_POSTS.map((post, i) => (
              <Link key={i} to={`/blog/${post.slug}`} className="glass-card p-8 rounded-2xl hover:border-brand-500/30 transition-all block group">
                <h2 className="text-2xl font-bold mb-3 group-hover:text-brand-400 transition-colors">{post.title}</h2>
                <p className="text-surface-300 mb-4">{post.excerpt}</p>
                <div className="text-sm text-surface-400 flex items-center gap-4">
                  <span>{post.date}</span>
                  <span>•</span>
                  <span>{post.author}</span>
                </div>
              </Link>
            ))}
          </div>
        </main>
      </div>
    </>
  );
}

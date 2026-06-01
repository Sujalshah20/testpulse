import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import SEO from '../../components/SEO.jsx';
import { BookOpen, ChevronLeft } from 'lucide-react';
import { BLOG_POSTS } from './Blog.jsx';

export default function BlogPost() {
  const { slug } = useParams();
  const post = BLOG_POSTS.find(p => p.slug === slug);

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.excerpt,
    "author": {
      "@type": "Organization",
      "name": post.author
    },
    "datePublished": new Date(post.date).toISOString()
  };

  return (
    <>
      <SEO 
        title={post.title}
        description={post.excerpt}
        url={`/blog/${slug}`}
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
              <Link to="/pricing" className="text-surface-300 hover:text-white transition-colors">Pricing</Link>
              <Link to="/blog" className="text-white">Blog</Link>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-sm font-medium hover:text-brand-400 transition-colors">Sign In</Link>
            </div>
          </div>
        </nav>

        <main className="pt-32 pb-20 px-6 max-w-3xl mx-auto">
          <Link to="/blog" className="inline-flex items-center gap-2 text-brand-400 hover:text-brand-300 mb-8">
            <ChevronLeft className="w-4 h-4" /> Back to Blog
          </Link>
          
          <article>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">{post.title}</h1>
            <div className="flex items-center gap-4 text-surface-400 mb-12 pb-8 border-b border-white/10">
              <span>{post.date}</span>
              <span>•</span>
              <span>{post.author}</span>
            </div>
            
            <div className="prose prose-invert prose-brand max-w-none text-surface-200 text-lg leading-relaxed space-y-6">
              <p>This is a placeholder for the full article content. The SEO schema has been properly generated for <strong>{post.title}</strong>.</p>
              <p>Building a platform like TestPulse requires careful attention to detail. Search engine optimization (SEO) is a critical piece of the puzzle, ensuring that students, teachers, and administrators can easily find the tools they need to succeed.</p>
              <p>By implementing JSON-LD Structured Data, Open Graph tags, and standard meta tags, this post is fully optimized for discovery.</p>
            </div>
          </article>
        </main>
      </div>
    </>
  );
}

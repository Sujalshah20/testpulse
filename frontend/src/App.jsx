// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ExamList from './pages/ExamList.jsx';
import ExamRoom from './pages/ExamRoom.jsx';
import Results from './pages/Results.jsx';
import AdminExams from './pages/admin/AdminExams.jsx';
import AdminQuestions from './pages/admin/AdminQuestions.jsx';
import AdminUsers from './pages/admin/AdminUsers.jsx';
import Home from './pages/marketing/Home.jsx';
import Features from './pages/marketing/Features.jsx';
import HowItWorks from './pages/marketing/HowItWorks.jsx';
import Pricing from './pages/marketing/Pricing.jsx';
import Blog from './pages/marketing/Blog.jsx';
import BlogPost from './pages/marketing/BlogPost.jsx';
import { Helmet } from 'react-helmet-async';

function GoogleAnalytics() {
  const GA_ID = 'G-XXXXXXXXXX'; // Placeholder for GA4 Measurement ID
  return (
    <Helmet>
      <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}></script>
      <script>
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}
      </script>
    </Helmet>
  );
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <>
      <GoogleAnalytics />
      <Routes>
        {/* Public Marketing */}
        <Route path="/" element={<Home />} />
        <Route path="/features" element={<Features />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        
        {/* Auth */}
        <Route path="/login" element={<Login />} />

      {/* Protected — all authenticated users */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute roles={['student', 'examiner', 'admin']}>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/exams"
        element={
          <ProtectedRoute roles={['student', 'examiner', 'admin']}>
            <ExamList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/exam-room/:attemptId"
        element={
          <ProtectedRoute roles={['student']}>
            <ExamRoom />
          </ProtectedRoute>
        }
      />
      <Route
        path="/results/:attemptId"
        element={
          <ProtectedRoute roles={['student', 'examiner', 'admin']}>
            <Results />
          </ProtectedRoute>
        }
      />

      {/* Protected — admin / examiner only */}
      <Route
        path="/admin/exams"
        element={
          <ProtectedRoute roles={['admin', 'examiner']}>
            <AdminExams />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/questions"
        element={
          <ProtectedRoute roles={['admin', 'examiner']}>
            <AdminQuestions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute roles={['admin']}>
            <AdminUsers />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router future={{ 
        v7_startTransition: true, 
        v7_relativeSplatPath: true 
      }}>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

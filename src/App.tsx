import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { Navbar } from './components/Navbar';

// Lazy load route components
const Home = lazy(() => import('./pages/Home'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const History = lazy(() => import('./pages/History'));

const App = () => {
  const { user, loading, error } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Navbar />
      <Suspense fallback={
        <div className="d-flex justify-content-center align-items-center min-vh-100">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      }>
        <Routes>
          {/* Root route - redirects logged-in users to dashboard by default */}
          <Route
            path="/"
            element={user ? <Navigate to="/dashboard" replace /> : <Home />}
          />
          <Route
            path="/home"
            element={<Home />}
          />
          {/* Dashboard - protected route */}
          <Route
            path="/dashboard"
            element={user ? <Dashboard /> : <Navigate to="/" replace />}
          />
          {/* History - protected route */}
          <Route
            path="/history"
            element={user ? <History /> : <Navigate to="/" replace />}
          />
        </Routes>
      </Suspense>
    </Router>
  );
};

export default App;

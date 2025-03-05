import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { Navbar } from './components/Navbar';

// Lazy load route components
const Home = lazy(() => import('./pages/Home'));
const QuickPen = lazy(() => import('./pages/QuickPen'));
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
          <Route
            path="/"
            element={user ? <Navigate to="/app" replace /> : <Home />}
          />
          <Route
            path="/app"
            element={user ? <QuickPen /> : <Navigate to="/" replace />}
          />
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

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { Navbar } from './components/Navbar';
import Home from './pages/Home';
import QuickPen from './pages/QuickPen';

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
      <Routes>
        <Route
          path="/"
          element={user ? <Navigate to="/app" replace /> : <Home />}
        />
        <Route
          path="/app"
          element={user ? <QuickPen /> : <Navigate to="/" replace />}
        />
      </Routes>
    </Router>
  );
};

export default App;

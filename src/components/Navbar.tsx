import React, { useState } from 'react';
import pen from '../assets/pen.svg';
import { useAppSelector } from '../store/hooks';
import { authService } from '../services/auth';
import { AuthModal } from './AuthModal';

export function Navbar() {
  const { user } = useAppSelector(state => state.auth);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleAuth = async (provider: 'google' | 'anonymous' | 'email') => {
    try {
      switch (provider) {
        case 'google':
          await authService.signInWithGoogle();
          break;
        case 'anonymous':
          await authService.signInAnonymously();
          break;
        case 'email':
          alert('Email sign in not implemented yet');
          break;
      }
      setShowAuthModal(false);
    } catch (error) {
      console.error('Error during authentication:', error);
    }
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
        <div className="container">
          <a className="navbar-brand d-flex align-items-center gap-3 text-primary" href="/">
            <img src={pen} alt="QuickPen" className="d-block" style={{ width: '35px', height: '35px' }} />
            <span className="fw-semibold text-dark text-opacity-80">QuickPen</span>
          </a>
          <button
            className={`btn ${user ? 'btn-outline-primary' : 'btn-primary'}`}
            onClick={() => user ? authService.signOut() : setShowAuthModal(true)}
          >
            {user ? 'Logout' : 'Login'}
          </button>
        </div>
      </nav>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSelectProvider={handleAuth}
      />
    </>
  );
}
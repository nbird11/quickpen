import React, { useState } from 'react';
import styles from './Navbar.module.css';
import pen from '../../assets/pen.svg';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/auth';
import { AuthModal } from '../AuthModal/AuthModal';

export function Navbar() {
  const { user } = useAuth();
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
          // Handle email sign in separately with a form
          break;
      }
      setShowAuthModal(false);
    } catch (error) {
      console.error('Error during authentication:', error);
    }
  };

  return (
    <>
      <nav className={`navbar navbar-expand-lg navbar-light ${styles.navbar}`}>
        <div className="container">
          <a className={styles.brand} href="/">
            <img src={pen} alt="QuickPen" className={styles.logo} />
          </a>
          <p className={`${styles.brand} text-start m-0`}>QuickPen</p>
          <button 
            className={`btn ${user ? 'btn-outline-primary' : 'btn-primary'}`}
            onClick={() => user ? authService.signOut() : setShowAuthModal(true)}
          >
            {user ? 'Sign Out' : 'Sign In'}
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
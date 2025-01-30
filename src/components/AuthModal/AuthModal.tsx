import React from 'react';
import styles from './AuthModal.module.css';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProvider: (provider: 'google' | 'anonymous' | 'email') => void;
}

export function AuthModal({ isOpen, onClose, onSelectProvider }: AuthModalProps) {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Sign In to QuickPen</h2>
          <button className={styles.closeButton} onClick={onClose}>&times;</button>
        </div>
        <div className={styles.content}>
          <button 
            className={`btn btn-outline-primary ${styles.providerButton}`}
            onClick={() => onSelectProvider('google')}
          >
            <img src="https://static.cdnlogo.com/logos/g/82/google-g-2015.svg" alt="" width={20} height={20} /> Continue with Google
          </button>
          <button 
            className={`btn btn-outline-secondary ${styles.providerButton}`}
            onClick={() => onSelectProvider('email')}
          >
            <i className="bi bi-envelope"></i> Sign in with Email
          </button>
          <button 
            className={`btn btn-outline-secondary ${styles.providerButton}`}
            onClick={() => onSelectProvider('anonymous')}
          >
            <i className="bi bi-incognito"></i> Try Anonymously
          </button>
        </div>
      </div>
    </div>
  );
} 
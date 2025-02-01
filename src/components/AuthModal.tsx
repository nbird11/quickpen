import React from 'react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProvider: (provider: 'google' | 'anonymous' | 'email') => void;
}

export function AuthModal({ isOpen, onClose, onSelectProvider }: AuthModalProps) {
  if (!isOpen) return null;

  return (
    <>
      <div className="modal fade show d-block" onClick={onClose}>
        <div className="modal-dialog modal-md modal-dialog-centered">
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title h3">Sign In to QuickPen</h2>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body p-4">
              <div className="d-grid gap-3">
                <button
                  className="btn btn-outline-primary d-flex align-items-center justify-content-center gap-2 py-2"
                  onClick={() => onSelectProvider('google')}
                >
                  <img src="https://static.cdnlogo.com/logos/g/82/google-g-2015.svg" alt="" width={24} height={24} />
                  Continue with Google
                </button>
                <button
                  className="btn btn-outline-secondary d-flex align-items-center justify-content-center gap-2 py-2"
                  onClick={() => onSelectProvider('email')}
                >
                  <i className="bi bi-envelope fs-5"></i> Sign in with Email
                </button>
                <button
                  className="btn btn-outline-secondary d-flex align-items-center justify-content-center gap-2 py-2"
                  onClick={() => onSelectProvider('anonymous')}
                >
                  <i className="bi bi-incognito fs-5"></i> Try Anonymously
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show"></div>
    </>
  );
}
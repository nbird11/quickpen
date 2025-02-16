import { useState, useEffect } from 'react';
import pen from '../assets/pen.svg';
import { useAppSelector } from '../store/hooks';
import { authService } from '../services/auth';
import * as firebaseui from 'firebaseui';
import { auth } from '../services/firebase';
import 'firebaseui/dist/firebaseui.css';
import { EmailAuthProvider, GoogleAuthProvider } from 'firebase/auth';

export function Navbar() {
  const { user } = useAppSelector(state => state.auth);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    if (showAuth) {
      const ui = firebaseui.auth.AuthUI.getInstance() || new firebaseui.auth.AuthUI(auth);

      ui.start('#firebaseui-auth-container', {
        signInOptions: [
          GoogleAuthProvider.PROVIDER_ID,
          {
            provider: EmailAuthProvider.PROVIDER_ID,
            requireDisplayName: false,
          },
          firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID,
        ],
        signInFlow: 'popup',
        callbacks: {
          signInSuccessWithAuthResult: () => {
            setShowAuth(false);
            return false; // Don't redirect
          },
        },
      });
    }
  }, [showAuth]);

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
            onClick={() => user ? authService.signOut() : setShowAuth(true)}
          >
            {user ? 'Logout' : 'Login'}
          </button>
        </div>
      </nav>

      {showAuth && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div className="modal fade show d-block">
            <div className="modal-dialog modal-md modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h2 className="modal-title h3">Sign In to QuickPen</h2>
                  <button type="button" className="btn-close" onClick={() => setShowAuth(false)}></button>
                </div>
                <div className="modal-body">
                  <div id="firebaseui-auth-container"></div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
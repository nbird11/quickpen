import { useState, useEffect } from 'react';
import { Navbar as BsNavbar, Container, Button, Nav, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import pen from '../assets/pen.svg';
import { useAppSelector } from '../store/hooks';
import { authService } from '../services/auth';
import * as firebaseui from 'firebaseui';
import firebase from '../services/firebase';
import 'firebaseui/dist/firebaseui.css';

export function Navbar() {
  const { user } = useAppSelector(state => state.auth);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    if (showAuth) {
      const ui = firebaseui.auth.AuthUI.getInstance() || new firebaseui.auth.AuthUI(firebase.auth());

      ui.start('#firebaseui-auth-container', {
        signInOptions: [
          {
            provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID,
            scopes: ['profile', 'email']
          },
          {
            provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
            requireDisplayName: false,
          },
          firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID
        ],
        signInFlow: 'popup',
        callbacks: {
          signInSuccessWithAuthResult: () => {
            setShowAuth(false);
            return false; // Don't redirect
          },
        },
        tosUrl: '/terms',
        privacyPolicyUrl: '/privacy'
      });
    }
  }, [showAuth]);

  return (
    <>
      <BsNavbar expand="lg" className="bg-light shadow-sm">
        <Container>
          <BsNavbar.Brand href="/home" className="d-flex align-items-center gap-3 text-primary">
            <img src={pen} alt="QuickPen" className="d-block" style={{ width: '35px', height: '35px' }} />
            <span className="fw-semibold text-dark text-opacity-80">QuickPen</span>
          </BsNavbar.Brand>

          <BsNavbar.Toggle aria-controls="basic-navbar-nav" />
          <BsNavbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/home">Home</Nav.Link>
              {user && (
                <>
                  <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
                  <Nav.Link as={Link} to="/history">History</Nav.Link>
                </>
              )}
            </Nav>
          </BsNavbar.Collapse>

          <Button
            variant={user ? 'outline-primary' : 'primary'}
            onClick={() => user ? authService.signOut() : setShowAuth(true)}
          >
            {user ? 'Logout' : 'Login'}
          </Button>
        </Container>
      </BsNavbar>

      <Modal
        show={showAuth}
        onHide={() => setShowAuth(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title as="h2" className="h3">Sign In to QuickPen</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div id="firebaseui-auth-container"></div>
        </Modal.Body>
      </Modal>
    </>
  );
}
import React from 'react';
import styles from './Navbar.module.css';
import pen from '../../assets/pen.svg';

export function Navbar() {
  return (
    <nav className={`navbar navbar-expand-lg navbar-light ${styles.navbar}`}>
      <div className="container">
        <a className={styles.brand} href="/">
          <img src={pen} alt="QuickPen" className={styles.logo} />
          QuickPen
        </a>
        <button className="btn btn-primary">Login</button>
      </div>
    </nav>
  );
}
import React from 'react';
import styles from './Hero.module.css';

export function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.heroOverlay}></div>
      <div className={`container ${styles.heroContent}`}>
        <h1 className="display-4 mb-4">Write Better, Write Faster</h1>
        <p className="lead mb-4">
          Track your writing progress with timed sprints, measure your word count, and build a consistent writing habit.
        </p>
        <button className="btn btn-light btn-lg">Start Writing Now</button>
      </div>
    </section>
  );
}
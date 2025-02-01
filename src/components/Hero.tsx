import React from 'react';

export function Hero() {
  return (
    <section className="position-relative overflow-hidden py-5">
      <div className="position-absolute top-0 start-0 end-0 bottom-0"
        style={{
          background: 'linear-gradient(135deg, var(--bs-green) 0%, var(--bs-dark) 100%)',
          zIndex: 1
        }}>
      </div>
      <div className="container position-relative text-center text-white py-4 py-md-5" style={{ zIndex: 2 }}>
        <h1 className="display-4 fw-bold mb-4" style={{ letterSpacing: '-0.5px' }}>
          Write Better, Write Faster
        </h1>
        <p className="lead mb-4">
          Track your writing progress with timed sprints, measure your word count, and build a consistent writing habit.
        </p>
        <button className="btn btn-light btn-lg">Start Writing Now</button>
      </div>
    </section>
  );
}
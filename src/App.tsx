import React from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { AuthListener } from './components/AuthListener';

function App() {
  return (
    <AuthListener>
      <div>
        <Navbar />
        <Hero />

        {/* Features Section */}
        <section className="bg-white py-5">
          <div className="container">
            <h2 className="text-center mb-5">Why Choose QuickPen?</h2>
            <div className="row g-4">
              <div className="col-md-4">
                <div className="card h-100 shadow-sm hover-lift">
                  <div className="card-body">
                    <h3 className="card-title h5">⏱️ Timed Writing Sprints</h3>
                    <p className="card-text">
                      Set custom duration goals and challenge yourself to write without distractions.
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card h-100 shadow-sm hover-lift">
                  <div className="card-body">
                    <h3 className="card-title h5">📊 Track Your Progress</h3>
                    <p className="card-text">
                      Monitor your writing stats, including word count, WPM, and daily streaks.
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card h-100 shadow-sm hover-lift">
                  <div className="card-body">
                    <h3 className="card-title h5">🏆 Build Consistency</h3>
                    <p className="card-text">
                      Maintain your writing streak and achieve your writing goals.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-5 bg-sepia-light">
          <div className="container">
            <h2 className="text-center mb-5">Choose Your Plan</h2>
            <div className="row g-4 justify-content-center">
              <div className="col-md-5">
                <div className="card h-100">
                  <div className="card-body text-center">
                    <h3 className="card-title">Free</h3>
                    <div className="display-6 my-3">$0</div>
                    <ul className="list-unstyled">
                      <li className="mb-2">✓ Unlimited Writing Sprints</li>
                      <li className="mb-2">✓ Basic Progress Tracking</li>
                      <li className="mb-2">✓ Daily Streaks</li>
                    </ul>
                    <button className="btn btn-outline-primary">Get Started</button>
                  </div>
                </div>
              </div>
              <div className="col-md-5">
                <div className="card h-100 border-primary">
                  <div className="card-body text-center">
                    <h3 className="card-title">Pro</h3>
                    <div className="display-6 my-3">$5/mo</div>
                    <ul className="list-unstyled">

                      <li className="mb-2">✓ Everything in Free</li>
                      <li className="mb-2">✓ Advanced Analytics</li>
                      <li className="mb-2">✓ Custom Tags</li>
                      <li className="mb-2">✓ Export Options</li>
                    </ul>
                    <button className="btn btn-primary">Upgrade to Pro</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer className={`py-4 text-white bg-dark`}>
          <div className="container text-center">
            <p className="mb-0">&copy; {new Date().getFullYear()} QuickPen. All rights reserved.</p>
          </div>

        </footer>
      </div>
    </AuthListener>
  );
}

export default App;

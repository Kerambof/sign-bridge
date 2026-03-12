import React from 'react';
import './LandingPage.css';

function LandingPage({ onStart }) {
  return (
    <div className="landing-page">
      <div className="landing-container">
        
        {/* Hero Section */}
        <div className="hero-section">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="badge-dot"></span>
              Real-time AI Communication
            </div>
            
            <h1 className="hero-title">
              Break down communication barriers
            </h1>
            
            <p className="hero-subtitle">
              Two-way conversation between hearing and hearing-impaired individuals through gesture recognition and live speech-to-text.
            </p>

            <div className="hero-actions">
              <button onClick={onStart} className="btn-start">
                Start Communicating
                <span className="btn-arrow">→</span>
              </button>
              <button className="btn-demo" onClick={() => {
                document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' });
              }}>
                See How It Works
              </button>
            </div>

            <div className="hero-stats">
              <div className="stat">
                <div className="stat-number">6+</div>
                <div className="stat-label">Active Gestures</div>
              </div>
              <div className="stat">
                <div className="stat-number">2-Way</div>
                <div className="stat-label">Communication</div>
              </div>
              <div className="stat">
                <div className="stat-number">Real-time</div>
                <div className="stat-label">Processing</div>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="visual-card card-1">
              <div className="card-icon">👋</div>
              <div className="card-text">HELLO</div>
            </div>
            <div className="visual-card card-2">
              <div className="card-icon">🎤</div>
              <div className="card-text">Live Captions</div>
            </div>
            <div className="visual-card card-3">
              <div className="card-icon">✋</div>
              <div className="card-text">STOP</div>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="how-section" id="how-it-works">
          <div className="section-label-tag">How It Works</div>
          <h2 className="section-title">Simple. Instant. Accessible.</h2>
          
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">01</div>
              <div className="step-icon">🎥</div>
              <h3>Show Gesture</h3>
              <p>Hearing-impaired person makes a gesture in front of the camera</p>
            </div>

            <div className="step-card">
              <div className="step-number">02</div>
              <div className="step-icon">🤖</div>
              <h3>AI Detects</h3>
              <p>MediaPipe AI recognizes the gesture in real-time</p>
            </div>

            <div className="step-card">
              <div className="step-number">03</div>
              <div className="step-icon">💬</div>
              <h3>Instant Message</h3>
              <p>Text appears and optionally speaks aloud for the hearing person</p>
            </div>

            <div className="step-card">
              <div className="step-number">04</div>
              <div className="step-icon">🎤</div>
              <h3>Speak Back</h3>
              <p>Hearing person speaks, text appears for hearing-impaired person to read</p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="features-section">
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Real-time Processing</h3>
              <p>Instant gesture recognition with no lag. Communication happens naturally.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🌐</div>
              <h3>Works Anywhere</h3>
              <p>Browser-based. No app downloads. Works on desktop and mobile.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>5 Core Gestures</h3>
              <p>Essential communication covered: Yes, Ok, Hello, Stop, Help.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🔊</div>
              <h3>Voice Output</h3>
              <p>Optional text-to-speech so gestures can be heard by the hearing person.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📝</div>
              <h3>Live Captions</h3>
              <p>Speech-to-text displays spoken words for the hearing-impaired person.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">💾</div>
              <h3>Conversation History</h3>
              <p>Full transcript of the conversation for reference and clarity.</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="cta-section">
          <div className="cta-content">
            <h2>Ready to bridge the gap?</h2>
            <p>Start communicating without barriers in seconds.</p>
            <button onClick={onStart} className="btn-cta">
              Launch SignBridge
              <span className="btn-arrow">→</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <footer className="landing-footer">
          <p>Built with love for the deaf and hard-of-hearing community• Powered by MediaPipe AI</p>
        </footer>

      </div>
    </div>
  );
}

export default LandingPage;
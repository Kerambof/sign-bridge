import React, { useRef, useEffect, useState } from 'react';
import './App.css';
import HandDetector from './utils/handDetector';
import GestureRecognizer from './utils/gestureRecognizer';
import SpeechRecognitionService from './utils/speechRecognition';
import TextToSpeechService from './utils/textToSpeech';
import LandingPage from './components/LandingPage';

function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const messagesEndRef = useRef(null);
  const handDetectorRef = useRef(null);
  const gestureRecognizerRef = useRef(null);
  const speechRecognitionRef = useRef(null);
  const textToSpeechRef = useRef(null);
  const [showLanding, setShowLanding] = useState(true);
  
  // System state
  const [cameraActive, setCameraActive] = useState(false);
  const [mediapipeActive, setMediapipeActive] = useState(false);
  const [speechListening, setSpeechListening] = useState(false);
  const [voiceOutputEnabled, setVoiceOutputEnabled] = useState(true);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showGuide, setShowGuide] = useState(true);
  
  // Detection state
  const [handsDetected, setHandsDetected] = useState(0);
  const [currentGesture, setCurrentGesture] = useState(null);
  const [interimSpeech, setInterimSpeech] = useState('');
  
  // Conversation history
  const [messages, setMessages] = useState([]);
  const lastGestureRef = useRef(null);
  const gestureCooldownRef = useRef(false);

  // Available gestures (working ones only)
 const availableGestures = [
  { emoji: '👍', name: 'YES', desc: 'Thumbs up' },
  { emoji: '👌', name: 'OK', desc: 'Circle with thumb & index' },
 // { emoji: '👎', name: 'NO', desc: 'Thumbs down' },
  { emoji: '👋', name: 'HELLO', desc: 'Open palm, fingers spread' },
  { emoji: '✋', name: 'STOP ', desc: 'Palm forward, fingers together' },
  { emoji: '', name: 'HELP', desc: 'Hand raised high' },
 // { emoji: '🙏', name: 'THANK YOU', desc: 'Prayer position, centered' },
  //{ emoji: '🫶', name: 'LOVE', desc: 'Thumb & pinky out, middle curled' },
 // { emoji: '', name: 'HUNGRY', desc: 'Hand near mouth' }
];
  useEffect(() => {
    gestureRecognizerRef.current = new GestureRecognizer();
    speechRecognitionRef.current = new SpeechRecognitionService();
    textToSpeechRef.current = new TextToSpeechService();
    
    // Only start camera if NOT showing landing page
    if (!showLanding) {
      startSystem();
    }
    
    return () => cleanup();
  }, [showLanding]); // Re-run when showLanding changes
  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startSystem = async () => {
    setLoading(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
        setError(null);

        videoRef.current.onloadedmetadata = () => {
          initializeMediaPipe();
        };
      }
    } catch (err) {
      console.error('Camera error:', err);
      setError('Camera access denied. Please allow camera permissions.');
      setLoading(false);
    }
  };

  const initializeMediaPipe = () => {
    try {
      if (canvasRef.current && videoRef.current) {
        canvasRef.current.width = videoRef.current.videoWidth || 1280;
        canvasRef.current.height = videoRef.current.videoHeight || 720;
      }

      if (!handDetectorRef.current) {
        handDetectorRef.current = new HandDetector();
      }

      handDetectorRef.current.initialize(
        videoRef.current,
        canvasRef.current,
        handleHandResults
      );

      setMediapipeActive(true);
      setLoading(false);
      console.log('MediaPipe initialized!');
    } catch (err) {
      console.error('MediaPipe error:', err);
      setError('Failed to initialize hand tracking: ' + err.message);
      setLoading(false);
    }
  };

  const handleHandResults = (results) => {
    const numHands = results.multiHandLandmarks ? results.multiHandLandmarks.length : 0;
    setHandsDetected(numHands);

    if (numHands > 0 && gestureRecognizerRef.current) {
      const landmarks = results.multiHandLandmarks[0];
      const detectedGesture = gestureRecognizerRef.current.recognizeGesture(landmarks);
      const smoothedGesture = gestureRecognizerRef.current.smoothGesture(detectedGesture);
      
      // Update current gesture display (for visual feedback)
      if (smoothedGesture !== currentGesture) {
        setCurrentGesture(smoothedGesture);
      }

      // Only add message if gesture changed AND cooldown expired
      if (smoothedGesture && 
          !gestureCooldownRef.current && 
          smoothedGesture.gesture !== lastGestureRef.current) {
        
        // Add message
        addMessage('gesture', smoothedGesture.text, smoothedGesture.emoji);
        
        // Speak if voice enabled
        if (voiceOutputEnabled && textToSpeechRef.current) {
          textToSpeechRef.current.speak(smoothedGesture.text);
        }

        // Set cooldown (2 seconds before same gesture can be captured again)
        lastGestureRef.current = smoothedGesture.gesture;
        gestureCooldownRef.current = true;
        
        setTimeout(() => {
          gestureCooldownRef.current = false;
        }, 2000); // 2 second cooldown
      }

      // Reset last gesture if hand is removed
      if (!smoothedGesture) {
        lastGestureRef.current = null;
        setCurrentGesture(null);
      }
    } else {
      setCurrentGesture(null);
      lastGestureRef.current = null;
    }
  };

  const toggleSpeechListening = () => {
    if (!speechRecognitionRef.current.isSupported()) {
      setError('Speech recognition not supported in this browser. Try Chrome.');
      return;
    }

    if (speechListening) {
      speechRecognitionRef.current.stop();
      setSpeechListening(false);
      setInterimSpeech('');
    } else {
      speechRecognitionRef.current.start(
        (result) => {
          setInterimSpeech(result.interim);
          if (result.isFinal && result.final) {
            addMessage('speech', result.final, '🎤');
            setInterimSpeech('');
          }
        },
        (error) => {
          console.error('Speech error:', error);
          setError('Speech recognition error: ' + error);
          setSpeechListening(false);
        }
      );
      setSpeechListening(true);
    }
  };

  const toggleVoiceOutput = () => {
    if (textToSpeechRef.current) {
      const newState = textToSpeechRef.current.toggle();
      setVoiceOutputEnabled(newState);
    }
  };

  const addMessage = (type, text, icon) => {
    const newMessage = {
      id: Date.now(),
      type,
      text,
      icon,
      timestamp: new Date().toLocaleTimeString()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const addQuickPhrase = (phrase, icon) => {
    addMessage('quick', phrase, icon);
    if (voiceOutputEnabled && textToSpeechRef.current) {
      textToSpeechRef.current.speak(phrase);
    }
  };

  const clearConversation = () => {
    if (window.confirm('Clear all messages?')) {
      setMessages([]);
    }
  };
  const exportConversation = () => {
  if (messages.length === 0) {
    alert('No messages to export!');
    return;
  }

  // Create text content
  let content = '='.repeat(50) + '\n';
  content += 'SignBridge Conversation Export\n';
  content += 'Date: ' + new Date().toLocaleString() + '\n';
  content += '='.repeat(50) + '\n\n';

  messages.forEach((msg, index) => {
    const type = msg.type === 'speech' ? '🎤 SPEECH' : 
                 msg.type === 'gesture' ? '✋ GESTURE' : 
                 '⚡ QUICK PHRASE';
    
    content += `[${msg.timestamp}] ${type}\n`;
    content += `${msg.icon} ${msg.text}\n\n`;
  });

  content += '='.repeat(50) + '\n';
  content += `Total Messages: ${messages.length}\n`;
  content += 'Exported from SignBridge\n';

  // Create downloadable file
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `signbridge-conversation-${Date.now()}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

  const cleanup = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
    }
    if (handDetectorRef.current) {
      handDetectorRef.current.stop();
    }
    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.stop();
    }
    if (textToSpeechRef.current) {
      textToSpeechRef.current.stop();
    }
    setCameraActive(false);
    setMediapipeActive(false);
    setSpeechListening(false);
  };

  return (
  <>
    {showLanding ? (
      <LandingPage onStart={() => setShowLanding(false)} />
    ) : (
      <div className="App">
      <header className="app-header">
        <h1>🤝 SignBridge</h1>
        <p>Two-way communication for everyone</p>
        <div className="header-stats">
          <span className="stat-badge">✅ {availableGestures.length} Gestures Active</span>
          <span className="stat-badge">💬 {messages.length} Messages</span>
        </div>
      </header>

      {error && (
        <div className="error-banner">
          ⚠️ {error}
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      <div className="two-way-container">
        
        {/* TOP SECTION: Captions */}
        <div className="captions-section"> 
                  <div className="section-header">
            <h2>📝 Live Captions</h2>
            <div className="header-actions">
              <span className="section-label">Hearing-Impaired View</span>
              <button onClick={exportConversation} className="btn-export" disabled={messages.length === 0}>
                📥 Export
              </button>
              <button onClick={clearConversation} className="btn-clear" disabled={messages.length === 0}>
                🗑️ Clear
              </button>
            </div>
          </div>
          
          <div className="captions-display">
            {messages.length === 0 ? (
              <div className="empty-state">
                <p className="empty-icon">💬</p>
                <p className="empty-title">No messages yet</p>
                <p className="empty-subtitle">Start listening or make a gesture to begin</p>
              </div>
            ) : (
              <div className="messages-container">
                {messages.map(msg => (
                  <div key={msg.id} className={`message ${msg.type}`}>
                    <span className="message-icon">{msg.icon}</span>
                    <div className="message-content">
                      <span className="message-text">{msg.text}</span>
                      <span className="message-time">{msg.timestamp}</span>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
            
            {interimSpeech && (
              <div className="interim-speech">
                <span className="typing-indicator">💬</span> {interimSpeech}...
              </div>
            )}
          </div>
        </div>

        {/* BOTTOM SECTION: Gestures */}
        <div className="gesture-section">
          <div className="section-header">
            <h2>🎥 Gesture Recognition</h2>
            <div className="header-actions">
              <span className="section-label">Hearing Person View</span>
              <button onClick={() => setShowGuide(!showGuide)} className="btn-toggle-guide">
                {showGuide ? '👁️ Hide Guide' : '📖 Show Guide'}
              </button>
            </div>
          </div>

          <div className="gesture-content">
            <div className="camera-container">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{ display: 'none' }}
              />
              
              <canvas
                ref={canvasRef}
                className="gesture-canvas"
              />
              
              {loading && <div className="loading-overlay">⏳ Loading AI...</div>}
              
              {handsDetected > 0 && (
                <div className="hand-indicator">
                  ✋ Tracking {handsDetected} hand{handsDetected > 1 ? 's' : ''}
                </div>
              )}

              {currentGesture && (
                <div className="current-gesture-display">
                  <span className="gesture-emoji-large">{currentGesture.emoji}</span>
                  <span className="gesture-text-large">{currentGesture.text}</span>
                  {voiceOutputEnabled && <span className="speaker-icon">🔊</span>}
                </div>
              )}
            </div>

            {showGuide && (
              <div className="gesture-guide">
                <h4>✨ Available Gestures</h4>
                <div className="gesture-grid">
                  {availableGestures.map((g, idx) => (
                    <div key={idx} className="gesture-card">
                      <span className="gesture-card-emoji">{g.emoji}</span>
                      <div className="gesture-card-info">
                        <strong>{g.name}</strong>
                        <p>{g.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Control Panel */}
          <div className="control-panel">
            <button
              onClick={toggleSpeechListening}
              className={`btn ${speechListening ? 'btn-recording' : 'btn-primary'}`}
            >
              {speechListening ? '⏹️ Stop Listening' : '🎤 Start Listening'}
            </button>

            <button
              onClick={toggleVoiceOutput}
              className={`btn ${voiceOutputEnabled ? 'btn-success' : 'btn-muted'}`}
            >
              {voiceOutputEnabled ? '🔊 Voice ON' : '🔇 Voice OFF'}
            </button>
          </div>

          {/* Quick Phrases */}
          <div className="quick-phrases">
            <h4>⚡ Quick Phrases</h4>
            <div className="phrase-buttons">
              <button onClick={() => addQuickPhrase('Help', '')} className="phrase-btn">
                Help
              </button>
              <button onClick={() => addQuickPhrase('Thank You', '🙏')} className="phrase-btn">
                🙏 Thank You
              </button>
              <button onClick={() => addQuickPhrase('Yes', '👍')} className="phrase-btn">
                👍 Yes
              </button>
              <button onClick={() => addQuickPhrase('No', '👎')} className="phrase-btn">
                👎 No
              </button>
              <button onClick={() => addQuickPhrase('Hello', '👋')} className="phrase-btn">
                👋 Hello
              </button>
              <button onClick={() => addQuickPhrase('Stop', '✋')} className="phrase-btn">
                ✋ Stop
              </button>
            </div>
          </div>
        </div>

      </div>

    {/* System Status */}
      <div className="system-status">
        <div className={`status-dot ${cameraActive ? 'active' : ''}`} title="Camera" />
        <div className={`status-dot ${mediapipeActive ? 'active' : ''}`} title="Hand Tracking" />
        <div className={`status-dot ${speechListening ? 'active' : ''}`} title="Speech Recognition" />
      </div>
    </div>
      )}
    </>
  );
}
export default App;
class SpeechRecognitionService {
  constructor() {
    // Check browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.error('Speech Recognition not supported in this browser');
      this.recognition = null;
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true; // Keep listening
    this.recognition.interimResults = true; // Show partial results
    this.recognition.lang = 'en-US';

    this.isListening = false;
    this.onResultCallback = null;
    this.onErrorCallback = null;
  }

  // Start listening
  start(onResult, onError) {
    if (!this.recognition) {
      if (onError) onError('Speech recognition not supported');
      return;
    }

    this.onResultCallback = onResult;
    this.onErrorCallback = onError;

    this.recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      // Process all results
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      if (this.onResultCallback) {
        this.onResultCallback({
          final: finalTranscript.trim(),
          interim: interimTranscript.trim(),
          isFinal: finalTranscript.length > 0
        });
      }
    };

    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (this.onErrorCallback) {
        this.onErrorCallback(event.error);
      }
    };

    this.recognition.onend = () => {
      // Auto-restart if still supposed to be listening
      if (this.isListening) {
        console.log('Recognition ended, restarting...');
        this.recognition.start();
      }
    };

    try {
      this.recognition.start();
      this.isListening = true;
      console.log('Speech recognition started');
    } catch (err) {
      console.error('Failed to start recognition:', err);
      if (this.onErrorCallback) {
        this.onErrorCallback(err.message);
      }
    }
  }

  // Stop listening
  stop() {
    if (this.recognition && this.isListening) {
      this.isListening = false;
      this.recognition.stop();
      console.log('Speech recognition stopped');
    }
  }

  // Check if supported
  isSupported() {
    return this.recognition !== null;
  }
}

export default SpeechRecognitionService;
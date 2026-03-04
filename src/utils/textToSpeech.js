class TextToSpeechService {
  constructor() {
    this.synthesis = window.speechSynthesis;
    this.enabled = true;
  }

  // Speak text aloud
  speak(text, options = {}) {
    if (!this.enabled || !text) return;

    // Cancel any ongoing speech
    this.synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options.rate || 1.0;
    utterance.pitch = options.pitch || 1.0;
    utterance.volume = options.volume || 1.0;
    utterance.lang = options.lang || 'en-US';

    this.synthesis.speak(utterance);
  }

  // Toggle on/off
  toggle() {
    this.enabled = !this.enabled;
    if (!this.enabled) {
      this.synthesis.cancel(); // Stop current speech
    }
    return this.enabled;
  }

  // Stop speaking
  stop() {
    this.synthesis.cancel();
  }

  isEnabled() {
    return this.enabled;
  }
}

export default TextToSpeechService;
// Web Speech API Voice synthesis and Recognition helpers

export class SpeechHelper {
  private static synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
  private static recognition: any = null;

  static speak(text: string, lang = 'ur-PK') {
    if (!this.synth) return;
    this.synth.cancel(); // Stop any ongoing speech
    
    // Clean markdown stars or bold characters for speech
    const cleanText = text.replace(/[*#_~`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = lang;
    utterance.rate = 1.0;
    
    // Try finding an Urdu or Hindi or English voice
    const voices = this.synth.getVoices();
    const voice = voices.find(v => v.lang.startsWith('ur') || v.lang.startsWith('hi') || v.lang.startsWith('en'));
    if (voice) utterance.voice = voice;

    this.synth.speak(utterance);
  }

  static stopSpeaking() {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  static isRecognitionSupported(): boolean {
    return typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
  }

  static startListening(
    onResult: (text: string) => void,
    onEnd: () => void,
    onError: (err: string) => void
  ) {
    if (!this.isRecognitionSupported()) {
      onError('Speech recognition is not supported in this browser');
      return null;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US'; // Works reasonably well for Roman Urdu / English speech

      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onResult(transcript);
      };

      this.recognition.onerror = (event: any) => {
        onError(event.error || 'Speech input error');
      };

      this.recognition.onend = () => {
        onEnd();
      };

      this.recognition.start();
      return this.recognition;
    } catch (e: any) {
      onError(e.message || 'Could not start speech recognition');
      return null;
    }
  }

  static stopListening() {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {}
    }
  }
}

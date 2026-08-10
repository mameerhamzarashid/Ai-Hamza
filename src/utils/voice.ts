// Web Speech API Voice synthesis and Recognition helpers

export class SpeechHelper {
  private static synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
  private static recognition: any = null;

  static speak(
    text: string,
    lang = 'en-US',
    onStart?: () => void,
    onEnd?: () => void
  ) {
    if (!this.synth) return;
    this.synth.cancel(); // Stop any ongoing speech

    // Clean markdown formatting for clean vocal output
    const cleanText = text
      .replace(/[*#_~`]/g, '')
      .replace(/\[TASK QUEUED\]|\[MEMORY STORED\]/gi, '')
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = lang;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    if (onStart) utterance.onstart = onStart;
    if (onEnd) utterance.onend = onEnd;

    // Load available voices
    const voices = this.synth.getVoices();
    const voice = voices.find(
      (v) =>
        v.lang.startsWith('en') ||
        v.lang.startsWith('ur') ||
        v.lang.startsWith('hi')
    );
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
    onError: (err: string) => void,
    lang = 'en-US'
  ) {
    if (!this.isRecognitionSupported()) {
      onError('Speech recognition is not supported in this browser');
      return null;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = lang; // Defaults to en-US or ur-PK

      this.recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          onResult(finalTranscript);
        }
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

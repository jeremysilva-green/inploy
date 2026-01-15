/**
 * Text-to-Speech Service
 * Uses Web Speech API for free, browser-native voice greetings
 */

export class TTSService {
  private synthesis: SpeechSynthesis | null = null;
  private isSupported: boolean = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
      this.isSupported = true;
    }
  }

  /**
   * Check if TTS is supported in the browser
   */
  isAvailable(): boolean {
    return this.isSupported && this.synthesis !== null;
  }

  /**
   * Speak text with specified language
   *
   * @param text - Text to speak
   * @param lang - Language code (default: Spanish for Paraguay)
   * @param options - Voice options
   */
  async speak(
    text: string,
    lang: string = 'es-ES',
    options?: {
      rate?: number;
      pitch?: number;
      volume?: number;
    }
  ): Promise<void> {
    if (!this.isAvailable()) {
      console.warn('TTS not supported in this browser');
      return;
    }

    return new Promise((resolve, reject) => {
      try {
        // Cancel any ongoing speech
        this.synthesis!.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = options?.rate ?? 1.0;
        utterance.pitch = options?.pitch ?? 1.0;
        utterance.volume = options?.volume ?? 1.0;

        utterance.onend = () => resolve();
        utterance.onerror = (event) => {
          console.error('TTS error:', event);
          reject(event);
        };

        this.synthesis!.speak(utterance);
      } catch (error) {
        console.error('TTS speak error:', error);
        reject(error);
      }
    });
  }

  /**
   * Welcome an employer with a randomized greeting
   *
   * @param employerName - Employer's first name
   */
  async welcomeEmployer(employerName: string): Promise<void> {
    const greetings = [
      `Bienvenido ${employerName}`,
      `Buenos días ${employerName}`,
      `Hola ${employerName}, que tengas un buen día`,
      `Buen día ${employerName}`,
      `¡Hola ${employerName}! Bienvenido`,
    ];

    const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];

    try {
      await this.speak(randomGreeting, 'es-ES', {
        rate: 0.9, // Slightly slower for clarity
        pitch: 1.0,
        volume: 1.0,
      });
    } catch (error) {
      console.error('Failed to play welcome greeting:', error);
    }
  }

  /**
   * Stop any ongoing speech
   */
  stop(): void {
    if (this.isAvailable()) {
      this.synthesis!.cancel();
    }
  }

  /**
   * Pause ongoing speech
   */
  pause(): void {
    if (this.isAvailable()) {
      this.synthesis!.pause();
    }
  }

  /**
   * Resume paused speech
   */
  resume(): void {
    if (this.isAvailable()) {
      this.synthesis!.resume();
    }
  }

  /**
   * Get available voices
   */
  getVoices(): SpeechSynthesisVoice[] {
    if (!this.isAvailable()) {
      return [];
    }
    return this.synthesis!.getVoices();
  }

  /**
   * Get Spanish voices specifically
   */
  getSpanishVoices(): SpeechSynthesisVoice[] {
    return this.getVoices().filter((voice) => voice.lang.startsWith('es'));
  }
}

// Singleton instance
export const ttsService = new TTSService();

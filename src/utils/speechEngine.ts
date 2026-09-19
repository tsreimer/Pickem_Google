// Robust Web Speech Synthesis Engine
// Handles Chrome / Safari / Edge iframe quirks:
// 1. Asynchronous cancel() flush delay
// 2. Chrome 15-second speech stall bug via active keep-alive
// 3. Sentence-by-sentence streaming with real-time transcript sync
// 4. Persona-tailored voice selection (Male for Sal/Commish, Female for Chloe)

export interface SpeechEngineOptions {
  speaker?: 'sal' | 'chloe' | 'commish' | 'recap' | 'cohost';
  rate?: number;
  pitch?: number;
  volume?: number;
  onStart?: () => void;
  onSentenceChange?: (sentenceIndex: number, currentSentence: string, totalSentences: number) => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

class SpeechEngine {
  private currentSentences: string[] = [];
  private currentSentenceIndex: number = 0;
  private isCurrentlyActive: boolean = false;
  private isCurrentlyPaused: boolean = false;
  private keepAliveTimer: number | null = null;
  private activeOptions: SpeechEngineOptions | null = null;
  private voices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.loadVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        this.loadVoices();
      };
    }
  }

  private loadVoices() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.voices = window.speechSynthesis.getVoices() || [];
    }
  }

  public getVoices(): SpeechSynthesisVoice[] {
    if (this.voices.length === 0) {
      this.loadVoices();
    }
    return this.voices;
  }

  public getBestVoice(speaker: 'sal' | 'chloe' | 'commish' | 'recap' | 'cohost' = 'sal'): SpeechSynthesisVoice | null {
    const allVoices = this.getVoices();
    if (!allVoices || allVoices.length === 0) return null;

    const englishVoices = allVoices.filter(v => v.lang.startsWith('en'));
    const pool = englishVoices.length > 0 ? englishVoices : allVoices;

    if (speaker === 'chloe' || speaker === 'cohost') {
      // Look for natural female English voice
      const female = pool.find(v =>
        /(female|zira|samantha|karen|victoria|moira|fiona|ava|serena|jenny)/i.test(v.name)
      );
      if (female) return female;
    } else {
      // Look for natural male English voice
      const male = pool.find(v =>
        /(male|david|daniel|george|oliver|guy|alex|tom|fred)/i.test(v.name)
      );
      if (male) return male;
    }

    return pool[0] || null;
  }

  public speakScript(text: string, options: SpeechEngineOptions = {}) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.warn('SpeechSynthesis is not supported in this browser environment.');
      if (options.onError) options.onError(new Error('SpeechSynthesis not supported'));
      return;
    }

    this.stop();

    // Clean and split text into complete spoken sentences
    const cleanText = text.replace(/\[.*?\]/g, '').trim();
    const rawSentences = cleanText.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g) || [cleanText];
    this.currentSentences = rawSentences.map(s => s.trim()).filter(s => s.length > 0);
    this.currentSentenceIndex = 0;
    this.activeOptions = options;
    this.isCurrentlyActive = true;
    this.isCurrentlyPaused = false;

    if (this.currentSentences.length === 0) {
      this.stop();
      return;
    }

    // Chrome bug workaround: cancel() is async; brief timeout prevents dropping the next speech
    setTimeout(() => {
      if (!this.isCurrentlyActive) return;
      this.startKeepAlive();
      if (options.onStart) options.onStart();
      this.speakCurrentSentence();
    }, 60);
  }

  private speakCurrentSentence() {
    if (!this.isCurrentlyActive || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    if (this.currentSentenceIndex >= this.currentSentences.length) {
      this.stop();
      if (this.activeOptions?.onEnd) {
        this.activeOptions.onEnd();
      }
      return;
    }

    const sentence = this.currentSentences[this.currentSentenceIndex];
    if (this.activeOptions?.onSentenceChange) {
      this.activeOptions.onSentenceChange(
        this.currentSentenceIndex,
        sentence,
        this.currentSentences.length
      );
    }

    const utterance = new SpeechSynthesisUtterance(sentence);
    const speaker = this.activeOptions?.speaker || 'sal';
    const voice = this.getBestVoice(speaker);
    if (voice) {
      utterance.voice = voice;
    }

    // Pitch & rate tuning based on persona
    const rateMultiplier = this.activeOptions?.rate || 1.0;
    if (speaker === 'sal') {
      utterance.pitch = this.activeOptions?.pitch ?? 0.8;
      utterance.rate = 0.96 * rateMultiplier;
    } else if (speaker === 'chloe') {
      utterance.pitch = this.activeOptions?.pitch ?? 1.18;
      utterance.rate = 1.05 * rateMultiplier;
    } else {
      utterance.pitch = this.activeOptions?.pitch ?? 0.98;
      utterance.rate = 1.02 * rateMultiplier;
    }

    if (this.activeOptions?.volume !== undefined) {
      utterance.volume = this.activeOptions.volume;
    }

    utterance.onend = () => {
      if (!this.isCurrentlyActive || this.isCurrentlyPaused) return;
      this.currentSentenceIndex++;
      // Brief pause between sentences for natural breathing
      setTimeout(() => {
        this.speakCurrentSentence();
      }, 70);
    };

    utterance.onerror = (e) => {
      // Ignored non-fatal cancellations
      if (e.error === 'canceled' || e.error === 'interrupted') {
        return;
      }
      console.warn('SpeechSynthesis sentence error:', e.error);
      if (this.isCurrentlyActive) {
        // Attempt next sentence if one failed
        this.currentSentenceIndex++;
        setTimeout(() => {
          this.speakCurrentSentence();
        }, 80);
      }
    };

    window.speechSynthesis.speak(utterance);
  }

  // Workaround for Chrome's 15-second speech synthesis pause bug
  private startKeepAlive() {
    this.stopKeepAlive();
    this.keepAliveTimer = window.setInterval(() => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        }
      }
    }, 7500);
  }

  private stopKeepAlive() {
    if (this.keepAliveTimer) {
      clearInterval(this.keepAliveTimer);
      this.keepAliveTimer = null;
    }
  }

  public pause() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.isCurrentlyPaused = true;
      window.speechSynthesis.pause();
    }
  }

  public resume() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.isCurrentlyPaused = false;
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      } else if (this.isCurrentlyActive) {
        this.speakCurrentSentence();
      }
    }
  }

  public stop() {
    this.isCurrentlyActive = false;
    this.isCurrentlyPaused = false;
    this.stopKeepAlive();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  public seekToSentence(sentenceIndex: number) {
    if (sentenceIndex >= 0 && sentenceIndex < this.currentSentences.length) {
      this.currentSentenceIndex = sentenceIndex;
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setTimeout(() => {
        if (this.isCurrentlyActive) {
          this.speakCurrentSentence();
        }
      }, 50);
    }
  }

  public isActive(): boolean {
    return this.isCurrentlyActive;
  }

  public isPaused(): boolean {
    return this.isCurrentlyPaused;
  }

  public getCurrentSentenceIndex(): number {
    return this.currentSentenceIndex;
  }

  public getTotalSentences(): number {
    return this.currentSentences.length;
  }
}

export const speechEngine = new SpeechEngine();

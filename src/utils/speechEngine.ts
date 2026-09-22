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

export interface DialogueTurnItem {
  speaker: string;
  text: string;
  stageDirection?: string;
}

export interface MultiSpeakerSpeechOptions {
  speaker1Name?: string;
  speaker2Name?: string;
  speaker1Voice?: string;
  speaker2Voice?: string;
  styleId?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  onStart?: () => void;
  onTurnChange?: (turnIndex: number, currentTurn: DialogueTurnItem, totalTurns: number) => void;
  onSentenceChange?: (sentenceIndex: number, currentSentence: string, totalSentences: number) => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

class SpeechEngine {
  private currentSentences: Array<{ text: string; speakerName: string; isSpeaker2: boolean }> = [];
  private currentSentenceIndex: number = 0;
  private isCurrentlyActive: boolean = false;
  private isCurrentlyPaused: boolean = false;
  private keepAliveTimer: number | null = null;
  private activeOptions: SpeechEngineOptions | null = null;
  private activeMultiOptions: MultiSpeakerSpeechOptions | null = null;
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

  public getBestVoice(speaker: 'sal' | 'chloe' | 'commish' | 'recap' | 'cohost' = 'sal', voiceNamePreference?: string): SpeechSynthesisVoice | null {
    const allVoices = this.getVoices();
    if (!allVoices || allVoices.length === 0) return null;

    const englishVoices = allVoices.filter(v => v.lang.startsWith('en'));
    const pool = englishVoices.length > 0 ? englishVoices : allVoices;

    if (speaker === 'chloe' || speaker === 'cohost') {
      // Look for natural female English voice
      const female = pool.find(v =>
        /(female|zira|samantha|karen|victoria|moira|fiona|ava|serena|jenny|cortana)/i.test(v.name)
      );
      if (female) return female;
    } else {
      // Look for natural male English voice
      const male = pool.find(v =>
        /(male|david|daniel|george|oliver|guy|alex|tom|fred|natural.*male)/i.test(v.name)
      );
      if (male) return male;
    }

    return pool[0] || null;
  }

  // Speak multi-turn dialogue with alternating voices and debate cadence
  public speakDialogue(turns: DialogueTurnItem[], options: MultiSpeakerSpeechOptions = {}) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.warn('SpeechSynthesis is not supported in this browser environment.');
      if (options.onError) options.onError(new Error('SpeechSynthesis not supported'));
      return;
    }

    this.stop();
    this.activeMultiOptions = options;
    this.activeOptions = null;

    const sentences: Array<{ text: string; speakerName: string; isSpeaker2: boolean }> = [];
    const s1Name = (options.speaker1Name || 'Sal').toLowerCase();

    turns.forEach((turn) => {
      const isSpeaker2 = !turn.speaker.toLowerCase().includes(s1Name);
      const cleanText = turn.text
        .replace(/\[(?:pause|dramatic pause|long pause|short pause)\]/gi, ', ')
        .replace(/\[.*?\]/g, '')
        .replace(/\(.*?\)/g, '')
        .replace(/\s{2,}/g, ' ')
        .trim();

      const turnSentences = cleanText.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g) || [cleanText];
      turnSentences.forEach((s) => {
        const trimmed = s.trim();
        if (trimmed.length > 0) {
          sentences.push({
            text: trimmed,
            speakerName: turn.speaker,
            isSpeaker2,
          });
        }
      });
    });

    this.currentSentences = sentences;
    this.currentSentenceIndex = 0;
    this.isCurrentlyActive = true;
    this.isCurrentlyPaused = false;

    if (this.currentSentences.length === 0) {
      this.stop();
      return;
    }

    setTimeout(() => {
      if (!this.isCurrentlyActive) return;
      this.startKeepAlive();
      if (options.onStart) options.onStart();
      this.speakCurrentSentence();
    }, 60);
  }

  public speakScript(text: string, options: SpeechEngineOptions = {}) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.warn('SpeechSynthesis is not supported in this browser environment.');
      if (options.onError) options.onError(new Error('SpeechSynthesis not supported'));
      return;
    }

    this.stop();
    this.activeOptions = options;
    this.activeMultiOptions = null;

    // Clean and split text into complete spoken sentences for Web Speech Synthesis
    const cleanText = text
      .replace(/\[(?:pause|dramatic pause|long pause|short pause)\]/gi, ', ')
      .replace(/\[.*?\]/g, '')
      .replace(/\(.*?\)/g, '')
      .replace(/\s{2,}/g, ' ')
      .trim();
    const rawSentences = cleanText.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g) || [cleanText];
    this.currentSentences = rawSentences
      .map(s => s.trim())
      .filter(s => s.length > 0)
      .map(s => ({
        text: s,
        speakerName: options.speaker || 'Sal',
        isSpeaker2: options.speaker === 'chloe' || options.speaker === 'cohost',
      }));

    this.currentSentenceIndex = 0;
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
      if (this.activeMultiOptions?.onEnd) {
        this.activeMultiOptions.onEnd();
      } else if (this.activeOptions?.onEnd) {
        this.activeOptions.onEnd();
      }
      return;
    }

    const item = this.currentSentences[this.currentSentenceIndex];
    if (this.activeMultiOptions?.onSentenceChange) {
      this.activeMultiOptions.onSentenceChange(
        this.currentSentenceIndex,
        item.text,
        this.currentSentences.length
      );
    } else if (this.activeOptions?.onSentenceChange) {
      this.activeOptions.onSentenceChange(
        this.currentSentenceIndex,
        item.text,
        this.currentSentences.length
      );
    }

    const utterance = new SpeechSynthesisUtterance(item.text);

    // Multi-Speaker Voice Selection
    if (this.activeMultiOptions) {
      const isS2 = item.isSpeaker2;
      const voicePref = isS2 ? this.activeMultiOptions.speaker2Voice : this.activeMultiOptions.speaker1Voice;
      const voice = this.getBestVoice(isS2 ? 'chloe' : 'sal', voicePref);
      if (voice) utterance.voice = voice;

      // Apply Debate Cadence Style adjustments
      const styleId = this.activeMultiOptions.styleId || 'rapid_crossfire';
      let cadenceRateMult = 1.0;
      let cadencePitchAdj = 0;

      if (styleId === 'score_radio') {
        cadenceRateMult = 1.25;
        cadencePitchAdj = 0.15;
      } else if (styleId === 'blues') {
        cadenceRateMult = 0.86;
        cadencePitchAdj = -0.15;
      } else if (styleId === 'celebratory_85') {
        cadenceRateMult = 1.1;
        cadencePitchAdj = 0.08;
      } else {
        cadenceRateMult = 1.12;
      }

      // Gemini Voice Profile simulation in Web Speech
      if (isS2) {
        // Speaker 2 (Chloe/Kore or Puck/Zephyr)
        if (voicePref === 'Puck') {
          utterance.pitch = Math.min(2.0, (1.25 + cadencePitchAdj));
          utterance.rate = Math.min(2.0, 1.18 * cadenceRateMult);
        } else if (voicePref === 'Charon') {
          utterance.pitch = Math.max(0.4, (0.7 + cadencePitchAdj));
          utterance.rate = 0.95 * cadenceRateMult;
        } else if (voicePref === 'Zephyr') {
          utterance.pitch = Math.min(1.8, (1.05 + cadencePitchAdj));
          utterance.rate = 1.05 * cadenceRateMult;
        } else {
          // Kore / Aoede female
          utterance.pitch = Math.min(2.0, (1.2 + cadencePitchAdj));
          utterance.rate = 1.05 * cadenceRateMult;
        }
      } else {
        // Speaker 1 (Sal/Fenrir or Zephyr/Charon)
        if (voicePref === 'Zephyr') {
          utterance.pitch = Math.min(1.8, (1.0 + cadencePitchAdj));
          utterance.rate = 1.05 * cadenceRateMult;
        } else if (voicePref === 'Puck') {
          utterance.pitch = Math.min(2.0, (1.2 + cadencePitchAdj));
          utterance.rate = 1.15 * cadenceRateMult;
        } else if (voicePref === 'Charon') {
          utterance.pitch = Math.max(0.3, (0.65 + cadencePitchAdj));
          utterance.rate = 0.92 * cadenceRateMult;
        } else {
          // Fenrir baritone
          utterance.pitch = Math.max(0.4, (0.78 + cadencePitchAdj));
          utterance.rate = 0.96 * cadenceRateMult;
        }
      }
    } else {
      const speaker = this.activeOptions?.speaker || 'sal';
      const voice = this.getBestVoice(speaker);
      if (voice) utterance.voice = voice;

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
    }

    utterance.onend = () => {
      if (!this.isCurrentlyActive || this.isCurrentlyPaused) return;
      this.currentSentenceIndex++;
      setTimeout(() => {
        this.speakCurrentSentence();
      }, 70);
    };

    utterance.onerror = (e) => {
      if (e.error === 'canceled' || e.error === 'interrupted') {
        return;
      }
      console.warn('SpeechSynthesis sentence error:', e.error);
      if (this.isCurrentlyActive) {
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

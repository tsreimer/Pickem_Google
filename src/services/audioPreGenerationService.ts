// Audio Pre-Generation Service
// Calculates initial strategist briefings for logged-in users on load
// and manages cached WAV buffers for zero-wait instant audio playback.

export interface CalculatedBriefing {
  teamId: string;
  teamName: string;
  ownerName: string;
  rank: number;
  points: number;
  maxRemaining: number;
  anchorsIntact: number;
  damageGrade: string;
  speaker: 'sal' | 'chloe' | 'commish';
  title: string;
  headline: string;
  script: string;
  stageDirections: string;
  tacticalPointers: string[];
  audioUrl?: string | null;
  wavStreamUrl?: string | null;
  hasNeuralAudio: boolean;
  fallbackToSpeechSynthesis: boolean;
  durationSeconds: number;
  pregeneratedAt: string;
  format?: string;
}

class AudioPreGenerationService {
  private cache: Map<string, CalculatedBriefing> = new Map();
  private audioInstances: Map<string, HTMLAudioElement> = new Map();
  private inFlightRequests: Map<string, Promise<CalculatedBriefing | null>> = new Map();
  private listeners: Set<(teamId: string, speaker: string, briefing: CalculatedBriefing) => void> = new Set();

  private getCacheKey(teamId: string, speaker: string): string {
    return `${teamId}-${speaker}`;
  }

  // Subscribe to pre-generation completions
  public onBriefingReady(callback: (teamId: string, speaker: string, briefing: CalculatedBriefing) => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  // Check if briefing WAV is already pre-generated in cache
  public isReady(teamId: string, speaker: 'sal' | 'chloe' | 'commish'): boolean {
    return this.cache.has(this.getCacheKey(teamId, speaker));
  }

  // Retrieve cached briefing if available
  public getCachedBriefing(teamId: string, speaker: 'sal' | 'chloe' | 'commish'): CalculatedBriefing | null {
    return this.cache.get(this.getCacheKey(teamId, speaker)) || null;
  }

  // Get pre-loaded HTMLAudioElement ready for instant zero-wait playback
  public getPreloadedAudio(teamId: string, speaker: 'sal' | 'chloe' | 'commish'): HTMLAudioElement | null {
    return this.audioInstances.get(this.getCacheKey(teamId, speaker)) || null;
  }

  // Pre-generate briefing and cache WAV on app load for the logged-in user
  public async pregenerateBriefing(
    teamId: string = 'team-todd',
    speaker: 'sal' | 'chloe' | 'commish' = 'sal',
    customScript?: string,
    customStageDirections?: string,
    customHeadline?: string,
    customTitle?: string
  ): Promise<CalculatedBriefing | null> {
    const key = this.getCacheKey(teamId, speaker);

    if (this.cache.has(key) && !customScript) {
      return this.cache.get(key)!;
    }

    if (this.inFlightRequests.has(key)) {
      return this.inFlightRequests.get(key)!;
    }

    const requestPromise = (async () => {
      try {
        const res = await fetch('/api/audio/pregenerate-briefing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            teamId,
            speaker,
            script: customScript,
            stageDirections: customStageDirections,
            headline: customHeadline,
            title: customTitle,
          }),
        });

        if (!res.ok) {
          throw new Error(`Server responded with ${res.status}`);
        }

        const data = await res.json();
        if (data.success && data.briefing) {
          const briefing: CalculatedBriefing = {
            teamId,
            teamName: data.briefing.teamName,
            ownerName: data.briefing.ownerName,
            rank: data.briefing.rank,
            points: data.briefing.points,
            maxRemaining: data.briefing.maxRemaining,
            anchorsIntact: data.briefing.anchorsIntact,
            damageGrade: data.briefing.damageGrade,
            speaker,
            title: data.briefing.title,
            headline: data.briefing.headline,
            script: data.briefing.script,
            stageDirections: data.briefing.stageDirections,
            tacticalPointers: data.briefing.tacticalPointers || [],
            audioUrl: data.audioUrl || null,
            wavStreamUrl: data.wavStreamUrl || null,
            hasNeuralAudio: Boolean(data.hasNeuralAudio && data.audioUrl),
            fallbackToSpeechSynthesis: Boolean(data.fallbackToSpeechSynthesis || !data.hasNeuralAudio),
            durationSeconds: data.durationSeconds || 38,
            pregeneratedAt: data.pregeneratedAt || new Date().toISOString(),
            format: data.hasNeuralAudio ? 'Gemini Neural WAV' : 'Web Speech Engine',
          };

          this.cache.set(key, briefing);

          // Pre-buffer HTMLAudioElement in memory ONLY if real neural audio exists
          if (typeof window !== 'undefined' && briefing.hasNeuralAudio && briefing.audioUrl) {
            const audio = new Audio();
            audio.preload = 'auto';
            audio.src = briefing.audioUrl;
            audio.load();
            this.audioInstances.set(key, audio);
          }

          // Notify listeners
          this.listeners.forEach(cb => cb(teamId, speaker, briefing));

          return briefing;
        }
        return null;
      } catch (err) {
        console.warn(`[AudioPreGen] Failed to pregenerate briefing for ${teamId}-${speaker}:`, err);
        return null;
      } finally {
        this.inFlightRequests.delete(key);
      }
    })();

    this.inFlightRequests.set(key, requestPromise);
    return requestPromise;
  }

  // Pre-load all available commentators for the logged-in user in background
  public async pregenerateAllSpeakersForUser(teamId: string = 'team-todd'): Promise<void> {
    // Priority: Coach Sal first (default strategist)
    await this.pregenerateBriefing(teamId, 'sal');
    // In background, pre-generate Chloe & Commish
    this.pregenerateBriefing(teamId, 'chloe').catch(() => {});
    this.pregenerateBriefing(teamId, 'commish').catch(() => {});
  }

  // Explicitly trigger Gemini 3.1 Flash Neural TTS synthesis for a team briefing
  public async synthesizeBriefingWithGemini(
    teamId: string = 'team-todd',
    speaker: 'sal' | 'chloe' | 'commish' = 'sal',
    force: boolean = false
  ): Promise<CalculatedBriefing | null> {
    const key = this.getCacheKey(teamId, speaker);
    try {
      const res = await fetch('/api/audio/synthesize-briefing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId, speaker, force }),
      });
      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }
      const data = await res.json();
      const existing = this.cache.get(key);

      if (data.hasNeuralAudio && data.audioUrl) {
        const updated: CalculatedBriefing = {
          teamId,
          teamName: existing?.teamName || 'Team',
          ownerName: existing?.ownerName || 'Manager',
          rank: existing?.rank || 1,
          points: existing?.points || 0,
          maxRemaining: existing?.maxRemaining || 127,
          anchorsIntact: existing?.anchorsIntact || 7,
          damageGrade: existing?.damageGrade || 'A',
          speaker,
          title: existing?.title || 'Strategy Briefing',
          headline: existing?.headline || 'Directives',
          script: existing?.script || '',
          stageDirections: existing?.stageDirections || '',
          tacticalPointers: existing?.tacticalPointers || [],
          audioUrl: data.audioUrl,
          hasNeuralAudio: true,
          fallbackToSpeechSynthesis: false,
          durationSeconds: data.durationSeconds || existing?.durationSeconds || 32,
          pregeneratedAt: new Date().toISOString(),
          format: 'Gemini Neural WAV',
        };

        this.cache.set(key, updated);

        if (typeof window !== 'undefined') {
          const audio = new Audio();
          audio.preload = 'auto';
          audio.src = data.audioUrl;
          audio.load();
          this.audioInstances.set(key, audio);
        }

        this.listeners.forEach(cb => cb(teamId, speaker, updated));
        return updated;
      }
      return null;
    } catch (err) {
      console.warn(`[AudioPreGen] Synthesis failed for ${teamId}-${speaker}:`, err);
      return null;
    }
  }
}

export const audioPreGenerationService = new AudioPreGenerationService();

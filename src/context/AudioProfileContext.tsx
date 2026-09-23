import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { TtsAudioProfile, formatTtsPromptPayload } from '../types';

interface AudioProfileContextType {
  profile: TtsAudioProfile;
  currentModel: string;
  isLoading: boolean;
  saveStatus: 'saving' | 'saved' | 'error' | null;
  saveProfile: (updatedProfile: TtsAudioProfile) => Promise<boolean>;
  refreshProfile: () => Promise<void>;
  resetToDefault: () => Promise<void>;
  primaryHost: {
    speaker: string;
    voiceName: string;
    roleContext: string;
    avatar: string;
    title: string;
  };
  coHost: {
    speaker: string;
    voiceName: string;
    roleContext: string;
    avatar: string;
    title: string;
  };
}

const DEFAULT_PROFILE: TtsAudioProfile = {
  id: 'profile-halsted-war-room',
  name: 'Halsted & Ivy Gridiron War Room',
  title: '4th Quarter Confidence Sweat & Live Audit',
  sceneTitle: "Vito & Sal's Broadcast Studio Booth",
  sceneDescription: 'Inside the laminate studio booth on 35th and Halsted in Chicago. Neon Old Style clock humming, smell of hot giardiniera and dipped au jus, CTA Orange Line rumbling outside.',
  directorsNotes: {
    style: 'Enthusiastic, passionate sports radio debate between a gravelly veteran coach and an articulate MIT sports analyst.',
    pace: 'Rapid-fire, punchy tempo with dramatic pauses before key scoring lines and high-stakes point tallies.',
    accent: 'Authentic Chicago sports radio baritone paired with crisp articulate analytical delivery.'
  },
  sampleContext: 'Coach Sal Ditkofsky (61, Chicago beef stand owner, 1985 Bears superfan) and Dr. Chloe Vance (28, MIT Sloan analytics director). Coach Sal trusts grit, trench play, and gut instinct. Dr. Chloe trusts Expected Points Added (EPA), Bayesian probability distributions, and Game Theory Optimal allocations.',
  transcript: 'Sal: [clears throat] Welcome back to the Gridiron War Room on 35th and Halsted! Look at this board, Chloe! Eleven out of twelve managers in the Initech Invitational got their teeth kicked in by the Niners upset!\nChloe: [chuckles] Sal, you call it an upset, but our Bayesian model had Kyle Shanahan with a 41.2% underdog variance edge. Matthew Stafford took four sacks.\nSal: [banging desk] Forget the Monte Carlo regression! You do NOT put fourteen points on a banged-up offensive line! That is confidence pool suicide!\nChloe: [fast paced] The math was solid based on closing line value, Sal. The real carnage was the high-leverage tiebreaker.\nSal: That ain\'t math, Chloe—that\'s just heartbreak dipped in au jus! Let\'s break down Week 3!',
  isMultiSpeaker: true,
  speakerConfigs: [
    {
      speaker: 'Coach Sal',
      voiceName: 'Fenrir',
      roleContext: 'Passionate veteran coach, gravelly Ditka swagger, blunt accountability',
      avatar: '🥩'
    },
    {
      speaker: 'Dr. Chloe',
      voiceName: 'Kore',
      roleContext: 'MIT Sloan Analytics Director, sharp, witty, data-driven',
      avatar: '📊'
    }
  ],
  hostTitle: 'Host & Gridiron Strategist',
  coHostTitle: 'Chief Analytics Director',
  icon: '🎙️'
};

const AudioProfileContext = createContext<AudioProfileContextType | undefined>(undefined);

export const AudioProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<TtsAudioProfile>(() => {
    try {
      const stored = localStorage.getItem('commissioner_active_profile');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Ignore JSON parse errors
    }
    return DEFAULT_PROFILE;
  });

  const [currentModel, setCurrentModel] = useState<string>('gemini-3.8-flash-tts');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<'saving' | 'saved' | 'error' | null>(null);

  // Sync profile from backend on mount and define refresh
  const refreshProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/commissioner/tts-profile');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.activeProfile) {
          setProfile(data.activeProfile);
          if (data.currentModel) {
            setCurrentModel(data.currentModel);
          }
          try {
            localStorage.setItem('commissioner_active_profile', JSON.stringify(data.activeProfile));
          } catch {
            // Ignore quota errors
          }
        }
      }
    } catch (err) {
      console.warn('[AudioProfileContext] Failed to load server profile:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProfile();

    // Listen for cross-component and cross-tab updates
    const handleCustomUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<TtsAudioProfile>;
      if (customEvent.detail) {
        setProfile(customEvent.detail);
      }
    };

    const handleStorageUpdate = (e: StorageEvent) => {
      if (e.key === 'commissioner_active_profile' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setProfile(parsed);
        } catch {
          // Ignore
        }
      }
    };

    window.addEventListener('commissioner_profile_updated', handleCustomUpdate);
    window.addEventListener('storage', handleStorageUpdate);

    return () => {
      window.removeEventListener('commissioner_profile_updated', handleCustomUpdate);
      window.removeEventListener('storage', handleStorageUpdate);
    };
  }, [refreshProfile]);

  // Save profile to backend & broadcast
  const saveProfile = async (updatedProfile: TtsAudioProfile): Promise<boolean> => {
    try {
      setSaveStatus('saving');
      setProfile(updatedProfile);

      // Save to localStorage immediately
      try {
        localStorage.setItem('commissioner_active_profile', JSON.stringify(updatedProfile));
        localStorage.setItem('commissioner_active_preset_id', updatedProfile.id);
        
        // Also map to legacy Watercooler keys if needed for compatibility
        const spk1 = updatedProfile.speakerConfigs?.[0];
        const spk2 = updatedProfile.speakerConfigs?.[1];
        if (spk1?.voiceName) localStorage.setItem('watercooler_voice1', spk1.voiceName);
        if (spk2?.voiceName) localStorage.setItem('watercooler_voice2', spk2.voiceName);
      } catch {
        // Ignore
      }

      // Broadcast event so all components react immediately
      window.dispatchEvent(
        new CustomEvent('commissioner_profile_updated', { detail: updatedProfile })
      );

      const res = await fetch('/api/commissioner/tts-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: updatedProfile }),
      });

      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();

      if (data.success) {
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus(null), 3500);
        return true;
      } else {
        setSaveStatus('error');
        return false;
      }
    } catch (err) {
      console.error('[AudioProfileContext] Save failed:', err);
      setSaveStatus('error');
      return false;
    }
  };

  const resetToDefault = async () => {
    try {
      setSaveStatus('saving');
      const res = await fetch('/api/commissioner/tts-profile/reset', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          setProfile(data.profile);
          localStorage.setItem('commissioner_active_profile', JSON.stringify(data.profile));
          window.dispatchEvent(
            new CustomEvent('commissioner_profile_updated', { detail: data.profile })
          );
        }
      }
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch {
      setSaveStatus('error');
    }
  };

  const spk1 = profile.speakerConfigs?.[0] || DEFAULT_PROFILE.speakerConfigs[0];
  const spk2 = profile.speakerConfigs?.[1] || DEFAULT_PROFILE.speakerConfigs[1];

  const primaryHost = {
    speaker: spk1.speaker || 'Coach Sal',
    voiceName: spk1.voiceName || 'Fenrir',
    roleContext: spk1.roleContext || 'Host & Gridiron Strategist',
    avatar: spk1.avatar || '🥩',
    title: profile.hostTitle || 'Host & Gridiron Strategist'
  };

  const coHost = {
    speaker: spk2.speaker || 'Dr. Chloe',
    voiceName: spk2.voiceName || 'Kore',
    roleContext: spk2.roleContext || 'Chief Analytics Director',
    avatar: spk2.avatar || '📊',
    title: profile.coHostTitle || 'Chief Analytics Director'
  };

  return (
    <AudioProfileContext.Provider
      value={{
        profile,
        currentModel,
        isLoading,
        saveStatus,
        saveProfile,
        refreshProfile,
        resetToDefault,
        primaryHost,
        coHost,
      }}
    >
      {children}
    </AudioProfileContext.Provider>
  );
};

export const useAudioProfile = (): AudioProfileContextType => {
  const context = useContext(AudioProfileContext);
  if (!context) {
    throw new Error('useAudioProfile must be used within an AudioProfileProvider');
  }
  return context;
};

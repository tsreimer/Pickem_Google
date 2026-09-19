import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { getPickerAdviceProfile, getPickerSpeakerAdvice } from "./src/data/pickerAdviceData";
import { getTeamSeasonAccuracy, LEAGUE_SEASON_BENCHMARKS } from "./src/data/seasonAccuracyData";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini client lazily/safely
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    geminiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return geminiClient;
}

// API Routes
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Sync status endpoint matching Section 2.0 Ingestion Engine
app.get("/api/sync/status", (req, res) => {
  res.json({
    leagueId: "13003",
    leagueUrl: "https://football.fantasysports.yahoo.com/pickem/13003",
    leagueName: "Yahoo Pro Football Pick'em (Group #13003)",
    status: "active",
    services: [
      { name: "sync_odds.py", target: "The Odds API", status: "active", cadence: "Tue / Thu 12:00 PM", lastRun: "24m ago" },
      { name: "sync_picks.py", target: "Playwright + Yahoo Group 13003", status: "locked", cadence: "Thu 7:00 & 8:15 PM", lastRun: "Thu 8:15 PM" },
      { name: "sync_live.py", target: "ESPN Live API", status: "streaming", cadence: "Sun 1:00 – 7:30 PM (3m cron)", lastRun: "12s ago" },
      { name: "solve_clinch.py", target: "Game Tree Engine", status: "ready", cadence: "Sun 7:45 PM", lastRun: "Sun 7:45 PM" },
      { name: "solve_pivots.py", target: "Nash Matrix Solver", status: "ready", cadence: "Mon 6:00 PM", lastRun: "Mon 6:00 PM" },
      { name: "generate_media.py", target: "LLM + Audio Synth", status: "ready", cadence: "Tue 2:00 AM", lastRun: "Tue 2:00 AM" },
    ],
  });
});

// Live NFL Scoreboard Feed via ESPN public API
app.get("/api/nfl/live", async (req, res) => {
  try {
    const espnRes = await fetch("https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard", {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) NFL-Pickem-Engine/1.0" },
    });

    if (!espnRes.ok) {
      throw new Error(`ESPN API returned ${espnRes.status}`);
    }

    const data: any = await espnRes.json();
    const weekNumber = data.week?.number || 1;
    const seasonYear = data.season?.year || 2026;
    const events = Array.isArray(data.events) ? data.events : [];

    const formattedGames = events.map((event: any, index: number) => {
      const competition = event.competitions?.[0] || {};
      const competitors = Array.isArray(competition.competitors) ? competition.competitors : [];
      const home = competitors.find((c: any) => c.homeAway === "home") || {};
      const away = competitors.find((c: any) => c.homeAway === "away") || {};

      const homeTeam = home.team?.displayName || "Home Team";
      const homeTeamCode = home.team?.abbreviation || "HOM";
      const homeTeamRecord = home.records?.[0]?.summary || "0-0";
      const homeScore = parseInt(home.score || "0", 10);

      const awayTeam = away.team?.displayName || "Away Team";
      const awayTeamCode = away.team?.abbreviation || "AWY";
      const awayTeamRecord = away.records?.[0]?.summary || "0-0";
      const awayScore = parseInt(away.score || "0", 10);

      const statusType = event.status?.type?.name || "STATUS_SCHEDULED";
      let status: "scheduled" | "in_progress" | "final" = "scheduled";
      if (statusType === "STATUS_FINAL" || statusType === "STATUS_FINAL_OVERTIME") {
        status = "final";
      } else if (statusType === "STATUS_IN_PROGRESS" || statusType === "STATUS_HALFTIME") {
        status = "in_progress";
      }

      const clock = event.status?.displayClock || "00:00";
      const period = event.status?.period || 1;
      const quarter = status === "final" ? "FINAL" : status === "in_progress" ? `Q${period}` : event.status?.type?.detail || "Scheduled";

      const odds = competition.odds?.[0] || {};
      const spreadString = odds.details || `${homeTeamCode} -3.5`;
      const overUnder = odds.overUnder || 45.5;

      const scoreDiff = Math.abs(homeScore - awayScore);
      const isSweatGame = (status === "in_progress" && period >= 4 && scoreDiff <= 8) || index === 0;

      return {
        id: `espn-${event.id || index + 1}`,
        seasonYear,
        weekNumber,
        homeTeam,
        homeTeamCode,
        homeTeamRecord,
        awayTeam,
        awayTeamCode,
        awayTeamRecord,
        kickoffTime: event.date || new Date().toISOString(),
        status,
        homeScore,
        awayScore,
        quarter,
        clock,
        possession: homeScore > awayScore ? "home" : "away",
        situation: competition.situation?.downDistanceText || event.status?.type?.detail || "Game in play",
        consensusSpread: -3.5,
        homeWinProbability: 0.54,
        isSweatGame,
        spreadString,
        network: competition.broadcasts?.[0]?.names?.[0] || "CBS",
      };
    });

    res.json({
      success: true,
      leagueGroup: "Yahoo Pick'em #13003",
      source: "ESPN Live Scoreboard API",
      seasonYear,
      weekNumber,
      gamesCount: formattedGames.length,
      lastUpdated: new Date().toISOString(),
      games: formattedGames,
    });
  } catch (error: any) {
    console.error("ESPN live scoreboard fetch error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch live games from ESPN API",
    });
  }
});

// Yahoo Pick'em Group 13003 Configuration & Picks Ingestion
app.get("/api/yahoo/league", (req, res) => {
  res.json({
    leagueId: "13003",
    url: "https://football.fantasysports.yahoo.com/pickem/13003",
    name: "Yahoo Pro Football Pick'em (Group 13003)",
    currentWeek: 1,
    seasonYear: 2026,
    format: "Confidence Points (1-16)",
    lockTime: "Thursday 8:15 PM & Sunday 1:00 PM EDT",
    memberCount: 8,
    status: "gated_private_group",
    requiresAuth: true,
    errorNotice: "Yahoo Error #113: You are not a member of this group without Yahoo login / group password.",
    verified: true,
  });
});

// Test Yahoo Group access with group password, invite link, or cookies
app.post("/api/yahoo/test-access", async (req, res) => {
  const { groupPassword = "", inviteUrl = "", cookie = "" } = req.body;
  try {
    const targetUrl = inviteUrl || `https://football.fantasysports.yahoo.com/pickem/13003`;
    const headers: Record<string, string> = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    };
    if (cookie) {
      headers["Cookie"] = cookie;
    }

    const response = await fetch(targetUrl, {
      headers,
      redirect: "follow",
    });
    const html = await response.text();
    const isError113 = html.includes("Error #113") || html.includes("You are not a member of this group");
    const isLoginRedirect = html.includes("login.yahoo.com") || html.includes("signin");
    const titleMatch = html.match(/<title>(.*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1] : "Yahoo Pick'em";

    res.json({
      success: !isError113 && !isLoginRedirect,
      status: isError113 ? "error_113_not_member" : isLoginRedirect ? "redirect_login" : "accessible",
      pageTitle: title,
      requiresPassword: true,
      requiresLogin: isLoginRedirect || isError113,
      yahooErrorCode: isError113 ? 113 : null,
      message: isError113
        ? "Yahoo returned Error #113: 'You are not a member of this group.' Automated scraping without Yahoo login session or valid member credentials is restricted by Yahoo."
        : isLoginRedirect
        ? "Yahoo redirected to login.yahoo.com for authentication."
        : "Successfully accessed Yahoo group page!",
      testedUrl: targetUrl,
      hasPasswordProvided: Boolean(groupPassword),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Ingest / Parse pasted Yahoo Pick'em Group 13003 matrix
app.post("/api/yahoo/parse-picks", (req, res) => {
  const { rawText = "" } = req.body;
  if (!rawText || typeof rawText !== "string") {
    return res.status(400).json({ error: "Missing 'rawText' from Yahoo Pick'em Group 13003" });
  }

  // Simple resilient parser for pasted Yahoo pick matrix
  const lines = rawText.split("\n").map(l => l.trim()).filter(Boolean);
  const parsedEntries: Array<{ teamName: string; pick: string; confidence?: number }> = [];

  for (const line of lines) {
    // E.g. "Reimer Original | KC (14)" or "Dave - Chalk King: BUF [12]"
    const match = line.match(/([a-zA-Z0-9\s]+)[:|,-]+([A-Z]{2,3})\s*[\(\[]?(\d{1,2})?[\)\]]?/i);
    if (match) {
      parsedEntries.push({
        teamName: match[1].trim(),
        pick: match[2].toUpperCase(),
        confidence: match[3] ? parseInt(match[3], 10) : undefined,
      });
    }
  }

  res.json({
    success: true,
    leagueId: "13003",
    parsedCount: parsedEntries.length,
    entries: parsedEntries,
    timestamp: new Date().toISOString(),
  });
});

// Section 8.0: LLM Generative AI Postgame Show generator
// Helper to convert 16-bit 24kHz mono PCM to WAV
function pcmToWav(pcmBuffer: Buffer, sampleRate = 24000, numChannels = 1, bitsPerSample = 16): Buffer {
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataSize = pcmBuffer.length;
  const header = Buffer.alloc(44);

  // RIFF chunk descriptor
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + dataSize, 4);
  header.write("WAVE", 8);

  // "fmt " sub-chunk
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
  header.writeUInt16LE(1, 20); // AudioFormat (1 for PCM)
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);

  // "data" sub-chunk
  header.write("data", 36);
  header.writeUInt32LE(dataSize, 40);

  return Buffer.concat([header, pcmBuffer]);
}

// Persistent Disk & In-memory cache for synthesized Gemini TTS audio
const AUDIO_CACHE_DIR = path.join(process.cwd(), ".audio-cache");
if (!fs.existsSync(AUDIO_CACHE_DIR)) {
  try {
    fs.mkdirSync(AUDIO_CACHE_DIR, { recursive: true });
  } catch (err) {
    console.warn("Could not create .audio-cache directory:", err);
  }
}

const ttsAudioCache = new Map<string, { audioUrl: string; durationSeconds: number; voiceName: string; modelUsed: string }>();

// Load existing disk-cached audio into memory on startup
try {
  if (fs.existsSync(AUDIO_CACHE_DIR)) {
    const files = fs.readdirSync(AUDIO_CACHE_DIR);
    for (const file of files) {
      if (file.endsWith(".json")) {
        try {
          const raw = fs.readFileSync(path.join(AUDIO_CACHE_DIR, file), "utf-8");
          const parsed = JSON.parse(raw);
          if (parsed.cacheKey && parsed.audioUrl) {
            ttsAudioCache.set(parsed.cacheKey, {
              audioUrl: parsed.audioUrl,
              durationSeconds: parsed.durationSeconds || 45,
              voiceName: parsed.voiceName || "Fenrir",
              modelUsed: parsed.modelUsed || "gemini-3.1-flash-tts-preview",
            });
          }
        } catch {
          // ignore corrupted cache entries
        }
      }
    }
    console.log(`[AudioCache] Loaded ${ttsAudioCache.size} persistent audio tracks from disk.`);
  }
} catch (e) {
  console.warn("[AudioCache] Error loading disk cache:", e);
}

function saveAudioToDiskCache(cacheKey: string, data: { audioUrl: string; durationSeconds: number; voiceName: string; modelUsed: string }) {
  try {
    const hash = crypto.createHash("sha256").update(cacheKey).digest("hex");
    const filePath = path.join(AUDIO_CACHE_DIR, `${hash}.json`);
    fs.writeFileSync(filePath, JSON.stringify({ cacheKey, ...data }), "utf-8");
  } catch (e) {
    console.warn("[AudioCache] Failed to persist audio to disk:", e);
  }
}

// Quota exhaustion cooldown tracker (prevents log spam and 429 errors when Gemini TTS daily limit is reached)
let ttsQuotaCooldownUntil = 0;

// Default Chicago Ditka Director & Scene Settings
const DEFAULT_CHICAGO_PERSONA = 'Coach Sal "Da Bear" Ditkofsky (61-year-old Bridgeport Chicago superfan & retired steelworker, wearing a navy-and-orange sweater vest, thick mustache, chewing an unlit cigar, lifelong 1985 Bears diehard)';

const DEFAULT_CHICAGO_SCENE = "Back-corner laminate booth at Vito & Sal's Original Italian Beef & Sausage on 35th and Halsted in Chicago. Neon Old Style clock humming, smell of hot giardiniera and dipped au jus, CTA Orange Line 'L' train rumbling outside.";

const DEFAULT_CHICAGO_DIRECTORS_NOTES = "Director's Note: Speak in an authentic, gravelly South-Side Chicago accent with the fiery, authoritative cadence of Coach Mike Ditka. Pronounce 'the' as 'da', 'this' as 'dis', 'that' as 'dat', 'with' as 'wit\'', and elongate broad Midwestern nasal 'A's ('Chicaaago', 'Daaaa Bears', 'baa-ck booth'). Include audible throat clears, sudden explosive disbelief, dramatic pauses, and thunderous table slaps.";

// Default Co-Host: Dr. Chloe "The Algorithm" Vance (MIT Sloan Analytics)
const DEFAULT_CHLOE_PERSONA = 'Dr. Chloe "The Algorithm" Vance (28-year-old MIT Sloan sports analytics director, NextGen Stats consultant, sharp, articulate, witty, sipping a matcha latte, armed with Expected Points Added and Monte Carlo models)';

export interface SpeakerVoiceConfigItem {
  speaker: string;
  voiceName: string;
}

export interface SynthesizeOptions {
  characterPersona?: string;
  sceneBackstory?: string;
  directorsNotes?: string;
  fullPromptPayload?: string;
  isMultiSpeaker?: boolean;
  speakerVoiceConfigs?: SpeakerVoiceConfigItem[];
}

// Core Gemini TTS Synthesizer supporting Single-Speaker and Multi-Speaker
async function synthesizeSpeechWithGemini(
  text: string,
  voiceName: string = "Fenrir",
  stylePrompt: string = DEFAULT_CHICAGO_DIRECTORS_NOTES,
  options?: SynthesizeOptions
): Promise<{
  audioUrl: string;
  durationSeconds: number;
  voiceName: string;
  modelUsed: string;
  cached: boolean;
  fullPromptPayload: string;
  isMultiSpeaker?: boolean;
}> {
  const isMulti = Boolean(options?.isMultiSpeaker && options?.speakerVoiceConfigs && options.speakerVoiceConfigs.length === 2);
  const speakerConfigs = isMulti ? options!.speakerVoiceConfigs! : [];

  const persona = options?.characterPersona || DEFAULT_CHICAGO_PERSONA;
  const scene = options?.sceneBackstory || DEFAULT_CHICAGO_SCENE;
  const notes = options?.directorsNotes || stylePrompt || DEFAULT_CHICAGO_DIRECTORS_NOTES;

  let fullPrompt = options?.fullPromptPayload;
  if (!fullPrompt) {
    if (isMulti) {
      const s1 = speakerConfigs[0].speaker;
      const s2 = speakerConfigs[1].speaker;
      fullPrompt = `TTS the following conversation between ${s1} and ${s2}. ${notes} Scene Setting: ${scene}.\n\n${text}`;
    } else {
      fullPrompt = `[${notes} Scene Setting: ${scene}. Character Voice: ${persona}.]\n\n${text}`;
    }
  }

  const cacheKey = `${isMulti ? `MULTI::${speakerConfigs.map(s => `${s.speaker}:${s.voiceName}`).join('|')}` : voiceName}:::${fullPrompt.trim()}`;
  if (ttsAudioCache.has(cacheKey)) {
    const cached = ttsAudioCache.get(cacheKey)!;
    return { ...cached, cached: true, fullPromptPayload: fullPrompt, isMultiSpeaker: isMulti };
  }

  const ai = getGeminiClient();
  if (!ai) {
    throw new Error("Gemini API key is not configured");
  }

  const modelName = "gemini-3.1-flash-tts-preview";
  const MAX_RETRIES = 2; // Up to 3 attempts total with exponential jittered backoff on 503 / spikes
  let lastError: any = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      if (attempt > 0) {
        // Exponential backoff with jitter on 503 / temporary traffic spikes
        const delayMs = 1200 * Math.pow(1.8, attempt - 1) + Math.random() * 800;
        console.info(`[Gemini TTS] Retrying model ${modelName} after transient backoff (${Math.round(delayMs)}ms)... attempt ${attempt + 1}/${MAX_RETRIES + 1}`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }

      // Build speechConfig for Multi-Speaker or Single-Speaker
      let speechConfig: any;
      if (isMulti) {
        speechConfig = {
          multiSpeakerVoiceConfig: {
            speakerVoiceConfigs: [
              {
                speaker: speakerConfigs[0].speaker,
                voiceConfig: {
                  prebuiltVoiceConfig: {
                    voiceName: speakerConfigs[0].voiceName || "Fenrir",
                  },
                },
              },
              {
                speaker: speakerConfigs[1].speaker,
                voiceConfig: {
                  prebuiltVoiceConfig: {
                    voiceName: speakerConfigs[1].voiceName || "Kore",
                  },
                },
              },
            ],
          },
        };
      } else {
        speechConfig = {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: voiceName || "Fenrir",
            },
          },
        };
      }

      const generatePromise = ai.models.generateContent({
        model: modelName,
        contents: [{ parts: [{ text: fullPrompt }] }],
        config: {
          responseModalities: ["AUDIO"],
          speechConfig,
        },
      });

      // Wrap with 45s timeout for full WAV audio generation
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Gemini TTS request timed out after 45s")), 45000)
      );

      const response = (await Promise.race([generatePromise, timeoutPromise])) as any;

      const candidatePart = response.candidates?.[0]?.content?.parts?.[0];
      const base64Data = candidatePart?.inlineData?.data;

      if (base64Data) {
        const pcmBuffer = Buffer.from(base64Data, "base64");
        const wavBuffer = pcmToWav(pcmBuffer, 24000, 1, 16);
        const audioUrl = `data:audio/wav;base64,${wavBuffer.toString("base64")}`;
        const durationSeconds = Math.max(1, Math.round(pcmBuffer.length / (24000 * 2)));

        const result = {
          audioUrl,
          durationSeconds,
          voiceName: isMulti ? `${speakerConfigs[0].voiceName}+${speakerConfigs[1].voiceName}` : voiceName,
          modelUsed: modelName,
          cached: false,
          fullPromptPayload: fullPrompt,
          isMultiSpeaker: isMulti,
        };

        ttsAudioCache.set(cacheKey, {
          audioUrl,
          durationSeconds,
          voiceName: result.voiceName,
          modelUsed: modelName,
        });

        saveAudioToDiskCache(cacheKey, {
          audioUrl,
          durationSeconds,
          voiceName: result.voiceName,
          modelUsed: modelName,
        });

        return result;
      }
    } catch (err: any) {
      lastError = err;
      const errMsg = err?.message || String(err);
      const isQuotaError =
        err?.status === 429 ||
        errMsg.includes("429") ||
        errMsg.includes("RESOURCE_EXHAUSTED") ||
        errMsg.includes("quota") ||
        errMsg.includes("Quota exceeded");

      const isHighDemand =
        err?.status === 503 ||
        errMsg.includes("503") ||
        errMsg.includes("UNAVAILABLE") ||
        errMsg.includes("high demand") ||
        errMsg.includes("Spikes in demand");

      if (isQuotaError) {
        // Set cooldown for 60 seconds to prevent hammering the rate-limited endpoint
        ttsQuotaCooldownUntil = Date.now() + 60000;
        console.info(`[TTS Cooldown] Gemini TTS free-tier rate limit reached. Activating 60s cooldown. Fallback to client browser SpeechSynthesis.`);
        break; // Quota errors should not retry immediately
      } else if (isHighDemand) {
        console.info(`[TTS Notice] Gemini TTS experienced temporary high demand spike (503) on attempt ${attempt + 1}/${MAX_RETRIES + 1}.`);
        if (attempt === MAX_RETRIES) {
          (lastError as any).isHighDemand = true;
        }
      } else {
        console.info(`[TTS Notice] Gemini TTS attempt ${attempt + 1} with ${modelName} returned: ${errMsg}`);
      }
    }
  }

  throw lastError || new Error("Failed to synthesize audio with Gemini TTS");
}

// Gemini TTS speech generation endpoint (gemini-3.1-flash-tts-preview)
app.post("/api/tts/synthesize", async (req, res) => {
  const {
    text,
    voiceName = "Fenrir",
    stylePrompt = DEFAULT_CHICAGO_DIRECTORS_NOTES,
    characterPersona,
    sceneBackstory,
    directorsNotes,
    fullPromptPayload,
    isMultiSpeaker = false,
    speakerVoiceConfigs,
  } = req.body;

  if (!text || typeof text !== "string") {
    return res.status(400).json({ error: "Missing required 'text' parameter" });
  }

  // If Gemini TTS is in cooldown due to free-tier quota exhaustion, respond immediately with fallback instruction
  if (Date.now() < ttsQuotaCooldownUntil) {
    const cooldownRemaining = Math.max(1, Math.ceil((ttsQuotaCooldownUntil - Date.now()) / 1000));
    return res.json({
      fallbackToSpeechSynthesis: true,
      quotaExceeded: true,
      cooldownRemainingSeconds: cooldownRemaining,
      message: "Gemini TTS daily quota limit reached. Using instant browser SpeechSynthesis engine.",
      voiceName: voiceName || "Fenrir",
    });
  }

  try {
    const result = await synthesizeSpeechWithGemini(text, voiceName, stylePrompt, {
      characterPersona,
      sceneBackstory,
      directorsNotes,
      fullPromptPayload,
      isMultiSpeaker,
      speakerVoiceConfigs,
    });
    res.json(result);
  } catch (error: any) {
    const errMsg = error?.message || String(error);
    const isQuotaError =
      error?.status === 429 ||
      errMsg.includes("429") ||
      errMsg.includes("RESOURCE_EXHAUSTED") ||
      errMsg.includes("quota") ||
      errMsg.includes("Quota exceeded");

    const isHighDemand =
      error?.isHighDemand ||
      error?.status === 503 ||
      errMsg.includes("503") ||
      errMsg.includes("UNAVAILABLE") ||
      errMsg.includes("high demand") ||
      errMsg.includes("Spikes in demand");

    if (isQuotaError) {
      ttsQuotaCooldownUntil = Date.now() + 60000;
      return res.json({
        fallbackToSpeechSynthesis: true,
        quotaExceeded: true,
        isHighDemand: false,
        cooldownRemainingSeconds: 60,
        message: "Gemini TTS free-tier quota limit reached. Using instant browser SpeechSynthesis engine.",
        voiceName: voiceName || "Fenrir",
      });
    }

    if (isHighDemand) {
      return res.json({
        fallbackToSpeechSynthesis: true,
        quotaExceeded: false,
        isHighDemand: true,
        message: "Gemini TTS model is currently experiencing high demand. Seamlessly using browser speech engine.",
        voiceName: voiceName || "Fenrir",
      });
    }

    console.info("[TTS Fallback] Gemini TTS synthesis fallback active:", errMsg);
    res.json({
      fallbackToSpeechSynthesis: true,
      quotaExceeded: false,
      isHighDemand: false,
      error: errMsg,
      message: "Gemini TTS temporarily unavailable. Using browser speech engine.",
      voiceName: voiceName || "Fenrir",
    });
  }
});

// Endpoint: Check Gemini TTS Engine & Quota Status
app.get("/api/tts/status", (req, res) => {
  const isCooldown = Date.now() < ttsQuotaCooldownUntil;
  res.json({
    geminiTtsAvailable: !isCooldown,
    quotaExceeded: isCooldown,
    cooldownRemainingSeconds: isCooldown ? Math.max(1, Math.ceil((ttsQuotaCooldownUntil - Date.now()) / 1000)) : 0,
    model: "gemini-3.1-flash-tts-preview",
    cachedTracksCount: ttsAudioCache.size,
    freeTierDailyQuotaNotice: "Gemini 3.1 Flash TTS free-tier permits 10 requests per day per project. Browser SpeechSynthesis acts as instant fallback when quota is reached.",
  });
});

// Endpoint: Force Reset TTS Quota Cooldown (for immediate retry)
app.post("/api/tts/reset-cooldown", (req, res) => {
  ttsQuotaCooldownUntil = 0;
  res.json({ success: true, message: "TTS quota cooldown reset." });
});

// ============================================================================
// Section 7.5: Audio Commentary Pre-Generation Service
// Calculates initial strategist briefings on load and maintains cached WAV files
// ============================================================================

interface CachedBriefingEntry {
  wavBuffer: Buffer;
  base64DataUrl: string;
  hasNeuralAudio: boolean;
  durationSeconds: number;
  pregeneratedAt: string;
  briefing: {
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
  };
}

const pregeneratedBriefingCache = new Map<string, CachedBriefingEntry>();

// Helper to look up pre-cached neural audio for single-speaker briefing
function findCachedBriefingAudio(script: string, voiceName: string): { audioUrl: string; durationSeconds: number; modelUsed: string } | null {
  const scriptSnippet = script.slice(0, 45).toLowerCase().replace(/[^a-z0-9]/g, "");
  for (const [key, val] of ttsAudioCache.entries()) {
    // Avoid matching multi-speaker tracks for single-speaker briefings
    if (key.startsWith("MULTI::")) continue;
    const keyLower = key.toLowerCase();
    if (key.includes(voiceName) && (key.includes(script.slice(0, 40)) || keyLower.replace(/[^a-z0-9]/g, "").includes(scriptSnippet))) {
      return val;
    }
  }
  return null;
}

// Calculate the initial strategist briefing data for any manager
function calculateStrategistBriefingData(teamId: string = "team-todd", speaker: "sal" | "chloe" | "commish" = "sal") {
  const profile = getPickerAdviceProfile(teamId);
  const advice = getPickerSpeakerAdvice(teamId, speaker);

  return {
    teamId: profile.teamId,
    teamName: profile.teamName,
    ownerName: profile.ownerName,
    rank: profile.rank,
    points: profile.points,
    maxRemaining: profile.maxRemaining,
    anchorsIntact: profile.teamId === "team-todd" ? 7 : profile.teamId === "team-orange" ? 5 : 6,
    damageGrade: profile.damageGrade,
    speaker,
    title: advice.title,
    headline: advice.headline,
    stageDirections: advice.stageDirections,
    script: advice.script,
    tacticalPointers: advice.tacticalPointers,
  };
}

// Pre-generate briefing and store in memory cache
function pregenerateAudioBriefing(
  teamId: string = "team-todd",
  speaker: "sal" | "chloe" | "commish" = "sal",
  customScript?: string,
  customStageDirections?: string,
  customHeadline?: string,
  customTitle?: string
): CachedBriefingEntry {
  const cacheKey = `${teamId}-${speaker}`;
  const existing = pregeneratedBriefingCache.get(cacheKey);
  if (existing && !customScript) {
    return existing;
  }

  const briefing = calculateStrategistBriefingData(teamId, speaker);
  if (customScript) briefing.script = customScript;
  if (customStageDirections) briefing.stageDirections = customStageDirections;
  if (customHeadline) briefing.headline = customHeadline;
  if (customTitle) briefing.title = customTitle;

  const voiceName = speaker === "sal" ? "Fenrir" : speaker === "chloe" ? "Kore" : "Puck";
  
  // Check if neural audio already exists in ttsAudioCache for this text + voice
  const cachedNeural = findCachedBriefingAudio(briefing.script, voiceName);

  let wavBuffer = Buffer.alloc(0);
  let base64DataUrl = "";
  let hasNeuralAudio = false;
  let durationSeconds = Math.max(12, Math.round(briefing.script.split(" ").length / 2.5));

  if (cachedNeural && cachedNeural.audioUrl) {
    base64DataUrl = cachedNeural.audioUrl;
    hasNeuralAudio = true;
    durationSeconds = cachedNeural.durationSeconds || durationSeconds;
    const base64Content = base64DataUrl.replace(/^data:audio\/wav;base64,/, "");
    wavBuffer = Buffer.from(base64Content, "base64");
  }

  const entry: CachedBriefingEntry = {
    wavBuffer,
    base64DataUrl,
    hasNeuralAudio,
    durationSeconds,
    pregeneratedAt: new Date().toISOString(),
    briefing,
  };

  pregeneratedBriefingCache.set(cacheKey, entry);
  console.log(`[AudioPreGen] Calculated strategist briefing for ${teamId} (${speaker}). Neural audio ready: ${hasNeuralAudio}.`);
  return entry;
}

// Pre-generate initial briefing on server startup for Todd Reimer (default user)
pregenerateAudioBriefing("team-todd", "sal");
pregenerateAudioBriefing("team-todd", "chloe");
pregenerateAudioBriefing("team-todd", "commish");

// Endpoint: Pre-generate or retrieve calculated strategist briefing & cached WAV
app.post("/api/audio/pregenerate-briefing", (req, res) => {
  const { teamId = "team-todd", speaker = "sal", script, stageDirections, headline, title } = req.body;
  const validSpeaker = (speaker === "chloe" || speaker === "commish" ? speaker : "sal") as "sal" | "chloe" | "commish";
  const entry = pregenerateAudioBriefing(teamId, validSpeaker, script, stageDirections, headline, title);

  res.json({
    success: true,
    teamId,
    speaker: validSpeaker,
    cached: true,
    hasNeuralAudio: entry.hasNeuralAudio,
    fallbackToSpeechSynthesis: !entry.hasNeuralAudio,
    durationSeconds: entry.durationSeconds,
    audioUrl: entry.hasNeuralAudio ? entry.base64DataUrl : null,
    wavStreamUrl: entry.hasNeuralAudio ? `/api/audio/briefing-wav?teamId=${teamId}&speaker=${validSpeaker}` : null,
    briefing: entry.briefing,
    pregeneratedAt: entry.pregeneratedAt,
  });
});

// Endpoint: Explicit on-demand synthesis for individual team strategist briefing
app.post("/api/audio/synthesize-briefing", async (req, res) => {
  const { teamId = "team-todd", speaker = "sal", force = false, script, stageDirections, headline, title } = req.body;
  const validSpeaker = (speaker === "chloe" || speaker === "commish" ? speaker : "sal") as "sal" | "chloe" | "commish";
  const briefing = calculateStrategistBriefingData(teamId, validSpeaker);
  if (script) briefing.script = script;
  if (stageDirections) briefing.stageDirections = stageDirections;
  if (headline) briefing.headline = headline;
  if (title) briefing.title = title;

  const voiceName = validSpeaker === "sal" ? "Fenrir" : validSpeaker === "chloe" ? "Kore" : "Puck";

  const cacheKey = `${teamId}-${validSpeaker}`;
  const existing = pregeneratedBriefingCache.get(cacheKey);
  if (!force && existing && existing.hasNeuralAudio && existing.base64DataUrl) {
    return res.json({
      success: true,
      cached: true,
      audioUrl: existing.base64DataUrl,
      durationSeconds: existing.durationSeconds,
      voiceName,
      modelUsed: "gemini-3.1-flash-tts-preview",
      hasNeuralAudio: true,
      briefing: existing.briefing,
    });
  }

  // Also check if audio already exists in ttsAudioCache directly
  const cachedNeural = findCachedBriefingAudio(briefing.script, voiceName);
  if (!force && cachedNeural && cachedNeural.audioUrl) {
    const base64Content = cachedNeural.audioUrl.replace(/^data:audio\/wav;base64,/, "");
    const wavBuffer = Buffer.from(base64Content, "base64");
    const entry: CachedBriefingEntry = {
      wavBuffer,
      base64DataUrl: cachedNeural.audioUrl,
      hasNeuralAudio: true,
      durationSeconds: cachedNeural.durationSeconds || Math.max(12, Math.round(briefing.script.split(" ").length / 2.5)),
      pregeneratedAt: new Date().toISOString(),
      briefing,
    };
    pregeneratedBriefingCache.set(cacheKey, entry);
    return res.json({
      success: true,
      cached: true,
      audioUrl: cachedNeural.audioUrl,
      durationSeconds: entry.durationSeconds,
      voiceName,
      modelUsed: cachedNeural.modelUsed || "gemini-3.1-flash-tts-preview",
      hasNeuralAudio: true,
      briefing,
    });
  }

  // If in cooldown, return fallback instruction
  if (Date.now() < ttsQuotaCooldownUntil) {
    const cooldownRemaining = Math.max(1, Math.ceil((ttsQuotaCooldownUntil - Date.now()) / 1000));
    return res.json({
      success: true,
      fallbackToSpeechSynthesis: true,
      quotaExceeded: true,
      cooldownRemainingSeconds: cooldownRemaining,
      message: "Gemini TTS daily quota limit reached. Using instant browser SpeechSynthesis engine.",
      voiceName,
      hasNeuralAudio: false,
      briefing,
    });
  }

  try {
    const persona = validSpeaker === "sal"
      ? "Coach Sal Ditkofsky, passionate 1985 Bears disciple and South-Side Chicago beef stand operator"
      : validSpeaker === "chloe"
      ? "Dr. Chloe Vance, MIT Sloan Sports Analytics director, high-speed articulate data scientist"
      : "The Commish AI, automated pool commissioner, official Initech Invitational ruling engine";
    
    const notes = validSpeaker === "sal"
      ? "Deliver with authentic South-Side Chicago Ditka swagger, slapping laminate counter, intense conviction and hearty laughter"
      : validSpeaker === "chloe"
      ? "Deliver with fast-paced MIT Ivy League precision, crisp articulation, and sharp statistical focus"
      : "Deliver with official league commissioner broadcast authority, mechanical chime, and precise statistical ruling";

    const result = await synthesizeSpeechWithGemini(briefing.script, voiceName, notes, {
      characterPersona: persona,
      directorsNotes: notes,
      sceneBackstory: briefing.stageDirections,
    });

    const base64Content = result.audioUrl.replace(/^data:audio\/wav;base64,/, "");
    const wavBuffer = Buffer.from(base64Content, "base64");

    const entry: CachedBriefingEntry = {
      wavBuffer,
      base64DataUrl: result.audioUrl,
      hasNeuralAudio: true,
      durationSeconds: result.durationSeconds,
      pregeneratedAt: new Date().toISOString(),
      briefing,
    };
    pregeneratedBriefingCache.set(cacheKey, entry);

    return res.json({
      success: true,
      cached: result.cached,
      audioUrl: result.audioUrl,
      durationSeconds: result.durationSeconds,
      voiceName: result.voiceName,
      modelUsed: result.modelUsed,
      hasNeuralAudio: true,
      briefing,
    });
  } catch (err: any) {
    const errMsg = err?.message || String(err);
    const isQuota = err?.status === 429 || errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("429") || errMsg.includes("Quota exceeded");
    const isHighDemand =
      err?.isHighDemand ||
      err?.status === 503 ||
      errMsg.includes("503") ||
      errMsg.includes("UNAVAILABLE") ||
      errMsg.includes("high demand") ||
      errMsg.includes("Spikes in demand");

    if (isQuota) {
      ttsQuotaCooldownUntil = Date.now() + 60000;
    }

    console.info(`[AudioPreGen] Synthesis fallback active (isQuota=${isQuota}, isHighDemand=${isHighDemand}): ${errMsg}`);

    return res.json({
      success: true,
      fallbackToSpeechSynthesis: true,
      quotaExceeded: isQuota,
      isHighDemand,
      message: isQuota
        ? "Gemini TTS daily free-tier quota reached (10 requests/day)."
        : isHighDemand
        ? "Gemini TTS model is currently experiencing high demand (temporary traffic spike)."
        : `Gemini TTS temporarily unavailable. Using browser speech engine.`,
      voiceName,
      hasNeuralAudio: false,
      briefing,
    });
  }
});

// Endpoint: Stream the cached binary WAV file directly
app.get("/api/audio/briefing-wav", (req, res) => {
  const teamId = (req.query.teamId as string) || "team-todd";
  const speaker = ((req.query.speaker as string) || "sal") as "sal" | "chloe" | "commish";
  const validSpeaker = speaker === "chloe" || speaker === "commish" ? speaker : "sal";

  const entry = pregenerateAudioBriefing(teamId, validSpeaker);

  if (!entry.hasNeuralAudio || !entry.wavBuffer || entry.wavBuffer.length === 0) {
    return res.status(404).json({
      error: "Neural audio stream unavailable. Use browser speech synthesis engine.",
      fallbackToSpeechSynthesis: true,
    });
  }

  res.setHeader("Content-Type", "audio/wav");
  res.setHeader("Content-Length", entry.wavBuffer.length);
  res.setHeader("Cache-Control", "public, max-age=86400, immutable");
  res.setHeader("Accept-Ranges", "bytes");
  res.send(entry.wavBuffer);
});

// Endpoint: Check cache status
app.get("/api/audio/pregeneration-status", (req, res) => {
  const keys = Array.from(pregeneratedBriefingCache.keys());
  res.json({
    activeCachedBriefings: keys,
    totalCount: keys.length,
    defaultUserReady: pregeneratedBriefingCache.has("team-todd-sal"),
    engine: "Gemini Neural TTS + Web Speech Engine Bridge",
  });
});

// ============================================================================
// Section 7.6: Weekly Audio Recap & Executive Summary Endpoint
// Pre-cached audio dispatch for the simplified Landing Page
// ============================================================================

const WEEKLY_RECAP_DATA = {
  id: "weekly-recap-wk1",
  weekNumber: 1,
  title: "🎙️ Halsted & Ivy: Week 1 End-of-Day Recap & SoFi Bloodbath",
  subtitle: "Coach Sal & Dr. Chloe deconstruct the 114-point Rams massacre, Orange crush's +10 upset, and Todd's 127-pt sleeping giant posture.",
  duration: "02:12",
  durationSeconds: 132,
  headline: "Carnage at SoFi: Chalk Collapses, Underdogs Strike, & The Sleeping Giant Awakens",
  writtenRecap: `What a brutal start to the Initech Invitational. Eleven out of twelve managers in Yahoo Group #13003 rode Matthew Stafford and the Rams minus-3.5, only to watch Kyle Shanahan's 49ers pull off a shocking road upset that incinerated 114 aggregate confidence points.

Shoeman absorbed the most devastating blow of the night, forfeiting their #1 sixteen-point anchor. Meanwhile, Orange crush stands alone atop the leaderboard after boldly assigning 10 points to San Francisco (+10), pocketing 26 points. But don't sleep on Todd Reimer ('CramItUp Your CramHole Lafleur'): despite sitting in 8th place with 8 points, Todd preserved all seven top confidence anchors (LAC, JAX, DET, PHI, BAL, PIT, CIN), controlling 91 points on heavy favorites and holding the league's strongest Monte Carlo win equity going into Sunday.`,
  keyTakeaways: [
    { label: "Sole Survivor", text: "Orange crush nailed the +10 SF upset to take sole possession of 1st place (26 pts)." },
    { label: "Anchor Carnage", text: "11 of 12 managers burned on the Rams, vaporizing 114 total confidence points." },
    { label: "Shoeman Crushed", text: "Lost 16-point anchor on LAR; season ceiling clipped to 120 max points." },
    { label: "Sleeping Giant", text: "Todd Reimer's top 7 anchors intact (91 points on heavy favorites) for #1 recovery index." },
    { label: "Master Hedge", text: "PatN (BroncosCountry) only risked 1 point on LAR, preserving a league-best 135 max points." },
  ],
  speakers: [
    {
      id: "sal",
      name: "Coach Sal",
      title: 'Coach Sal "Da Bear" Ditkofsky',
      voiceName: "Fenrir",
      avatar: "🥩",
      role: "Bridgeport Beef Proprietor & Ditka Disciple",
    },
    {
      id: "chloe",
      name: "Dr. Chloe",
      title: 'Dr. Chloe "The Algorithm" Vance',
      voiceName: "Kore",
      avatar: "📊",
      role: "MIT Sloan Sports Analytics Director",
    },
  ],
  scriptText:
    "TTS the following conversation between Sal and Chloe:\nSal: [slaps laminate table] Good evening, Chicago gridiron faithful! Dis is Coach Sal comin' to ya live from Vito & Sal's Beef on 35th and Halsted! Wit' me, dissectin' da carnage from her MIT spreadsheet, is Dr. Chloe Vance! Chloe, did you see SoFi Stadium?! Eleven out of twelve managers in Yahoo Group thirteen-double-oh-three got taken behind da woodshed by San Francisco!\nChloe: [sips matcha latte] A catastrophic 114 confidence points vaporized, Sal. The entire pool rode the Rams minus 3.5, and Kyle Shanahan executed a defensive masterclass. Only Orange crush had the intestinal fortitude—or algorithmic luck—to assign 10 confidence points to the 49ers upset, catapulting them into sole possession of first place with 26 points.\nSal: An absolute beauty by Orange crush! But my heart breaks for Shoeman! Shoeman put his number one sixteen-point anchor right on da Rams! Boom! Down goes Frazier! His maximum season ceiling is clipped to one-twenty!\nChloe: And let's not overlook Niner Faithful, who suffered the ultimate cognitive dissonance: picked against his own 49ers for 11 points, watched San Francisco win, and forfeited 11 points. However, Sal, looking ahead at the remaining 14 games, the real story is Todd Reimer and 'CramItUp Your CramHole Lafleur'.\nSal: [chuckles warmly] Tell 'em, Chloe! People see Todd at eight points and think he's down! But Todd's playin' chess while dese guys are playin' checkers!\nChloe: Exactly. Todd absorbed a 9-point hit on the Rams, but preserved his top seven confidence anchors: 16 on the Chargers, 15 on the Jaguars, 14 on Detroit, 13 on Philly, 12 on Baltimore, 11 on Pittsburgh, and 10 on Cincy. That is 91 confidence points concentrated on heavy favorites. My Monte Carlo simulation gives Todd the single highest probability of capturing first place by Monday night.\nSal: That's what I'm talkin' about! Intangibles and discipline! Cash dem heavy anchors, ride da Chargers minus ten, and put double giardiniera on da victory beef! Let's get to Sunday!",
  dialogueTurns: [
    {
      speaker: "Sal",
      text: "[slaps laminate table] Good evening, Chicago gridiron faithful! Dis is Coach Sal comin' to ya live from Vito & Sal's Beef on 35th and Halsted! Wit' me, dissectin' da carnage from her MIT spreadsheet, is Dr. Chloe Vance! Chloe, did you see SoFi Stadium?! Eleven out of twelve managers in Yahoo Group thirteen-double-oh-three got taken behind da woodshed by San Francisco!",
      stageDirection: "slaps table, booming Ditka gravelly baritone",
    },
    {
      speaker: "Chloe",
      text: "[sips matcha latte] A catastrophic 114 confidence points vaporized, Sal. The entire pool rode the Rams minus 3.5, and Kyle Shanahan executed a defensive masterclass. Only Orange crush had the intestinal fortitude—or algorithmic luck—to assign 10 confidence points to the 49ers upset, catapulting them into sole possession of first place with 26 points.",
      stageDirection: "sips matcha, crisp, sharp, fast analytical cadence",
    },
    {
      speaker: "Sal",
      text: "An absolute beauty by Orange crush! But my heart breaks for Shoeman! Shoeman put his number one sixteen-point anchor right on da Rams! Boom! Down goes Frazier! His maximum season ceiling is clipped to one-twenty!",
      stageDirection: "scoffs in disbelief, shouts passionately, clears throat",
    },
    {
      speaker: "Chloe",
      text: "And let's not overlook Niner Faithful, who suffered the ultimate cognitive dissonance: picked against his own 49ers for 11 points, watched San Francisco win, and forfeited 11 points. However, Sal, looking ahead at the remaining 14 games, the real story is Todd Reimer and 'CramItUp Your CramHole Lafleur'.",
      stageDirection: "dry sarcastic smirk, tapping laptop keys",
    },
    {
      speaker: "Sal",
      text: "[chuckles warmly] Tell 'em, Chloe! People see Todd at eight points and think he's down! But Todd's playin' chess while dese guys are playin' checkers!",
      stageDirection: "hearty belly laugh, nods enthusiastically",
    },
    {
      speaker: "Chloe",
      text: "Exactly. Todd absorbed a 9-point hit on the Rams, but preserved his top seven confidence anchors: 16 on the Chargers, 15 on the Jaguars, 14 on Detroit, 13 on Philly, 12 on Baltimore, 11 on Pittsburgh, and 10 on Cincy. That is 91 confidence points concentrated on heavy favorites. My Monte Carlo simulation gives Todd the single highest probability of capturing first place by Monday night.",
      stageDirection: "authoritative and confident NextGen analysis",
    },
    {
      speaker: "Sal",
      text: "That's what I'm talkin' about! Intangibles and discipline! Cash dem heavy anchors, ride da Chargers minus ten, and put double giardiniera on da victory beef! Let's get to Sunday!",
      stageDirection: "triumphant roar, counter slap",
    },
  ],
};

// In-memory or pre-cached weekly recap audio storage
let weeklyRecapAudioCache: {
  audioUrl: string | null;
  durationSeconds: number;
  modelUsed: string;
  hasNeuralAudio: boolean;
} = {
  audioUrl: null,
  durationSeconds: 132,
  modelUsed: "gemini-3.1-flash-tts-preview",
  hasNeuralAudio: false,
};

// Check if pre-cached multi-speaker radio show exists in ttsAudioCache on startup
for (const [key, val] of ttsAudioCache.entries()) {
  if (key.startsWith("MULTI::") || (key.includes("Sal:Fenrir") && key.includes("Chloe:Kore"))) {
    weeklyRecapAudioCache = {
      audioUrl: val.audioUrl,
      durationSeconds: val.durationSeconds || 132,
      modelUsed: val.modelUsed || "gemini-3.1-flash-tts-preview",
      hasNeuralAudio: true,
    };
    console.log("[AudioCache] Linked pre-cached neural audio for Weekly Recap Radio Show (Halsted & Ivy, 132s).");
    break;
  }
}

// Endpoint: Get Weekly Recap Metadata and Cached Audio
app.get("/api/audio/weekly-recap", (req, res) => {
  const isCooldown = Date.now() < ttsQuotaCooldownUntil;
  res.json({
    success: true,
    data: WEEKLY_RECAP_DATA,
    audio: {
      hasNeuralAudio: weeklyRecapAudioCache.hasNeuralAudio,
      audioUrl: weeklyRecapAudioCache.audioUrl,
      durationSeconds: weeklyRecapAudioCache.durationSeconds,
      modelUsed: weeklyRecapAudioCache.modelUsed,
      fallbackToSpeechSynthesis: !weeklyRecapAudioCache.hasNeuralAudio,
      quotaExceeded: isCooldown,
      cooldownRemainingSeconds: isCooldown ? Math.max(1, Math.ceil((ttsQuotaCooldownUntil - Date.now()) / 1000)) : 0,
    },
  });
});

// Endpoint: Explicitly synthesize / regenerate the weekly recap with Gemini TTS
app.post("/api/audio/weekly-recap/synthesize", async (req, res) => {
  if (weeklyRecapAudioCache.hasNeuralAudio && weeklyRecapAudioCache.audioUrl && !req.body.force) {
    return res.json({
      success: true,
      cached: true,
      hasNeuralAudio: true,
      audioUrl: weeklyRecapAudioCache.audioUrl,
      durationSeconds: weeklyRecapAudioCache.durationSeconds,
      modelUsed: weeklyRecapAudioCache.modelUsed,
    });
  }

  // Check cooldown
  if (Date.now() < ttsQuotaCooldownUntil) {
    const cooldownRemaining = Math.max(1, Math.ceil((ttsQuotaCooldownUntil - Date.now()) / 1000));
    return res.json({
      success: true,
      cached: false,
      hasNeuralAudio: false,
      fallbackToSpeechSynthesis: true,
      quotaExceeded: true,
      cooldownRemainingSeconds: cooldownRemaining,
      message: "Gemini TTS free-tier daily quota limit reached. Using instant browser speech engine.",
    });
  }

  try {
    const result = await synthesizeSpeechWithGemini(
      WEEKLY_RECAP_DATA.scriptText,
      "Fenrir",
      DEFAULT_CHICAGO_DIRECTORS_NOTES,
      {
        isMultiSpeaker: true,
        speakerVoiceConfigs: [
          { speaker: "Sal", voiceName: "Fenrir" },
          { speaker: "Chloe", voiceName: "Kore" },
        ],
        characterPersona: `${DEFAULT_CHICAGO_PERSONA} & ${DEFAULT_CHLOE_PERSONA}`,
        sceneBackstory: DEFAULT_CHICAGO_SCENE,
        directorsNotes: DEFAULT_CHICAGO_DIRECTORS_NOTES,
      }
    );

    weeklyRecapAudioCache = {
      audioUrl: result.audioUrl,
      durationSeconds: result.durationSeconds || 94,
      modelUsed: result.modelUsed || "gemini-3.1-flash-tts-preview",
      hasNeuralAudio: true,
    };

    res.json({
      success: true,
      cached: false,
      hasNeuralAudio: true,
      audioUrl: result.audioUrl,
      durationSeconds: result.durationSeconds,
      modelUsed: result.modelUsed,
    });
  } catch (err: any) {
    const isQuota = Date.now() < ttsQuotaCooldownUntil;
    const isHighDemand = Boolean(err?.isHighDemand || (err?.message && err.message.includes("503")));
    res.json({
      success: true,
      cached: false,
      hasNeuralAudio: false,
      fallbackToSpeechSynthesis: true,
      quotaExceeded: isQuota,
      isHighDemand,
      message: isHighDemand
        ? "Gemini TTS model is currently experiencing high demand (temporary traffic spike). Playing with browser speech engine."
        : isQuota
        ? "Gemini TTS daily quota limit reached. Playing with browser speech engine."
        : "Playing with browser speech engine.",
    });
  }
});

// Section 8.0: LLM Generative AI Postgame Show generator (Talk Show with Multi-Speaker TTS)
app.post("/api/broadcast/generate", async (req, res) => {
  const {
    weekNumber = 1,
    winner = "Todd (Reimer Original)",
    chaser = "Dave (Chalk King)",
    sweatGame = "BUF vs KC",
    margin = 3,
    speaker1Voice = "Fenrir",
    speaker2Voice = "Kore",
    cohostArchetype = "chloe",
    debateCadence = "Rapid-Fire Crosstalk & Gridiron Debate",
    cadencePrompt = "",
    stylePrompt = "",
  } = req.body;

  // Speaker metadata definition
  const speaker1Meta = {
    id: "sal",
    name: "Sal",
    title: 'Coach Sal "Da Bear" Ditkofsky',
    role: "Bridgeport Beef Stand Owner & 1985 Bears Disciple",
    voiceName: speaker1Voice || "Fenrir",
    color: "#EA580C",
    avatar: "🥩",
    tagline: "Run da damn ball 40 times and punch 'em in da mouth!",
    archetype: "Old-School Ditka Superfan",
    promptBio: "A 61-year-old South-Side Chicago Italian beef proprietor and 1985 Bears diehard. Speaks with a thick Mike Ditka accent ('da', 'dis', 'dat', 'wit''), loves running the ball, slaps the table, scoffs at computers and fancy analytics.",
  };

  let speaker2Meta = {
    id: "chloe",
    name: "Chloe",
    title: 'Dr. Chloe "The Algorithm" Vance',
    role: "MIT Sloan Sports Analytics Director & NextGen Stats Lead",
    voiceName: speaker2Voice || "Kore",
    color: "#06B6D4",
    avatar: "📊",
    tagline: "Expected Points Added > Your gut instinct and beef grease.",
    archetype: "Ivy League Analytics Prodigy",
    promptBio: "A 28-year-old MIT Sloan analytics director who sips matcha latte, cites Expected Points Added (EPA/play), win-probability charts, and teases Sal's reliance on 'intangibles and sausage grease'.",
  };

  if (cohostArchetype === "kev") {
    speaker2Meta = {
      id: "kev",
      name: "Kev",
      title: 'Kev "The Score" Callahan',
      role: "AM 670 Sports Radio Screamer & 8-Leg Parlay Degenerate",
      voiceName: speaker2Voice || "Puck",
      color: "#F59E0B",
      avatar: "⚡",
      tagline: "I took out a second mortgage on Buffalo - fire the offensive coordinator!",
      archetype: "AM Radio Hot-Take Jock",
      promptBio: "A caffeinated, rapid-fire AM 670 sports radio screamer who had heavy confidence on the game, screams about blown picks, interrupts frantically, and demands every coach get fired immediately.",
    };
  } else if (cohostArchetype === "rex") {
    speaker2Meta = {
      id: "rex",
      name: "Rex",
      title: 'Rex "Big Gunslinger" McCoy',
      role: "Texas Quarterback Booster with Big Belt Buckle",
      voiceName: speaker2Voice || "Zephyr",
      color: "#8B5CF6",
      avatar: "🤠",
      tagline: "If your quarterback can't throw a strawberry through a battleship, bench him!",
      archetype: "Southern Arm-Talent Evangelist",
      promptBio: "A big-talking Texas football booster with an enormous belt buckle who only cares about raw arm talent, deep 60-yard post routes, and big stadium tailgates, laughing boisterously at Sal's cold-weather trench football.",
    };
  }

  const activeCadence = cadencePrompt || stylePrompt || debateCadence || "Fast-paced, heated sports talk show debate";

  // Fallback multi-speaker talk show dialogue matched to archetype
  let fallbackDialogueTurns = [
    {
      speaker: speaker1Meta.name,
      text: `[slaps laminate table] Good morning, Chicago! Dis is Coach Sal comin' to ya live from Vito & Sal's Beef on 35th and Halsted! Wit' me as always, lookin' down her nose from an MIT spreadsheet, is Dr. Chloe Vance! Chloe, did you see ${chaser}'s disaster on ${sweatGame}?!`,
      stageDirection: "slaps laminate table, speaks in booming Ditka gravelly baritone",
    },
    {
      speaker: speaker2Meta.name,
      text: "[sips matcha latte] Good morning, Sal. And yes, my win-probability model plummeted by 84.6% the exact second Josh Allen forced that ball into triple coverage. It was an unmitigated regression catastrophe.",
      stageDirection: "sips matcha, crisp, sharp, fast analytical cadence",
    },
    {
      speaker: speaker1Meta.name,
      text: "Regression catastrophe my hind leg! It was bad play callin'! Two yards out, seventy-eight seconds on da clock! You hand da rock to your fullback and you push da pile! Mike Ditka is rollin' over in his sweater vest hearin' you talk about regressions!",
      stageDirection: "scoffs in disgust, shouts passionately, clears throat",
    },
    {
      speaker: speaker2Meta.name,
      text: `Sal, the expected points added on an inside run against that goal-line box was negative 0.4. But congratulations to ${winner} for executing textbook game-theory leverage on ${sweatGame}.`,
      stageDirection: "authoritative and confident, slight smirk",
    },
    {
      speaker: speaker1Meta.name,
      text: `Intangibles, Chloe! ${winner} has got ice in his veins and spicy giardiniera on his breath! Todd takes da whole pot! ${chaser}, you're on mop duty at da beef stand!`,
      stageDirection: "hearty belly laugh, counter slap",
    },
  ];

  if (cohostArchetype === "kev") {
    fallbackDialogueTurns = [
      {
        speaker: speaker1Meta.name,
        text: `[slaps laminate table] Turn off da phone lines! Dis is Coach Sal at Vito & Sal's Beef! Kev Callahan, put down da espresso and look at what happened to ${chaser} in ${sweatGame}!`,
        stageDirection: "slaps laminate table, speaks in booming Ditka baritone",
      },
      {
        speaker: speaker2Meta.name,
        text: `[screams into microphone] Sal, I am in physical pain! I had maximum confidence points on that game! Maximum! Fire the offensive coordinator into the sun right now!`,
        stageDirection: "furious AM radio screech, papers rustling wildly",
      },
      {
        speaker: speaker1Meta.name,
        text: `Take a blood pressure pill, Kev! You put heavy confidence on a squad that can't punch it in from the two-yard line! Meanwhile ${winner} played optimal leverage and took da entire Yahoo #13003 pool!`,
        stageDirection: "hearty belly laugh, pours a glass of water",
      },
      {
        speaker: speaker2Meta.name,
        text: `[pounds desk] Don't talk to me about leverage, Sal! That was a phantom holding call! I haven't slept in thirty-six hours! My bookie is texting me right now!`,
        stageDirection: "groans in agony, slamming phone receiver",
      },
      {
        speaker: speaker1Meta.name,
        text: `Dat's why you don't chase chalk, Kev! Grab an Italian beef dipped wit' hot giardiniera and crown ${winner} the King of Week ${weekNumber}!`,
        stageDirection: "counter slap, triumphant chuckle",
      },
    ];
  } else if (cohostArchetype === "rex") {
    fallbackDialogueTurns = [
      {
        speaker: speaker1Meta.name,
        text: `[slaps laminate table] Good morning Chicago! Coach Sal here wit' our Texas booster Rex McCoy! Rex, what did I tell ya about fancy spread offenses?!`,
        stageDirection: "chuckles in Ditka baritone, wipes counter",
      },
      {
        speaker: speaker2Meta.name,
        text: `[adjusts 10-gallon hat] Well hold on now Sal! If your quarterback can't sling a strawberry through a battleship from 50 yards out, you don't deserve the win! ${chaser} trusted a pop-gun offense!`,
        stageDirection: "boisterous Texas drawl, adjusts giant belt buckle",
      },
      {
        speaker: speaker1Meta.name,
        text: `Gunslinger nonsense, Rex! It's about fullbacks and slobberknocker goal-line defense! ${winner} understood dat, and now Todd is sittin' pretty in first place in Group #13003!`,
        stageDirection: "slaps table with vigor",
      },
      {
        speaker: speaker2Meta.name,
        text: `[spits toothpick, chuckles] Can't argue with first place, partner! ${winner} rode that stallion straight to the winner's circle, while ${chaser} got bucked off at the two-yard line!`,
        stageDirection: "hearty belly laugh, tips hat",
      },
      {
        speaker: speaker1Meta.name,
        text: `Bears football baby! Order up two combos and pass da trophy to ${winner}!`,
        stageDirection: "roars with laughter",
      },
    ];
  }

  const fallbackTtsPromptText = `TTS the following conversation between ${speaker1Meta.name} and ${speaker2Meta.name}:\n${fallbackDialogueTurns
    .map((turn) => `${turn.speaker}: ${turn.text}`)
    .join("\n")}`;

  const fallbackFullPromptPayload = `TTS the following conversation between ${speaker1Meta.name} and ${speaker2Meta.name}. ${DEFAULT_CHICAGO_DIRECTORS_NOTES} Scene Setting: ${DEFAULT_CHICAGO_SCENE}.\n\n${fallbackTtsPromptText}`;

  try {
    const ai = getGeminiClient();
    if (!ai) {
      return res.json({
        headline: "🥩 Halsted & Ivy: Coach Sal & Dr. Chloe Clash Over Dave's Choke!",
        show_title: "The Halsted & Ivy Sports Roundtable",
        roast_target_team: chaser,
        is_multi_speaker: true,
        speaker_1: speaker1Meta,
        speaker_2: speaker2Meta,
        dialogue_turns: fallbackDialogueTurns,
        radio_script_text: fallbackTtsPromptText,
        full_tts_prompt: fallbackFullPromptPayload,
        character_persona: `${speaker1Meta.title} & ${speaker2Meta.title}`,
        scene_backstory: DEFAULT_CHICAGO_SCENE,
        directors_notes: DEFAULT_CHICAGO_DIRECTORS_NOTES,
        anthem_prompt: "High-energy 80s Chicago polka-synthwave celebration with pounding bass and victory brass",
        ballad_prompt: "Melancholic South-Side Chicago blues guitar and mournful harmonica titled 'Dave's Goal-Line Disaster'",
        key_stats: [
          "Todd gained +14 net points on Kansas City's goal-line stand",
          "Dave dropped from 1st to 2nd with zero points earned on Buffalo (12 pts)",
          "Win probability swung by 84% in the final 90 seconds",
        ],
      });
    }

    const prompt = `You are the executive producer of the smash-hit Chicago sports talk show "Halsted & Ivy: The Gridiron Dispute".
The show is broadcast live from Vito & Sal's Italian Beef on 35th and Halsted in Bridgeport, Chicago.

The two on-air hosts are:
1. Speaker "${speaker1Meta.name}" (${speaker1Meta.title}): ${speaker1Meta.promptBio}
2. Speaker "${speaker2Meta.name}" (${speaker2Meta.title}): ${speaker2Meta.promptBio}

Debate Cadence & Style Direction:
"${activeCadence}"

Recap context for Week ${weekNumber} (End-of-Day Gridiron Breakdown):
- League: Yahoo Pro Football Pick'em (Group #13003)
- Completed Games Settled:
  * Game 1: Seattle Seahawks (-3.5) def. Patriots (26-20). Consensus chalk hit: all 12 pool managers cashed.
  * Game 2: San Francisco 49ers (+3.5) UPSET LA Rams (17-13). Catastrophic bloodbath at SoFi: 11 of 12 pool managers lost on the Rams, vaporizing 114 total confidence points!
- Standings & Picker Profiles:
  * Leader: Orange crush in 1st place with 26 points (the ONLY manager to pick SF +10 pts upset!).
  * Critical Anchor Casualty: Shoeman burned his #1 maximum 16-point anchor on LAR, crippling his max season ceiling to 120 points.
  * Irony Award: Niner Faithful picked against his own 49ers for 11 points and watched SF win while losing 11 points.
  * Damage Control Master: BroncosCountry (PatN) lost only 1 point on LAR, preserving a league-best 135 max possible points.
  * Sleeping Giant: Todd Reimer ("CramItUp Your CramHole Lafleur") sitting at 8 points but preserved ALL top 7 confidence anchors: LAC (16), JAX (15), DET (14), PHI (13), BAL (12), PIT (11), CIN (10) for 127 points maximum upside!
- Rest-of-Week Outlook: 14 games pending. If heavy favorites (Chargers -10, Jaguars -8.5, Lions -7) hold, Todd has the mathematical runway to surge to 1st place as opponent picks unlock.

INSTRUCTIONS:
Generate a brand-new, authentic, hilarious, fast-paced 5-turn talk show conversation between ${speaker1Meta.name} and ${speaker2Meta.name}.
Crucial requirements:
- The script MUST distinctly reflect the persona of ${speaker2Meta.name} (${speaker2Meta.title}) and the specified Debate Cadence ("${activeCadence}").
- Each line MUST start with "${speaker1Meta.name}: " or "${speaker2Meta.name}: ".
- Alternate turns between ${speaker1Meta.name} and ${speaker2Meta.name} (5 turns total).
- Include bracketed audio cues and physical reactions tailored to their archetype:
  * For Sal: [slaps laminate table], [chews giardiniera], [scoffs loudly], [chuckles in Ditka baritone]
  * For Chloe (if host): [sips matcha latte], [rapid keystrokes], [smirks coolly]
  * For Kev (if host): [screams into microphone], [papers rustling wildly], [pounds the desk in fury], [groans in agony]
  * For Rex (if host): [adjusts 10-gallon hat], [boisterous belly laugh], [spits toothpick], [twangs in Texas drawl]

Return ONLY valid JSON matching this schema:
{
  "headline": "Punchy talk show news ticker headline (e.g. 'Halsted & Ivy: Coach Sal & ${speaker2Meta.name} Clash Over ${chaser}\\'s Choke!')",
  "show_title": "Halsted & Ivy: The Gridiron Dispute",
  "roast_target_team": "${chaser}",
  "dialogue_turns": [
    { "speaker": "${speaker1Meta.name}", "text": "...", "stageDirection": "..." },
    { "speaker": "${speaker2Meta.name}", "text": "...", "stageDirection": "..." },
    { "speaker": "${speaker1Meta.name}", "text": "...", "stageDirection": "..." },
    { "speaker": "${speaker2Meta.name}", "text": "...", "stageDirection": "..." },
    { "speaker": "${speaker1Meta.name}", "text": "...", "stageDirection": "..." }
  ],
  "scene_backstory": "Corner laminate booth at Vito & Sal's Italian Beef on 35th & Halsted, Chicago. Steam hissing off the au jus vat, neon Old Style clock buzzing.",
  "directors_notes": "Director's Note: ${activeCadence}. Sal is ${speaker1Meta.name} (${speaker1Meta.voiceName}). Co-host is ${speaker2Meta.name} (${speaker2Meta.voiceName}).",
  "key_stats": [
    "Todd gained +${margin || 14} net leverage points in Group #13003",
    "Dave dropped points on ${sweatGame} top confidence lock"
  ]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.85,
      },
    });

    const parsed = JSON.parse(response.text?.trim() || "{}");

    const turns: Array<{ speaker: string; text: string; stageDirection?: string }> =
      Array.isArray(parsed.dialogue_turns) && parsed.dialogue_turns.length > 0
        ? parsed.dialogue_turns
        : fallbackDialogueTurns;

    // Build the exact Gemini TTS multi-speaker prompt string
    const conversationScript = `TTS the following conversation between ${speaker1Meta.name} and ${speaker2Meta.name}:\n${turns
      .map((t) => `${t.speaker}: ${t.text}`)
      .join("\n")}`;

    const fullPromptPayload = `TTS the following conversation between ${speaker1Meta.name} and ${speaker2Meta.name}. ${parsed.directors_notes || DEFAULT_CHICAGO_DIRECTORS_NOTES} Scene: ${parsed.scene_backstory || DEFAULT_CHICAGO_SCENE}.\n\n${conversationScript}`;

    parsed.show_title = parsed.show_title || "Halsted & Ivy: The Gridiron Dispute";
    parsed.is_multi_speaker = true;
    parsed.speaker_1 = speaker1Meta;
    parsed.speaker_2 = speaker2Meta;
    parsed.dialogue_turns = turns;
    parsed.radio_script_text = conversationScript;
    parsed.full_tts_prompt = fullPromptPayload;

    // Synthesize broadcast audio using Gemini Multi-Speaker TTS (gemini-3.1-flash-tts-preview)
    try {
      const ttsResult = await synthesizeSpeechWithGemini(
        conversationScript,
        speaker1Meta.voiceName,
        parsed.directors_notes || DEFAULT_CHICAGO_DIRECTORS_NOTES,
        {
          characterPersona: `${speaker1Meta.title} and ${speaker2Meta.title}`,
          sceneBackstory: parsed.scene_backstory,
          directorsNotes: parsed.directors_notes,
          fullPromptPayload: fullPromptPayload,
          isMultiSpeaker: true,
          speakerVoiceConfigs: [
            { speaker: speaker1Meta.name, voiceName: speaker1Meta.voiceName },
            { speaker: speaker2Meta.name, voiceName: speaker2Meta.voiceName },
          ],
        }
      );
      parsed.audioUrl = ttsResult.audioUrl;
      parsed.durationSeconds = ttsResult.durationSeconds;
      parsed.voiceName = ttsResult.voiceName;
      parsed.modelUsed = ttsResult.modelUsed;
    } catch (ttsErr) {
      console.warn("Multi-speaker Gemini TTS synthesis skipped or failed, falling back gracefully:", ttsErr);
    }

    res.json(parsed);
  } catch (error: any) {
    console.error("Gemini talk show generation error:", error);
    res.json({
      headline: "🥩 Halsted & Ivy: Coach Sal & Dr. Chloe Debate Dave's Choke!",
      show_title: "Halsted & Ivy: The Gridiron Dispute",
      roast_target_team: chaser,
      is_multi_speaker: true,
      speaker_1: speaker1Meta,
      speaker_2: speaker2Meta,
      dialogue_turns: fallbackDialogueTurns,
      radio_script_text: fallbackTtsPromptText,
      full_tts_prompt: fallbackFullPromptPayload,
      character_persona: `${speaker1Meta.title} and ${speaker2Meta.title}`,
      scene_backstory: DEFAULT_CHICAGO_SCENE,
      directors_notes: DEFAULT_CHICAGO_DIRECTORS_NOTES,
      key_stats: [
        "Dave lost his 3rd consecutive 12+ confidence game",
        "Todd's underdog leverage pick scored 14 points",
        "Pool variance index reached 94th percentile",
      ],
    });
  }
});

// Section 8.0: Commish Roast Generator
app.post("/api/roast/generate", async (req, res) => {
  const { targetName = "Dave", reason = "lost 14-pt pick on Buffalo", score = 96 } = req.body;

  try {
    const ai = getGeminiClient();
    if (!ai) {
      return res.json({
        roast: `Stat Alert: ${targetName} has now lost three consecutive 12+ confidence picks on national television. That is a 0.038% statistical anomaly. Truly generational choking.`,
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: `You are 'The Commish AI (Bot)' in a competitive NFL Pick'em league.
Write a 2-sentence mathematical and hilarious roast directed at "${targetName}" who ${reason} with a score of ${score}.
Keep it sharp, funny, sports-literate, and cite a humorous fake or real statistical metric. Do not be offensive.`,
    });

    res.json({ roast: response.text?.trim() });
  } catch (error) {
    res.json({
      roast: `Stat Alert: ${targetName} has achieved a closing line efficiency of -24.8%. The computer models are formally requesting you consult a coin flip next week.`,
    });
  }
});

// ============================================================================
// Section 9.0: AI Broadcast Commentary Endpoint (Gemini 3.8 Flash)
// Summarizes weekly pick outcomes, strategy effectiveness, and game-theoretic audits
// ============================================================================
app.post("/api/broadcast/commentary", async (req, res) => {
  const {
    teamId = "team-todd",
    weekNumber = 7,
    persona = "dual", // "dual" | "sal" | "chloe" | "commish"
    focusMode = "full_debrief", // "full_debrief" | "strategy_audit" | "anchor_leverage"
    userQuestion = "",
  } = req.body;

  const numericWeek = Number(weekNumber) || 7;
  const teamAccuracyData = getTeamSeasonAccuracy(teamId);
  const weekRecord =
    teamAccuracyData.weeklyTrends.find((w) => w.week === numericWeek) ||
    teamAccuracyData.weeklyTrends[teamAccuracyData.weeklyTrends.length - 1];

  const leagueWeekAvg = weekRecord.leagueAvgAccuracy;

  const statsSummary = {
    record: `${weekRecord.correctCount}-${weekRecord.gamesCount - weekRecord.correctCount}`,
    accuracy: weekRecord.accuracy,
    pointsEarned: weekRecord.pointsEarned,
    pointsPossible: weekRecord.pointsPossible,
    confidenceEfficiency: weekRecord.confidenceEfficiency,
    leagueAvgAccuracy: leagueWeekAvg,
    anchorRecord: weekRecord.anchorRecord,
    weeklyRank: weekRecord.weeklyRank,
  };

  // Helper to construct dynamic local fallback if Gemini is offline or unconfigured
  const buildFallbackCommentary = () => {
    const isWinHeavy = weekRecord.accuracy >= 65;
    const isAnchorSafe = weekRecord.anchorAccuracy >= 75;
    const diff = Number((weekRecord.accuracy - leagueWeekAvg).toFixed(1));

    let headline = "";
    let script: Array<{ speaker: string; text: string; stageDirection?: string }> = [];
    let grade = "B";
    let capitalEfficiency = weekRecord.confidenceEfficiency;
    let anchorDiscipline = isAnchorSafe ? "Rock Solid (High Anchors Preserved)" : "Compromised by Upset Carnage";
    let riskProfile = weekRecord.confidenceEfficiency > 75 ? "Optimal Game-Theory Value" : "Chalk-Heavy Defensive";

    if (isWinHeavy && isAnchorSafe) {
      grade = "A";
      headline = `Week ${numericWeek} Dominance: ${teamAccuracyData.ownerName} Slams the Door at ${weekRecord.accuracy}%`;
      script = [
        {
          speaker: "Coach Sal",
          stageDirection: "slapping laminate table at Vito & Sal's, hot giardiniera flying",
          text: `Now DAT is what I am talkin' about! Look at Week ${numericWeek}, you beautiful bastards! ${weekRecord.pointsEarned} points in the bag! You didn't get cute, you nailed ${weekRecord.anchorRecord} of dem big four anchors, and you shoved Buffalo down the league's throat like a dipped beef sandwich!`,
        },
        {
          speaker: "Dr. Chloe Vance",
          stageDirection: "pointing stylus at Expected Points Added heat map",
          text: `Statistically speaking, Sal's exuberance is actually justified. ${teamAccuracyData.ownerName}'s confidence allocation efficiency registered at ${weekRecord.confidenceEfficiency}%, outpacing the Yahoo pool median by +${diff}%. Protecting the 13 through 16 point buckets yielded an expected value delta of +18.4 points against the chalk-heavy field.`,
        },
        {
          speaker: "Coach Sal",
          stageDirection: "chomping unlit cigar with a toothy grin",
          text: `You hear dat? Expected value delta! Dat means we kicked their teeth in with pure arithmetic! Keep your hands off the low-rent 1-point dart throws and keep feedin' dem heavy hitters!`,
        },
      ];
    } else if (isWinHeavy && !isAnchorSafe) {
      grade = "B-";
      headline = `Week ${numericWeek} Mirage: High Win Rate (${weekRecord.accuracy}%) Masked by Anchor Destruction`;
      script = [
        {
          speaker: "Coach Sal",
          stageDirection: "groaning loudly and rubbing temples",
          text: `I wanna be happy, I really do! Eleven wins looks great on paper to da casuals! But you burned da house down on the 15-pointer! What did I tell ya about trusting road underdogs with double-digit confidence?! That's like orderin' ketchup on a Chicago hot dog! Disrespectful!`,
        },
        {
          speaker: "Dr. Chloe Vance",
          stageDirection: "frowning at the Bayesian distribution graph",
          text: `Sal is emotionally dramatic, but the variance matrix confirms the vulnerability. While your raw hit rate was impressive at ${weekRecord.accuracy}%, your point conversion efficiency lagged at only ${weekRecord.confidenceEfficiency}%. You won the 2 and 3 point skirmishes but surrendered high-leverage equity on your top tiers.`,
        },
        {
          speaker: "Coach Sal",
          stageDirection: "waving towel dismissively",
          text: `Listen to the doctor! Next week, we lock up da 16-pointer like Fort Knox. No more hero picks on Thursday night!`,
        },
      ];
    } else {
      grade = "C+";
      headline = `Week ${numericWeek} Survival Audit: Grinding Through Slate Turbulence`;
      script = [
        {
          speaker: "Coach Sal",
          stageDirection: "shaking head in disbelief, looking out the diner window",
          text: `Tough Sunday. Real tough Sunday. We got blood on da floor in the 1 o'clock window. But listen to me: you're still in the fight! ${teamAccuracyData.ownerName} didn't surrender the ship!`,
        },
        {
          speaker: "Dr. Chloe Vance",
          stageDirection: "adjusting glasses and pulling up leverage curves",
          text: `Looking at the holistic slate, the entire Yahoo #13003 pool suffered massive drawdown with consensus chalk falling in multiple key games. Your point efficiency of ${weekRecord.confidenceEfficiency}% kept you within striking distance of the money bubble. The key now is recalibrating your mid-range weights (7-11 points).`,
        },
        {
          speaker: "Coach Sal",
          stageDirection: "pointing stern finger directly at camera",
          text: `Dust yourself off, grab an Italian ice, and let's go steal some points next week!`,
        },
      ];
    }

    if (persona === "sal") {
      script = script.filter((s) => s.speaker === "Coach Sal");
    } else if (persona === "chloe") {
      script = script.filter((s) => s.speaker === "Dr. Chloe Vance");
    } else if (persona === "commish") {
      script = [
        {
          speaker: "The Commish AI",
          stageDirection: "gavel rapping firmly on league ledger desk",
          text: `Official Commissioner Audit for ${teamAccuracyData.teamName} (Week ${numericWeek}): You logged ${weekRecord.correctCount} correct outcomes out of ${weekRecord.gamesCount} for ${weekRecord.pointsEarned} total points (Efficiency: ${weekRecord.confidenceEfficiency}%). Pool Standing impact: Week Rank #${weekRecord.weeklyRank}. Your clinch equity remains active, but confidence variance on Tier-1 games requires tighter discipline.`,
        },
      ];
    }

    if (userQuestion && script.length > 0) {
      script.push({
        speaker: persona === "chloe" ? "Dr. Chloe Vance" : "Coach Sal",
        stageDirection: persona === "chloe" ? "reviewing user query on tablet" : "leaning over desk with intense focus",
        text: persona === "chloe"
          ? `Addressing your specific query on "${userQuestion}": Statistical variance suggests allocating moderate 6-8 confidence units rather than risking maximum leverage on high-volatility matchups.`
          : `Regarding "${userQuestion}": Don't overcomplicate it! Stick with the home trenches, protect your big 14-16 point hammers, and never chase cute road dogs on short rest!`,
      });
    }

    return {
      teamId,
      teamName: teamAccuracyData.teamName,
      ownerName: teamAccuracyData.ownerName,
      weekNumber: numericWeek,
      persona,
      focusMode,
      headline,
      broadcastScript: script,
      strategyAssessment: {
        grade,
        summary: `Captured ${weekRecord.pointsEarned} of ${weekRecord.pointsPossible} available points (${weekRecord.confidenceEfficiency}% efficiency) with ${weekRecord.anchorRecord} tier-1 anchors converting.`,
        capitalEfficiency,
        anchorDiscipline,
        gameTheoryRiskProfile: riskProfile,
      },
      tacticalPrescriptions: [
        `Insulate top anchors (14-16 pts) exclusively on games with win probabilities exceeding 70%.`,
        `Deploy mid-confidence pivots (6-9 pts) where pool consensus heavily overweights a public favorite.`,
        `Minimize damage on Thursday night games by keeping confidence assignments strictly under 5 points.`,
      ],
      keyHighlights: [
        `${weekRecord.correctCount} wins / ${weekRecord.gamesCount - weekRecord.correctCount} losses (${weekRecord.accuracy}% straight-up)`,
        `${weekRecord.pointsEarned} points secured (Rank #${weekRecord.weeklyRank} for the week)`,
        `${diff >= 0 ? "+" : ""}${diff}% differential against Yahoo #13003 pool median (${leagueWeekAvg}%)`,
      ],
      salQuote: isAnchorSafe
        ? "Dat's how we run a football franchise! Pure Chicago grit and no cute nonsense!"
        : "You burned a 14-pointer on a team that can't run a trap play! Unacceptable!",
      chloeQuote: `Confidence Point Efficiency clocked in at ${weekRecord.confidenceEfficiency}%, with a positive delta of ${diff}% over league median.`,
      statsSummary,
      generatedWith: "Initech Analytics Desk (High-Fidelity Strategy Audit)",
      timestamp: new Date().toISOString(),
    };
  };

  try {
    const ai = getGeminiClient();
    if (!ai) {
      console.info("[BroadcastCommentary] GEMINI_API_KEY not configured. Returning analytical fallback.");
      return res.json({
        success: true,
        source: "fallback",
        commentary: buildFallbackCommentary(),
      });
    }

    const personaPromptGuidelines =
      persona === "sal"
        ? `Focus strictly on Coach Sal "Da Bear" Ditkofsky (61-yr-old Bridgeport Chicago superfan, Ditka accent, speaks with "da", "dis", "dat", table slaps, unlit cigar, blunt tough love, hates cute hedges).`
        : persona === "chloe"
        ? `Focus strictly on Dr. Chloe "The Algorithm" Vance (28-yr-old MIT Sloan sports analytics director, NextGen Stats consultant, sharp, articulate, citing EPA, Monte Carlo clinch odds, Bayesian leverage, Nash equilibrium).`
        : persona === "commish"
        ? `Focus strictly on The Commish AI (Bot) (stern, dry, mathematical referee of Yahoo Pick'em Group #13003, citing league rules, pool standings, and official rulings).`
        : `Include dialogue exchange between Coach Sal Ditkofsky AND Dr. Chloe Vance. They banter back and forth—Sal brings fiery Chicago grit and gut instincts, while Chloe counters with quantitative Expected Value and Game Theory.`;

    const focusModeGuidance =
      focusMode === "strategy_audit"
        ? "Deeply scrutinize the manager's confidence point allocation math, closing line value (CLV), and risk vs. reward distribution."
        : focusMode === "anchor_leverage"
        ? "Focus intensely on the high-confidence 13 to 16 point anchor games—did they protect their most valuable capital or burn it on dangerous chalk?"
        : "Provide a complete post-slate radio broadcast recap covering wins, losses, anchor survival, and strategy effectiveness.";

    const prompt = `You are the executive producer and on-air broadcast talent for "The Initech Invitational: Yahoo Pick'em #13003 Post-Game Broadcast".

Analyze this manager's weekly performance and strategy effectiveness:
- Manager: "${teamAccuracyData.ownerName}" (Franchise: "${teamAccuracyData.teamName}")
- Week Number: Week ${numericWeek} of the NFL Season
- Record: ${weekRecord.correctCount} Wins, ${weekRecord.gamesCount - weekRecord.correctCount} Losses (${weekRecord.accuracy}% straight-up accuracy)
- Points Captured: ${weekRecord.pointsEarned} out of ${weekRecord.pointsPossible} available (${weekRecord.confidenceEfficiency}% Point Efficiency)
- Top 4 Anchors (13-16 points): ${weekRecord.anchorRecord} converted
- League Median Accuracy this week: ${leagueWeekAvg}% (Differential: ${(weekRecord.accuracy - leagueWeekAvg).toFixed(1)}%)
- Week Rank in Pool: #${weekRecord.weeklyRank}
- Season Trend: Accuracy ${teamAccuracyData.currentSeasonAccuracy}%, Efficiency ${teamAccuracyData.currentSeasonEfficiency}%, Overall Rank #${teamAccuracyData.leagueAccuracyRank}
${userQuestion ? `- User's Specific Question to the Desk: "${userQuestion}"` : ""}

Persona Guidelines:
${personaPromptGuidelines}

Focus Area:
${focusModeGuidance}

Output JSON format strictly with the following keys:
{
  "headline": "A catchy, energetic broadcast segment headline",
  "broadcastScript": [
    {
      "speaker": "Coach Sal" or "Dr. Chloe Vance" or "The Commish AI",
      "text": "The dialogue line",
      "stageDirection": "e.g. [slaps table], [adjusts glasses], [sighs in disbelief]"
    }
  ],
  "strategyAssessment": {
    "grade": "e.g. A, B+, B, C-, D, etc.",
    "summary": "1-2 sentences summarizing strategy effectiveness",
    "capitalEfficiency": 78, // number 0-100
    "anchorDiscipline": "Short status descriptor like 'Flawless Anchor Protection' or 'Compromised by Upset Carnage'",
    "gameTheoryRiskProfile": "Short descriptor like 'Optimal Contrarian Leverage' or 'Defensive Chalk Heavy'"
  },
  "tacticalPrescriptions": [
    "Three actionable strategic bullet points for next week's slate"
  ],
  "salQuote": "One punchy Ditka-style soundbite",
  "chloeQuote": "One quantitative takeaway"
}
`;

    // Multi-model fallback sequence to mitigate 503 temporary high-demand spikes
    const candidateModels = ["gemini-3.8-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];
    let rawText = "";
    let modelUsed = "gemini-3.8-flash";
    let lastError: any = null;

    for (const model of candidateModels) {
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
              responseMimeType: "application/json",
            },
          });

          if (response.text) {
            rawText = response.text;
            modelUsed = model;
            break;
          }
        } catch (err: any) {
          lastError = err;
          const errMsg = err?.message || String(err);
          const isHighDemand =
            err?.status === 503 ||
            errMsg.includes("503") ||
            errMsg.includes("UNAVAILABLE") ||
            errMsg.includes("high demand") ||
            errMsg.includes("Spikes in demand");

          if (isHighDemand) {
            console.info(`[BroadcastCommentary] Model ${model} returned 503 (high demand spike) on attempt ${attempt + 1}.`);
            if (attempt === 0) {
              await new Promise((r) => setTimeout(r, 600));
              continue;
            }
          }
          break; // move to next candidate model
        }
      }
      if (rawText) break;
    }

    if (!rawText) {
      console.info(
        `[BroadcastCommentary] All Gemini models currently experiencing high demand (503). Serving resilient analytical strategy debrief.`
      );
      return res.json({
        success: true,
        source: "fallback",
        notice: "Gemini models experiencing temporary high demand; instant analytical audit activated.",
        commentary: buildFallbackCommentary(),
      });
    }

    let parsed: any;
    try {
      parsed = JSON.parse(rawText);
    } catch (parseErr) {
      console.info("[BroadcastCommentary] Cleaning markdown wrapper from JSON response");
      const cleaned = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();
      parsed = JSON.parse(cleaned);
    }

    const finalResult = {
      teamId,
      teamName: teamAccuracyData.teamName,
      ownerName: teamAccuracyData.ownerName,
      weekNumber: numericWeek,
      persona,
      focusMode,
      headline: parsed.headline || `Week ${numericWeek} Broadcast Commentary`,
      broadcastScript: Array.isArray(parsed.broadcastScript) ? parsed.broadcastScript : buildFallbackCommentary().broadcastScript,
      strategyAssessment: {
        grade: parsed.strategyAssessment?.grade || "B+",
        summary: parsed.strategyAssessment?.summary || `Solid execution with ${weekRecord.pointsEarned} points captured.`,
        capitalEfficiency: Number(parsed.strategyAssessment?.capitalEfficiency) || weekRecord.confidenceEfficiency,
        anchorDiscipline: parsed.strategyAssessment?.anchorDiscipline || "Solid Anchor Defense",
        gameTheoryRiskProfile: parsed.strategyAssessment?.gameTheoryRiskProfile || "Balanced Value",
      },
      tacticalPrescriptions: Array.isArray(parsed.tacticalPrescriptions) ? parsed.tacticalPrescriptions : buildFallbackCommentary().tacticalPrescriptions,
      keyHighlights: [
        `${weekRecord.correctCount} Wins / ${weekRecord.gamesCount - weekRecord.correctCount} Losses (${weekRecord.accuracy}% accuracy)`,
        `${weekRecord.pointsEarned} Points Scored (Efficiency: ${weekRecord.confidenceEfficiency}%)`,
        `Top Anchors (13-16 pts): ${weekRecord.anchorRecord} converted`,
      ],
      salQuote: parsed.salQuote || "Keep feedin' dem heavy anchors and leave da cute stuff in the trash!",
      chloeQuote: parsed.chloeQuote || `Confidence Point Efficiency registered at ${weekRecord.confidenceEfficiency}%.`,
      statsSummary,
      generatedWith: modelUsed === "gemini-3.8-flash" ? "Gemini 3.8 Flash (Live AI Commentary)" : `${modelUsed} (Live AI Commentary)`,
      timestamp: new Date().toISOString(),
    };

    res.json({
      success: true,
      source: "gemini",
      modelUsed,
      commentary: finalResult,
    });
  } catch (error: any) {
    console.info("[BroadcastCommentary] Handled fallback during commentary generation:", error?.message || error);
    res.json({
      success: true,
      source: "fallback",
      error: error.message || "High demand fallback",
      commentary: buildFallbackCommentary(),
    });
  }
});

// ============================================================================
// Section 9.0: Ask the Coach for Pick Advice & Tactical Matchup Analysis
// Interactive coach advisory engine with Coach Sal, Dr. Chloe, and Commish
// ============================================================================
app.post("/api/coach/ask-advice", async (req, res) => {
  const {
    question = "How should I allocate my 14 to 16 point anchor picks this week?",
    coach = "sal",
    teamId = "team-todd",
    weekNumber = 2,
  } = req.body;

  const teamProfile = getPickerAdviceProfile(teamId);
  const ownerName = teamProfile.ownerName || "Manager";
  const teamName = teamProfile.teamName || "Franchise";
  const currentRank = teamProfile.rank || 8;

  // Rule-based fallback generator for immediate offline / 503 resilience
  const buildFallbackAdvice = () => {
    const qLower = (question || "").toLowerCase();
    let headline = "COACH SAL'S CHALK TALK: DISCIPLINE WINS THE INITECH INVITATIONAL!";
    let verbalAdvice = `[slaps laminate table at Vito & Sal's, hot giardiniera flying] Listen to me, ${ownerName}! You're sittin' at Rank #${currentRank}, and you're lookin' for the magic pill. Let me tell ya what wins in this league: IT'S NOT BEING CUTE! It's the trenches! You protect your big four hammers—the 13, 14, 15, and 16-point buckets—like they're the last beef sandwiches in Bridgeport! You only put double-digit confidence on teams that control both sides of the line of scrimmage, win the turnover battle, and don't turn the football over in their own territory. You leave the 1 and 2-point scrap heap for the coin-flip road dogs. That's how we climb to number one!`;
    let bulletPoints = [
      "Rule 1 (The Iron Anchor): Put your 14, 15, and 16 points exclusively on home favorites with dominant offensive line run-block win rates.",
      "Rule 2 (The Thursday Night Quarantine): Never assign more than 5 confidence points to Thursday night games—short rest creates erratic turnover variance.",
      "Rule 3 (The Leverage Pivot): If you need to chase the leader, don't blow up your whole card; find ONE public chalk trap (80%+ public on a 3-point favorite) and fade it with 7 confidence points.",
      "Rule 4 (Monday Night Ammo): Reserve 6 to 9 points for Monday Night Football so you have the mathematical runway to pivot if you need points to clinch.",
    ];
    let goldenRule = "Never risk double-digit confidence on a team that can't run a trap play!";
    let recommendedPicks = [
      {
        matchup: "DET Lions @ GB Packers",
        recommendedTeam: "DET",
        confidenceTier: "14-16 (Heavy Anchor)",
        rationale: "Dominant offensive line projection; Lions control tempo and limit short-field turnovers.",
      },
      {
        matchup: "BAL Ravens @ KC Chiefs",
        recommendedTeam: "BAL",
        confidenceTier: "10-12 (Core Value)",
        rationale: "Elite rushing attack creates positive time-of-possession leverage against crowd consensus.",
      },
      {
        matchup: "BUF Bills vs ARI Cardinals",
        recommendedTeam: "BUF",
        confidenceTier: "6-8 (Mid Buffer)",
        rationale: "High public ownership (88%) makes this dangerous chalk; protect capital with a moderate hedge.",
      },
    ];
    let chloePerspective = `Statistical EPA analysis confirms Sal's principle: 68.4% of total pool scoring variance is concentrated in games weighted 11-16 points. Maximizing win probability on those four games yields a higher seasonal expected value than hunting low-probability upsets.`;

    if (qLower.includes("chase") || qLower.includes("leader") || qLower.includes("catch") || qLower.includes("underdog")) {
      headline = "COACH SAL'S CHASE PROTOCOL: SURGICAL PIVOTS, NOT SUICIDE MISSIONS!";
      verbalAdvice = `[points cigar firmly at the chalkboard] You wanna catch the leader, ${ownerName}? You don't do it by pickin' eight underdogs and throwing your season into Lake Michigan! That's amateur hour! You look for THE ONE GAME where the public is completely drunk on a hype train. When 85% of Yahoo is on a 3.5-point favorite, that's where you drop a 7-point pivot on the underdog! If it hits, you gain 14 net points on the whole field in one swing!`;
      goldenRule = "One well-placed 7-point dagger beats six reckless 1-point prayer picks every single time.";
    } else if (qLower.includes("anchor") || qLower.includes("14") || qLower.includes("16") || qLower.includes("heavy")) {
      headline = "COACH SAL'S ANCHOR DEFENSE: LOCK UP FORT KNOX!";
      verbalAdvice = `[leans in with ferocious focus] Look at me! Your 13, 14, 15, and 16-pointers are worth 58 total points! That's almost half your entire week! You do NOT give those points to rookie quarterbacks on the road! You give them to veteran signal callers with top-five defensive pass rushes. When you hit 4-for-4 on anchors, you cannot have a bad week in this pool!`;
      goldenRule = "Your anchors aren't for gambling; they're for collecting interest. Protect them with your life.";
    } else if (qLower.includes("thursday") || qLower.includes("monday") || qLower.includes("mnf")) {
      headline = "COACH SAL'S PRIMETIME RULE: QUARANTINE THURSDAY, WEAPONIZE MONDAY!";
      verbalAdvice = `[adjusts headset with a scowl] Thursday night football is sloppy football, period! Guys didn't even heal from Sunday! Keep your Thursday pick under 4 points. But Monday night? That's your closer! Keep 7 or 8 points on Monday night so when Sunday wraps up, you know EXACTLY what you need to take home the weekly prize!`;
      goldenRule = "Thursday is a minefield; Monday is your scalpel.";
    }

    if (coach === "chloe") {
      headline = `DR. CHLOE VANCE: BAYESIAN PORTFOLIO OPTIMIZATION`;
      verbalAdvice = `[tapping stylus against Monte Carlo simulation chart] Looking at the variance matrix for ${teamName}, your priority is maximizing Closing Line Value (CLV). In Yahoo Pick'em Group #13003, the median participant overweights public favorites by 12.8%. By aligning your highest confidence buckets with Vegas consensus models rather than public sentiment, you generate an asymmetric risk-reward curve that outperforms the field over an 18-week sample.`;
      goldenRule = "Eliminate uncompensated variance: weight games strictly by modeled win probability delta.";
    } else if (coach === "commish") {
      headline = `THE COMMISH AI: OFFICIAL LEAGUE #13003 DIRECTIVE`;
      verbalAdvice = `[gavel strikes official league ledger] Commissioner Audit for ${ownerName}: All picks lock strictly at scheduled kickoff. To maximize your clinch index and prevent elimination from weekly high-score payouts, maintain strict confidence tier separation. Dispersing high confidence uniformly across uncertain matchups statistically accelerates elimination.`;
      goldenRule = "Standings reward disciplined capital preservation; rash speculation guarantees a mid-table finish.";
    }

    return {
      coach,
      coachName: coach === "chloe" ? "Dr. Chloe Vance" : coach === "commish" ? "The Commish AI" : "Coach Sal 'Da Bear' Ditkofsky",
      teamId,
      teamName,
      ownerName,
      currentRank,
      question,
      headline,
      verbalAdvice,
      bulletPoints,
      goldenRule,
      recommendedPicks,
      chloePerspective,
      source: "analytical_fallback",
      generatedWith: "Initech Tactical Coaching Engine (Resilient)",
      timestamp: new Date().toISOString(),
    };
  };

  try {
    const ai = getGeminiClient();
    if (!ai) {
      return res.json({
        success: true,
        source: "fallback",
        advice: buildFallbackAdvice(),
      });
    }

    const personaInstructions =
      coach === "chloe"
        ? `You are Dr. Chloe "The Algorithm" Vance, 28-yr-old MIT Sloan sports analytics director. High-speed, articulate, data scientist. Focus on Expected Points Added (EPA), Bayesian win probability, closing line value (CLV), confidence point efficiency, and Game Theory Optimal (GTO) play.`
        : coach === "commish"
        ? `You are The Commish AI, the stern, dry mathematical referee and commissioner of Yahoo Pick'em Group #13003. Cite pool rules, standings implications, tiebreaker math, and point protection.`
        : `You are Coach Sal "Da Bear" Ditkofsky, 61-yr-old Bridgeport Chicago hot-head, 1985 Bears superfan, South-Side beef stand owner. Ditka accent ("dis", "dat", "dem", "da Bears"), table slaps, unlit cigar, tough love, blunt accountability. Focus on line of scrimmage dominance, turnover differential, avoiding cute hedges, and protecting heavy 14-16 point anchor games.`;

    const prompt = `You are providing on-air tactical pick advice and strategic football analysis for a manager in "The Initech Invitational: Yahoo Pick'em #13003" confidence pool.

User's Question: "${question}"
Manager Name: "${ownerName}"
Team Name: "${teamName}"
Current League Standing: Rank #${currentRank} out of 10 managers in Group #13003
Week Number: Week ${weekNumber}

Persona Guidelines:
${personaInstructions}

Provide concrete, actionable advice on how to make picks, allocate confidence points (1 to 16), avoid chalk traps, or analyze specific matchups.
Output JSON strictly conforming to this schema:
{
  "headline": "Punchy all-caps coaching headline",
  "verbalAdvice": "Detailed direct spoken response (130-180 words) with expressive stage directions in brackets like [slaps desk], [points finger], [adjusts glasses]. Highly engaging and actionable.",
  "bulletPoints": [
    "Rule 1: ...",
    "Rule 2: ...",
    "Rule 3: ...",
    "Rule 4: ..."
  ],
  "goldenRule": "One punchy signature rule of thumb",
  "recommendedPicks": [
    {
      "matchup": "Matchup name e.g. DET @ GB",
      "recommendedTeam": "e.g. DET",
      "confidenceTier": "14-16 (Heavy Anchor) or 8-13 (Core Value) or 1-7 (Low Hedge)",
      "rationale": "Clear trench and situational reasoning"
    }
  ],
  "chloePerspective": "Dr. Chloe Vance's concise 2-sentence statistical analytics note on Expected Value and variance."
}
`;

    const candidateModels = ["gemini-3.8-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];
    let rawText = "";
    let modelUsed = "gemini-3.8-flash";

    for (const model of candidateModels) {
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
              responseMimeType: "application/json",
            },
          });

          if (response.text) {
            rawText = response.text;
            modelUsed = model;
            break;
          }
        } catch (err: any) {
          const errMsg = err?.message || String(err);
          const isHighDemand =
            err?.status === 503 ||
            errMsg.includes("503") ||
            errMsg.includes("UNAVAILABLE") ||
            errMsg.includes("high demand") ||
            errMsg.includes("Spikes in demand");

          if (isHighDemand) {
            console.info(`[AskCoach] Model ${model} returned 503 on attempt ${attempt + 1}.`);
            if (attempt === 0) {
              await new Promise((r) => setTimeout(r, 500));
              continue;
            }
          }
          break;
        }
      }
      if (rawText) break;
    }

    if (!rawText) {
      console.info("[AskCoach] Models temporarily unavailable. Serving analytical coaching fallback.");
      return res.json({
        success: true,
        source: "fallback",
        advice: buildFallbackAdvice(),
      });
    }

    let parsed: any;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      const cleaned = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();
      parsed = JSON.parse(cleaned);
    }

    const fallbackData = buildFallbackAdvice();
    const advicePayload = {
      coach,
      coachName: coach === "chloe" ? "Dr. Chloe Vance" : coach === "commish" ? "The Commish AI" : "Coach Sal 'Da Bear' Ditkofsky",
      teamId,
      teamName,
      ownerName,
      currentRank,
      question,
      headline: parsed.headline || fallbackData.headline,
      verbalAdvice: parsed.verbalAdvice || fallbackData.verbalAdvice,
      bulletPoints: Array.isArray(parsed.bulletPoints) && parsed.bulletPoints.length > 0 ? parsed.bulletPoints : fallbackData.bulletPoints,
      goldenRule: parsed.goldenRule || fallbackData.goldenRule,
      recommendedPicks: Array.isArray(parsed.recommendedPicks) && parsed.recommendedPicks.length > 0 ? parsed.recommendedPicks : fallbackData.recommendedPicks,
      chloePerspective: parsed.chloePerspective || fallbackData.chloePerspective,
      source: "gemini",
      modelUsed,
      generatedWith: modelUsed === "gemini-3.8-flash" ? "Gemini 3.8 Flash (Live Coaching)" : `${modelUsed} (Live Coaching)`,
      timestamp: new Date().toISOString(),
    };

    res.json({
      success: true,
      source: "gemini",
      modelUsed,
      advice: advicePayload,
    });
  } catch (error: any) {
    console.info("[AskCoach] Handled error with analytical fallback:", error?.message || error);
    res.json({
      success: true,
      source: "fallback",
      advice: buildFallbackAdvice(),
    });
  }
});


// Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

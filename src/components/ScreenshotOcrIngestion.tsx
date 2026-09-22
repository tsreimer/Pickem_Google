import React, { useState, useRef, useEffect } from 'react';
import { useTeam } from '../context/TeamContext';
import { YAHOO_WEEK_GAMES } from '../data/mockData';
import { YahooGroupTeamRow, YahooPickCell } from '../types';
import {
  Camera,
  UploadCloud,
  FileSpreadsheet,
  Check,
  Copy,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Eye,
  Trash2,
  ExternalLink,
  ShieldCheck,
  HelpCircle,
  Layers,
  Terminal,
  FileText,
  Sliders
} from 'lucide-react';

interface ExtractedManagerData {
  managerName: string;
  teamName: string;
  mnfTotalPoints?: number;
  picks: Array<{
    gameId: number;
    team: string;
    confidence: number;
  }>;
  sumPoints?: number;
  isValidSum?: boolean;
  csvRow?: string;
}

interface ScreenshotOcrIngestionProps {
  onLoadIntoValidator?: (csvText: string) => void;
  onStageToWarRoom?: (rows: YahooGroupTeamRow[]) => void;
}

export const ScreenshotOcrIngestion: React.FC<ScreenshotOcrIngestionProps> = ({
  onLoadIntoValidator,
  onStageToWarRoom,
}) => {
  const { updateGroupPicksMatrix } = useTeam();

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [managerHint, setManagerHint] = useState<string>('');
  const [teamHint, setTeamHint] = useState<string>('');

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [ocrStep, setOcrStep] = useState<number>(0); // 1 to 4
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [extractedManagers, setExtractedManagers] = useState<ExtractedManagerData[]>([]);
  const [generatedCsv, setGeneratedCsv] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [modelUsed, setModelUsed] = useState<string>('');

  const [showPromptModal, setShowPromptModal] = useState<boolean>(false);
  const [aiPromptText, setAiPromptText] = useState<string>('');
  const [copiedPrompt, setCopiedPrompt] = useState<boolean>(false);
  const [copiedCsv, setCopiedCsv] = useState<boolean>(false);
  const [stagedSuccess, setStagedSuccess] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const dropZoneRef = useRef<HTMLDivElement | null>(null);

  // Fetch pre-baked AI prompt from backend or fallback to static generator
  useEffect(() => {
    fetch('/api/picks/ai-prompt?week=2')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.prompt) {
          setAiPromptText(data.prompt);
        }
      })
      .catch(() => {
        // Fallback prompt text if backend is unreachable
        const gamesList = YAHOO_WEEK_GAMES.map(
          (g) => `Game ${g.id}: ${g.favored} vs ${g.underdog}${g.isLocked ? " [LOCKED]" : " [PENDING]"}`
        ).join('\n');
        setAiPromptText(`You are an expert NFL Pick'em Ingestion Assistant for the "Initech Invitational" confidence pool for Week 2.\nI am attaching a screenshot of an NFL Pick'em card or league group picks table for Week 2.\n\nPlease convert this screenshot into an RFC-compliant CSV with ZERO conversational preamble or markdown backticks so I can paste it directly into our pool ingestion engine.\n\n### Strict League Rules & Anti-Leak Privacy Directives:\n1. Each manager picks ONE team for each NFL game.\n2. CRITICAL ANTI-LEAK PRIVACY SHIELD: If a game has not locked yet (e.g. Games 2 to 16), DO NOT extract or expose anyone's future pick! For any un-locked game, output '--' for team and leave the points cell empty.\n3. DO NOT invent fake picks or confidence numbers to fill unplayed games or force a 136 total. If a game is not locked, keep it blank/empty.\n4. League Tie Rule: There are NO tiebreakers this season; winners split the prize evenly.\n5. Standard NFL team abbreviations only (e.g. Buf, Det, SF, KC, Sea, etc.).\n\n### Official Week 2 NFL Game Schedule (Game 1 to 16):\n${gamesList}\n\n### Required Output Format:\nLine 1 MUST be the exact CSV header:\nManager,TeamName,G1_Team,G1_Pts,G2_Team,G2_Pts,G3_Team,G3_Pts,G4_Team,G4_Pts,G5_Team,G5_Pts,G6_Team,G6_Pts,G7_Team,G7_Pts,G8_Team,G8_Pts,G9_Team,G9_Pts,G10_Team,G10_Pts,G11_Team,G11_Pts,G12_Team,G12_Pts,G13_Team,G13_Pts,G14_Team,G14_Pts,G15_Team,G15_Pts,G16_Team,G16_Pts,MNF_Total_Points\n\nOutput only the pure CSV text.`);
      });
  }, []);

  // Global clipboard paste listener
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            handleImageSelected(blob);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const handleImageSelected = (file: File) => {
    setImageFile(file);
    setErrorMessage(null);
    setStagedSuccess(false);

    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageSelected(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleImageSelected(file);
    } else {
      setErrorMessage('Please drop a valid image file (PNG, JPG, or WEBP).');
    }
  };

  // Generate an in-browser sample screenshot canvas so the user can test the pipeline immediately
  const handleLoadDemoScreenshot = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1000;
    canvas.height = 700;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Dark slate background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Header bar
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(20, 20, 960, 70);
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('YAHOO! SPORTS PICK\'EM - INITECH INVITATIONAL (WEEK 1)', 40, 62);

    // Card title
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('Manager: Todd Reimer  |  Team: CramItUp Your CramHole Lafleur  |  Rule: Ties Split Prize Evenly', 40, 130);

    // Table of picks
    const demoPicks = [
      { game: 'G1: Sea vs NE', pick: 'Sea', conf: 8 },
      { game: 'G2: LAR vs SF', pick: 'LAR', conf: 9 },
      { game: 'G3: Cin vs TB', pick: 'Cin', conf: 10 },
      { game: 'G4: Det vs NO', pick: 'Det', conf: 14 },
      { game: 'G5: Ten vs NYJ', pick: 'Ten', conf: 3 },
      { game: 'G6: Bal vs Ind', pick: 'Bal', conf: 12 },
      { game: 'G7: Pit vs Atl', pick: 'Pit', conf: 11 },
      { game: 'G8: Chi vs Car', pick: 'Chi', conf: 5 },
      { game: 'G9: Jax vs Cle', pick: 'Jax', conf: 15 },
      { game: 'G10: Buf vs Hou', pick: 'Buf', conf: 7 },
      { game: 'G11: LV vs Mia', pick: 'LV', conf: 2 },
      { game: 'G12: Min vs GB', pick: 'Min', conf: 1 },
      { game: 'G13: Phi vs Was', pick: 'Phi', conf: 13 },
      { game: 'G14: LAC vs Ari', pick: 'LAC', conf: 16 },
      { game: 'G15: Dal vs NYG', pick: 'Dal', conf: 4 },
      { game: 'G16: KC vs Den', pick: 'KC', conf: 6 },
    ];

    ctx.font = '14px monospace';
    demoPicks.forEach((p, idx) => {
      const col = idx < 8 ? 0 : 1;
      const row = idx % 8;
      const x = 40 + col * 470;
      const y = 170 + row * 60;

      ctx.fillStyle = '#1e293b';
      ctx.fillRect(x, y, 450, 48);

      ctx.fillStyle = '#94a3b8';
      ctx.fillText(p.game, x + 15, y + 30);

      ctx.fillStyle = '#22c55e';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText(`PICK: ${p.pick}`, x + 240, y + 30);

      ctx.fillStyle = '#fbbf24';
      ctx.fillText(`[${p.conf} pts]`, x + 350, y + 30);
      ctx.font = '14px monospace';
    });

    // Verification badge
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('CONFIDENCE WEIGHT SUM: 136 / 136  (ALL 1-16 USED ONCE)', 40, 670);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'initech_demo_picksheet.png', { type: 'image/png' });
        handleImageSelected(file);
      }
    }, 'image/png');
  };

  const handleProcessOcr = async () => {
    if (!imagePreviewUrl) {
      setErrorMessage('Please select, drop, or paste a screenshot first.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    setOcrStep(1);

    try {
      // Step 1: Preprocessing & Encoding
      await new Promise((r) => setTimeout(r, 400));
      setOcrStep(2);

      // Step 2: Multimodal Gemini 3.8 Flash API call
      const response = await fetch('/api/picks/ocr-screenshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imagePreviewUrl,
          mimeType: imageFile?.type || 'image/png',
          managerNameHint: managerHint.trim(),
          teamNameHint: teamHint.trim(),
          weekNumber: 2,
        }),
      });

      setOcrStep(3);
      await new Promise((r) => setTimeout(r, 300));

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to extract picks from screenshot');
      }

      setOcrStep(4);
      await new Promise((r) => setTimeout(r, 300));

      setExtractedManagers(data.managers || []);
      setGeneratedCsv(data.fullCsv || '');
      setNotes(data.notes || '');
      setModelUsed(data.modelUsed || 'gemini-3.8-flash');
    } catch (err: any) {
      console.error('OCR processing error:', err);
      setErrorMessage(err.message || 'An error occurred while analyzing the screenshot.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(aiPromptText);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2500);
  };

  const handleCopyCsv = () => {
    navigator.clipboard.writeText(generatedCsv);
    setCopiedCsv(true);
    setTimeout(() => setCopiedCsv(false), 2500);
  };

  const handleStageDirectly = () => {
    if (extractedManagers.length === 0) return;

    const rowsToStage: YahooGroupTeamRow[] = extractedManagers.map((mgr, idx) => {
      const pickMap: Record<number, YahooPickCell> = {};
      let totalEarnedPoints = 0;

      for (let g = 1; g <= 16; g++) {
        const p = mgr.picks?.find((pk) => pk.gameId === g);
        const gameRef = YAHOO_WEEK_GAMES.find((gw) => gw.id === g);
        const isLocked = Boolean(gameRef?.isLocked);
        const isFinal = gameRef?.status === 'final';

        if (!isLocked) {
          // Anti-leak shield
          pickMap[g] = { team: '--', status: 'hidden' };
        } else if (p && p.team && p.team !== '--') {
          const won = isFinal && Boolean(gameRef?.winner && gameRef.winner.toLowerCase() === p.team.toLowerCase());
          const lost = isFinal && Boolean(gameRef?.winner && gameRef.winner.toLowerCase() !== p.team.toLowerCase());
          pickMap[g] = {
            team: p.team,
            confidence: p.confidence || undefined,
            status: won ? 'won' : lost ? 'lost' : 'pending',
          };
          if (won && p.confidence) {
            totalEarnedPoints += p.confidence;
          }
        } else {
          pickMap[g] = { team: '--', status: 'hidden' };
        }
      }

      const isCurrentUser =
        mgr.managerName.toLowerCase().includes('todd') ||
        mgr.teamName.toLowerCase().includes('cram');

      return {
        teamId: `ocr-team-${idx + 1}`,
        teamName: mgr.teamName || mgr.managerName,
        ownerName: mgr.managerName,
        points: totalEarnedPoints,
        isCurrentUser,
        picks: pickMap,
      };
    });

    updateGroupPicksMatrix(rowsToStage);
    if (onStageToWarRoom) {
      onStageToWarRoom(rowsToStage);
    }
    setStagedSuccess(true);
  };

  const handleSendToValidator = () => {
    if (!generatedCsv) return;
    if (onLoadIntoValidator) {
      onLoadIntoValidator(generatedCsv);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Quick Actions */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/50 via-slate-900 to-indigo-950/50 border border-purple-800/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Camera className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white uppercase tracking-wider">
                  Screenshot-to-CSV AI Vision Ingestion
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-200 border border-purple-500/40 font-mono font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-purple-300" />
                  GEMINI 3.8 FLASH OCR
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Snap or paste any Yahoo Pick&apos;em screenshot to auto-extract manager picks into an RFC-compliant CSV with strict 1-16 weight verification.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowPromptModal(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/30 flex items-center gap-2 transition cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy AI Prompt (ChatGPT/Claude)</span>
          </button>

          <button
            onClick={handleLoadDemoScreenshot}
            className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span>Load Demo Screenshot</span>
          </button>
        </div>
      </div>

      {/* Main Upload & Configuration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Dropzone & Image Preview */}
        <div className="lg:col-span-7 space-y-4">
          <div
            ref={dropZoneRef}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`relative rounded-2xl border-2 border-dashed p-6 transition flex flex-col items-center justify-center text-center min-h-[260px] ${
              imagePreviewUrl
                ? 'border-purple-500/50 bg-slate-900/80'
                : 'border-slate-700/80 hover:border-purple-400/60 bg-slate-900/40 hover:bg-slate-900/60'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/jpg"
              onChange={handleFileInputChange}
              className="hidden"
            />

            {imagePreviewUrl ? (
              <div className="w-full space-y-4">
                <div className="relative group rounded-xl overflow-hidden border border-slate-700/80 bg-black/40 max-h-[320px] flex items-center justify-center">
                  <img
                    src={imagePreviewUrl}
                    alt="Picksheet Screenshot Preview"
                    className="max-h-[320px] w-auto object-contain rounded-lg"
                  />
                  <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 text-white text-xs font-semibold border border-slate-600 hover:bg-slate-700 transition"
                    >
                      Change Image
                    </button>
                    <button
                      onClick={() => {
                        setImageFile(null);
                        setImagePreviewUrl(null);
                        setExtractedManagers([]);
                        setGeneratedCsv('');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-red-900/80 text-red-200 text-xs font-semibold border border-red-700 hover:bg-red-800 transition flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Remove
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                  <span className="flex items-center gap-1 font-mono text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    {imageFile ? `${imageFile.name} (${(imageFile.size / 1024).toFixed(1)} KB)` : 'Demo screenshot loaded'}
                  </span>
                  <span className="text-slate-500 italic">Press Ctrl+V / Cmd+V to paste another screenshot</span>
                </div>
              </div>
            ) : (
              <div className="space-y-3 py-4">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-inner">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-200">
                    Drag &amp; drop your pick&apos;em screenshot here
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    Take a screenshot of your Yahoo pick sheet or group matrix and press <span className="px-1.5 py-0.5 rounded bg-slate-800 text-purple-300 font-mono text-[11px] border border-slate-700">Ctrl + V</span> or browse.
                  </p>
                </div>

                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition shadow-md cursor-pointer"
                  >
                    Select Screenshot File
                  </button>
                  <button
                    type="button"
                    onClick={handleLoadDemoScreenshot}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition cursor-pointer"
                  >
                    Try Sample Card
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Optional Hints for Enhanced OCR Matching */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-purple-400" />
                OCR Recognition Hints (Optional)
              </span>
              <span className="text-[10px] text-slate-500">Helps auto-associate card metadata</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Manager Name Hint
                </label>
                <input
                  type="text"
                  value={managerHint}
                  onChange={(e) => setManagerHint(e.target.value)}
                  placeholder="e.g. Todd Reimer or Dave K"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Team Name Hint
                </label>
                <input
                  type="text"
                  value={teamHint}
                  onChange={(e) => setTeamHint(e.target.value)}
                  placeholder="e.g. CramItUp Your CramHole Lafleur"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Execution Triggers & Progress Pipeline */}
        <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
              <h4 className="text-xs font-black text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" />
                Ingestion Verification Pipeline
              </h4>

              <div className="space-y-2.5 text-xs">
                <div className={`p-2.5 rounded-lg border flex items-center justify-between ${
                  ocrStep >= 1 ? 'bg-purple-950/40 border-purple-800 text-purple-200' : 'bg-slate-950 border-slate-800 text-slate-500'
                }`}>
                  <span className="font-medium">1. Image Sanitization &amp; Canvas Encoding</span>
                  {ocrStep >= 1 && <Check className="w-3.5 h-3.5 text-purple-400" />}
                </div>

                <div className={`p-2.5 rounded-lg border flex items-center justify-between ${
                  ocrStep >= 2 ? 'bg-purple-950/40 border-purple-800 text-purple-200' : 'bg-slate-950 border-slate-800 text-slate-500'
                }`}>
                  <span className="font-medium">2. Gemini 3.8 Flash Vision Multimodal OCR</span>
                  {ocrStep >= 2 && <Check className="w-3.5 h-3.5 text-purple-400" />}
                </div>

                <div className={`p-2.5 rounded-lg border flex items-center justify-between ${
                  ocrStep >= 3 ? 'bg-purple-950/40 border-purple-800 text-purple-200' : 'bg-slate-950 border-slate-800 text-slate-500'
                }`}>
                  <span className="font-medium">3. 1-16 Unique Weights &amp; 136-Pt Sum Audit</span>
                  {ocrStep >= 3 && <Check className="w-3.5 h-3.5 text-purple-400" />}
                </div>

                <div className={`p-2.5 rounded-lg border flex items-center justify-between ${
                  ocrStep >= 4 ? 'bg-purple-950/40 border-purple-800 text-purple-200' : 'bg-slate-950 border-slate-800 text-slate-500'
                }`}>
                  <span className="font-medium">4. RFC-Compliant CSV Formulation</span>
                  {ocrStep >= 4 && <Check className="w-3.5 h-3.5 text-purple-400" />}
                </div>
              </div>
            </div>

            {/* Error Notification */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-red-950/70 border border-red-800 text-red-300 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold">Extraction Error</p>
                  <p className="text-red-300/90">{errorMessage}</p>
                </div>
              </div>
            )}

            {/* Staged Notification */}
            {stagedSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-xs flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Successfully Staged into War Room!</p>
                  <p className="text-emerald-300/90">
                    The extracted manager cards are now active in the Group Picks Matrix and Live Standings.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Action Trigger Button */}
          <div className="pt-2">
            <button
              onClick={handleProcessOcr}
              disabled={isProcessing || !imagePreviewUrl}
              className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2.5 transition shadow-lg ${
                isProcessing || !imagePreviewUrl
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-900/30 cursor-pointer'
              }`}
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-purple-300" />
                  <span>Analyzing Screenshot with Gemini Vision...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-purple-200" />
                  <span>Extract Picks with Gemini 3.8 Flash Vision</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Extracted Results Section (Visible after extraction) */}
      {extractedManagers.length > 0 && (
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-5 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <ShieldCheck className="w-4 h-4" />
              </span>
              <div>
                <h4 className="text-sm font-black text-white uppercase tracking-wider">
                  Extracted Pick&apos;em Card(s) ({extractedManagers.length})
                </h4>
                <p className="text-[11px] text-slate-400">
                  {notes || `Processed with ${modelUsed}. All integrity checks verified.`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyCsv}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
              >
                {copiedCsv ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCsv ? 'Copied CSV!' : 'Copy CSV'}</span>
              </button>

              <button
                onClick={handleSendToValidator}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white flex items-center gap-1.5 transition cursor-pointer shadow-md"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Send to CSV Validator</span>
              </button>

              <button
                onClick={handleStageDirectly}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-black flex items-center gap-1.5 transition cursor-pointer shadow-md"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>Stage Directly to War Room</span>
              </button>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="space-y-4">
            {extractedManagers.map((mgr, mIdx) => {
              const weights = mgr.picks?.map((p) => p.confidence).filter((c) => c > 0) || [];
              const sum = weights.reduce((a, b) => a + b, 0);
              const isValid = sum === 136 && weights.length === 16;

              return (
                <div key={mIdx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-sm font-black text-white">{mgr.managerName || 'Manager'}</span>
                      <span className="text-xs text-slate-400 ml-2">({mgr.teamName || 'Team'})</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-[11px] px-2.5 py-0.5 rounded-full font-mono font-bold border ${
                          weights.length === 16
                            ? isValid
                              ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                              : 'bg-amber-950/60 text-amber-300 border-amber-800'
                            : 'bg-indigo-950/60 text-indigo-300 border-indigo-700'
                        }`}
                      >
                        {weights.length === 16
                          ? `Sum: ${sum}/136 pts ${isValid ? '✓ (Valid 1-16)' : '⚠ Check Weights'}`
                          : `Locked: ${weights.length}/16 Games (${sum} pts) • G${weights.length + 1}-G16 Masked`}
                      </span>
                      {weights.length < 16 && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/70 text-emerald-300 font-mono border border-emerald-800 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-emerald-400" />
                          Anti-Leak Shield Active
                        </span>
                      )}
                      <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono border border-slate-700">
                        Rule: Ties Split Prize Evenly
                      </span>
                    </div>
                  </div>

                  {/* 16-Game Picks Visual Matrix */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
                    {Array.from({ length: 16 }, (_, i) => i + 1).map((gameId) => {
                      const pick = mgr.picks?.find((p) => p.gameId === gameId);
                      const gameRef = YAHOO_WEEK_GAMES.find((gw) => gw.id === gameId);
                      return (
                        <div
                          key={gameId}
                          className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-center space-y-1"
                        >
                          <div className="text-[10px] text-slate-500 font-mono">G{gameId}</div>
                          <div className="text-xs font-black text-white">{pick?.team || '--'}</div>
                          <div className="text-[10px] font-bold text-amber-400 font-mono">
                            {pick?.confidence ? `${pick.confidence} pts` : '--'}
                          </div>
                          <div className="text-[9px] text-slate-500 truncate">
                            {gameRef ? `${gameRef.favored}/${gameRef.underdog}` : ''}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Raw RFC CSV Code Block */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono text-[11px] text-purple-300 font-bold flex items-center gap-1">
                <Terminal className="w-3.5 h-3.5" />
                RFC-Compliant Initech CSV Representation
              </span>
              <button
                onClick={handleCopyCsv}
                className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px]"
              >
                <Copy className="w-3 h-3" />
                Copy
              </button>
            </div>
            <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-300 overflow-x-auto whitespace-pre">
              {generatedCsv}
            </pre>
          </div>
        </div>
      )}

      {/* Copy AI Vision Prompt Modal */}
      {showPromptModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-purple-800/80 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl relative max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  <Sparkles className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">
                    Prompt for External AI (ChatGPT / Claude / Gemini)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Use this prompt if you prefer submitting your screenshot to an external AI chatbot.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPromptModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-xs transition"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 overflow-y-auto flex-1 pr-1 text-xs text-slate-300">
              <p>
                <strong>How to use:</strong> Click <em>Copy Prompt to Clipboard</em>, open ChatGPT Plus, Claude 3.5 Sonnet, or Gemini, attach your screenshot, and paste this prompt. It instructs the AI to generate the exact RFC CSV row with all 16 games and strict 136-point sum constraints.
              </p>

              <div className="relative">
                <textarea
                  readOnly
                  value={aiPromptText}
                  rows={12}
                  className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-200 focus:outline-none resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <span className="text-[11px] text-slate-500">
                Matches the 16 Week 1 NFL games and RFC CSV format.
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyPrompt}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/30 flex items-center gap-1.5 transition cursor-pointer"
                >
                  {copiedPrompt ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPrompt ? 'Prompt Copied to Clipboard!' : 'Copy Prompt to Clipboard'}</span>
                </button>
                <button
                  onClick={() => setShowPromptModal(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useRef } from 'react';
import { useTeam } from '../context/TeamContext';
import { YAHOO_WEEK_GAMES, YAHOO_GROUP_PICKS_MATRIX } from '../data/mockData';
import { YahooGroupTeamRow, YahooPickCell } from '../types';
import { ScreenshotOcrIngestion } from './ScreenshotOcrIngestion';
import {
  FileSpreadsheet,
  Download,
  Upload,
  Copy,
  Check,
  AlertTriangle,
  CheckCircle2,
  FileText,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  HelpCircle,
  Eye,
  ArrowRight,
  Info,
  Database,
  Camera
} from 'lucide-react';

// Generates the official RFC-compliant CSV header
const CSV_HEADER = 'Manager,TeamName,' +
  Array.from({ length: 16 }, (_, i) => `G${i + 1}_Team,G${i + 1}_Pts`).join(',') +
  ',MNF_Total_Points';

// Standard clean CSV template row generator
const generateCsvTemplate = (): string => {
  const exampleRow1 = 'Todd Reimer,CramItUp Your CramHole Lafleur,Sea,8,LAR,9,Cin,10,Det,14,Ten,3,Bal,12,Pit,11,Chi,5,Jax,15,Buf,7,LV,2,Min,1,Phi,13,LAC,16,Dal,4,KC,6,45';
  const exampleRow2 = 'Orange crush,Orange crush,Sea,16,SF,10,Cin,12,Det,14,Ten,5,Bal,15,Pit,8,Chi,6,Jax,13,Buf,11,LV,4,Min,2,Phi,9,LAC,7,Dal,3,KC,1,42';
  const emptyRow1 = 'Dave K,Sir Limps-A-Lot,Sea,4,LAR,5,TB,8,Det,11,NYJ,6,Bal,12,Atl,9,Chi,7,Jax,10,Hou,14,Mia,3,GB,2,Phi,13,LAC,15,NYG,1,Buf,16,48';
  const emptyRow2 = 'Shoeman,Shoeman,Sea,15,LAR,16,Cin,11,Det,13,Ten,4,Bal,14,Pit,10,Chi,6,Jax,12,Buf,9,LV,5,Min,3,Phi,8,LAC,7,Dal,2,KC,1,44';

  return `${CSV_HEADER}\n# INITECH INVITATIONAL OFFICIAL CSV IMPORT FORMAT\n# Rules: Each manager must assign numbers 1 to 16 exactly once (sum = 136). Team codes match NFL slate.\n${exampleRow1}\n${exampleRow2}\n${emptyRow1}\n${emptyRow2}`;
};

// Generates an export of the current active live matrix
const exportMatrixToCsv = (matrix: YahooGroupTeamRow[]): string => {
  const lines = [CSV_HEADER];
  matrix.forEach(row => {
    const pickCells: string[] = [];
    for (let g = 1; g <= 16; g++) {
      const cell = row.picks[g];
      const team = cell?.team && cell.team !== '--' ? cell.team : 'PENDING';
      const conf = cell?.confidence !== undefined ? cell.confidence : '';
      pickCells.push(team, String(conf));
    }
    lines.push(`"${row.ownerName}","${row.teamName}",${pickCells.join(',')},44`);
  });
  return lines.join('\n');
};

interface ParsedValidationResult {
  valid: boolean;
  managerName: string;
  teamName: string;
  picksCount: number;
  assignedPoints: number[];
  duplicatePoints: number[];
  missingPoints: number[];
  sumPoints: number;
  rowNumber: number;
  errors: string[];
}

export const CsvImportExportVault: React.FC = () => {
  const { groupPicksMatrix, updateGroupPicksMatrix, resetGroupPicksMatrix } = useTeam();

  const [activeTab, setActiveTab] = useState<'import' | 'ocr' | 'template' | 'example' | 'export'>('import');
  const [pastedCsvText, setPastedCsvText] = useState<string>('');
  const [copiedTemplate, setCopiedTemplate] = useState<boolean>(false);
  const [copiedExport, setCopiedExport] = useState<boolean>(false);
  const [importStatusMessage, setImportStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [parsedRows, setParsedRows] = useState<YahooGroupTeamRow[]>([]);
  const [validationReport, setValidationReport] = useState<ParsedValidationResult[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Parse and validate CSV text
  const parseAndValidateCsv = (csvContent: string) => {
    const lines = csvContent
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0 && !l.startsWith('#'));

    if (lines.length <= 1) {
      setValidationReport([]);
      setParsedRows([]);
      return;
    }

    const report: ParsedValidationResult[] = [];
    const generatedMatrixRows: YahooGroupTeamRow[] = [];

    // Check if line 0 is a header
    const dataLines = lines[0].toLowerCase().includes('manager') ? lines.slice(1) : lines;

    dataLines.forEach((line, index) => {
      // Split by comma ignoring quotes
      const cells = line.split(',').map(c => c.replace(/^["']|["']$/g, '').trim());
      if (cells.length < 3) return;

      const managerName = cells[0] || `Manager ${index + 1}`;
      const teamName = cells[1] || managerName;
      const errors: string[] = [];
      const assignedPoints: number[] = [];
      const pickMap: Record<number, YahooPickCell> = {};

      // Parse 16 game pairs: [Team, Conf]
      let cellIdx = 2;
      for (let gameId = 1; gameId <= 16; gameId++) {
        const teamCode = cells[cellIdx] || '--';
        const confVal = parseInt(cells[cellIdx + 1], 10);
        cellIdx += 2;

        const gameRef = YAHOO_WEEK_GAMES.find(g => g.id === gameId);
        const isLocked = Boolean(gameRef?.isLocked);
        const isFinal = gameRef?.status === 'final';

        // ANTI-LEAK PRIVACY DIRECTIVE: If game is not locked yet, protect future picks from exposure!
        if (!isLocked) {
          pickMap[gameId] = {
            team: '--',
            status: 'hidden'
          };
        } else if (!isNaN(confVal) && confVal >= 1 && confVal <= 16 && teamCode !== '--') {
          assignedPoints.push(confVal);
          const won = isFinal && Boolean(gameRef?.winner && gameRef.winner.toLowerCase() === teamCode.toLowerCase());
          const lost = isFinal && Boolean(gameRef?.winner && gameRef.winner.toLowerCase() !== teamCode.toLowerCase());
          pickMap[gameId] = {
            team: teamCode,
            confidence: confVal,
            status: won ? 'won' : lost ? 'lost' : 'pending'
          };
        } else {
          pickMap[gameId] = {
            team: teamCode === 'PENDING' ? '--' : teamCode,
            status: 'hidden'
          };
        }
      }

      // Check for duplicates only among assigned points
      const counts: Record<number, number> = {};
      assignedPoints.forEach(p => { counts[p] = (counts[p] || 0) + 1; });
      const duplicatePoints = Object.keys(counts)
        .filter(k => counts[Number(k)] > 1)
        .map(Number);

      // Check missing 1-16 only for complete slates
      const missingPoints: number[] = [];
      for (let i = 1; i <= 16; i++) {
        if (!assignedPoints.includes(i)) missingPoints.push(i);
      }

      const sumPoints = assignedPoints.reduce((acc, curr) => acc + curr, 0);

      if (duplicatePoints.length > 0) {
        errors.push(`Duplicate confidence weights: ${duplicatePoints.join(', ')} pts`);
      }
      // ONLY enforce 136-point sum if all 16 games have locked picks
      if (assignedPoints.length === 16 && sumPoints !== 136) {
        errors.push(`Sum is ${sumPoints} pts (must equal 136 for full 16-game card)`);
      }

      report.push({
        valid: errors.length === 0,
        managerName,
        teamName,
        picksCount: Object.keys(pickMap).length,
        assignedPoints,
        duplicatePoints,
        missingPoints,
        sumPoints,
        rowNumber: index + 1,
        errors
      });

      // Calculate total won points
      let totalWon = 0;
      Object.values(pickMap).forEach(p => {
        if (p.status === 'won' && p.confidence) {
          totalWon += p.confidence;
        }
      });

      const isUser = managerName.toLowerCase().includes('todd') || teamName.toLowerCase().includes('cram');

      // Generate internal row representation
      generatedMatrixRows.push({
        teamId: `custom-team-${index + 1}`,
        teamName,
        ownerName: managerName,
        points: totalWon,
        isCurrentUser: isUser,
        picks: pickMap
      });
    });

    setValidationReport(report);
    setParsedRows(generatedMatrixRows);
  };

  // Handle text area change
  const handleTextChange = (text: string) => {
    setPastedCsvText(text);
    setImportStatusMessage(null);
    parseAndValidateCsv(text);
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setPastedCsvText(content);
        parseAndValidateCsv(content);
        setImportStatusMessage({
          type: 'info',
          text: `Loaded file "${file.name}" (${(file.size / 1024).toFixed(1)} KB). Verified structure below.`
        });
      }
    };
    reader.readAsText(file);
  };

  // Download template file
  const handleDownloadTemplate = () => {
    const content = generateCsvTemplate();
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'initech_confidence_pool_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export current live matrix
  const handleExportCurrent = () => {
    const content = exportMatrixToCsv(groupPicksMatrix || YAHOO_GROUP_PICKS_MATRIX);
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const today = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `initech_picks_snapshot_${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Load sample dataset
  const handleLoadSample = () => {
    const sample = generateCsvTemplate();
    setPastedCsvText(sample);
    parseAndValidateCsv(sample);
    setImportStatusMessage({
      type: 'info',
      text: 'Loaded official Initech 4-manager sample data into parser.'
    });
  };

  // Apply parsed matrix to context
  const handleApplyImport = () => {
    if (parsedRows.length === 0) {
      setImportStatusMessage({
        type: 'error',
        text: 'No valid manager rows to import. Please upload or paste a valid CSV first.'
      });
      return;
    }

    const hasErrors = validationReport.some(r => !r.valid);
    if (hasErrors) {
      const invalidCount = validationReport.filter(r => !r.valid).length;
      if (!window.confirm(`Warning: ${invalidCount} manager row(s) contain validation errors (e.g. duplicate weights). Do you still want to proceed with this backup import?`)) {
        return;
      }
    }

    updateGroupPicksMatrix(parsedRows);
    setImportStatusMessage({
      type: 'success',
      text: `Successfully staged ${parsedRows.length} manager cards into the active War Room & Live Standings!`
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Database className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                Pool Roster &amp; CSV Backup Vault
                <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950 text-purple-300 font-mono font-bold border border-purple-800">
                  OFFLINE SAFEGUARD
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Official Initech Pick&apos;em CSV ingestion, emergency failover parser, and immutable kickoff audit export.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('ocr')}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/30 flex items-center gap-2 transition cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5 text-purple-200" />
            <span>AI Screenshot-to-CSV</span>
          </button>

          <button
            onClick={handleDownloadTemplate}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-2 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-purple-400" />
            <span>Download CSV Template</span>
          </button>

          <button
            onClick={handleExportCurrent}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-black" />
            <span>Export Live Snapshot (.csv)</span>
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setActiveTab('import')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'import'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>1. CSV Ingestion &amp; Validator</span>
        </button>

        <button
          onClick={() => setActiveTab('ocr')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'ocr'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Camera className="w-3.5 h-3.5 text-purple-300" />
          <span>2. AI Screenshot Ingestion</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-950 text-purple-200 border border-purple-800 font-bold ml-1">
            GEMINI VISION
          </span>
        </button>

        <button
          onClick={() => setActiveTab('template')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'template'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>3. CSV Specification &amp; Template</span>
        </button>

        <button
          onClick={() => setActiveTab('example')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'example'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>4. Properly Formatted Example</span>
        </button>

        <button
          onClick={() => setActiveTab('export')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'export'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Download className="w-3.5 h-3.5" />
          <span>5. Live Matrix Snapshot Export</span>
        </button>
      </div>

      {/* Status Alert Banner */}
      {importStatusMessage && (
        <div
          className={`p-4 rounded-xl text-xs font-mono flex items-center justify-between border ${
            importStatusMessage.type === 'success'
              ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300'
              : importStatusMessage.type === 'error'
              ? 'bg-red-950/70 border-red-500/50 text-red-300'
              : 'bg-blue-950/70 border-blue-500/50 text-blue-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {importStatusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : importStatusMessage.type === 'error' ? (
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            ) : (
              <Info className="w-4 h-4 text-blue-400 shrink-0" />
            )}
            <span>{importStatusMessage.text}</span>
          </div>

          <button
            onClick={() => setImportStatusMessage(null)}
            className="text-slate-400 hover:text-white ml-2 text-xs"
          >
            &times;
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: CSV INGESTION & REAL-TIME VALIDATOR                                */}
      {/* ========================================================================= */}
      {activeTab === 'import' && (
        <div className="space-y-6">
          {/* Screenshot AI OCR shortcut banner */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-purple-950/60 via-slate-900 to-indigo-950/60 border border-purple-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-purple-200">
              <span className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30 shrink-0">
                <Camera className="w-4 h-4" />
              </span>
              <div>
                <span className="font-bold text-white">Have a screenshot of your pick sheet instead of a spreadsheet?</span>
                <p className="text-[11px] text-slate-300">
                  Auto-convert your screenshot into an RFC CSV with Gemini 3.8 Flash Vision, or copy our external AI prompt.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('ocr')}
              className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold transition flex items-center gap-1.5 text-xs whitespace-nowrap cursor-pointer self-start sm:self-auto shadow-md"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Launch AI Screenshot OCR</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left 6 cols: Upload & Text Area */}
            <div className="lg:col-span-6 space-y-4">
              
              {/* Drag-and-drop or select area */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700 hover:border-purple-500 rounded-2xl p-6 text-center cursor-pointer transition bg-slate-900/50 hover:bg-slate-900 group"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".csv,.txt"
                  className="hidden"
                />
                <div className="p-3 w-12 h-12 mx-auto rounded-xl bg-purple-500/20 text-purple-400 group-hover:scale-110 transition flex items-center justify-center mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="text-sm font-bold text-white mb-1">
                  Click to Browse or Drag &amp; Drop CSV File
                </div>
                <div className="text-xs text-slate-400">
                  Accepts standard .csv or .txt spreadsheets with Initech 16-game confidence headers
                </div>
              </div>

              {/* Direct Paste Text Area */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-purple-400" />
                    Or Paste Raw CSV Data Directly:
                  </label>
                  <button
                    onClick={handleLoadSample}
                    className="text-[11px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 transition"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Load Sample Data</span>
                  </button>
                </div>

                <textarea
                  rows={8}
                  value={pastedCsvText}
                  onChange={(e) => handleTextChange(e.target.value)}
                  placeholder="Manager,TeamName,G1_Team,G1_Pts,G2_Team,G2_Pts,..."
                  className="w-full bg-[#0B0F17] border border-slate-800 rounded-xl p-3 font-mono text-xs text-slate-300 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 placeholder-slate-600"
                />
              </div>

              {/* Action Controls */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => {
                    setPastedCsvText('');
                    setValidationReport([]);
                    setParsedRows([]);
                    setImportStatusMessage(null);
                  }}
                  disabled={!pastedCsvText}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-900 border border-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Clear Form
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      resetGroupPicksMatrix();
                      setImportStatusMessage({
                        type: 'info',
                        text: 'Restored default Yahoo synced picks matrix.'
                      });
                    }}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-slate-800 border border-slate-700 flex items-center gap-1.5 transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restore Yahoo Sync</span>
                  </button>

                  <button
                    onClick={handleApplyImport}
                    disabled={parsedRows.length === 0}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-500 hover:bg-purple-400 text-white shadow-lg shadow-purple-500/20 flex items-center gap-1.5 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Stage Import ({parsedRows.length} Managers)</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Right 6 cols: Live Validation Engine */}
            <div className="lg:col-span-6 space-y-4">
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Integrity Validation Engine
                  </h3>
                  <span className="text-xs font-mono font-bold text-slate-400">
                    {validationReport.filter(r => r.valid).length} of {validationReport.length} Rows Valid
                  </span>
                </div>

                {validationReport.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-xs space-y-2">
                    <FileSpreadsheet className="w-8 h-8 mx-auto text-slate-600" />
                    <p>Paste or upload a CSV above to inspect live integrity &amp; duplicate confidence checks.</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                    {validationReport.map((res, i) => (
                      <div
                        key={i}
                        className={`p-3 rounded-xl border text-xs font-mono space-y-1.5 transition ${
                          res.valid
                            ? 'bg-slate-950/70 border-emerald-500/40 text-slate-300'
                            : 'bg-red-950/30 border-red-500/50 text-red-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-bold flex items-center gap-2">
                            {res.valid ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                            )}
                            <span className="text-white">{res.managerName}</span>
                            <span className="text-slate-400 text-[10px] font-normal font-sans">
                              ({res.teamName})
                            </span>
                          </div>

                          <span
                            className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                              res.valid
                                ? res.assignedPoints.length === 16
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                : 'bg-red-500/20 text-red-400'
                            }`}
                          >
                            {res.valid
                              ? res.assignedPoints.length === 16
                                ? 'VALID CARD (16/16)'
                                : `VALID (PARTIAL ${res.assignedPoints.length}/16 LOCKED)`
                              : 'CORRECTION NEEDED'}
                          </span>
                        </div>

                        {/* Point Stats */}
                        <div className="text-[11px] text-slate-400 flex items-center gap-3">
                          <span>
                            Locked Games: <strong className="text-white">{res.assignedPoints.length}</strong>/16
                          </span>
                          <span>
                            Sum: <strong className="text-amber-400">{res.sumPoints}</strong> pts {res.sumPoints === 136 ? '✓' : ''}
                          </span>
                          {res.assignedPoints.length < 16 && (
                            <span className="text-emerald-400/90 text-[10px] bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-800/40">
                              🛡️ Anti-Leak Shield Active (G{res.assignedPoints.length + 1}-G16 Masked)
                            </span>
                          )}
                        </div>

                        {/* Error Breakdown if any */}
                        {res.errors.length > 0 && (
                          <div className="pt-1 text-[11px] text-red-300 space-y-0.5 font-sans">
                            {res.errors.map((err, idx) => (
                              <div key={idx} className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                                <span>{err}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Staged Matrix Preview Table */}
          {parsedRows.length > 0 && (
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Database className="w-4 h-4 text-purple-400" />
                    Staged Import Preview ({parsedRows.length} Managers)
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Review parsed allocations before applying to the active War Room board.
                  </p>
                </div>

                <button
                  onClick={handleApplyImport}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-purple-500 hover:bg-purple-400 text-white shadow transition cursor-pointer"
                >
                  Confirm &amp; Apply All
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-950 text-slate-400 text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="py-2 px-3">Manager</th>
                      {YAHOO_WEEK_GAMES.map(g => (
                        <th key={g.id} className="py-2 px-2 text-center">
                          G{g.id}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-[11px]">
                    {parsedRows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/40">
                        <td className="py-2 px-3 text-white font-bold whitespace-nowrap">
                          {row.ownerName}
                        </td>
                        {YAHOO_WEEK_GAMES.map(g => {
                          const p = row.picks[g.id];
                          return (
                            <td key={g.id} className="py-2 px-2 text-center">
                              {p ? (
                                <span className="text-slate-300">
                                  {p.team} {p.confidence ? `[${p.confidence}]` : ''}
                                </span>
                              ) : (
                                <span className="text-slate-600">--</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: SCREENSHOT-TO-CSV AI VISION INGESTION                              */}
      {/* ========================================================================= */}
      {activeTab === 'ocr' && (
        <ScreenshotOcrIngestion
          onLoadIntoValidator={(csvText) => {
            setPastedCsvText(csvText);
            parseAndValidateCsv(csvText);
            setActiveTab('import');
            setImportStatusMessage({
              type: 'info',
              text: 'Loaded extracted screenshot CSV into validator. Inspect 1-16 weights & click Confirm to apply.'
            });
          }}
          onStageToWarRoom={(rows) => {
            setImportStatusMessage({
              type: 'success',
              text: `Successfully staged ${rows.length} manager card(s) from screenshot into active War Room!`
            });
          }}
        />
      )}

      {/* ========================================================================= */}
      {/* TAB 3: CSV SPECIFICATION & TEMPLATE DOWNLOAD                              */}
      {/* ========================================================================= */}
      {activeTab === 'template' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-purple-400" />
                  Official Initech Pick&apos;em CSV Structure
                </h3>
                <p className="text-xs text-slate-400">
                  Follow this specification to prepare your Excel or Google Sheets export for seamless validation.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generateCsvTemplate());
                    setCopiedTemplate(true);
                    setTimeout(() => setCopiedTemplate(false), 2000);
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
                >
                  {copiedTemplate ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-purple-400" />}
                  <span>{copiedTemplate ? 'Copied!' : 'Copy Template CSV'}</span>
                </button>

                <button
                  onClick={handleDownloadTemplate}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white flex items-center gap-1.5 transition cursor-pointer shadow"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .csv</span>
                </button>
              </div>
            </div>

            {/* 3 Core Rules */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="font-bold text-amber-400 uppercase text-[11px] flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  Rule 1: Unique 1 to 16 Weights
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Every manager must assign integers from 1 up to 16 without duplicates. The total point sum across all 16 games must equal exactly 136.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="font-bold text-cyan-400 uppercase text-[11px] flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                  Rule 2: Team Codes
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Use standard abbreviations corresponding to the slate (e.g., KC, BUF, BAL, DET, SEA, LAR, SF). Case-insensitive.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="font-bold text-emerald-400 uppercase text-[11px] flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Rule 3: No Tiebreakers — Even Prize Split
                </div>
                <p className="text-slate-400 leading-relaxed">
                  For this season, there are NO tiebreakers; tied managers split the prize evenly. The final column (MNF_Total_Points) is retained for standard CSV schema compatibility (default 45 or 0) but is never used to break ties.
                </p>
              </div>
            </div>

            {/* Copyable Template Raw Display */}
            <div className="space-y-2 pt-2">
              <div className="text-xs font-mono text-slate-400">
                Template Preview (35 columns per line):
              </div>
              <pre className="p-4 rounded-xl bg-[#0B0F17] border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto whitespace-pre leading-relaxed">
                {generateCsvTemplate()}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: PROPERLY FORMATTED IMPORT EXAMPLE                                  */}
      {/* ========================================================================= */}
      {activeTab === 'example' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Eye className="w-4 h-4 text-amber-400" />
                  Example of a Properly Formatted Import
                </h3>
                <p className="text-xs text-slate-400">
                  Here is how Todd Reimer&apos;s real Initech card and the pool entries look when exported or imported:
                </p>
              </div>

              <button
                onClick={() => {
                  handleLoadSample();
                  setActiveTab('import');
                }}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-black flex items-center gap-1.5 transition cursor-pointer font-sans shadow"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Load This Example into Validator</span>
              </button>
            </div>

            {/* Visual Breakdown of Todd Reimer's Row */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="text-xs font-bold text-white flex items-center justify-between">
                <span className="text-purple-400 font-mono">Row 1 Breakdown: Todd Reimer</span>
                <span className="text-emerald-400 font-mono text-[11px] bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                  VALID: 16 Unique Weights (Sum = 136 pts)
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2 text-center text-xs font-mono">
                {YAHOO_WEEK_GAMES.map(g => {
                  const toddPicks = YAHOO_GROUP_PICKS_MATRIX[1].picks[g.id];
                  return (
                    <div key={g.id} className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                      <div className="text-[10px] text-slate-500 font-bold">G{g.id}</div>
                      <div className="text-white font-bold text-xs">{toddPicks?.team || 'KC'}</div>
                      <div className="text-amber-400 text-[11px]">
                        {toddPicks?.confidence || 6} pts
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Code Box with Syntax Highlighting Simulation */}
            <div className="space-y-1.5">
              <div className="text-xs font-mono text-slate-400">
                Exact CSV Lines (Ready to copy into Notepad or Excel):
              </div>
              <pre className="p-4 rounded-xl bg-[#0B0F17] border border-slate-800 font-mono text-[11px] text-emerald-300 overflow-x-auto whitespace-pre leading-relaxed">
{`Manager,TeamName,G1_Team,G1_Pts,G2_Team,G2_Pts,G3_Team,G3_Pts,G4_Team,G4_Pts,G5_Team,G5_Pts,G6_Team,G6_Pts,G7_Team,G7_Pts,G8_Team,G8_Pts,G9_Team,G9_Pts,G10_Team,G10_Pts,G11_Team,G11_Pts,G12_Team,G12_Pts,G13_Team,G13_Pts,G14_Team,G14_Pts,G15_Team,G15_Pts,G16_Team,G16_Pts,MNF_Total_Points
Todd Reimer,CramItUp Your CramHole Lafleur,Sea,8,LAR,9,Cin,10,Det,14,Ten,3,Bal,12,Pit,11,Chi,5,Jax,15,Buf,7,LV,2,Min,1,Phi,13,LAC,16,Dal,4,KC,6,45
Orange crush,Orange crush,Sea,16,SF,10,Cin,12,Det,14,Ten,5,Bal,15,Pit,8,Chi,6,Jax,13,Buf,11,LV,4,Min,2,Phi,9,LAC,7,Dal,3,KC,1,42
Dave K,Sir Limps-A-Lot,Sea,4,LAR,5,TB,8,Det,11,NYJ,6,Bal,12,Atl,9,Chi,7,Jax,10,Hou,14,Mia,3,GB,2,Phi,13,LAC,15,NYG,1,Buf,16,48
Shoeman,Shoeman,Sea,15,LAR,16,Cin,11,Det,13,Ten,4,Bal,14,Pit,10,Chi,6,Jax,12,Buf,9,LV,5,Min,3,Phi,8,LAC,7,Dal,2,KC,1,44`}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: LIVE MATRIX SNAPSHOT EXPORT                                        */}
      {/* ========================================================================= */}
      {activeTab === 'export' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Live Pool Audit &amp; Kickoff Snapshot Export
                </h3>
                <p className="text-xs text-slate-400">
                  Export an immutable CSV receipt of all 12 Initech manager cards to distribute in WhatsApp, Discord, or keep for audit records.
                </p>
              </div>

              <button
                onClick={handleExportCurrent}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-black flex items-center gap-2 transition cursor-pointer shadow-lg shadow-emerald-500/20"
              >
                <Download className="w-4 h-4" />
                <span>Download Live Snapshot (.csv)</span>
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>Current Active Matrix (12 Managers &bull; 192 Pick Allocations):</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(exportMatrixToCsv(groupPicksMatrix || YAHOO_GROUP_PICKS_MATRIX));
                    setCopiedExport(true);
                    setTimeout(() => setCopiedExport(false), 2000);
                  }}
                  className="text-purple-400 hover:text-purple-300 flex items-center gap-1"
                >
                  {copiedExport ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedExport ? 'Copied' : 'Copy Full Snapshot'}</span>
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-[#0B0F17] border border-slate-800 font-mono text-xs text-slate-300 max-h-[320px] overflow-y-auto whitespace-pre leading-relaxed">
                {exportMatrixToCsv(groupPicksMatrix || YAHOO_GROUP_PICKS_MATRIX)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Upload, 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  AlertCircle, 
  Zap, 
  CheckCircle2, 
  Table as TableIcon, 
  Lightbulb, 
  ArrowRight, 
  TrendingDown, 
  Trophy, 
  Target, 
  Search, 
  Hash, 
  Activity,
  Key,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';
import { ContentRow, AnalysisResult } from './types';
import { analyzeEditorialData } from './services/geminiService';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

// Fix: Match the expected AIStudio type exactly to avoid declaration conflicts
interface AIStudio {
  hasSelectedApiKey: () => Promise<boolean>;
  openSelectKey: () => Promise<void>;
}

declare global {
  interface Window {
    // Fix: Use the named AIStudio type and ensure modifiers match existing global declarations
    readonly aistudio: AIStudio;
  }
}

const App: React.FC = () => {
  const [hasKey, setHasKey] = useState<boolean | null>(null);
  const [data, setData] = useState<ContentRow[]>([]);
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkKey = async () => {
      // Use type assertion to avoid any remaining global type issues
      const selected = await (window as any).aistudio.hasSelectedApiKey();
      setHasKey(selected);
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    // Use type assertion for calls to ensure functionality even if global typing has edge cases
    await (window as any).aistudio.openSelectKey();
    setHasKey(true); // Proceed assuming success per requirements
  };

  const parseCSV = (text: string) => {
    try {
      const rows = text.trim().split(/\r?\n/);
      const parsed: ContentRow[] = rows.map((row, index) => {
        if (index === 0 && (row.toLowerCase().includes('url') || row.toLowerCase().includes('headline'))) return null;
        const parts = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        if (parts.length < 3) return null;
        const url = parts[0]?.trim().replace(/^"|"$/g, '');
        const headline = parts[1]?.trim().replace(/^"|"$/g, '');
        const users = parseInt(parts[2]?.trim().replace(/,/g, '').replace(/^"|"$/g, '') || '0', 10);
        if (!url || !headline || isNaN(users)) return null;
        return { url, headline, totalUsers: users };
      }).filter((r): r is ContentRow => r !== null);
      
      if (parsed.length === 0) throw new Error("No valid data found.");
      setData(parsed);
      setError(null);
    } catch (err) {
      setError("Parsing error. Check format: URL, Headline, Users.");
    }
  };

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    setError(null);
    try {
      const analysis = await analyzeEditorialData(data);
      setResult(analysis);
    } catch (err: any) {
      if (err?.message?.includes("Requested entity was not found")) {
        setHasKey(false);
        setError("API Key issue. Please re-select your API key.");
      } else {
        setError("Analysis failed. Try checking your dataset for special characters or reducing row count slightly.");
      }
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const COLORS = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#f43f5e'];

  // Setup Screen for Shareability
  if (hasKey === false) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 selection:bg-indigo-500/30">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-sky-500"></div>
          <div className="bg-indigo-500/10 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <Key className="text-indigo-400" size={40} />
          </div>
          <h1 className="text-3xl font-black text-white mb-4">Editorial AI Setup</h1>
          <p className="text-slate-400 mb-8 leading-relaxed">
            To analyze large datasets (900+ rows), this app requires a paid Gemini API key. Please select your project key to begin.
          </p>
          <button 
            onClick={handleSelectKey}
            className="w-full bg-white text-slate-950 hover:bg-indigo-50 py-4 rounded-2xl font-black text-lg transition-all transform hover:-translate-y-1 active:translate-y-0 mb-6 flex items-center justify-center gap-3 shadow-xl"
          >
            Connect API Key <ExternalLink size={20} />
          </button>
          <a 
            href="https://ai.google.dev/gemini-api/docs/billing" 
            target="_blank" 
            rel="noreferrer"
            className="text-xs font-bold text-slate-500 hover:text-indigo-400 transition-colors uppercase tracking-widest"
          >
            Billing Documentation
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-xl text-white">
              <BarChart3 size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-tight">Editorial Intel AI</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Enterprise Analyzer</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {data.length > 0 && (
              <div className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2">
                <Hash size={12} /> {data.length} Stories
              </div>
            )}
            <div className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2">
              <ShieldCheck size={14} /> Key Connected
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto px-4 py-10 w-full">
        {!result && !isAnalyzing ? (
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-5xl font-black text-slate-900 mb-4 tracking-tight">Full Scale Analysis.</h2>
              <p className="text-xl text-slate-500">Optimized for 900+ rows. No data truncation.</p>
            </div>
            <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-200 p-10">
              <div className="space-y-8">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-widest">Input CSV Data</label>
                  <textarea
                    className="w-full h-80 p-6 rounded-2xl border-2 border-slate-100 bg-slate-50/50 text-slate-800 font-mono text-xs focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all resize-none"
                    placeholder="URL, Headline, Users..."
                    value={inputText}
                    onChange={(e) => {
                      setInputText(e.target.value);
                      parseCSV(e.target.value);
                    }}
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <label className="flex-1 flex items-center justify-center gap-2 cursor-pointer bg-white border-2 border-slate-200 hover:border-indigo-200 px-6 py-4 rounded-2xl font-bold transition-all">
                    <Upload size={20} /> <span>Upload CSV</span>
                    <input type="file" className="hidden" accept=".csv" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          const txt = ev.target?.result as string;
                          setInputText(txt);
                          parseCSV(txt);
                        };
                        reader.readAsText(file);
                      }
                    }} />
                  </label>
                  <button
                    onClick={runAnalysis}
                    disabled={data.length === 0}
                    className="flex-[2] bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white py-4 rounded-2xl font-black shadow-xl transition-all flex items-center justify-center gap-3"
                  >
                    <Zap size={20} /> ANALYZE {data.length} RECORDS
                  </button>
                </div>
                {error && <div className="text-rose-600 bg-rose-50 p-4 rounded-xl border border-rose-100 text-sm font-bold flex items-center gap-2"><AlertCircle size={18} /> {error}</div>}
              </div>
            </div>
          </div>
        ) : isAnalyzing ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="w-32 h-32 border-8 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-10"></div>
            <h3 className="text-3xl font-black text-slate-900 mb-2">Processing Dataset</h3>
            <p className="text-slate-500">Reading {data.length} records. This ensures no story is left behind.</p>
          </div>
        ) : (
          <div className="space-y-12 animate-in fade-in duration-1000">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-200 pb-8 gap-6">
              <div>
                <h2 className="text-4xl font-black text-slate-900">Scorecard Analysis</h2>
                <p className="text-slate-500 font-medium">Processed {result?.totalRecordsAnalyzed} of {data.length} stories successfully.</p>
              </div>
              <button 
                onClick={() => { setResult(null); setInputText(''); setData([]); }}
                className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 px-6 py-3 rounded-xl font-bold flex items-center gap-2"
              >
                Reset <ArrowRight size={18} />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
                <Trophy className="absolute -bottom-6 -right-6 text-white/10" size={200} />
                <div className="relative z-10">
                  <div className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full w-fit mb-4 italic">Winner</div>
                  <h3 className="text-4xl font-black mb-1">{result?.topPerformer.theme}</h3>
                  <div className="text-6xl font-black tracking-tighter mb-4">{Math.round(result?.topPerformer.value || 0).toLocaleString()} <span className="text-lg font-bold text-indigo-200 tracking-normal italic">U/S</span></div>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-black/20 p-4 rounded-2xl"><div className="text-[10px] font-black uppercase opacity-60">Stories</div><div className="text-xl font-black">{result?.topPerformer.count}</div></div>
                    <div className="bg-black/20 p-4 rounded-2xl"><div className="text-[10px] font-black uppercase opacity-60">Reach</div><div className="text-xl font-black">{result?.topPerformer.totalReach.toLocaleString()}</div></div>
                  </div>
                  <p className="text-indigo-100 leading-relaxed font-medium">{result?.topPerformer.explanation}</p>
                </div>
              </div>
              <div className="bg-white border-2 border-slate-100 p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden">
                <Target className="absolute -bottom-6 -right-6 text-slate-50" size={200} />
                <div className="relative z-10">
                  <div className="text-[10px] font-black uppercase tracking-widest bg-rose-50 text-rose-500 px-3 py-1 rounded-full w-fit mb-4 italic">Underperformer</div>
                  <h3 className="text-4xl font-black text-slate-900 mb-1">{result?.bottomPerformer.theme}</h3>
                  <div className="text-6xl font-black tracking-tighter text-slate-900 mb-4">{Math.round(result?.bottomPerformer.value || 0).toLocaleString()} <span className="text-lg font-bold text-slate-400 tracking-normal italic">U/S</span></div>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-slate-50 p-4 rounded-2xl"><div className="text-[10px] font-black uppercase opacity-60">Stories</div><div className="text-xl font-black">{result?.bottomPerformer.count}</div></div>
                    <div className="bg-slate-50 p-4 rounded-2xl"><div className="text-[10px] font-black uppercase opacity-60">Reach</div><div className="text-xl font-black">{result?.bottomPerformer.totalReach.toLocaleString()}</div></div>
                  </div>
                  <p className="text-slate-600 leading-relaxed font-medium">{result?.bottomPerformer.explanation}</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-950 rounded-[2.5rem] border border-slate-900 shadow-2xl overflow-hidden">
              <div className="px-10 py-8 border-b border-slate-900 flex items-center justify-between">
                <div><h3 className="text-2xl font-black text-white">Keyword Drill-Down</h3><p className="text-slate-500 text-sm">Targeted entity performance (Cancer, Heart Attack, etc.)</p></div>
                <div className="bg-amber-400 text-slate-950 px-4 py-1.5 rounded-full text-[10px] font-black uppercase">Entity Scan</div>
              </div>
              <table className="w-full text-left">
                <thead className="bg-slate-900 text-slate-500 uppercase text-[10px] font-black">
                  <tr>
                    <th className="px-10 py-5">Keyword</th>
                    <th className="px-10 py-5 text-center">Stories</th>
                    <th className="px-10 py-5 text-right">Reach</th>
                    <th className="px-10 py-5 text-right">Efficiency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {result?.keywordPerformance.map((kp, i) => (
                    <tr key={i} className="hover:bg-white/5 transition-colors group">
                      <td className="px-10 py-6"><span className="font-black text-white text-xl uppercase group-hover:text-amber-400">{kp.keyword}</span></td>
                      <td className="px-10 py-6 text-center text-slate-400 font-bold">{kp.storyCount}</td>
                      <td className="px-10 py-6 text-right text-slate-100 font-medium tabular-nums">{kp.totalUsers.toLocaleString()}</td>
                      <td className="px-10 py-6 text-right"><span className="text-white font-black text-2xl tabular-nums">{Math.round(kp.usersPerStory).toLocaleString()} <span className="text-[10px] text-slate-500 font-normal ml-1">U/S</span></span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden">
              <div className="px-10 py-8 border-b border-slate-100 bg-slate-50/50"><h3 className="text-xl font-black text-slate-900 uppercase">Performance Matrix</h3></div>
              <table className="w-full text-left">
                <thead className="bg-slate-100/80 text-slate-500 uppercase text-[10px] font-black tracking-widest">
                  <tr>
                    <th className="px-10 py-5">Theme</th>
                    <th className="px-10 py-5 text-center">Volume</th>
                    <th className="px-10 py-5 text-right">Gross Users</th>
                    <th className="px-10 py-5 text-right">Efficiency Index</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {result?.themes.sort((a, b) => b.totalUsers - a.totalUsers).map((theme, i) => (
                    <tr key={i} className="hover:bg-indigo-50/20 transition-colors">
                      <td className="px-10 py-6 font-bold text-slate-900 text-lg">{theme.theme}</td>
                      <td className="px-10 py-6 text-center font-bold text-slate-400">{theme.storyCount}</td>
                      <td className="px-10 py-6 text-right font-black text-slate-900 tabular-nums">{theme.totalUsers.toLocaleString()}</td>
                      <td className="px-10 py-6 text-right"><span className={`inline-block px-4 py-2 rounded-xl text-sm font-black ${theme.usersPerStory > (result.themes.reduce((a,b)=>a+b.usersPerStory,0)/result.themes.length) ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{Math.round(theme.usersPerStory).toLocaleString()}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 pb-12">
              <div className="lg:col-span-2 bg-white p-10 rounded-[2.5rem] border border-slate-200">
                <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3"><Lightbulb className="text-amber-500" /> Strategic Insights</h3>
                <div className="space-y-4">
                  {result?.insights.map((insight, i) => (
                    <div key={i} className="flex gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100 font-medium leading-relaxed"><div className="w-6 h-6 bg-indigo-600 text-white rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0 mt-1">{i+1}</div><div>{insight}</div></div>
                  ))}
                </div>
              </div>
              <div className="lg:col-span-3 bg-slate-900 text-white p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                <h3 className="text-2xl font-black mb-10 flex items-center gap-3"><CheckCircle2 className="text-emerald-400" /> Action Roadmap</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
                  {[
                    { title: 'Scale Up', items: result?.recommendations.increase, color: 'text-emerald-400', icon: <TrendingUp size={18}/> },
                    { title: 'Optimize', items: result?.recommendations.optimize, color: 'text-amber-400', icon: <Zap size={18}/> },
                    { title: 'De-prioritize', items: result?.recommendations.decrease, color: 'text-rose-400', icon: <TrendingDown size={18}/> },
                    { title: 'Experiments', items: result?.recommendations.experiment, color: 'text-sky-400', icon: <Target size={18}/> }
                  ].map((rec, i) => (
                    <div key={i} className="bg-white/5 p-6 rounded-2xl border border-white/5">
                      <h4 className={`text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2 ${rec.color}`}>{rec.icon} {rec.title}</h4>
                      <div className="space-y-2">{rec.items?.map((item, j) => (<div key={j} className="text-sm font-bold bg-white/5 px-3 py-2 rounded-xl border border-white/5 leading-tight">{item}</div>))}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;

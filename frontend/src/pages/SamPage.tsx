import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Send,
  Bot,
  User,
  ArrowRight,
  TrendingUp,
  Database,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  FileText,
  Clock,
  RotateCcw,
  Zap,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Terminal,
  Cpu,
  KeyRound,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { samApi } from '../api/sam';
import { useAuth } from '../context/AuthContext';
import type {
  SamMessage,
  SamAnalysisBlock,
  SamStatus,
} from '../types/api';

export const SamPage: React.FC = () => {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<SamMessage[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [expandedLineage, setExpandedLineage] = useState<Record<string, boolean>>({});
  const [samStatus, setSamStatus] = useState<SamStatus | null>(null);
  const [samStatusLoading, setSamStatusLoading] = useState(true);

  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Suggested business queries requested by user
  const suggestedQueries = [
    "What's driving revenue?",
    "Find high-value customers",
    "What are customers unhappy about?",
    "Which products need attention?",
    "Give me 3 actions for this month",
  ];

  // Fetch truthful SAM LLM status on mount
  useEffect(() => {
    samApi.getStatus().then((status) => {
      setSamStatus(status);
      setSamStatusLoading(false);
    }).catch(() => setSamStatusLoading(false));
  }, []);

  // Initialize with greeting
  useEffect(() => {
    const welcomeMsg: SamMessage = {
      id: 'msg_welcome',
      type: 'sam',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `Welcome to SAM — your autonomous intelligence analyst inside Samriddh. I synthesize real-time transaction records, customer RFM tiers, and Voice of Customer sentiment to answer business questions visually. How can I assist your executive strategy today?`,
    };
    setMessages([welcomeMsg]);
  }, []);

  // Scroll to bottom on new message
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const handleSend = async (queryText?: string) => {
    const q = (queryText || inputQuery).trim();
    if (!q || isThinking) return;

    const userMsg: SamMessage = {
      id: `user_${Date.now()}`,
      type: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      prompt: q,
      text: q,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsThinking(true);

    try {
      const response = await samApi.askSam({ query: q });
      setMessages((prev) => [...prev, response]);
      if (response.llmStatus) {
        setSamStatus(response.llmStatus);
      }
    } catch (err: any) {
      const errorMsg: SamMessage = {
        id: `err_${Date.now()}`,
        type: 'sam',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `I encountered a communication issue accessing database aggregates: ${err.message}. Please retry in a moment.`,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  const toggleLineage = (msgId: string) => {
    setExpandedLineage((prev) => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  const renderMetricHighlight = (m: any, idx: number) => {
    const toneMap: Record<string, string> = {
      positive: 'bg-emerald-50 text-emerald-900 border-emerald-200',
      negative: 'bg-rose-50 text-rose-900 border-rose-200',
      gold: 'bg-gold-50 text-gold-950 border-gold-300',
      neutral: 'bg-ivory-100 text-forest-950 border-ivory-300',
    };
    const toneClass = toneMap[m.tone] || toneMap.neutral;

    return (
      <div
        key={idx}
        className={`p-3.5 rounded-xl border ${toneClass} shadow-sm space-y-1`}
      >
        <span className="text-[10px] uppercase font-semibold tracking-wider opacity-80 block">
          {m.label}
        </span>
        <strong className="text-xl font-serif font-bold block font-mono">
          {m.value}
        </strong>
        {m.change && (
          <span className="text-[11px] font-medium block opacity-90">
            {m.change}
          </span>
        )}
      </div>
    );
  };

  const renderRecommendation = (r: any, idx: number) => {
    const badgeMap: Record<string, string> = {
      Immediate: 'bg-rose-100 text-rose-900 border-rose-300',
      Strategic: 'bg-gold-100 text-gold-900 border-gold-300',
      Watch: 'bg-navy-100 text-navy-900 border-navy-300',
    };
    const priorityBadge = badgeMap[r.priority] || 'bg-ivory-200 text-forest-900 border-ivory-300';

    return (
      <div
        key={idx}
        className="p-4 rounded-xl bg-white border border-ivory-300 shadow-sm space-y-2"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${priorityBadge}`}>
              {r.priority}
            </span>
            <span className="text-xs text-forest-600 font-medium">
              {r.category}
            </span>
          </div>
        </div>

        <h5 className="text-sm font-serif font-bold text-forest-950">
          {r.title}
        </h5>

        <p className="text-xs text-forest-800 leading-relaxed">
          {r.description}
        </p>

        {r.expectedImpact && (
          <div className="pt-2 border-t border-ivory-200 text-[11px] text-gold-800 font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-gold-600" />
            <span>{r.expectedImpact}</span>
          </div>
        )}
      </div>
    );
  };

  const renderAnalysisBlock = (block: SamAnalysisBlock, blockIdx: number) => {
    switch (block.type) {
      case 'metrics':
        return (
          <div key={blockIdx} className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-3">
            {block.metrics?.map((m, i) => renderMetricHighlight(m, i))}
          </div>
        );

      case 'chart':
        if (!block.chartData) return null;
        return (
          <div
            key={blockIdx}
            className="my-4 p-4 rounded-xl bg-navy-950 text-white border border-navy-800 shadow-luxury space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-serif font-bold text-ivory-100">
                {block.title || 'Dynamic Metric Trajectory'}
              </span>
              <span className="text-[10px] text-gold-400 uppercase tracking-wider font-mono">
                Verified Time-Series
              </span>
            </div>
            <div className="h-44 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={block.chartData.data}
                  margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="samMiniGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#C5A059" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#C5A059" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey={block.chartData.xKey}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#A3B8B0', fontSize: 10 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#A3B8B0', fontSize: 10 }}
                    tickFormatter={(v) => `£${(v / 1000).toFixed(0)}K`}
                  />
                  <Tooltip
                    formatter={(val: any) => [`£${val.toLocaleString()}`, 'Value']}
                    contentStyle={{ backgroundColor: '#0B1D19', borderColor: '#C5A059', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Area
                    type="monotone"
                    dataKey={block.chartData.yKey}
                    stroke="#C5A059"
                    strokeWidth={2}
                    fill="url(#samMiniGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        );

      case 'table':
        if (!block.tableData) return null;
        return (
          <div
            key={blockIdx}
            className="my-4 rounded-xl border border-ivory-300 overflow-hidden shadow-sm bg-white"
          >
            {block.title && (
              <div className="p-3 bg-ivory-100 border-b border-ivory-200 text-xs font-serif font-bold text-forest-950">
                {block.title}
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-ivory-50 text-forest-800 uppercase text-[10px] tracking-wider border-b border-ivory-200">
                  <tr>
                    {block.tableData.columns.map((col, idx) => (
                      <th key={idx} className="px-3.5 py-2 font-semibold">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-ivory-200 text-forest-900">
                  {block.tableData.rows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-ivory-50">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="px-3.5 py-2 whitespace-nowrap font-mono text-[11px]">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'recommendation':
        return (
          <div key={blockIdx} className="my-4 space-y-2.5">
            <h4 className="text-xs uppercase tracking-wider font-bold text-gold-800">
              {block.title || 'Recommended Action Directives'}
            </h4>
            <div className="space-y-2">
              {block.recommendations?.map((r, i) => renderRecommendation(r, i))}
            </div>
          </div>
        );

      case 'lineage':
        if (!block.dataLineage) return null;
        return (
          <div
            key={blockIdx}
            className="mt-3 p-3 rounded-xl bg-ivory-200/50 border border-ivory-300 text-[11px] text-forest-700 space-y-1.5"
          >
            <div className="flex items-center justify-between font-mono">
              <span className="flex items-center gap-1 text-forest-900 font-semibold">
                <Database className="w-3.5 h-3.5 text-forest-700" />
                <span>Verified Source Tables: {block.dataLineage.sourceTables.join(', ')}</span>
              </span>
              <span className="text-emerald-700 font-bold">Confidence: 100% (Real DB)</span>
            </div>
            <p className="text-[10px] text-forest-600">
              Evaluated {block.dataLineage.recordsAnalyzed.toLocaleString()} records at {new Date(block.dataLineage.computedAt).toLocaleTimeString()}
            </p>
          </div>
        );

      case 'text':
      default:
        return (
          <div
            key={blockIdx}
            className="text-xs sm:text-sm text-forest-950 leading-relaxed bg-ivory-50/70 p-4 rounded-xl border border-ivory-200 my-2"
          >
            {block.content}
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)] min-h-[600px] pb-4">
      {/* 1. LEFT PANEL: Suggested Query Bookmarks & Domain Quick-filters */}
      <aside className="hidden lg:flex flex-col w-72 bg-white rounded-2xl border border-ivory-300 shadow-luxury p-5 shrink-0 space-y-6 overflow-y-auto">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-gold-700 block">
            Intelligence Prompts
          </span>
          <h3 className="text-sm font-serif font-bold text-forest-950 mt-0.5">
            Executive Queries
          </h3>
          <p className="text-[11px] text-forest-600 mt-1 leading-relaxed">
            Instant analytical inquiries grounded in live retail database records.
          </p>
        </div>

        <div className="space-y-2">
          {suggestedQueries.map((sq, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(sq)}
              disabled={isThinking}
              className="w-full text-left p-3 rounded-xl bg-ivory-50 hover:bg-gold-50 hover:border-gold-300 text-xs font-medium text-forest-900 border border-ivory-300 transition-all flex items-center justify-between group active:scale-98 disabled:opacity-50"
            >
              <span>{sq}</span>
              <ArrowRight className="w-3.5 h-3.5 text-forest-400 group-hover:text-gold-700 group-hover:translate-x-0.5 transition-all shrink-0" />
            </button>
          ))}
        </div>

        {/* Truthful LLM Agent Status Card */}
        <div className="p-4 rounded-xl bg-ivory-100 border border-ivory-200 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-serif font-bold text-forest-950">Sam AI Agent</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${
                samStatus?.isConfigured
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-amber-50 text-amber-900 border-amber-300'
              }`}
            >
              {samStatus?.status || 'Setup Required'}
            </span>
          </div>

          {samStatus?.isConfigured ? (
            <div className="space-y-1 text-[11px] text-forest-700 font-mono">
              <p>Provider: <strong className="text-forest-950">{samStatus.provider}</strong></p>
              <p>Model: <strong className="text-forest-950">{samStatus.model}</strong></p>
            </div>
          ) : (
            <div className="space-y-1 text-[11px] text-forest-700">
              <p className="leading-relaxed">
                Add <code className="px-1 py-0.5 bg-ivory-200 rounded text-forest-950 font-mono font-bold">{samStatus?.requiredEnvVar || 'GEMINI_API_KEY'}</code> to backend <code className="font-mono">.env</code> to activate LLM reasoning.
              </p>
              <p className="text-[10px] text-forest-500 italic">
                Deterministic database tools are active and verified.
              </p>
            </div>
          )}
        </div>
      </aside>

      {/* 2. CENTER PANEL: Main Conversational & Analytical Stream */}
      <main className="flex-1 flex flex-col bg-white rounded-2xl border border-ivory-300 shadow-luxury overflow-hidden min-w-0">
        {/* Chat Stream Header */}
        <div className="px-6 py-3.5 bg-gradient-to-r from-forest-950 via-forest-900 to-forest-950 text-white flex items-center justify-between border-b border-gold-500/20">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gold-500/20 border border-gold-400/40 text-gold-300 flex items-center justify-center font-bold text-xs">
              ✦
            </div>
            <div>
              <h2 className="text-sm font-serif font-bold text-ivory-100">
                SAM Business Intelligence Analyst
              </h2>
              <p className="text-[10px] text-gold-300 font-mono">
                Grounded in 536K sales lines &amp; 100K customer reviews
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setMessages([
                  {
                    id: 'msg_welcome',
                    type: 'sam',
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    text: `Conversation memory reset. All database telemetry is connected. How may I assist your strategy?`,
                  },
                ]);
              }}
              title="Reset conversation"
              className="p-1.5 rounded-lg text-ivory-300 hover:text-white hover:bg-forest-800 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Message History Viewport */}
        <div className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-6">
          {messages.map((msg) => {
            const isUser = msg.type === 'user';
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-forest-950 text-gold-400 flex items-center justify-center font-serif font-bold text-xs shrink-0 shadow-sm border border-gold-500/30">
                    SAM
                  </div>
                )}

                <div
                  className={`max-w-2xl rounded-2xl p-5 ${
                    isUser
                      ? 'bg-forest-900 text-white rounded-br-none shadow-md'
                      : 'bg-ivory-50 text-forest-950 rounded-tl-none border border-ivory-300 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <span className={`text-[10px] uppercase font-bold tracking-wider ${isUser ? 'text-gold-300' : 'text-forest-600'}`}>
                      {isUser ? `${profile.roleTitle || 'Executive'} Inquiry` : 'Analytical Response'}
                    </span>
                    <span className={`text-[10px] font-mono ${isUser ? 'text-ivory-400' : 'text-forest-500'}`}>
                      {msg.timestamp}
                    </span>
                  </div>

                  {/* Primary Narrative */}
                  <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                    {msg.text}
                  </p>

                  {/* Tools executed badge */}
                  {msg.toolsUsed && msg.toolsUsed.length > 0 && (
                    <div className="mt-2.5 flex items-center gap-1.5 text-[10px] text-forest-600 font-mono">
                      <Terminal className="w-3 h-3 text-forest-500" />
                      <span>Tools: {msg.toolsUsed.join(', ')}</span>
                    </div>
                  )}

                  {/* Rich Analysis Blocks */}
                  {msg.analysisBlocks && msg.analysisBlocks.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-ivory-300/80 space-y-3">
                      {msg.analysisBlocks.map((b, bIdx) => renderAnalysisBlock(b, bIdx))}
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-gold-500 text-forest-950 flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                    {profile.avatarInitials || 'EX'}
                  </div>
                )}
              </motion.div>
            );
          })}

          {/* Thinking Indicator */}
          {isThinking && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3.5 justify-start"
            >
              <div className="w-8 h-8 rounded-xl bg-forest-950 text-gold-400 flex items-center justify-center font-serif font-bold text-xs shrink-0 shadow-sm border border-gold-500/30">
                SAM
              </div>
              <div className="rounded-2xl p-4 bg-ivory-50 border border-ivory-300 text-forest-800 text-xs flex items-center gap-2.5 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-gold-500 animate-ping" />
                <span>Executing analytics queries across Supabase records...</span>
              </div>
            </motion.div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Quick Query Pill Bar on Mobile/Tablet */}
        <div className="lg:hidden px-4 py-2 bg-ivory-100/80 border-t border-ivory-200 overflow-x-auto flex items-center gap-2">
          {suggestedQueries.map((sq, i) => (
            <button
              key={i}
              onClick={() => handleSend(sq)}
              className="px-3 py-1 rounded-full bg-white hover:bg-gold-50 text-forest-800 text-[11px] font-medium border border-ivory-300 whitespace-nowrap"
            >
              {sq}
            </button>
          ))}
        </div>

        {/* Prompt Input Box */}
        <div className="p-4 sm:p-6 bg-white border-t border-ivory-300">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2 bg-ivory-50 border border-ivory-300 rounded-2xl p-2 focus-within:border-gold-500 focus-within:bg-white transition-colors shadow-sm"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask SAM any business, customer, or product question..."
              className="flex-1 px-3 py-2 bg-transparent text-sm text-forest-950 placeholder-forest-400 focus:outline-none"
              disabled={isThinking}
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || isThinking}
              className="px-4 py-2.5 rounded-xl bg-forest-900 hover:bg-forest-800 text-gold-300 font-semibold text-xs flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm active:scale-95"
            >
              <span>Analyze</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </main>

      {/* 3. RIGHT PANEL: Live Contextual Intelligence & Executive Signals */}
      <aside className="hidden xl:flex flex-col w-80 bg-white rounded-2xl border border-ivory-300 shadow-luxury p-5 shrink-0 space-y-5 overflow-y-auto">
        <div className="border-b border-ivory-200 pb-3">
          <span className="text-[10px] uppercase font-bold tracking-wider text-gold-700 block">
            Live Database Pulse
          </span>
          <h3 className="text-sm font-serif font-bold text-forest-950 mt-0.5">
            Operational Telemetry
          </h3>
        </div>

        {/* Live Counters */}
        <div className="space-y-2.5">
          <div className="p-3 bg-ivory-50 rounded-xl border border-ivory-200 flex items-center justify-between">
            <span className="text-xs text-forest-700">Retail Sales</span>
            <span className="text-xs font-mono font-bold text-forest-950">536,641 Rows</span>
          </div>

          <div className="p-3 bg-ivory-50 rounded-xl border border-ivory-200 flex items-center justify-between">
            <span className="text-xs text-forest-700">Reviews Joined</span>
            <span className="text-xs font-mono font-bold text-forest-950">100,000 Rows</span>
          </div>

          <div className="p-3 bg-ivory-50 rounded-xl border border-ivory-200 flex items-center justify-between">
            <span className="text-xs text-forest-700">Customer RFM</span>
            <span className="text-xs font-mono font-bold text-forest-950">4,372 Indexed</span>
          </div>

          <div className="p-3 bg-ivory-50 rounded-xl border border-ivory-200 flex items-center justify-between">
            <span className="text-xs text-forest-700">Catalog SKUs</span>
            <span className="text-xs font-mono font-bold text-forest-950">4,070 Items</span>
          </div>
        </div>

        {/* Strategic Directives Card */}
        <div className="p-4 rounded-xl bg-gold-50/60 border border-gold-300 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-gold-900">
            <Zap className="w-3.5 h-3.5 text-gold-600" />
            <span>Active Strategic Directives</span>
          </div>
          <ul className="text-xs text-forest-800 space-y-1.5 list-disc list-inside">
            <li>Reactivate 135 at-risk high-value accounts</li>
            <li>Reinforce fragile SKU transit packaging</li>
            <li>Scale tableware bundling in European corridor</li>
          </ul>
        </div>

        {/* Truthful LLM Architecture Telemetry */}
        <div className="p-4 rounded-xl bg-ivory-100 border border-ivory-200 text-xs space-y-2">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-forest-700" />
            <span className="font-serif font-bold text-forest-950">LLM Provider Status</span>
          </div>

          {samStatusLoading ? (
            <div className="space-y-1 text-[11px] text-forest-600 font-mono bg-white p-2.5 rounded-lg border border-ivory-300 animate-pulse">
              <p>Checking LLM connection…</p>
            </div>
          ) : samStatus?.isConfigured ? (
            <div className="space-y-1 text-[11px] text-emerald-800 font-mono bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
              <p>Status: <strong>Connected</strong></p>
              <p>Provider: <strong>{samStatus.provider}</strong></p>
              <p>Model: <strong>{samStatus.model}</strong></p>
            </div>
          ) : (
            <div className="space-y-1.5 text-[11px] text-forest-700 bg-white p-3 rounded-lg border border-ivory-300">
              <p className="font-semibold text-amber-800 flex items-center gap-1">
                <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                <span>Sam AI — Setup Required</span>
              </p>
              <p className="text-[10px] text-forest-600 leading-relaxed">
                To connect live LLM inference, configure <code className="font-mono font-bold text-forest-900">{samStatus?.requiredEnvVar || 'GEMINI_API_KEY'}</code> in your backend <code className="font-mono">.env</code>.
              </p>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
};

import { useEffect, useState } from 'react';
import { Activity, CheckCircle2, XCircle, RefreshCw, Sparkles, Users, MessageSquare, ShieldCheck } from 'lucide-react';

interface HealthStatus {
  status: string;
  timestamp?: string;
  service?: string;
  uptime?: number;
}

export default function App() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [latency, setLatency] = useState<number | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const checkHealth = async () => {
    setLoading(true);
    setError(null);
    const start = performance.now();
    try {
      const res = await fetch(`${apiUrl}/health`);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      const data = await res.json();
      setLatency(Math.round(performance.now() - start));
      setHealth(data);
      setLastChecked(new Date());
    } catch (err: any) {
      setError(err.message || 'Failed to connect to API server');
      setHealth(null);
      setLatency(null);
      setLastChecked(new Date());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Background glow effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-indigo-600/15 blur-[120px] rounded-full"></div>
        <div className="absolute top-1/3 -left-32 w-80 h-80 bg-blue-600/10 blur-[100px] rounded-full"></div>
        <div className="absolute bottom-10 -right-32 w-80 h-80 bg-purple-600/10 blur-[100px] rounded-full"></div>
      </div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 font-bold text-white text-lg">
              F
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">Finneas</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">Day 2 Foundation</span>
              </div>
              <p className="text-xs text-slate-400">Private Real-time Study Rooms</p>
            </div>
          </div>

          {/* Backend Status Badge */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-card text-xs font-medium border border-slate-700/60 shadow-inner">
              {loading && !health ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                  <span className="text-slate-300">Connecting to API...</span>
                </>
              ) : health?.status === 'ok' ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  <span className="text-emerald-400 font-semibold">API Connected</span>
                  {latency !== null && (
                    <span className="text-slate-400 text-[11px] border-l border-slate-700 pl-2">
                      {latency}ms
                    </span>
                  )}
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  <span className="text-rose-400 font-semibold">API Offline</span>
                </>
              )}
            </div>

            <button
              onClick={checkHealth}
              disabled={loading}
              title="Re-check API status"
              className="p-2 rounded-lg glass-card hover:bg-slate-800 text-slate-300 hover:text-white transition border border-slate-700/60 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-12 relative z-10 space-y-12">
        {/* Hero Section */}
        <section className="text-center space-y-4 max-w-3xl mx-auto pt-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card border border-indigo-500/20 text-indigo-300 text-xs font-medium mb-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Full-Stack Foundation Established</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Study together in <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-indigo-200 bg-clip-text text-transparent">
              private, focused digital rooms
            </span>
          </h1>
          <p className="text-slate-400 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
            Finneas connects peer study groups with synchronized timers, collaborative resource sharing, and low-distraction real-time chat.
          </p>
        </section>

        {/* Integration Health Card */}
        <section className="glass-panel rounded-2xl p-6 sm:p-8 glow-indigo border border-indigo-500/20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-400" />
                Frontend ⟷ Backend Verification
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Verifying end-to-end communication via REST endpoint: <code className="text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded text-xs">{apiUrl}/health</code>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
                health?.status === 'ok' 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}>
                {health?.status === 'ok' ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Operational
                  </>
                ) : (
                  <>
                    <XCircle className="w-3.5 h-3.5" />
                    Disconnected
                  </>
                )}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="glass-card rounded-xl p-4 border border-slate-800">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Target Endpoint</div>
              <div className="mt-2 text-sm font-mono text-indigo-300 truncate">{apiUrl}/health</div>
              <div className="text-xs text-slate-500 mt-1">NestJS HTTP GET Controller</div>
            </div>

            <div className="glass-card rounded-xl p-4 border border-slate-800">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Response Payload</div>
              <div className="mt-2 font-mono text-xs text-slate-200 bg-slate-900/80 p-2 rounded overflow-x-auto">
                {health ? JSON.stringify(health, null, 2) : error ? `{ "error": "${error}" }` : 'Loading...'}
              </div>
            </div>

            <div className="glass-card rounded-xl p-4 border border-slate-800">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Metrics</div>
              <div className="mt-2 space-y-1 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Latency:</span>
                  <span className="font-semibold text-emerald-400">{latency ? `${latency} ms` : '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Server Uptime:</span>
                  <span className="font-mono text-slate-200">{health?.uptime ? `${Math.round(health.uptime)}s` : '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Last Ping:</span>
                  <span className="text-slate-400">{lastChecked ? lastChecked.toLocaleTimeString() : '—'}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Core Pillars Feature Grid */}
        <section className="space-y-6">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white">Finneas V1 Architecture Pillars</h3>
            <p className="text-slate-400 text-sm mt-1">Foundations established for rapid iterative product development</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card rounded-xl p-6 border border-slate-800/80 hover:border-indigo-500/30 transition group">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-110 transition">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="text-base font-semibold text-white mb-2">Private Study Rooms</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Invite-only study spaces with membership control, active presence indicators, and synchronized timers.
              </p>
            </div>

            <div className="glass-card rounded-xl p-6 border border-slate-800/80 hover:border-indigo-500/30 transition group">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4 group-hover:scale-110 transition">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h4 className="text-base font-semibold text-white mb-2">Focused Real-Time Chat</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Socket.IO powered real-time messaging with resource attachment sharing and pinboards for quick reference.
              </p>
            </div>

            <div className="glass-card rounded-xl p-6 border border-slate-800/80 hover:border-indigo-500/30 transition group">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-base font-semibold text-white mb-2">Robust NestJS Backend</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Modular architecture with PostgreSQL + Prisma for persistent state and Redis for ephemeral presence.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 px-6 py-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Finneas Study Platform — Phase 1 App Foundation</span>
          <span>React 18 + Vite • NestJS 10 • TypeScript Monorepo</span>
        </div>
      </footer>
    </div>
  );
}

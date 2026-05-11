import { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

// Định nghĩa kiểu dữ liệu khớp với Backend trả về
interface Metric {
  id: string;
  timestamp: string;
  prompt_length: number;
  status: string;
  latency_ms: number;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  cost_usd: number;
  error: string | null;
}

function App() {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchMetrics = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    setIsRefreshing(true);
    try {
      const response = await fetch('http://localhost:3000/api/metrics');
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setMetrics(data);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu:", error);
    } finally {
      setLoading(false);
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  useEffect(() => {
    fetchMetrics(true);
    const interval = setInterval(() => fetchMetrics(false), 5000);
    return () => clearInterval(interval);
  }, []);

  const totalRequests = metrics.length;
  const totalCost = metrics.reduce((sum, m) => sum + m.cost_usd, 0);
  const avgLatency = totalRequests ? Math.round(metrics.reduce((sum, m) => sum + m.latency_ms, 0) / totalRequests) : 0;
  const errorCount = metrics.filter(m => m.status === 'error').length;
  const errorRate = totalRequests ? ((errorCount / totalRequests) * 100).toFixed(1) : 0;

  const chartData = metrics.map((m, index) => ({
    name: `R${index + 1}`,
    latency: m.latency_ms,
    input: m.input_tokens,
    output: m.output_tokens,
    cost: m.cost_usd
  }));

  if (loading) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-[#0f172a] text-blue-400">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-xl font-medium animate-pulse">Initializing Observability Engine...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 p-4 md:p-8 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-semibold uppercase tracking-widest text-blue-400">Live System Monitor</span>
            </div>
            <h1 className="text-4xl font-black gradient-text tracking-tight">AI Observability</h1>
            <p className="text-slate-400">Intelligent performance tracking & cost analysis</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className={`text-xs font-mono transition-opacity duration-300 ${isRefreshing ? 'opacity-100' : 'opacity-0'}`}>
              <span className="text-blue-400">SYNCING DATA...</span>
            </div>
            <button
              onClick={() => fetchMetrics(true)}
              className="px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(37,99,235,0.4)] flex items-center gap-2"
            >
              <svg className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </header>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { label: 'Total Requests', value: totalRequests, color: 'border-blue-500', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
            { label: 'Total Expenditure', value: `$${totalCost.toFixed(5)}`, color: 'border-emerald-500', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
            { label: 'Avg Latency', value: `${avgLatency}ms`, color: 'border-amber-500', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
            { label: 'Success Rate', value: `${(100 - parseFloat(errorRate as string)).toFixed(1)}%`, color: 'border-rose-500', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
          ].map((kpi, i) => (
            <div key={i} className={`glass-card p-6 border-t-4 ${kpi.color} group hover:translate-y-[-4px] transition-all`}>
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">{kpi.label}</h3>
                <svg className="w-5 h-5 text-slate-500 group-hover:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={kpi.icon} />
                </svg>
              </div>
              <p className="text-3xl font-bold text-white">{kpi.value}</p>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          <div className="glass-card p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Latency Timeline</h2>
              <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">Real-time</span>
            </div>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <defs>
                    <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} unit="ms" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#f1f5f9' }}
                    itemStyle={{ color: '#60a5fa' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="latency" 
                    stroke="#3b82f6" 
                    strokeWidth={4} 
                    dot={{ fill: '#3b82f6', r: 4, strokeWidth: 2, stroke: '#0f172a' }} 
                    activeDot={{ r: 8, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-card p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Token Utilization</h2>
              <div className="flex gap-4">
                <div className="flex items-center gap-1.5 text-xs">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span className="text-slate-400">Input</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  <span className="text-slate-400">Output</span>
                </div>
              </div>
            </div>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{fill: 'rgba(255,255,255,0.05)'}}
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#f1f5f9' }}
                  />
                  <Bar dataKey="input" name="Input" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                  <Bar dataKey="output" name="Output" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Detailed Logs Table */}
        <div className="glass-card overflow-hidden">
          <div className="p-6 border-b border-white/5">
            <h2 className="text-xl font-bold">Recent Intelligence Transactions</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs uppercase tracking-wider text-slate-500 bg-white/5">
                  <th className="px-6 py-4 font-semibold">Timestamp</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Latency</th>
                  <th className="px-6 py-4 font-semibold text-right">Tokens</th>
                  <th className="px-6 py-4 font-semibold text-right">Cost (USD)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {metrics.slice().reverse().slice(0, 10).map((m) => (
                  <tr key={m.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4 text-sm font-mono text-slate-400">
                      {new Date(m.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                        m.status === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        {m.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-medium text-slate-300">
                      {m.latency_ms}ms
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-slate-400">
                      {m.total_tokens}
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-bold text-blue-400">
                      ${m.cost_usd.toFixed(6)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
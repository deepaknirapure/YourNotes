import React, { useState, useMemo, useCallback } from 'react';
import { 
  Code, Grid, Activity, BarChart3, Book, Globe, GitBranch, 
  Settings, Bell, HelpCircle, Menu, Search, ChevronLeft, 
  ChevronRight, ExternalLink, RefreshCw, Copy, Trash2, CheckCircle2, MoreHorizontal 
} from 'lucide-react';

// --- Constants & Data ---
const DEPLOYMENTS = [
  { id: "GryygXzug", name: "your-notes", status: "ready", branch: "main", time: Date.now() - 120000, author: "deepaknirapure" },
  { id: "Qw3eRtYuI", name: "your-notes", status: "building", branch: "feat/flashcards", time: Date.now() - 300000, author: "deepaknirapure" },
  { id: "A5aBwAVzn", name: "your-notes", status: "error", branch: "main", time: Date.now() - 2700000, author: "deepaknirapure" },
  // ... (Add more as needed)
];

const STATUS_CONFIG = {
  ready: { label: "Ready", color: "text-blue-500", bg: "bg-blue-500/10", dot: "bg-blue-500" },
  error: { label: "Error", color: "text-red-500", bg: "bg-red-500/10", dot: "bg-red-500" },
  building: { label: "Building", color: "text-orange-500", bg: "bg-orange-500/10", dot: "bg-orange-500 animate-pulse" },
  canceled: { label: "Canceled", color: "text-gray-400", bg: "bg-gray-400/10", dot: "bg-gray-400" },
};

const NAV_ITEMS = [
  { key: "overview", icon: Grid, label: "Overview" },
  { key: "deployments", icon: Activity, label: "Deployments", badge: "12" },
  { key: "analytics", icon: BarChart3, label: "Analytics" },
  { key: "logs", icon: Book, label: "Logs" },
];

const DeploymentsPage = () => {
  const [activeTab, setActiveTab] = useState('deployments');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  // Filter Logic
  const filteredData = useMemo(() => {
    return DEPLOYMENTS.filter(d => 
      d.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
      d.branch.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  return (
    <div className="flex h-screen bg-black text-gray-100 font-sans selection:bg-blue-500/30">
      
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-black border-r border-white/10 transition-transform lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center gap-3 h-14 px-6 border-b border-white/10">
          <Code className="text-white" size={20} />
          <span className="font-bold tracking-tight text-lg">YourNotes</span>
        </div>

        <nav className="p-4 space-y-1">
          <p className="px-3 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Project</p>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === item.key ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
              }`}
            >
              <item.icon size={16} />
              {item.label}
              {item.badge && <span className="ml-auto bg-white/5 text-[10px] px-1.5 py-0.5 rounded-full">{item.badge}</span>}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-14 flex items-center justify-between px-6 border-b border-white/10">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="lg:hidden text-gray-400">
              <Menu size={20} />
            </button>
            <div className="flex items-center text-sm gap-2">
              <span className="text-gray-500">deepaknirapure</span>
              <span className="text-gray-700">/</span>
              <span className="font-medium">your-notes</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 text-gray-500 hover:text-gray-200"><Bell size={18} /></button>
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 border border-white/20" />
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                <Book className="text-gray-400" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Deployments</h1>
                <p className="text-sm text-gray-500">Manage and monitor your build history.</p>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                <input 
                  type="text" 
                  placeholder="Filter deployments..." 
                  className="w-full bg-transparent border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-white/20 transition-colors"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-white text-black rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors">
                  New Deployment
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="border border-white/10 rounded-xl overflow-hidden bg-white/[0.02]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-[11px] font-bold text-gray-500 uppercase tracking-widest bg-white/[0.02]">
                    <th className="px-6 py-4">Deployment</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 hidden md:table-cell">Branch</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredData.map((deploy) => (
                    <tr key={deploy.id} className="group hover:bg-white/[0.03] transition-colors cursor-pointer">
                      <td className="px-6 py-4">
                        <div className="font-mono text-sm text-blue-400">{deploy.id}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{deploy.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-bold tracking-wide ${STATUS_CONFIG[deploy.status].bg} ${STATUS_CONFIG[deploy.status].color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${STATUS_CONFIG[deploy.status].dot}`} />
                          {STATUS_CONFIG[deploy.status].label}
                        </span>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <GitBranch size={14} />
                          {deploy.branch}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 text-gray-600 hover:text-white transition-colors">
                          <MoreHorizontal size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DeploymentsPage;
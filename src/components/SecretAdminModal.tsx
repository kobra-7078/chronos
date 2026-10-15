import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  X,
  RotateCcw,
  Terminal,
  Database,
  ExternalLink,
  Sliders,
  CheckCircle2,
  Trash2,
  Sparkles,
  UserCheck,
  Eye,
  KeyRound,
  RefreshCw,
  Sun,
  Moon,
  FolderLock,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { THEME_CONFIGS } from '../data/mockData';
import { RoleType, ThemeType } from '../types';

export const SecretAdminModal: React.FC = () => {
  const {
    profile,
    setProfile,
    theme,
    setTheme,
    currentUser,
    githubUser,
    googleToken,
    githubToken,
    tasks,
    sessions,
    goals,
    resetAllData,
    isLoggedIn,
    currentPath,
    navigate,
    addTask,
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [isAdminUrl, setIsAdminUrl] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'storage' | 'ai_test' | 'overrides'>('overview');
  const [aiTestResult, setAiTestResult] = useState<string | null>(null);
  const [isTestingAi, setIsTestingAi] = useState(false);
  const [selectedStorageKey, setSelectedStorageKey] = useState<string | null>(null);
  const [storageData, setStorageData] = useState<Record<string, string>>({});

  // Check URL query parameters for ?admin=True&pass=108 (case-insensitive) on any page
  useEffect(() => {
    const checkAdminQuery = () => {
      try {
        const search = window.location.search;
        const params = new URLSearchParams(search);
        const adminVal = params.get('admin');
        const passVal = params.get('pass');

        const isTrueAdmin =
          (adminVal?.toLowerCase() === 'true' || adminVal === '1') && passVal === '108';

        setIsAdminUrl(isTrueAdmin);
        if (isTrueAdmin) {
          setIsOpen(true);
        }
      } catch (e) {
        console.error('Admin URL check error:', e);
      }
    };

    checkAdminQuery();

    // Listen for URL changes via popstate or custom events
    window.addEventListener('popstate', checkAdminQuery);
    return () => window.removeEventListener('popstate', checkAdminQuery);
  }, [currentPath]);

  // Refresh storage viewer
  useEffect(() => {
    if (isOpen) {
      const keys = [
        'chronos_clean_profile',
        'chronos_clean_tasks',
        'chronos_clean_sessions',
        'chronos_clean_goals',
        'chronos_clean_integrations',
        'chronos_clean_theme',
        'chronos_clean_github_user',
        'chronos_sidebar_minimized',
      ];
      const data: Record<string, string> = {};
      keys.forEach((k) => {
        const val = localStorage.getItem(k);
        if (val) data[k] = val;
      });
      setStorageData(data);
    }
  }, [isOpen, tasks, sessions, goals, profile]);

  if (!isAdminUrl) {
    return null;
  }

  const exitAdminMode = () => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('admin');
      url.searchParams.delete('pass');
      window.history.replaceState({}, '', url.pathname + (url.search ? url.search : '') + url.hash);
      setIsAdminUrl(false);
      setIsOpen(false);
    } catch {
      setIsOpen(false);
    }
  };

  const handleTestAiSchedule = async () => {
    setIsTestingAi(true);
    setAiTestResult('Running AI Schedule Optimization Engine...');
    try {
      const start = performance.now();
      const res = await fetch('/api/ai/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: profile.role || 'professional',
          tasks: tasks.length > 0 ? tasks : [
            {
              id: 'test-item-1',
              title: 'Review System Architecture & Core Pipelines',
              priority: 'high',
              estimatedMinutes: 60,
              remainingMinutes: 60,
              status: 'todo',
            },
          ],
          availability: profile.availability,
        }),
      });
      const data = await res.json();
      const duration = Math.round(performance.now() - start);
      setAiTestResult(`Status: ${res.status} OK (${duration}ms)\n` + JSON.stringify(data, null, 2));
    } catch (err: any) {
      setAiTestResult(`AI Test Failed: ${err.message}`);
    } finally {
      setIsTestingAi(false);
    }
  };

  const deleteStorageItem = (key: string) => {
    localStorage.removeItem(key);
    setStorageData((prev) => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  };

  const roles: RoleType[] = ['student', 'professional', 'researcher', 'educator', 'creator', 'custom'];

  return (
    <>
      {/* Floating Admin Trigger Badge if closed */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 z-50 px-3.5 py-2 rounded-2xl bg-rose-600 text-white font-mono text-xs font-bold shadow-2xl flex items-center gap-2 hover:bg-rose-500 transition-all border border-rose-400 animate-pulse cursor-pointer"
        >
          <ShieldAlert className="w-4 h-4" />
          <span>DEV ADMIN (pass=108)</span>
        </button>
      )}

      {/* Secret Admin Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="w-full max-w-4xl bg-neutral-950 border-2 border-rose-500/80 rounded-3xl shadow-2xl text-neutral-100 flex flex-col max-h-[92vh] overflow-hidden">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-neutral-800 bg-neutral-900/80 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40">
                  <Terminal className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-mono font-bold text-white tracking-tight">
                      SECRET DEVELOPER CONTROL SETTINGS
                    </h2>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 font-bold uppercase">
                      PASS: 108 VERIFIED
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 font-mono mt-0.5">
                    Universal developer override active at <span className="text-rose-400">{window.location.pathname}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={exitAdminMode}
                  className="px-2.5 py-1.5 rounded-xl border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-300 font-mono transition-colors cursor-pointer"
                  title="Remove query params from URL"
                >
                  Exit URL Mode
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-xl border border-neutral-700 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                  title="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Admin Tabs */}
            <div className="flex border-b border-neutral-800 bg-neutral-900/40 px-4 pt-2 gap-1 overflow-x-auto shrink-0 font-mono text-xs">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-3.5 py-2 rounded-t-xl transition-colors cursor-pointer ${
                  activeTab === 'overview'
                    ? 'bg-neutral-800 text-white font-bold border-t border-x border-neutral-700'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Diagnostics &amp; State
              </button>
              <button
                onClick={() => setActiveTab('overrides')}
                className={`px-3.5 py-2 rounded-t-xl transition-colors cursor-pointer ${
                  activeTab === 'overrides'
                    ? 'bg-neutral-800 text-white font-bold border-t border-x border-neutral-700'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Role &amp; Theme Overrides
              </button>
              <button
                onClick={() => setActiveTab('storage')}
                className={`px-3.5 py-2 rounded-t-xl transition-colors cursor-pointer ${
                  activeTab === 'storage'
                    ? 'bg-neutral-800 text-white font-bold border-t border-x border-neutral-700'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Storage &amp; Wipe ({Object.keys(storageData).length})
              </button>
              <button
                onClick={() => setActiveTab('ai_test')}
                className={`px-3.5 py-2 rounded-t-xl transition-colors cursor-pointer ${
                  activeTab === 'ai_test'
                    ? 'bg-neutral-800 text-white font-bold border-t border-x border-neutral-700'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                AI Scheduler API Test
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-6 flex-1 font-mono text-xs">
              {/* TAB 1: DIAGNOSTICS & STATE */}
              {activeTab === 'overview' && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800">
                      <span className="text-neutral-400 text-[10px] uppercase block">Current Route</span>
                      <span className="text-sm font-bold text-rose-400 mt-0.5 block truncate">
                        {currentPath} ({window.location.pathname})
                      </span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800">
                      <span className="text-neutral-400 text-[10px] uppercase block">Auth Status</span>
                      <span className={`text-sm font-bold mt-0.5 block ${isLoggedIn ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {isLoggedIn ? 'Authenticated' : 'Signed Out / Guest'}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800">
                      <span className="text-neutral-400 text-[10px] uppercase block">Google User</span>
                      <span className="text-sm font-bold text-neutral-200 mt-0.5 block truncate">
                        {currentUser?.email || 'Not connected'}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800">
                      <span className="text-neutral-400 text-[10px] uppercase block">GitHub User</span>
                      <span className="text-sm font-bold text-neutral-200 mt-0.5 block truncate">
                        {githubUser ? `@${githubUser.username}` : 'Not connected'}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800">
                      <span className="text-neutral-400 text-[10px] uppercase block">Google OAuth Token</span>
                      <span className="text-sm font-bold mt-0.5 block truncate">
                        {googleToken ? '✓ Cached in memory' : '✗ Missing'}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800">
                      <span className="text-neutral-400 text-[10px] uppercase block">Data Counts</span>
                      <span className="text-sm font-bold text-neutral-200 mt-0.5 block">
                        Tasks: {tasks.length} | Sessions: {sessions.length}
                      </span>
                    </div>
                  </div>

                  {/* Navigation Jump Actions */}
                  <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-3">
                    <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                      Quick Route Jumps
                    </h3>
                    <div className="flex flex-wrap gap-2.5">
                      <button
                        onClick={() => {
                          setProfile((p) => ({ ...p, onboarded: true }));
                          navigate('/h');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold border border-neutral-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>Jump to Workspace (/h)</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => navigate('/onboarding')}
                        className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold border border-neutral-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>Jump to Onboarding (/onboarding)</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          if (window.confirm('Wipe ALL saved data immediately and reset to clean state?')) {
                            resetAllData();
                            setStorageData({});
                          }
                        }}
                        className="px-3 py-1.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-300 font-bold border border-rose-800 transition-colors flex items-center gap-1.5 cursor-pointer ml-auto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hard Wipe Everything</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: OVERRIDES (ROLE & THEME) */}
              {activeTab === 'overrides' && (
                <div className="space-y-5">
                  <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
                    <span className="text-neutral-400 text-[10px] uppercase block font-bold">
                      Instant Role Switcher (Current: {profile.role})
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {roles.map((r) => (
                        <button
                          key={r}
                          onClick={() => setProfile((p) => ({ ...p, role: r }))}
                          className={`p-2 rounded-xl text-left border transition-all cursor-pointer capitalize ${
                            profile.role === r
                              ? 'bg-rose-500/20 border-rose-500 text-rose-300 font-bold'
                              : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
                    <span className="text-neutral-400 text-[10px] uppercase block font-bold">
                      Instant Theme Switcher (Current: {theme})
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {THEME_CONFIGS.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => setTheme(t.id)}
                          className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer flex items-center justify-between ${
                            theme === t.id
                              ? 'bg-neutral-800 border-white text-white font-bold'
                              : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full border border-white/20"
                              style={{ backgroundColor: t.accent }}
                            />
                            <span className="text-xs truncate">{t.label}</span>
                          </div>
                          {t.isLight ? (
                            <Sun className="w-3 h-3 text-amber-400 shrink-0" />
                          ) : (
                            <Moon className="w-3 h-3 text-neutral-400 shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: STORAGE & HARD WIPE */}
              {activeTab === 'storage' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400 text-xs">
                      Inspect &amp; clear specific LocalStorage keys. Zero placeholder policy active.
                    </span>
                    <button
                      onClick={() => {
                        resetAllData();
                        setStorageData({});
                      }}
                      className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear All LocalStorage Keys</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {Object.keys(storageData).length === 0 ? (
                      <div className="p-6 text-center border border-dashed border-neutral-800 rounded-2xl text-neutral-500">
                        Storage is completely clean and empty. No data cached.
                      </div>
                    ) : (
                      Object.entries(storageData).map(([key, val]) => (
                        <div
                          key={key}
                          className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between gap-3"
                        >
                          <div className="min-w-0">
                            <span className="font-bold text-white block truncate">{key}</span>
                            <span className="text-[10px] text-neutral-400 block truncate font-mono">
                              {val.length} bytes • {val.slice(0, 80)}...
                            </span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => setSelectedStorageKey(selectedStorageKey === key ? null : key)}
                              className="px-2 py-1 rounded-lg border border-neutral-700 hover:bg-neutral-800 text-neutral-300 text-[10px]"
                            >
                              {selectedStorageKey === key ? 'Hide' : 'Inspect'}
                            </button>
                            <button
                              onClick={() => deleteStorageItem(key)}
                              className="p-1 rounded-lg hover:bg-rose-500/20 text-rose-400 hover:text-rose-300"
                              title="Delete this key"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {selectedStorageKey && storageData[selectedStorageKey] && (
                    <div className="p-3 rounded-xl bg-black border border-neutral-700">
                      <span className="text-xs text-neutral-400 block mb-1">
                        Contents of {selectedStorageKey}:
                      </span>
                      <pre className="p-3 rounded bg-neutral-950 text-neutral-300 text-[11px] overflow-x-auto max-h-48">
                        {storageData[selectedStorageKey]}
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: AI TEST */}
              {activeTab === 'ai_test' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-white text-xs">AI Scheduling Server Endpoint Test</h3>
                      <p className="text-[11px] text-neutral-400">
                        Dispatches test payload to <span className="text-rose-400">/api/ai/schedule</span> to verify Gemini API connection.
                      </p>
                    </div>
                    <button
                      onClick={handleTestAiSchedule}
                      disabled={isTestingAi}
                      className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{isTestingAi ? 'Calling Gemini...' : 'Run Endpoint Test'}</span>
                    </button>
                  </div>

                  {aiTestResult && (
                    <div className="p-4 rounded-2xl bg-black border border-neutral-800 font-mono text-xs">
                      <span className="text-neutral-400 block mb-2 font-bold uppercase text-[10px]">
                        Server Response:
                      </span>
                      <pre className="text-emerald-400 whitespace-pre-wrap max-h-80 overflow-y-auto leading-relaxed">
                        {aiTestResult}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3.5 border-t border-neutral-800 bg-neutral-900/60 flex items-center justify-between text-neutral-400 text-[11px] font-mono shrink-0">
              <span>Add &apos;?admin=True&amp;pass=108&apos; to any URL to reopen.</span>
              <button
                onClick={() => setIsOpen(false)}
                className="px-3 py-1 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white transition-colors"
              >
                Close Panel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

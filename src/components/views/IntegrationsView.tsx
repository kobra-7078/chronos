import React from 'react';
import {
  Mail,
  GraduationCap,
  HardDrive,
  CheckSquare,
  Calendar,
  Bookmark,
  PlaySquare,
  Presentation,
  FolderOpen,
  MapPin,
  Check,
  RefreshCw,
  Plus,
  ExternalLink,
  ShieldCheck,
  User,
  Github,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { IntegrationProvider } from '../../types';

export const IntegrationsView: React.FC = () => {
  const {
    integrations,
    toggleIntegration,
    importIntegrationSample,
    currentUser,
    loginWithGoogle,
    syncGoogleResources,
    githubUser,
    loginWithGithub,
    logoutGithub,
    isAuthenticating,
  } = useApp();

  const getProviderIcon = (provider: IntegrationProvider) => {
    switch (provider) {
      case 'gmail': return <Mail className="w-5 h-5 text-rose-400" />;
      case 'google_classroom': return <GraduationCap className="w-5 h-5 text-amber-400" />;
      case 'google_drive': return <HardDrive className="w-5 h-5 text-cyan-400" />;
      case 'google_tasks': return <CheckSquare className="w-5 h-5 text-blue-400" />;
      case 'google_calendar': return <Calendar className="w-5 h-5 text-emerald-400" />;
      case 'google_keep': return <Bookmark className="w-5 h-5 text-yellow-400" />;
      case 'youtube': return <PlaySquare className="w-5 h-5 text-red-500" />;
      case 'slides': return <Presentation className="w-5 h-5 text-orange-400" />;
      case 'picker': return <FolderOpen className="w-5 h-5 text-teal-400" />;
      case 'maps': return <MapPin className="w-5 h-5 text-green-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Account Status */}
      <div className="glass-card p-6 rounded-3xl border border-[var(--theme-border)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-editorial font-bold text-white tracking-tight">
            Google Workspace &amp; Media Integrations
          </h2>
          <p className="text-xs text-[var(--theme-text-muted)] mt-1 max-w-2xl leading-relaxed">
            Chronos aggregates schedules, assignments, conversation threads, notes, and transit buffers across your authorized Google ecosystem.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {currentUser ? (
            <button
              onClick={() => syncGoogleResources()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[var(--theme-accent)] text-neutral-950 font-bold text-xs shadow-md hover:opacity-90 transition-opacity cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Sync Live Google Data</span>
            </button>
          ) : (
            <button
              onClick={loginWithGoogle}
              disabled={isAuthenticating}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[var(--theme-accent)] text-neutral-950 font-bold text-xs shadow-md hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.4l3.7 2.9C6.5 7.4 9 5 12 5z" />
                <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
                <path fill="#FBBC05" d="M5.6 14.7c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.2C.7 9.6 0 10.7 0 12s.7 2.4 1.9 4.8l3.7-2.1z" />
                <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2-6.4-4.8L1.9 16.4C3.7 20.3 7.5 23 12 23z" />
              </svg>
              <span>{isAuthenticating ? 'Connecting...' : 'Authorize Google Account'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid of integrations: GitHub + 10 Google & Media integrations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* GitHub Card */}
        <div className="glass-card p-5 rounded-3xl border border-[var(--theme-border)] flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/5 text-white">
                  <Github className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-xs text-white">GitHub Developer</h4>
                  <span className="text-[10px] uppercase font-mono text-[var(--theme-text-muted)]">
                    Code &amp; Repos
                  </span>
                </div>
              </div>

              <span
                className={`text-[9px] uppercase font-mono px-2 py-0.5 rounded-full border ${
                  githubUser
                    ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/40'
                    : 'bg-white/5 text-[var(--theme-text-muted)] border-white/10'
                }`}
              >
                {githubUser ? 'Connected' : 'Disconnected'}
              </span>
            </div>

            <p className="text-xs text-[var(--theme-text-muted)] mt-3 leading-relaxed">
              Import repositories, assign issues directly to focus blocks, and sync development workflows.
            </p>

            {githubUser && (
              <div className="mt-2 text-[11px] font-mono text-[var(--theme-accent-light)] flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>@{githubUser.username} connected</span>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
            <span className="text-[10px] font-mono text-[var(--theme-text-muted)]">
              OAuth &amp; PAT
            </span>

            {githubUser ? (
              <button
                onClick={logoutGithub}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-black/30 text-[var(--theme-text-muted)] hover:text-white border border-white/10 transition-colors cursor-pointer"
              >
                Disconnect
              </button>
            ) : (
              <button
                onClick={loginWithGithub}
                disabled={isAuthenticating}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[var(--theme-accent)] text-neutral-950 hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
              >
                Connect GitHub
              </button>
            )}
          </div>
        </div>

        {integrations.map((item) => {
          const isConnected = item.status === 'connected';
          return (
            <div
              key={item.id}
              className="glass-card p-5 rounded-3xl border border-[var(--theme-border)] flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/5">
                      {getProviderIcon(item.provider)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-xs text-white">{item.name}</h4>
                      <span className="text-[10px] uppercase font-mono text-[var(--theme-text-muted)]">
                        {item.category}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[9px] uppercase font-mono px-2 py-0.5 rounded-full border ${
                      isConnected
                        ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/40'
                        : 'bg-white/5 text-[var(--theme-text-muted)] border-white/10'
                    }`}
                  >
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>

                <p className="text-xs text-[var(--theme-text-muted)] mt-3 leading-relaxed">
                  {item.description}
                </p>

                {isConnected && (
                  <div className="mt-2 text-[11px] font-mono text-[var(--theme-accent-light)]">
                    {item.itemCount} synced items in schedule
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                <button
                  onClick={() => importIntegrationSample(item.provider)}
                  className="text-xs font-semibold text-[var(--theme-accent-light)] hover:underline flex items-center gap-1 cursor-pointer"
                  title="Import sample action item from this service"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Sync Sample</span>
                </button>

                <button
                  onClick={() => toggleIntegration(item.provider)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isConnected
                      ? 'bg-black/30 text-[var(--theme-text-muted)] hover:text-white border border-white/10'
                      : 'bg-[var(--theme-accent)] text-neutral-950 hover:opacity-90'
                  }`}
                >
                  {isConnected ? 'Disconnect' : 'Connect'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

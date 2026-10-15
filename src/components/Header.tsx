import React, { useState } from 'react';
import {
  RefreshCw,
  SlidersHorizontal,
  ChevronDown,
  Check,
  Plus,
  LogOut,
  Github,
  Sun,
  Moon,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ChronosLogo } from './ChronosLogo';
import { THEME_CONFIGS } from '../data/mockData';

interface HeaderProps {
  onOpenOnboarding: () => void;
  onOpenNewTask: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenOnboarding, onOpenNewTask }) => {
  const {
    theme,
    setTheme,
    runOptimization,
    isSolvingSchedule,
    currentUser,
    loginWithGoogle,
    logout,
    githubUser,
    loginWithGithub,
    logoutGithub,
    isAuthenticating,
  } = useApp();

  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const currentThemeConfig = THEME_CONFIGS.find((t) => t.id === theme) || THEME_CONFIGS[0];
  const darkThemes = THEME_CONFIGS.filter((t) => !t.isLight);
  const lightThemes = THEME_CONFIGS.filter((t) => t.isLight);

  return (
    <header className="sticky top-0 z-40 w-full glass-card border-b border-[var(--theme-border)] px-4 sm:px-8 py-3 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Adaptive Logo & Brand */}
        <div className="flex items-center gap-3">
          <ChronosLogo size={36} accent={currentThemeConfig.accent} />
          <div>
            <span className="font-editorial text-lg font-bold tracking-tight text-[var(--theme-text)] block leading-none">
              Chronos
            </span>
            <span className="text-[10px] text-[var(--theme-text-muted)] tracking-wider uppercase font-medium">
              Intelligence &amp; Planning
            </span>
          </div>
        </div>

        {/* Right: Theme Selector, Quick Action, Google Sign-in & Optimizer */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Theme Palette Switcher */}
          <div className="relative">
            <button
              onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
              className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl border border-[var(--theme-border)] bg-black/5 dark:bg-black/20 hover:bg-black/10 dark:hover:bg-black/30 text-xs text-[var(--theme-text)] transition-all cursor-pointer"
              title="Change theme palette"
            >
              <div
                className="w-2.5 h-2.5 rounded-full border border-black/10 dark:border-white/20 shadow-xs"
                style={{ backgroundColor: currentThemeConfig.accent }}
              />
              <span className="hidden sm:inline font-medium text-xs">
                {currentThemeConfig.label}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[var(--theme-text-muted)]" />
            </button>

            {themeDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 glass-card rounded-2xl shadow-2xl border border-[var(--theme-border)] p-2.5 z-50 max-h-[460px] overflow-y-auto">
                {/* Light Themes */}
                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-[var(--theme-text-muted)] px-2.5 py-1 uppercase tracking-wider">
                  <Sun className="w-3 h-3 text-amber-500" />
                  <span>Light Palettes</span>
                </div>
                <div className="space-y-1 mb-2.5">
                  {lightThemes.map((t) => {
                    const isCurrent = theme === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => {
                          setTheme(t.id);
                          setThemeDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs text-left transition-colors cursor-pointer ${
                          isCurrent
                            ? 'bg-[var(--theme-accent-subtle)] text-[var(--theme-accent-light)] font-semibold'
                            : 'text-[var(--theme-text)] hover:bg-black/5 dark:hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full border border-black/10 dark:border-white/20"
                            style={{ backgroundColor: t.accent }}
                          />
                          <span>{t.label}</span>
                        </div>
                        {isCurrent && <Check className="w-3.5 h-3.5 text-[var(--theme-accent)]" />}
                      </button>
                    );
                  })}
                </div>

                {/* Dark Themes */}
                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-[var(--theme-text-muted)] px-2.5 py-1 uppercase tracking-wider border-t border-[var(--theme-border)] pt-2">
                  <Moon className="w-3 h-3 text-indigo-400" />
                  <span>Dark Palettes</span>
                </div>
                <div className="space-y-1">
                  {darkThemes.map((t) => {
                    const isCurrent = theme === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => {
                          setTheme(t.id);
                          setThemeDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs text-left transition-colors cursor-pointer ${
                          isCurrent
                            ? 'bg-[var(--theme-accent-subtle)] text-[var(--theme-accent-light)] font-semibold'
                            : 'text-[var(--theme-text)] hover:bg-black/5 dark:hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full border border-black/10 dark:border-white/20"
                            style={{ backgroundColor: t.accent }}
                          />
                          <span>{t.label}</span>
                        </div>
                        {isCurrent && <Check className="w-3.5 h-3.5 text-[var(--theme-accent)]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Google Sign In / Account Dropdown */}
          <div className="relative">
            {currentUser || githubUser ? (
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-[var(--theme-border)] bg-black/5 dark:bg-black/20 hover:bg-black/10 dark:hover:bg-black/40 text-xs text-[var(--theme-text)] transition-colors cursor-pointer"
              >
                {currentUser?.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'Google User'}
                    className="w-5 h-5 rounded-full object-cover border border-[var(--theme-border)]"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-[var(--theme-accent)] text-neutral-950 font-bold flex items-center justify-center text-[10px]">
                    {currentUser?.displayName
                      ? currentUser.displayName[0].toUpperCase()
                      : githubUser?.username
                      ? githubUser.username[0].toUpperCase()
                      : 'U'}
                  </div>
                )}
                <span className="hidden md:inline font-medium text-xs max-w-[110px] truncate">
                  {currentUser?.displayName || (githubUser ? `@${githubUser.username}` : 'Account')}
                </span>
                <ChevronDown className="w-3 h-3 text-[var(--theme-text-muted)]" />
              </button>
            ) : (
              <button
                onClick={loginWithGoogle}
                disabled={isAuthenticating}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[var(--theme-accent)]/50 bg-[var(--theme-accent-subtle)] hover:bg-[var(--theme-accent)]/20 text-xs text-[var(--theme-text)] font-medium transition-all cursor-pointer disabled:opacity-50"
                title="Sign in with Google (Personal & Organization accounts supported)"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.4l3.7 2.9C6.5 7.4 9 5 12 5z" />
                  <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
                  <path fill="#FBBC05" d="M5.6 14.7c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.2C.7 9.6 0 10.7 0 12s.7 2.4 1.9 4.8l3.7-2.1z" />
                  <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2-6.4-4.8L1.9 16.4C3.7 20.3 7.5 23 12 23z" />
                </svg>
                <span className="hidden sm:inline">
                  {isAuthenticating ? 'Connecting...' : 'Sign in'}
                </span>
              </button>
            )}

            {userDropdownOpen && (currentUser || githubUser) && (
              <div className="absolute right-0 mt-2 w-64 glass-card rounded-2xl shadow-2xl border border-[var(--theme-border)] p-3 z-50 space-y-2.5">
                {currentUser && (
                  <div className="pb-2 border-b border-[var(--theme-border)]">
                    <span className="text-[11px] font-bold text-[var(--theme-text)] block truncate">
                      {currentUser.displayName || 'Google Account'}
                    </span>
                    <span className="text-[10px] text-[var(--theme-text-muted)] block truncate font-mono">
                      {currentUser.email}
                    </span>
                    <div className="text-[10px] text-emerald-500 flex items-center gap-1.5 mt-1">
                      <Check className="w-3 h-3" />
                      <span>Google Workspace Active</span>
                    </div>
                  </div>
                )}

                {githubUser && (
                  <div className="pb-2 border-b border-[var(--theme-border)]">
                    <span className="text-[11px] font-bold text-[var(--theme-text)] flex items-center gap-1.5">
                      <Github className="w-3 h-3 text-[var(--theme-accent-light)]" />
                      <span>@{githubUser.username}</span>
                    </span>
                    <div className="text-[10px] text-emerald-500 flex items-center gap-1.5 mt-0.5">
                      <Check className="w-3 h-3" />
                      <span>GitHub Synced</span>
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  {currentUser && (
                    <button
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out Google</span>
                    </button>
                  )}
                  {githubUser && (
                    <button
                      onClick={() => {
                        logoutGithub();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Disconnect GitHub</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quick Schedule Optimize */}
          <button
            onClick={runOptimization}
            disabled={isSolvingSchedule}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--theme-border)] bg-black/5 dark:bg-black/20 hover:bg-black/10 dark:hover:bg-black/40 text-xs font-medium text-[var(--theme-text)] transition-colors cursor-pointer disabled:opacity-50"
            title="Recalculate schedule"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSolvingSchedule ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Optimize</span>
          </button>

          {/* Add Plan Item */}
          <button
            onClick={onOpenNewTask}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[var(--theme-accent)] hover:opacity-90 text-neutral-950 font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">New Plan</span>
          </button>

          {/* Setup / Calibration */}
          <button
            onClick={onOpenOnboarding}
            className="p-1.5 rounded-xl border border-[var(--theme-border)] text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] bg-black/5 dark:bg-black/20 hover:bg-black/10 dark:hover:bg-black/40 transition-colors cursor-pointer"
            title="Open Onboarding Preferences"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

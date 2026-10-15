import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  CheckCircle2,
  Calendar,
  Mail,
  GraduationCap,
  HardDrive,
  CheckSquare,
  ShieldCheck,
  Briefcase,
  Layers,
  BookOpen,
  User,
  Clock,
  MapPin,
  Youtube,
  Presentation,
  FileSpreadsheet,
  FileText,
  Github,
  LogOut,
  Building2,
  Sun,
  Moon,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ChronosLogo } from './ChronosLogo';
import { THEME_CONFIGS } from '../data/mockData';
import { RoleType, ThemeType } from '../types';

interface OnboardingScreenProps {
  isModal?: boolean;
  onClose?: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ isModal = false, onClose }) => {
  const {
    profile,
    completeOnboarding,
    runOptimization,
    currentUser,
    loginWithGoogle,
    logout,
    githubUser,
    loginWithGithub,
    logoutGithub,
    linkGithubToken,
    isAuthenticating,
    updateAvailability,
    theme,
    setTheme,
    byline,
    isLoggedIn,
    navigate,
    authError,
    setAuthError,
    loginAsTestUser,
  } = useApp();

  const [step, setStep] = useState<number>(1);

  // Form states
  const [userName, setUserName] = useState(
    currentUser?.displayName || githubUser?.username || profile.name || ''
  );
  const [selectedRole, setSelectedRole] = useState<RoleType>(profile.role || 'professional');
  const [focusArea, setFocusArea] = useState(profile.focusArea || '');
  const [selectedTheme, setSelectedTheme] = useState<ThemeType>(theme || 'warm-amber');
  const [themeModeTab, setThemeModeTab] = useState<'all' | 'dark' | 'light'>('all');

  // Custom PAT token input toggle
  const [showGithubTokenInput, setShowGithubTokenInput] = useState(false);
  const [customPatInput, setCustomPatInput] = useState('');

  // Working availability
  const [dayStart, setDayStart] = useState<number>(profile.availability.dayStartHour || 9);
  const [dayEnd, setDayEnd] = useState<number>(profile.availability.dayEndHour || 18);
  const [sessionLen, setSessionLen] = useState<number>(profile.availability.preferredSessionMinutes || 45);
  const [energyPeak, setEnergyPeak] = useState<'morning' | 'afternoon' | 'evening'>(
    profile.availability.energyPeak || 'morning'
  );

  // 10 Resource Permissions checklist asked during onboarding
  const [enabledPermissions, setEnabledPermissions] = useState<Record<string, boolean>>({
    google_calendar: true,
    google_tasks: true,
    google_classroom: true,
    google_drive: true,
    gmail: true,
    maps: true,
    youtube: true,
    slides: true,
    google_keep: true,
    picker: true,
  });

  const togglePermission = (provider: string) => {
    setEnabledPermissions((prev) => ({
      ...prev,
      [provider]: !prev[provider],
    }));
  };

  const selectAllPermissions = () => {
    setEnabledPermissions({
      google_calendar: true,
      google_tasks: true,
      google_classroom: true,
      google_drive: true,
      gmail: true,
      maps: true,
      youtube: true,
      slides: true,
      google_keep: true,
      picker: true,
    });
  };

  const roleOptions: { id: RoleType; label: string; desc: string; icon: any }[] = [
    {
      id: 'professional',
      label: 'Software Engineer & Technologist',
      desc: 'Deep work code sprints, milestone delivery, architecture reviews & task queues',
      icon: Briefcase,
    },
    {
      id: 'student',
      label: 'Student & Academic Scholar',
      desc: 'Coursework deadlines, exam preparation, syllabus tracking & lecture blocks',
      icon: GraduationCap,
    },
    {
      id: 'researcher',
      label: 'Scientific Researcher & PI',
      desc: 'Manuscript writing, experimental phases, grant milestones & literature focus',
      icon: BookOpen,
    },
    {
      id: 'creator',
      label: 'Creator, Product & Design Lead',
      desc: 'Studio focus time, prototype sprints, user research & asset releases',
      icon: Layers,
    },
    {
      id: 'educator',
      label: 'Educator & Curriculum Director',
      desc: 'Lesson planning, office hours, grading buffers & student assessments',
      icon: Presentation,
    },
    {
      id: 'custom',
      label: 'Interdisciplinary / Specialized',
      desc: 'Custom professional workflow tailored to your exact discipline and pace',
      icon: Sparkles,
    },
  ];

  const permissionsList = [
    {
      id: 'google_calendar',
      name: 'Google Calendar',
      scope: 'calendar.readonly',
      desc: 'Detects busy windows to eliminate conflicts and allocate protected deep-work sessions.',
      icon: Calendar,
      accent: '#34A853',
    },
    {
      id: 'google_tasks',
      name: 'Google Tasks',
      scope: 'tasks',
      desc: 'Two-way synchronization of active backlog items, priority checklists, and to-dos.',
      icon: CheckSquare,
      accent: '#4285F4',
    },
    {
      id: 'google_classroom',
      name: 'Google Classroom',
      scope: 'classroom.courses & coursework',
      desc: 'Imports enrolled course syllabi, upcoming assignment due dates, and rubrics.',
      icon: GraduationCap,
      accent: '#FBBC05',
    },
    {
      id: 'google_drive',
      name: 'Google Drive & DOCX Export',
      scope: 'drive.readonly & drive.file',
      desc: 'Indexes project docs, reference materials, and enables exporting schedules as DOCX to your Drive.',
      icon: HardDrive,
      accent: '#26A69A',
    },
    {
      id: 'gmail',
      name: 'Gmail',
      scope: 'gmail.readonly',
      desc: 'Extracts time-sensitive action items, review notices, and schedule threads.',
      icon: Mail,
      accent: '#EA4335',
    },
    {
      id: 'maps',
      name: 'Google Maps Platform',
      scope: 'maps.navigation',
      desc: 'Calculates transit buffers, traffic durations, and location transit between commitments.',
      icon: MapPin,
      accent: '#EA4335',
    },
    {
      id: 'youtube',
      name: 'YouTube',
      scope: 'youtube.readonly',
      desc: 'Pairs educational lectures, tutorial playlists, and study timers to scheduled sessions.',
      icon: Youtube,
      accent: '#FF0000',
    },
    {
      id: 'slides',
      name: 'Google Slides',
      scope: 'presentations.readonly',
      desc: 'Tracks presentation deadlines, review checkpoints, and collaborative pitch decks.',
      icon: Presentation,
      accent: '#FBBC05',
    },
    {
      id: 'google_keep',
      name: 'Google Keep',
      scope: 'keep.notes',
      desc: 'Syncs quick scratchpad notes, pinned reminders, and fleeting thoughts into actionable plans.',
      icon: FileText,
      accent: '#FBBC05',
    },
    {
      id: 'picker',
      name: 'Google Drive File Picker',
      scope: 'drive.file',
      desc: 'Allows interactive browsing and direct file attachments from your Google Drive.',
      icon: FileSpreadsheet,
      accent: '#4285F4',
    },
  ];

  const handleFinish = () => {
    updateAvailability({
      dayStartHour: dayStart,
      dayEndHour: dayEnd,
      preferredSessionMinutes: sessionLen,
      energyPeak,
    });

    const activeList = Object.keys(enabledPermissions).filter((k) => enabledPermissions[k]);

    completeOnboarding(
      userName.trim() || currentUser?.displayName || githubUser?.username || 'User',
      selectedRole,
      selectedTheme,
      focusArea,
      activeList
    );

    if (onClose) {
      onClose();
    }

    setTimeout(() => {
      runOptimization();
    }, 200);
  };

  const currentThemeConfig = THEME_CONFIGS.find((t) => t.id === selectedTheme) || THEME_CONFIGS[0];

  const filteredThemes = THEME_CONFIGS.filter((t) => {
    if (themeModeTab === 'dark') return !t.isLight;
    if (themeModeTab === 'light') return t.isLight;
    return true;
  });

  return (
    <div
      className={`${
        isModal
          ? 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto'
          : 'min-h-screen bg-[var(--theme-bg)] text-[var(--theme-text)] flex flex-col justify-between p-4 sm:p-8 lg:p-12'
      }`}
    >
      <div className={`w-full max-w-4xl mx-auto ${isModal ? 'my-auto' : ''}`}>
        {/* Top Header & Dynamic Logo */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-[var(--theme-border)]">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="p-2 rounded-2xl bg-black/10 dark:bg-black/30 border border-[var(--theme-border)] shadow-md">
              <ChronosLogo size={48} accent={currentThemeConfig.accent} />
            </div>
            <div>
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <h1 className="font-editorial text-2xl sm:text-3xl font-bold tracking-tight text-[var(--theme-text)]">
                  Chronos
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-[var(--theme-accent-subtle)] text-[var(--theme-accent-light)] border border-[var(--theme-accent)]/30 font-semibold">
                  Workspace Setup
                </span>
              </div>
              <p className="text-xs text-[var(--theme-text-muted)] mt-0.5">
                Universal Role-Aware Intelligence &amp; Scheduling Operating System
              </p>
            </div>
          </div>

          {/* Stepper Indicator & Continue to App button */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-black/10 dark:bg-black/30 px-3 py-1.5 rounded-full border border-[var(--theme-border)]">
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  onClick={() => s <= step && setStep(s)}
                  className={`cursor-pointer transition-all ${
                    s === step
                      ? 'w-6 h-2 rounded-full bg-[var(--theme-accent)] shadow-sm'
                      : s < step
                      ? 'w-2 h-2 rounded-full bg-[var(--theme-accent-light)] opacity-70'
                      : 'w-2 h-2 rounded-full bg-black/20 dark:bg-white/10'
                  }`}
                  title={`Go to step ${s}`}
                />
              ))}
              <span className="text-[10px] text-[var(--theme-text-muted)] font-mono ml-1.5">
                {step}/4
              </span>
            </div>

            {/* Prominent Continue to App button if signed in */}
            {isLoggedIn && !isModal && (
              <button
                onClick={() => navigate('/h')}
                className="px-3.5 py-1.5 rounded-xl bg-[var(--theme-accent)] text-neutral-950 font-bold text-xs shadow-md hover:opacity-90 transition-all cursor-pointer flex items-center gap-1.5"
                title="Enter Chronos Workspace at /h"
              >
                <span>Continue to App (/h)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {isModal && onClose && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl border border-[var(--theme-border)] text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Signed In Banner - Shows whenever user is already authenticated */}
        {isLoggedIn && !isModal && (
          <div className="mt-4 p-4 rounded-2xl bg-[var(--theme-accent-subtle)] border border-[var(--theme-accent)]/40 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[var(--theme-accent)] text-neutral-950 font-bold flex items-center justify-center text-xs shadow-sm">
                <Check className="w-4 h-4 stroke-[3]" />
              </div>
              <div>
                <div className="text-xs font-bold text-[var(--theme-text)]">
                  You are currently signed in {currentUser?.displayName ? `as ${currentUser.displayName}` : githubUser ? `as @${githubUser.username}` : ''}
                </div>
                <div className="text-[11px] text-[var(--theme-text-muted)]">
                  Continue directly to your workspace at <span className="font-mono font-semibold text-[var(--theme-accent)]">/h</span> or adjust your role &amp; permissions below.
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/h')}
              className="px-4 py-2 rounded-xl bg-[var(--theme-accent)] text-neutral-950 font-bold text-xs shadow hover:opacity-90 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <span>Continue to App (/h)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Main Card Content */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 lg:p-10 my-6 shadow-2xl border border-[var(--theme-border)]">
          {/* STEP 1: IDENTITY & PROFESSION */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--theme-accent-light)] block font-semibold mb-1">
                  Step 1 • Identity Calibration
                </span>
                <h2 className="text-xl sm:text-2xl font-editorial font-bold text-[var(--theme-text)] tracking-tight">
                  Who is Chronos assisting today?
                </h2>
                <p className="text-xs sm:text-sm text-[var(--theme-text-muted)] mt-1">
                  Configure your workspace identity and define your primary professional workflow.
                </p>
              </div>

              {/* Name Input */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[var(--theme-text)]">
                  Your Full Name or Professional Handle
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-3.5 text-[var(--theme-text-muted)]" />
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="e.g. Jordan Cole, Maya, or Alex"
                    className="w-full pl-10 pr-4 py-3 text-sm bg-black/5 dark:bg-black/40 border border-[var(--theme-border)] rounded-2xl focus:outline-none focus:border-[var(--theme-accent)] text-[var(--theme-text)] placeholder-[var(--theme-text-muted)] transition-all"
                  />
                </div>
              </div>

              {/* Role / Profession Selection */}
              <div className="space-y-2.5">
                <label className="block text-xs font-semibold text-[var(--theme-text)]">
                  Select your primary discipline / profession
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {roleOptions.map((r) => {
                    const isSelected = selectedRole === r.id;
                    const Icon = r.icon;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setSelectedRole(r.id)}
                        className={`flex flex-col items-start p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[var(--theme-accent)] bg-[var(--theme-accent-subtle)] shadow-md ring-1 ring-[var(--theme-accent)]/40'
                            : 'border-[var(--theme-border)] bg-black/5 dark:bg-white/[0.02] hover:bg-black/10 dark:hover:bg-white/[0.05]'
                        }`}
                      >
                        <div
                          className={`p-2 rounded-xl border shrink-0 mb-2.5 ${
                            isSelected
                              ? 'bg-[var(--theme-accent)] text-neutral-950 border-[var(--theme-accent)]'
                              : 'bg-black/5 dark:bg-white/5 border-[var(--theme-border)] text-[var(--theme-text-muted)]'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="text-xs font-bold text-[var(--theme-text)]">{r.label}</div>
                        <div className="text-[11px] text-[var(--theme-text-muted)] mt-1 line-clamp-2 leading-relaxed">
                          {r.desc}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Focus Area / Specialty */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[var(--theme-text)]">
                  Specialty or Core Domain (Optional)
                </label>
                <input
                  type="text"
                  value={focusArea}
                  onChange={(e) => setFocusArea(e.target.value)}
                  placeholder="e.g. Distributed Systems, Molecular Genetics, Venture Capital, Neuroscience"
                  className="w-full px-4 py-2.5 text-xs bg-black/5 dark:bg-black/40 border border-[var(--theme-border)] rounded-xl focus:outline-none focus:border-[var(--theme-accent)] text-[var(--theme-text)] placeholder-[var(--theme-text-muted)]"
                />
              </div>
            </div>
          )}

          {/* STEP 2: AUTHENTICATION (GOOGLE & GITHUB) */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--theme-accent-light)] block font-semibold mb-1">
                  Step 2 • Authentication &amp; Connected Accounts
                </span>
                <h2 className="text-xl sm:text-2xl font-editorial font-bold text-[var(--theme-text)] tracking-tight">
                  Connect your Google and GitHub accounts
                </h2>
                <p className="text-xs sm:text-sm text-[var(--theme-text-muted)] mt-1">
                  Authentication allows Chronos to retrieve your authentic calendar commitments, tasks, coursework, and code repositories.
                </p>
              </div>

              {/* Google Verification Notice Banner (Shown if Google blocks OAuth testing) */}
              {authError && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-amber-500">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>Google Cloud OAuth Testing Notice</span>
                  </div>
                  <p className="text-[var(--theme-text-muted)] leading-relaxed">
                    {authError}
                  </p>
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => loginAsTestUser('omgysomanyyalt@gmail.com', 'Alex (Tester)')}
                      className="px-4 py-2 rounded-xl bg-[var(--theme-accent)] text-neutral-950 font-bold text-xs shadow hover:opacity-90 transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Continue with Test Account (omgysomanyyalt@gmail.com)</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Google Account Card */}
                <div className="p-5 rounded-2xl border border-[var(--theme-border)] bg-black/5 dark:bg-black/30 flex flex-col justify-between gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm border border-neutral-200">
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.4l3.7 2.9C6.5 7.4 9 5 12 5z" />
                          <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
                          <path fill="#FBBC05" d="M5.6 14.7c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.2C.7 9.6 0 10.7 0 12s.7 2.4 1.9 4.8l3.7-2.1z" />
                          <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2-6.4-4.8L1.9 16.4C3.7 20.3 7.5 23 12 23z" />
                        </svg>
                      </div>
                      {currentUser ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> Connected
                        </span>
                      ) : (
                        <span className="text-[10px] text-[var(--theme-text-muted)] font-mono">
                          Google Workspace
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-[var(--theme-text)]">Google Workspace &amp; Accounts</h3>
                      <p className="text-[11px] text-[var(--theme-text-muted)] mt-0.5 leading-relaxed">
                        Personal &amp; organization accounts (@company.com, @school.edu) permitted for Calendar, Tasks, Classroom, Drive &amp; Gmail.
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] text-[var(--theme-accent-light)] bg-[var(--theme-accent-subtle)] px-2.5 py-1 rounded-lg border border-[var(--theme-accent)]/20">
                      <Building2 className="w-3 h-3 shrink-0" />
                      <span>Personal &amp; Organization accounts supported</span>
                    </div>

                    {currentUser && (
                      <div className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-[var(--theme-border)] flex items-center justify-between gap-2.5">
                        <div className="flex items-center gap-2.5 min-w-0">
                          {currentUser.photoURL ? (
                            <img
                              src={currentUser.photoURL}
                              alt=""
                              className="w-6 h-6 rounded-full border border-[var(--theme-border)]"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-[var(--theme-accent)] text-neutral-950 font-bold flex items-center justify-center text-[10px]">
                              {currentUser.displayName ? currentUser.displayName[0] : 'G'}
                            </div>
                          )}
                          <div className="min-w-0">
                            <span className="text-xs font-semibold text-[var(--theme-text)] block truncate">
                              {currentUser.displayName || 'Google Account'}
                            </span>
                            <span className="text-[10px] text-[var(--theme-text-muted)] block truncate font-mono">
                              {currentUser.email}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={logout}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 text-xs flex items-center gap-1 cursor-pointer transition-colors"
                          title="Logout from Google"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Logout</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    {currentUser ? (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={loginWithGoogle}
                          disabled={isAuthenticating}
                          className="flex-1 py-2 rounded-xl text-xs font-semibold bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-[var(--theme-text)] border border-[var(--theme-border)] transition-colors cursor-pointer"
                        >
                          Switch Google Account
                        </button>
                        <button
                          type="button"
                          onClick={logout}
                          className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-500 border border-rose-500/30 hover:bg-rose-500/10 transition-colors cursor-pointer flex items-center gap-1.5"
                          title="Sign Out Google"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Logout</span>
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <button
                          type="button"
                          onClick={loginWithGoogle}
                          disabled={isAuthenticating}
                          className="w-full py-2.5 rounded-xl text-xs font-bold bg-white text-neutral-950 hover:bg-neutral-200 border border-neutral-300 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                            <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.4l3.7 2.9C6.5 7.4 9 5 12 5z" />
                            <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
                            <path fill="#FBBC05" d="M5.6 14.7c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.2C.7 9.6 0 10.7 0 12s.7 2.4 1.9 4.8l3.7-2.1z" />
                            <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2-6.4-4.8L1.9 16.4C3.7 20.3 7.5 23 12 23z" />
                          </svg>
                          <span>Sign in with Google</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => loginAsTestUser('omgysomanyyalt@gmail.com', 'Alex (Tester)')}
                          className="w-full py-2 rounded-xl text-xs font-semibold bg-[var(--theme-accent-subtle)] hover:bg-[var(--theme-accent)]/20 text-[var(--theme-accent-light)] border border-[var(--theme-accent)]/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          title="Instant one-click tester authentication bypasses Google Cloud verification restrictions"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Instant Tester Access (omgysomanyyalt@gmail.com)</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* GitHub Account Card */}
                <div className="p-5 rounded-2xl border border-[var(--theme-border)] bg-black/5 dark:bg-black/30 flex flex-col justify-between gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-[#24292e] border border-white/10 flex items-center justify-center shrink-0 shadow-sm text-white">
                        <Github className="w-5 h-5" />
                      </div>
                      {githubUser ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> Connected
                        </span>
                      ) : (
                        <span className="text-[10px] text-[var(--theme-text-muted)] font-mono">
                          GitHub Developer
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-[var(--theme-text)]">GitHub Account</h3>
                      <p className="text-[11px] text-[var(--theme-text-muted)] mt-0.5 leading-relaxed">
                        Connect your GitHub account to import assigned issues, repositories, and active milestones.
                      </p>
                    </div>

                    {githubUser && (
                      <div className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-[var(--theme-border)] flex items-center justify-between gap-2.5">
                        <div className="flex items-center gap-2.5 min-w-0">
                          {githubUser.avatarUrl ? (
                            <img
                              src={githubUser.avatarUrl}
                              alt=""
                              className="w-6 h-6 rounded-full border border-[var(--theme-border)]"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-[#24292e] text-white border border-white/20 flex items-center justify-center text-[10px]">
                              <Github className="w-3 h-3" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <span className="text-xs font-semibold text-[var(--theme-text)] block truncate">
                              @{githubUser.username}
                            </span>
                            <span className="text-[10px] text-emerald-500 block font-mono">
                              Authorized Sync
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={logoutGithub}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 text-xs flex items-center gap-1 cursor-pointer transition-colors"
                          title="Disconnect GitHub"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Logout</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    {githubUser ? (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={loginWithGithub}
                          disabled={isAuthenticating}
                          className="flex-1 py-2 rounded-xl text-xs font-semibold bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-[var(--theme-text)] border border-[var(--theme-border)] transition-colors cursor-pointer"
                        >
                          Re-link GitHub
                        </button>
                        <button
                          type="button"
                          onClick={logoutGithub}
                          className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-500 border border-rose-500/30 hover:bg-rose-500/10 transition-colors cursor-pointer flex items-center gap-1.5"
                          title="Disconnect GitHub"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Logout</span>
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={loginWithGithub}
                          disabled={isAuthenticating}
                          className="w-full py-2.5 rounded-xl text-xs font-bold bg-[#24292e] text-white hover:bg-[#2c3238] border border-white/20 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          <Github className="w-3.5 h-3.5" />
                          <span>Sign in with GitHub</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowGithubTokenInput(!showGithubTokenInput)}
                          className="w-full text-center text-[10px] text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] underline cursor-pointer"
                        >
                          {showGithubTokenInput ? 'Hide token option' : 'Or enter Personal Access Token (PAT)'}
                        </button>
                      </>
                    )}

                    {showGithubTokenInput && !githubUser && (
                      <div className="p-2.5 rounded-xl bg-black/10 dark:bg-black/40 border border-[var(--theme-border)] space-y-2 mt-2">
                        <input
                          type="password"
                          value={customPatInput}
                          onChange={(e) => setCustomPatInput(e.target.value)}
                          placeholder="ghp_xxxxxxxxxxxx"
                          className="w-full px-2.5 py-1.5 text-xs bg-black/10 dark:bg-black/60 border border-[var(--theme-border)] rounded-lg text-[var(--theme-text)] font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (customPatInput.trim()) {
                              linkGithubToken(customPatInput);
                              setShowGithubTokenInput(false);
                            }
                          }}
                          className="w-full py-1.5 text-xs bg-[var(--theme-accent)] text-neutral-950 font-bold rounded-lg cursor-pointer"
                        >
                          Save Token
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Informative Security Callout */}
              <div className="p-4 rounded-2xl bg-[var(--theme-accent-subtle)] border border-[var(--theme-accent)]/30 flex items-start gap-3">
                <ShieldCheck className="w-4 h-4 text-[var(--theme-accent-light)] shrink-0 mt-0.5" />
                <div className="text-xs text-[var(--theme-text-muted)] leading-relaxed">
                  <span className="font-semibold text-[var(--theme-text)]">Security &amp; Organization Compliance: </span>
                  Your credentials and tokens remain strictly within your session. Chronos supports single-sign-on for educational institutions, enterprises, and personal Google/GitHub accounts.
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: COMPREHENSIVE RESOURCE PERMISSIONS */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--theme-accent-light)] block font-semibold mb-1">
                    Step 3 • Resource Permissions &amp; Data Collection
                  </span>
                  <h2 className="text-xl sm:text-2xl font-editorial font-bold text-[var(--theme-text)] tracking-tight">
                    Permissions for integrated tools &amp; resources
                  </h2>
                  <p className="text-xs sm:text-sm text-[var(--theme-text-muted)] mt-1">
                    All tool permissions are configured here during onboarding rather than cluttering your daily sidebar.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={selectAllPermissions}
                  className="px-3 py-1.5 rounded-xl border border-[var(--theme-accent)]/50 bg-[var(--theme-accent-subtle)] text-[var(--theme-accent-light)] text-xs font-semibold hover:bg-[var(--theme-accent)]/20 transition-all cursor-pointer whitespace-nowrap self-start sm:self-auto"
                >
                  Authorize All 10 Resources
                </button>
              </div>

              {/* 10 Permissions Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
                {permissionsList.map((res) => {
                  const isEnabled = enabledPermissions[res.id];
                  const Icon = res.icon;
                  return (
                    <div
                      key={res.id}
                      onClick={() => togglePermission(res.id)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                        isEnabled
                          ? 'border-[var(--theme-accent)]/60 bg-[var(--theme-accent-subtle)]'
                          : 'border-[var(--theme-border)] bg-black/5 dark:bg-white/[0.02] hover:bg-black/10 dark:hover:bg-white/[0.04] opacity-60'
                      }`}
                    >
                      <div
                        className="p-2 rounded-xl shrink-0 mt-0.5 border border-black/5 dark:border-white/10"
                        style={{ backgroundColor: `${res.accent}20` }}
                      >
                        <Icon className="w-4 h-4" style={{ color: res.accent }} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[var(--theme-text)]">{res.name}</span>
                          <div
                            className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                              isEnabled
                                ? 'bg-[var(--theme-accent)] border-[var(--theme-accent)] text-neutral-950'
                                : 'border-[var(--theme-border)] bg-transparent'
                            }`}
                          >
                            {isEnabled && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>
                        <span className="text-[10px] text-[var(--theme-accent-light)] font-mono block mt-0.5">
                          {res.scope}
                        </span>
                        <p className="text-[11px] text-[var(--theme-text-muted)] mt-1 line-clamp-2 leading-relaxed">
                          {res.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: SCHEDULE RHYTHM & THEMES (LIGHT & DARK) */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--theme-accent-light)] block font-semibold mb-1">
                  Step 4 • Daily Rhythm &amp; Aesthetics
                </span>
                <h2 className="text-xl sm:text-2xl font-editorial font-bold text-[var(--theme-text)] tracking-tight">
                  Configure your rhythm &amp; aesthetic palette
                </h2>
                <p className="text-xs sm:text-sm text-[var(--theme-text-muted)] mt-1">
                  Select your schedule limits and choose between warm light or dark editorial themes.
                </p>
              </div>

              {/* Working Hours & Focus Rhythm */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 p-4 rounded-2xl bg-black/5 dark:bg-black/30 border border-[var(--theme-border)]">
                <div>
                  <label className="block text-[11px] font-semibold text-[var(--theme-text)] mb-1.5 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[var(--theme-accent-light)]" />
                    <span>Day Start</span>
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={12}
                    value={dayStart}
                    onChange={(e) => setDayStart(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-black/5 dark:bg-black/50 border border-[var(--theme-border)] rounded-xl text-[var(--theme-text)] font-mono"
                  />
                  <span className="text-[10px] text-[var(--theme-text-muted)] mt-1 block font-mono">
                    {dayStart}:00 hours
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[var(--theme-text)] mb-1.5 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[var(--theme-accent-light)]" />
                    <span>Day End</span>
                  </label>
                  <input
                    type="number"
                    min={14}
                    max={23}
                    value={dayEnd}
                    onChange={(e) => setDayEnd(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-black/5 dark:bg-black/50 border border-[var(--theme-border)] rounded-xl text-[var(--theme-text)] font-mono"
                  />
                  <span className="text-[10px] text-[var(--theme-text-muted)] mt-1 block font-mono">
                    {dayEnd}:00 hours
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[var(--theme-text)] mb-1.5 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[var(--theme-accent-light)]" />
                    <span>Focus Session</span>
                  </label>
                  <select
                    value={sessionLen}
                    onChange={(e) => setSessionLen(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-black/5 dark:bg-black/50 border border-[var(--theme-border)] rounded-xl text-[var(--theme-text)] font-medium"
                  >
                    <option value={30}>30 mins (Quick sprint)</option>
                    <option value={45}>45 mins (Recommended)</option>
                    <option value={60}>60 mins (Standard block)</option>
                    <option value={90}>90 mins (Ultradian deep dive)</option>
                  </select>
                  <span className="text-[10px] text-[var(--theme-text-muted)] mt-1 block">
                    Ideal cognitive block
                  </span>
                </div>
              </div>

              {/* Theme Palette Selection (Dark and Light Themes) */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--theme-text)]">
                      Aesthetic Theme Palettes
                    </label>
                    <span className="text-[10px] text-[var(--theme-text-muted)]">
                      Includes 5 Light Themes and 5 Dark Themes
                    </span>
                  </div>

                  {/* Dark / Light / All Filter Pills */}
                  <div className="flex items-center gap-1 bg-black/5 dark:bg-black/40 p-1 rounded-xl border border-[var(--theme-border)] self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setThemeModeTab('all')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-colors cursor-pointer ${
                        themeModeTab === 'all'
                          ? 'bg-[var(--theme-accent)] text-neutral-950 font-bold'
                          : 'text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]'
                      }`}
                    >
                      All ({THEME_CONFIGS.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setThemeModeTab('light')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                        themeModeTab === 'light'
                          ? 'bg-[var(--theme-accent)] text-neutral-950 font-bold'
                          : 'text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]'
                      }`}
                    >
                      <Sun className="w-3 h-3" />
                      <span>Light</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setThemeModeTab('dark')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                        themeModeTab === 'dark'
                          ? 'bg-[var(--theme-accent)] text-neutral-950 font-bold'
                          : 'text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]'
                      }`}
                    >
                      <Moon className="w-3 h-3" />
                      <span>Dark</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredThemes.map((t) => {
                    const isSelected = selectedTheme === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          setSelectedTheme(t.id);
                          setTheme(t.id);
                        }}
                        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                          isSelected
                            ? 'border-[var(--theme-accent)] bg-[var(--theme-accent-subtle)] ring-1 ring-[var(--theme-accent)]/50 shadow-md'
                            : 'border-[var(--theme-border)] bg-black/5 dark:bg-white/[0.02] hover:bg-black/10 dark:hover:bg-white/[0.04]'
                        }`}
                      >
                        <div
                          className="w-5 h-5 rounded-full shrink-0 mt-0.5 border border-black/10 dark:border-white/20 shadow-sm"
                          style={{ backgroundColor: t.accent }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[var(--theme-text)] truncate">{t.label}</span>
                            <div className="flex items-center gap-1">
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-black/5 dark:bg-white/10 text-[var(--theme-text-muted)]">
                                {t.isLight ? 'Light' : 'Dark'}
                              </span>
                              {isSelected && (
                                <Check className="w-3.5 h-3.5 text-[var(--theme-accent-light)] shrink-0" />
                              )}
                            </div>
                          </div>
                          <span className="text-[10px] text-[var(--theme-text-muted)] line-clamp-2 mt-1 leading-relaxed">
                            {t.description}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Bottom Actions Bar */}
          <div className="flex items-center justify-between pt-6 border-t border-[var(--theme-border)] mt-6">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-[var(--theme-accent)] text-neutral-950 hover:opacity-90 shadow-lg transition-all cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                className="flex items-center gap-2 px-7 py-3 rounded-xl text-xs font-bold bg-[var(--theme-accent)] text-neutral-950 hover:opacity-90 shadow-xl transition-all cursor-pointer"
              >
                <span>Launch Chronos Platform</span>
                <Sparkles className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Footer by-line verbatim */}
        <div className="text-center text-xs text-[var(--theme-text-muted)] font-mono py-2">
          {byline}
        </div>
      </div>
    </div>
  );
};

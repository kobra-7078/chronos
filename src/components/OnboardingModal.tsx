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
  Lock,
  ShieldCheck,
  Briefcase,
  Layers,
  BookOpen,
  User,
  Clock,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ChronosLogo } from './ChronosLogo';
import { THEME_CONFIGS } from '../data/mockData';
import { RoleType, ThemeType } from '../types';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const {
    profile,
    completeOnboarding,
    runOptimization,
    currentUser,
    loginWithGoogle,
    isAuthenticating,
    updateAvailability,
  } = useApp();

  const [step, setStep] = useState<number>(1);

  // Form states
  const [userName, setUserName] = useState(currentUser?.displayName || profile.name || '');
  const [selectedRole, setSelectedRole] = useState<RoleType>(profile.role || 'professional');
  const [focusArea, setFocusArea] = useState(profile.focusArea || '');
  const [selectedTheme, setSelectedTheme] = useState<ThemeType>(profile.theme || 'warm-amber');

  // Working availability
  const [dayStart, setDayStart] = useState<number>(profile.availability.dayStartHour || 9);
  const [dayEnd, setDayEnd] = useState<number>(profile.availability.dayEndHour || 18);
  const [sessionLen, setSessionLen] = useState<number>(profile.availability.preferredSessionMinutes || 45);

  if (!isOpen) return null;

  const roleOptions: { id: RoleType; label: string; desc: string; icon: any }[] = [
    {
      id: 'professional',
      label: 'Professional & Engineer',
      desc: 'Deep work sprints, milestone delivery, and focused tasks',
      icon: Briefcase,
    },
    {
      id: 'student',
      label: 'Student & Academic',
      desc: 'Coursework deadlines, exam preparation, and study schedules',
      icon: GraduationCap,
    },
    {
      id: 'researcher',
      label: 'Researcher & Scholar',
      desc: 'Manuscript writing, literature reviews, and research blocks',
      icon: BookOpen,
    },
    {
      id: 'creator',
      label: 'Creator & Designer',
      desc: 'Studio focus time, presentations, and creative deliverables',
      icon: Layers,
    },
    {
      id: 'custom',
      label: 'Interdisciplinary',
      desc: 'Flexible hybrid workflows blending multiple disciplines',
      icon: Sparkles,
    },
  ];

  const permissionsList = [
    {
      name: 'Google Calendar',
      scope: 'calendar.readonly',
      desc: 'Read busy times to prevent overlaps and carve out protected focus blocks.',
      icon: Calendar,
      color: 'text-emerald-400',
    },
    {
      name: 'Google Tasks',
      scope: 'tasks',
      desc: 'Synchronize active action items and to-do lists directly into your priority backlog.',
      icon: CheckSquare,
      color: 'text-blue-400',
    },
    {
      name: 'Google Classroom',
      scope: 'classroom.courses & coursework',
      desc: 'Import enrolled courses, assignment deadlines, and syllabus milestones.',
      icon: GraduationCap,
      color: 'text-amber-400',
    },
    {
      name: 'Google Drive',
      scope: 'drive.readonly',
      desc: 'Link authorized files and reference documents directly to scheduled work.',
      icon: HardDrive,
      color: 'text-cyan-400',
    },
    {
      name: 'Gmail',
      scope: 'gmail.readonly',
      desc: 'Extract action items and time-sensitive requests from conversation threads.',
      icon: Mail,
      color: 'text-rose-400',
    },
  ];

  const handleFinish = () => {
    updateAvailability({
      dayStartHour: dayStart,
      dayEndHour: dayEnd,
      preferredSessionMinutes: sessionLen,
    });

    completeOnboarding(
      userName.trim() || currentUser?.displayName || 'User',
      selectedRole,
      selectedTheme,
      focusArea
    );

    onClose();
    setTimeout(() => {
      runOptimization();
    }, 200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl glass-card rounded-3xl p-6 sm:p-8 shadow-2xl border border-[var(--theme-border)] text-[var(--theme-text)] my-6">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-5 border-b border-[var(--theme-border)]">
          <div className="flex items-center gap-3">
            <ChronosLogo size={40} />
            <div>
              <h2 className="text-xl font-editorial font-bold text-white tracking-tight">
                Chronos Calibration
              </h2>
              <span className="text-xs text-[var(--theme-text-muted)]">
                Streamlined Setup • Segment {step} of 3
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  s === step
                    ? 'w-7 bg-[var(--theme-accent)]'
                    : s < step
                    ? 'bg-[var(--theme-accent-light)] opacity-60'
                    : 'bg-white/10'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="py-6 min-h-[360px]">
          {/* SEGMENT 1: Name, Role & Focus */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-editorial font-semibold text-white">
                  What should Chronos call you?
                </h3>
                <p className="text-xs text-[var(--theme-text-muted)] mt-0.5">
                  Let's personalize your workspace and intelligence operating system.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--theme-text-muted)] mb-1">
                  Your Name or Moniker
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-3 text-[var(--theme-text-muted)]" />
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="e.g. Jordan, Dev, Maya"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-black/30 border border-white/10 rounded-2xl focus:outline-none focus:border-[var(--theme-accent)] text-white"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="block text-xs font-medium text-[var(--theme-text-muted)] mb-1.5">
                  Choose your primary role
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[170px] overflow-y-auto pr-1">
                  {roleOptions.map((r) => {
                    const isSelected = selectedRole === r.id;
                    const Icon = r.icon;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setSelectedRole(r.id)}
                        className={`flex items-start gap-3 p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[var(--theme-accent)] bg-[var(--theme-accent-subtle)]'
                            : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.04]'
                        }`}
                      >
                        <div
                          className={`p-1.5 rounded-xl border shrink-0 ${
                            isSelected
                              ? 'bg-[var(--theme-accent)] text-neutral-950 border-[var(--theme-accent)]'
                              : 'bg-white/5 border-white/10 text-[var(--theme-text-muted)]'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-white">{r.label}</div>
                          <div className="text-[10px] text-[var(--theme-text-muted)] line-clamp-1 mt-0.5">
                            {r.desc}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--theme-text-muted)] mb-1">
                  Primary Field or Objective (Optional)
                </label>
                <input
                  type="text"
                  value={focusArea}
                  onChange={(e) => setFocusArea(e.target.value)}
                  placeholder="e.g. Computer Science, Molecular Biology, Corporate Finance"
                  className="w-full px-3.5 py-2 text-xs bg-black/30 border border-white/10 rounded-xl focus:outline-none focus:border-[var(--theme-accent)] text-white"
                />
              </div>
            </div>
          )}

          {/* SEGMENT 2: Google Workspace Permissions & Sign-In */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-editorial font-semibold text-white">
                  Permissions &amp; Google Workspace Sync
                </h3>
                <p className="text-xs text-[var(--theme-text-muted)] mt-0.5">
                  Chronos integrates with your authorized Google accounts to synchronize your actual resources.
                </p>
              </div>

              {/* Google Sign-In Card */}
              <div className="p-4 rounded-2xl border border-[var(--theme-accent)]/40 bg-[var(--theme-accent-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.4l3.7 2.9C6.5 7.4 9 5 12 5z" />
                      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
                      <path fill="#FBBC05" d="M5.6 14.7c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.2C.7 9.6 0 10.7 0 12s.7 2.4 1.9 4.8l3.7-2.1z" />
                      <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2-6.4-4.8L1.9 16.4C3.7 20.3 7.5 23 12 23z" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">
                      {currentUser ? 'Google Account Connected' : 'Connect Your Google Account'}
                    </span>
                    <span className="text-[11px] text-[var(--theme-text-muted)] block font-mono">
                      {currentUser ? (currentUser.email || currentUser.displayName) : 'Enables Calendar, Tasks, Classroom & Drive'}
                    </span>
                  </div>
                </div>

                {currentUser ? (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-800/40">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Authorized</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={async () => {
                      await loginWithGoogle();
                    }}
                    disabled={isAuthenticating}
                    className="px-4 py-2 rounded-xl bg-[var(--theme-accent)] hover:opacity-90 text-neutral-950 font-bold text-xs shadow-md transition-opacity cursor-pointer whitespace-nowrap disabled:opacity-50"
                  >
                    {isAuthenticating ? 'Authorizing...' : 'Authorize Google Account'}
                  </button>
                )}
              </div>

              {/* Permissions List */}
              <div className="space-y-2 pt-1">
                <span className="text-[10px] font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider block">
                  Permissions Requested:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[160px] overflow-y-auto pr-1">
                  {permissionsList.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-start gap-2.5 text-xs"
                      >
                        <div className="p-1 rounded-lg bg-black/30 border border-white/5 mt-0.5">
                          <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                        </div>
                        <div>
                          <span className="font-semibold text-white block text-[11px]">
                            {item.name}
                          </span>
                          <span className="text-[10px] text-[var(--theme-text-muted)] line-clamp-1">
                            {item.desc}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* SEGMENT 3: Rhythm & Warm Palette */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-editorial font-semibold text-white">
                  Schedule rhythm &amp; aesthetic palette
                </h3>
                <p className="text-xs text-[var(--theme-text-muted)] mt-0.5">
                  Set your daily focus bounds and choose a refined warm color theme.
                </p>
              </div>

              {/* Rhythm constraints */}
              <div className="grid grid-cols-3 gap-3 p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 text-xs">
                <div>
                  <label className="block text-[11px] text-[var(--theme-text-muted)] mb-1">
                    Day Start
                  </label>
                  <input
                    type="number"
                    min={6}
                    max={12}
                    value={dayStart}
                    onChange={(e) => setDayStart(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs bg-black/40 border border-white/10 rounded-xl text-white font-mono"
                  />
                  <span className="text-[10px] text-[var(--theme-text-muted)]">{dayStart}:00</span>
                </div>

                <div>
                  <label className="block text-[11px] text-[var(--theme-text-muted)] mb-1">
                    Day End
                  </label>
                  <input
                    type="number"
                    min={15}
                    max={23}
                    value={dayEnd}
                    onChange={(e) => setDayEnd(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs bg-black/40 border border-white/10 rounded-xl text-white font-mono"
                  />
                  <span className="text-[10px] text-[var(--theme-text-muted)]">{dayEnd}:00</span>
                </div>

                <div>
                  <label className="block text-[11px] text-[var(--theme-text-muted)] mb-1">
                    Focus Chunk
                  </label>
                  <select
                    value={sessionLen}
                    onChange={(e) => setSessionLen(Number(e.target.value))}
                    className="w-full px-2 py-1.5 text-xs bg-black/40 border border-white/10 rounded-xl text-white"
                  >
                    <option value={30}>30 mins</option>
                    <option value={45}>45 mins (Recommended)</option>
                    <option value={50}>50 mins</option>
                    <option value={90}>90 mins</option>
                  </select>
                </div>
              </div>

              {/* Warm theme choices */}
              <div>
                <label className="block text-[11px] font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider mb-2">
                  Select Warm Palette
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {THEME_CONFIGS.map((t) => {
                    const isSelected = selectedTheme === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          setSelectedTheme(t.id);
                          document.documentElement.setAttribute('data-theme', t.id);
                        }}
                        className={`flex items-start gap-2.5 p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[var(--theme-accent)] bg-[var(--theme-accent-subtle)]'
                            : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.04]'
                        }`}
                      >
                        <div
                          className="w-4 h-4 rounded-full shrink-0 mt-0.5 border border-white/20"
                          style={{ backgroundColor: t.accent }}
                        />
                        <div className="flex-1">
                          <div className="text-xs font-semibold text-white flex items-center justify-between">
                            <span>{t.label}</span>
                            {isSelected && <Check className="w-3 h-3 text-[var(--theme-accent-light)]" />}
                          </div>
                          <span className="text-[10px] text-[var(--theme-text-muted)] line-clamp-1 block">
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
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-[var(--theme-border)]">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[var(--theme-text-muted)] hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-[var(--theme-accent)] text-neutral-950 hover:opacity-90 transition-opacity cursor-pointer"
            >
              Continue <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-[var(--theme-accent)] text-neutral-950 hover:opacity-90 shadow-lg transition-all cursor-pointer"
            >
              Launch Workspace <Sparkles className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

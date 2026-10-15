import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  Clock,
  CheckCircle2,
  Calendar,
  ArrowRight,
  Plus,
  Play,
  Pause,
  RotateCcw,
  Layers,
  Check,
  Compass,
  Database,
  ExternalLink,
  HardDrive,
  Download,
  FileText,
  AlertCircle,
  TrendingUp,
  Brain,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ScheduledSession, Task } from '../../types';

interface CommandCenterViewProps {
  onNavigateTab: (tab: string) => void;
  onOpenNewTask: () => void;
}

export const CommandCenterView: React.FC<CommandCenterViewProps> = ({
  onNavigateTab,
  onOpenNewTask,
}) => {
  const {
    profile,
    tasks,
    sessions,
    integrations,
    toggleTaskComplete,
    updateSessionStatus,
    runOptimization,
    generateAIScheduleAndExportDocx,
    isSolvingSchedule,
    currentUser,
    googleToken,
  } = useApp();

  const [activeSessionTimer, setActiveSessionTimer] = useState<number>(45 * 60);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  const [exportNotice, setExportNotice] = useState<{ type: 'success' | 'error'; text: string; link?: string } | null>(null);
  const [isExportingDocx, setIsExportingDocx] = useState<boolean>(false);

  // Focus timer countdown
  useEffect(() => {
    let interval: any;
    if (timerRunning && activeSessionTimer > 0) {
      interval = setInterval(() => {
        setActiveSessionTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning, activeSessionTimer]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Find active or upcoming session
  const nextSession = sessions.find((s) => s.status !== 'completed');

  // Deduplicate pending tasks with Set to guarantee zero key collisions
  const pendingTasks = useMemo(() => {
    const seen = new Set<string>();
    return tasks.filter((t) => {
      if (t.status === 'completed' || seen.has(t.id)) return false;
      seen.add(t.id);
      return true;
    });
  }, [tasks]);

  const completedTodayCount = useMemo(() => {
    return tasks.filter((t) => t.status === 'completed').length;
  }, [tasks]);

  const connectedIntegrations = useMemo(() => {
    return integrations.filter((i) => i.status === 'connected');
  }, [integrations]);

  // Today's total scheduled minutes
  const totalScheduledMinutes = useMemo(() => {
    return sessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
  }, [sessions]);

  // Handle AI schedule & DOCX export
  const handleAiScheduleAndExport = async (dest: 'drive' | 'download' | 'both') => {
    setIsExportingDocx(true);
    setExportNotice(null);
    try {
      const res = await generateAIScheduleAndExportDocx(dest);
      if (res.success) {
        setExportNotice({
          type: 'success',
          text: res.message || 'Schedule generated and DOCX exported successfully!',
          link: res.webViewLink,
        });
      } else {
        setExportNotice({
          type: 'error',
          text: res.error || 'Failed to complete export.',
        });
      }
    } catch (e: any) {
      setExportNotice({
        type: 'error',
        text: e.message || 'An error occurred during AI schedule generation.',
      });
    } finally {
      setIsExportingDocx(false);
    }
  };

  const todayDateString = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="space-y-6">
      {/* Executive Hero Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-[var(--theme-border)] relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--theme-accent)] animate-pulse" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--theme-text-muted)] font-mono">
                {profile.role.toUpperCase()} EXECUTIVE DASHBOARD • {todayDateString}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-editorial font-bold text-[var(--theme-text)] tracking-tight">
              {profile.name ? `Welcome back, ${profile.name}` : 'Welcome to Chronos'}
            </h1>
            <p className="text-xs sm:text-sm text-[var(--theme-text-muted)] mt-1.5 max-w-xl leading-relaxed">
              Your day is intelligently balanced with protected focus sprints, structured recovery intervals, and unified Google Workspace data.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onOpenNewTask}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--theme-accent)] text-neutral-950 font-bold text-xs shadow-md hover:opacity-90 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Create Plan</span>
            </button>

            <button
              onClick={runOptimization}
              disabled={isSolvingSchedule}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--theme-border)] bg-black/5 dark:bg-black/20 hover:bg-black/10 dark:hover:bg-black/40 text-[var(--theme-text)] font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <TrendingUp className={`w-3.5 h-3.5 text-[var(--theme-accent-light)] ${isSolvingSchedule ? 'animate-spin' : ''}`} />
              <span>Re-optimize Agenda</span>
            </button>
          </div>
        </div>
      </div>

      {/* AI Model Scheduling & DOCX Drive Export Card */}
      <div className="glass-card rounded-3xl p-6 border border-[var(--theme-accent)]/30 bg-[var(--theme-accent-subtle)] relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-[var(--theme-accent)] text-neutral-950">
                <Brain className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-[var(--theme-text)]">
                AI Cognitive Schedule &amp; Google Drive DOCX Export
              </h2>
            </div>
            <p className="text-xs text-[var(--theme-text-muted)] leading-relaxed">
              Let the AI model evaluate your pending tasks, cognitive fatigue curve, and energy peaks to generate an optimal time-blocked plan, then export it directly as a <span className="font-semibold text-[var(--theme-text)]">Microsoft Word (.docx)</span> file to your Google Drive.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => handleAiScheduleAndExport('both')}
              disabled={isExportingDocx || isSolvingSchedule}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--theme-accent)] text-neutral-950 font-bold text-xs shadow-md hover:opacity-90 transition-all cursor-pointer disabled:opacity-50"
              title="Generate schedule & add as DOCX to Google Drive and device"
            >
              <HardDrive className={`w-3.5 h-3.5 ${isExportingDocx ? 'animate-bounce' : ''}`} />
              <span>{isExportingDocx ? 'Generating & Exporting...' : 'Export DOCX to Drive'}</span>
            </button>

            <button
              onClick={() => handleAiScheduleAndExport('download')}
              disabled={isExportingDocx || isSolvingSchedule}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-[var(--theme-border)] bg-black/5 dark:bg-black/20 hover:bg-black/10 dark:hover:bg-black/40 text-xs font-semibold text-[var(--theme-text)] transition-colors cursor-pointer disabled:opacity-50"
              title="Download DOCX locally"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download DOCX</span>
            </button>
          </div>
        </div>

        {/* Export Notification / Success Banner */}
        {exportNotice && (
          <div
            className={`mt-4 p-3.5 rounded-2xl border text-xs flex items-center justify-between gap-3 ${
              exportNotice.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {exportNotice.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{exportNotice.text}</span>
            </div>

            {exportNotice.link && (
              <a
                href={exportNotice.link}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1 rounded-xl bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-700 transition-colors flex items-center gap-1 shrink-0"
              >
                <span>Open in Drive</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        )}
      </div>

      {/* Focus Timer & Next Session Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Focus Session Widget */}
        <div className="lg:col-span-2 glass-card rounded-3xl p-6 sm:p-7 border border-[var(--theme-border)] flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--theme-text-muted)] font-semibold">
                  Protected Focus Interval
                </span>
              </div>
              {nextSession && (
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[var(--theme-accent-subtle)] text-[var(--theme-accent-light)] border border-[var(--theme-accent)]/30 font-semibold uppercase">
                  {nextSession.sessionType.replace('_', ' ')}
                </span>
              )}
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-editorial font-bold text-[var(--theme-text)]">
                {nextSession ? nextSession.title : 'All scheduled sessions completed!'}
              </h3>
              <p className="text-xs text-[var(--theme-text-muted)] mt-1 line-clamp-2">
                {nextSession?.notes || 'No urgent focus sessions left. Review tasks or take a recovery break.'}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[var(--theme-border)] mt-6">
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-3xl sm:text-4xl font-bold text-[var(--theme-text)] tracking-tight">
                {formatTimer(activeSessionTimer)}
              </span>
              <span className="text-xs text-[var(--theme-text-muted)] font-mono">remaining</span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setTimerRunning(!timerRunning)}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer ${
                  timerRunning
                    ? 'bg-amber-500 text-neutral-950 hover:bg-amber-400'
                    : 'bg-[var(--theme-accent)] text-neutral-950 hover:opacity-90'
                }`}
              >
                {timerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                <span>{timerRunning ? 'Pause Interval' : 'Begin Focus'}</span>
              </button>

              <button
                onClick={() => {
                  setTimerRunning(false);
                  setActiveSessionTimer(45 * 60);
                }}
                className="p-2.5 rounded-xl border border-[var(--theme-border)] bg-black/5 dark:bg-black/20 hover:bg-black/10 dark:hover:bg-black/40 text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] transition-colors cursor-pointer"
                title="Reset timer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {nextSession && (
                <button
                  onClick={() => updateSessionStatus(nextSession.id, 'completed')}
                  className="px-4 py-2.5 rounded-xl border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                  title="Mark session as completed"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Complete</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats & Cognitive Balance */}
        <div className="glass-card rounded-3xl p-6 border border-[var(--theme-border)] flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--theme-text-muted)] font-semibold">
                Daily Capacity Metrics
              </span>
              <Compass className="w-4 h-4 text-[var(--theme-accent-light)]" />
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-black/5 dark:bg-black/20 border border-[var(--theme-border)] flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-[var(--theme-text-muted)] block">Focus Allocated</span>
                  <span className="text-lg font-bold text-[var(--theme-text)] font-mono">
                    {Math.round(totalScheduledMinutes / 60 * 10) / 10} hrs
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-[var(--theme-text-muted)] block">Sessions</span>
                  <span className="text-lg font-bold text-[var(--theme-accent-light)] font-mono">
                    {sessions.length}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-black/5 dark:bg-black/20 border border-[var(--theme-border)] flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-[var(--theme-text-muted)] block">Completed Tasks</span>
                  <span className="text-lg font-bold text-emerald-500 font-mono">
                    {completedTodayCount}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-[var(--theme-text-muted)] block">Pending Queue</span>
                  <span className="text-lg font-bold text-[var(--theme-text)] font-mono">
                    {pendingTasks.length}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-black/5 dark:bg-black/20 border border-[var(--theme-border)] flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-[var(--theme-text-muted)] block">Workspace Sync</span>
                  <span className="text-xs font-semibold text-[var(--theme-text)]">
                    {connectedIntegrations.length} Active Services
                  </span>
                </div>
                <button
                  onClick={() => onNavigateTab('integrations')}
                  className="text-xs text-[var(--theme-accent-light)] hover:underline flex items-center gap-1 font-medium"
                >
                  <span>Manage</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('schedule')}
            className="w-full py-2.5 rounded-xl border border-[var(--theme-border)] text-xs font-semibold text-[var(--theme-text)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>View Full Interactive Schedule</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Two-Column Layout: Priority Queue & Today's Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Deliverables Queue */}
        <div className="glass-card rounded-3xl p-6 sm:p-7 border border-[var(--theme-border)]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-editorial font-bold text-[var(--theme-text)]">
                Priority Action Queue
              </h3>
              <p className="text-xs text-[var(--theme-text-muted)] mt-0.5">
                Tasks organized by urgency &amp; remaining cognitive estimate
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('plan')}
              className="text-xs text-[var(--theme-accent-light)] hover:underline flex items-center gap-1 font-medium"
            >
              <span>All Plans ({tasks.length})</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {pendingTasks.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-[var(--theme-border)] rounded-2xl">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                <p className="text-xs font-semibold text-[var(--theme-text)]">No pending tasks!</p>
                <p className="text-[11px] text-[var(--theme-text-muted)] mt-0.5">
                  Your agenda is clear or all active tasks have been completed.
                </p>
              </div>
            ) : (
              pendingTasks.slice(0, 6).map((task) => (
                <div
                  key={task.id}
                  className="p-3.5 rounded-2xl border border-[var(--theme-border)] bg-black/5 dark:bg-black/20 hover:border-[var(--theme-accent)]/50 transition-all flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() => toggleTaskComplete(task.id)}
                      className="w-5 h-5 rounded-lg border border-[var(--theme-border)] hover:border-[var(--theme-accent)] flex items-center justify-center text-[var(--theme-text-muted)] hover:text-emerald-500 transition-colors cursor-pointer shrink-0"
                      title="Mark as completed"
                    >
                      <Check className="w-3 h-3 opacity-0 hover:opacity-100" />
                    </button>
                    <div className="min-w-0">
                      <span className="text-xs font-semibold text-[var(--theme-text)] block truncate">
                        {task.title}
                      </span>
                      <div className="flex items-center gap-2 text-[10px] text-[var(--theme-text-muted)] mt-0.5 font-mono">
                        <span>{task.estimatedMinutes}m estimate</span>
                        {task.sourceIntegration && (
                          <>
                            <span>•</span>
                            <span className="capitalize">{task.sourceIntegration.replace('google_', '')}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[9px] font-mono px-2 py-0.5 rounded-full uppercase font-bold shrink-0 ${
                      task.priority === 'critical'
                        ? 'bg-rose-500/15 text-rose-500 border border-rose-500/30'
                        : task.priority === 'high'
                        ? 'bg-amber-500/15 text-amber-500 border border-amber-500/30'
                        : 'bg-black/5 dark:bg-white/10 text-[var(--theme-text-muted)]'
                    }`}
                  >
                    {task.priority}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Today's Scheduled Blocks Flow */}
        <div className="glass-card rounded-3xl p-6 sm:p-7 border border-[var(--theme-border)]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-editorial font-bold text-[var(--theme-text)]">
                Today&apos;s Protected Flow
              </h3>
              <p className="text-xs text-[var(--theme-text-muted)] mt-0.5">
                Calculated cognitive intervals and fixed commitments
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('schedule')}
              className="text-xs text-[var(--theme-accent-light)] hover:underline flex items-center gap-1 font-medium"
            >
              <span>Full Schedule</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {sessions.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-[var(--theme-border)] rounded-2xl">
                <Calendar className="w-8 h-8 text-[var(--theme-accent-light)] mx-auto mb-2 opacity-80" />
                <p className="text-xs font-semibold text-[var(--theme-text)]">No sessions scheduled</p>
                <p className="text-[11px] text-[var(--theme-text-muted)] mt-0.5">
                  Run AI schedule optimization to time-block your day.
                </p>
              </div>
            ) : (
              sessions.slice(0, 6).map((session) => {
                const isCompleted = session.status === 'completed';
                const startTimeStr = session.startTime
                  ? new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : '--:--';

                return (
                  <div
                    key={session.id}
                    className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      isCompleted
                        ? 'border-[var(--theme-border)] bg-black/5 dark:bg-white/[0.02] opacity-60'
                        : 'border-[var(--theme-border)] bg-black/5 dark:bg-black/20 hover:border-[var(--theme-accent)]/40'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-14 text-center shrink-0">
                        <span className="font-mono text-xs font-bold text-[var(--theme-text)] block">
                          {startTimeStr}
                        </span>
                        <span className="text-[10px] text-[var(--theme-text-muted)] font-mono block">
                          {session.durationMinutes}m
                        </span>
                      </div>

                      <div className="w-0.5 h-7 bg-[var(--theme-border)] shrink-0" />

                      <div className="min-w-0">
                        <span
                          className={`text-xs font-semibold block truncate ${
                            isCompleted ? 'line-through text-[var(--theme-text-muted)]' : 'text-[var(--theme-text)]'
                          }`}
                        >
                          {session.title}
                        </span>
                        <span className="text-[10px] text-[var(--theme-accent-light)] uppercase font-mono block mt-0.5">
                          {session.sessionType.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        updateSessionStatus(session.id, isCompleted ? 'scheduled' : 'completed')
                      }
                      className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                        isCompleted
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-[var(--theme-border)] hover:border-emerald-500 text-transparent'
                      }`}
                      title={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  RefreshCw,
  Download,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  MapPin,
  PlaySquare,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ScheduledSession } from '../../types';

export const ScheduleView: React.FC = () => {
  const {
    sessions,
    engineResult,
    runOptimization,
    isSolvingSchedule,
    updateSessionStatus,
    importIntegrationSample,
    generateAIScheduleAndExportDocx,
  } = useApp();

  const [dayOffset, setDayOffset] = useState<number>(0);

  const hours = Array.from({ length: 14 }, (_, i) => i + 8); // 08:00 to 21:00

  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + dayOffset);
  const targetDateStr = targetDate.toISOString().split('T')[0];

  const daySessions = React.useMemo(() => {
    const seen = new Set<string>();
    return sessions.filter((s) => {
      if (!s.id || seen.has(s.id)) return false;
      seen.add(s.id);
      return s.startTime.split('T')[0] === targetDateStr;
    });
  }, [sessions, targetDateStr]);

  const exportICS = () => {
    let icsContent = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Chronos//Universal Planning//EN\n`;
    sessions.forEach((s) => {
      const dtStart = s.startTime.replace(/[-:]/g, '').split('.')[0] + 'Z';
      const dtEnd = s.endTime.replace(/[-:]/g, '').split('.')[0] + 'Z';
      icsContent += `BEGIN:VEVENT\nSUMMARY:${s.title}\nDESCRIPTION:${s.notes || 'Chronos focus session'}\nDTSTART:${dtStart}\nDTEND:${dtEnd}\nSTATUS:CONFIRMED\nEND:VEVENT\n`;
    });
    icsContent += `END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chronos-schedule-${targetDateStr}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="glass-card p-4 rounded-3xl border border-[var(--theme-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center bg-black/20 p-1 rounded-2xl border border-[var(--theme-border)]">
            <button
              onClick={() => setDayOffset((d) => d - 1)}
              className="p-1 rounded-xl text-[var(--theme-text-muted)] hover:text-white"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-editorial font-bold text-white">
              {targetDate.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
            <button
              onClick={() => setDayOffset((d) => d + 1)}
              className="p-1 rounded-xl text-[var(--theme-text-muted)] hover:text-white"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setDayOffset(0)}
            className="px-3 py-1.5 text-xs rounded-xl border border-[var(--theme-border)] bg-black/20 text-[var(--theme-text)] hover:bg-black/30"
          >
            Today
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={async () => {
              const res = await generateAIScheduleAndExportDocx('both');
              if (res.webViewLink) {
                alert(`Exported successfully! Opening in Google Drive: ${res.webViewLink}`);
                window.open(res.webViewLink, '_blank');
              } else if (res.message) {
                alert(res.message);
              }
            }}
            disabled={isSolvingSchedule}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--theme-accent)]/40 bg-[var(--theme-accent-subtle)] hover:bg-[var(--theme-accent)]/20 text-xs font-semibold text-[var(--theme-accent-light)] transition-colors cursor-pointer disabled:opacity-50"
            title="Generate AI schedule and add as DOCX to your Google Drive"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Add DOCX to Drive</span>
          </button>

          <button
            onClick={exportICS}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--theme-border)] bg-black/5 dark:bg-black/20 hover:bg-black/10 dark:hover:bg-black/40 text-xs text-[var(--theme-text)] cursor-pointer"
            title="Export to iCalendar / Google Calendar"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export .ics</span>
          </button>

          <button
            onClick={runOptimization}
            disabled={isSolvingSchedule}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[var(--theme-accent)] text-neutral-950 font-bold text-xs shadow-md hover:opacity-90 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSolvingSchedule ? 'animate-spin' : ''}`} />
            <span>Recalculate Schedule</span>
          </button>
        </div>
      </div>

      {/* Conflicts warning */}
      {engineResult && engineResult.conflicts.length > 0 && (
        <div className="p-4 rounded-3xl glass-card border border-amber-800/40 bg-amber-950/20 text-xs space-y-1 text-amber-200">
          <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Workload Conflict Detected
          </div>
          <p className="text-[var(--theme-text-muted)]">{engineResult.conflicts[0].reason}</p>
          <div className="text-[var(--theme-accent-light)] font-mono text-[11px] pt-1">
            Recommendation: {engineResult.conflicts[0].proposedResolution}
          </div>
        </div>
      )}

      {/* Schedule Timegrid */}
      <div className="glass-card rounded-3xl p-6 border border-[var(--theme-border)]">
        <div className="flex items-center justify-between pb-4 border-b border-[var(--theme-border)]">
          <h3 className="text-sm font-editorial font-bold text-white flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-[var(--theme-accent)]" />
            Timeline &amp; Focus Blocks
          </h3>
          <div className="flex items-center gap-3 text-[11px] text-[var(--theme-text-muted)]">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[var(--theme-accent)]" /> Focus Session
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400" /> Fixed Commitment
            </span>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {hours.map((hour) => {
            const currentSessions = daySessions.filter((s) => {
              const h = new Date(s.startTime).getHours();
              return h === hour;
            });

            return (
              <div key={hour} className="flex items-start gap-4">
                <div className="w-14 text-right font-mono text-xs text-[var(--theme-text-muted)] pt-1">
                  {hour.toString().padStart(2, '0')}:00
                </div>

                <div className="flex-1 min-h-[50px] border-t border-white/5 pt-1 space-y-2">
                  {currentSessions.map((session) => (
                    <div
                      key={session.id}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        session.isFixed
                          ? 'bg-amber-950/40 border-amber-800/40 text-amber-100'
                          : 'bg-[var(--theme-accent-subtle)] border-[var(--theme-accent)]/30 text-white'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs">{session.title}</span>
                            {session.isFixed && (
                              <span className="px-2 py-0.2 rounded-full bg-black/40 text-amber-300 text-[10px] font-mono border border-amber-800/40">
                                {session.integrationSource === 'maps' ? 'Transit Buffer' : 'Calendar'}
                              </span>
                            )}
                          </div>
                          {session.notes && (
                            <p className="text-[11px] opacity-75 mt-0.5 line-clamp-1">
                              {session.notes}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2.5 font-mono text-[11px]">
                          <span>
                            {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(session.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <button
                            onClick={() => {
                              const nextStatus = session.status === 'completed' ? 'scheduled' : 'completed';
                              updateSessionStatus(session.id, nextStatus);
                            }}
                            className={`p-1 rounded-lg ${
                              session.status === 'completed' ? 'text-emerald-400' : 'text-white/40 hover:text-white'
                            }`}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {daySessions.length === 0 && (
          <div className="mt-8 text-center py-10 space-y-2">
            <p className="text-xs text-[var(--theme-text-muted)]">
              No sessions scheduled for this date.
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => importIntegrationSample('google_calendar')}
                className="px-3 py-1.5 rounded-xl border border-[var(--theme-border)] text-xs text-[var(--theme-text)] hover:bg-white/5"
              >
                Sync Google Calendar
              </button>
              <button
                onClick={() => importIntegrationSample('maps')}
                className="px-3 py-1.5 rounded-xl border border-[var(--theme-border)] text-xs text-[var(--theme-text)] hover:bg-white/5"
              >
                Add Maps Transit Buffer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Chronos Deterministic Scheduling Engine
 * Enforces hard constraints, time windows, and conflict handling.
 */

import {
  Task,
  ScheduledSession,
  UserAvailability,
  EngineOptimizationResult,
  SchedulingConflict,
  TaskPriority,
} from '../types';

interface TimeWindow {
  start: Date;
  end: Date;
  isAvailable: boolean;
}

export class ChronosSchedulingEngine {
  public static optimizeSchedule(
    tasks: Task[],
    existingSessions: ScheduledSession[],
    availability: UserAvailability,
    startDate: Date = new Date(),
    daysToPlan: number = 7
  ): EngineOptimizationResult {
    // 1. Fixed commitments
    const fixedCommitments = existingSessions.filter((s) => s.isFixed || s.status === 'completed');
    
    // 2. Filter uncompleted tasks
    const activeTasks = tasks.filter((t) => t.status !== 'completed' && t.remainingMinutes > 0);

    // 3. Priority and deadline sort
    const sortedTasks = this.prioritizeTasks(activeTasks);

    // 4. Generate available windows
    const availableSlots = this.generateAvailableTimeWindows(
      startDate,
      daysToPlan,
      availability,
      fixedCommitments
    );

    const newlyScheduled: ScheduledSession[] = [...fixedCommitments];
    const conflicts: SchedulingConflict[] = [];
    let totalAllocatedMinutes = 0;
    const dailyWorkMinutes = new Map<string, number>();

    for (const task of sortedTasks) {
      let minutesNeeded = task.remainingMinutes;

      for (const slot of availableSlots) {
        if (minutesNeeded <= 0) break;
        if (!slot.isAvailable) continue;

        const dayKey = slot.start.toISOString().split('T')[0];
        const currentDayWork = dailyWorkMinutes.get(dayKey) || 0;
        if (currentDayWork >= availability.dailyMaxWorkMinutes) continue;

        const slotDuration = Math.floor((slot.end.getTime() - slot.start.getTime()) / (1000 * 60));
        if (slotDuration < 15) continue;

        const sessionChunk = Math.min(
          availability.preferredSessionMinutes,
          minutesNeeded,
          slotDuration,
          availability.dailyMaxWorkMinutes - currentDayWork
        );

        if (sessionChunk <= 0) continue;

        const sessionEnd = new Date(slot.start.getTime() + sessionChunk * 60 * 1000);

        const session: ScheduledSession = {
          id: `sess-${task.id}-${Date.now()}-${newlyScheduled.length}-${Math.random().toString(36).substring(2, 6)}`,
          taskId: task.id,
          title: task.title,
          startTime: slot.start.toISOString(),
          endTime: sessionEnd.toISOString(),
          durationMinutes: sessionChunk,
          sessionType: 'deep_work',
          status: 'scheduled',
          isFixed: false,
          notes: task.description || undefined,
        };

        newlyScheduled.push(session);
        minutesNeeded -= sessionChunk;
        totalAllocatedMinutes += sessionChunk;
        dailyWorkMinutes.set(dayKey, currentDayWork + sessionChunk);

        // Advance slot with break buffer
        const nextStart = new Date(sessionEnd.getTime() + availability.preferredBreakMinutes * 60 * 1000);
        if (nextStart.getTime() < slot.end.getTime()) {
          slot.start = nextStart;
        } else {
          slot.isAvailable = false;
        }
      }

      if (minutesNeeded > 0) {
        conflicts.push({
          taskId: task.id,
          taskTitle: task.title,
          dueDate: task.dueDate,
          requiredMinutes: task.remainingMinutes,
          availableMinutesBeforeDue: Math.max(0, task.remainingMinutes - minutesNeeded),
          reason: `Insufficient open focus blocks before deadline. Deficit: ${Math.round(minutesNeeded / 60 * 10) / 10}h.`,
          proposedResolution: 'Consider expanding work hours or extending deadline.',
        });
      }
    }

    const totalRequired = activeTasks.reduce((acc, t) => acc + t.remainingMinutes, 0);
    const scheduledTotal = totalAllocatedMinutes;
    const feasibilityScore = totalRequired === 0 ? 100 : Math.max(0, Math.min(100, Math.round((scheduledTotal / totalRequired) * 100)));

    const recommendations: string[] = [];
    if (feasibilityScore < 80) {
      recommendations.push('Consider delegating low-priority tasks or extending target deadlines.');
    }
    if (conflicts.length > 0) {
      recommendations.push(`${conflicts.length} tasks require additional focus blocks. Adjust your daily rhythm.`);
    }
    if (recommendations.length === 0) {
      recommendations.push('Schedule is well-balanced with optimal focus and buffer allocations.');
    }

    return {
      scheduledSessions: newlyScheduled.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()),
      unscheduledTasks: activeTasks.filter((t) => conflicts.some((c) => c.taskId === t.id)),
      conflicts,
      feasibilityScore,
      totalAllocatedMinutes,
      recommendations,
    };
  }

  private static prioritizeTasks(tasks: Task[]): Task[] {
    const priorityWeight: Record<TaskPriority, number> = {
      critical: 4,
      high: 3,
      medium: 2,
      low: 1,
    };

    return [...tasks].sort((a, b) => {
      const dateA = new Date(a.dueDate).getTime();
      const dateB = new Date(b.dueDate).getTime();
      if (dateA !== dateB) return dateA - dateB;
      return (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
    });
  }

  private static generateAvailableTimeWindows(
    startDate: Date,
    days: number,
    availability: UserAvailability,
    fixedSessions: ScheduledSession[]
  ): TimeWindow[] {
    const windows: TimeWindow[] = [];
    const baseDate = new Date(startDate);
    baseDate.setSeconds(0, 0);

    for (let d = 0; d < days; d++) {
      const currentDay = new Date(baseDate.getTime() + d * 24 * 60 * 60 * 1000);
      const dayOfWeek = currentDay.getDay();

      if (!availability.workDays.includes(dayOfWeek)) continue;

      const dayStart = new Date(currentDay);
      dayStart.setHours(availability.dayStartHour, 0, 0, 0);

      const dayEnd = new Date(currentDay);
      dayEnd.setHours(availability.dayEndHour, 0, 0, 0);

      const effectiveStart = d === 0 && baseDate > dayStart ? baseDate : dayStart;
      if (effectiveStart >= dayEnd) continue;

      const dayFixed = fixedSessions
        .filter((s) => {
          const sStart = new Date(s.startTime);
          const sEnd = new Date(s.endTime);
          return sStart < dayEnd && sEnd > effectiveStart;
        })
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

      let cursor = new Date(effectiveStart);

      for (const fixed of dayFixed) {
        const fixedStart = new Date(fixed.startTime);
        const fixedEnd = new Date(fixed.endTime);

        if (fixedStart > cursor) {
          windows.push({
            start: new Date(cursor),
            end: new Date(fixedStart),
            isAvailable: true,
          });
        }

        if (fixedEnd > cursor) {
          cursor = new Date(fixedEnd);
        }
      }

      if (cursor < dayEnd) {
        windows.push({
          start: new Date(cursor),
          end: new Date(dayEnd),
          isAvailable: true,
        });
      }
    }

    return windows;
  }
}

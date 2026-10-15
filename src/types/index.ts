/**
 * Chronos Universal Type Definitions
 * Role-aware Intelligence, Planning & Scheduling Platform
 * Editorial warm design system with New York and SF Pro typography
 */

export type RoleType =
  | 'student'
  | 'professional'
  | 'researcher'
  | 'educator'
  | 'creator'
  | 'custom';

export type ThemeType =
  | 'warm-amber'
  | 'terracotta'
  | 'warm-sepia'
  | 'warm-sage'
  | 'warm-midnight'
  | 'light-parchment'
  | 'light-sand'
  | 'light-sage'
  | 'light-terracotta'
  | 'light-clean';

export interface ThemeConfig {
  id: ThemeType;
  label: string;
  accent: string;
  bgPreview: string;
  description: string;
  isLight?: boolean;
}

export interface UserAvailability {
  workDays: number[]; // 0 = Sun, 1 = Mon ... 6 = Sat
  dayStartHour: number; // e.g. 9 for 09:00
  dayEndHour: number; // e.g. 18 for 18:00
  preferredSessionMinutes: number; // e.g. 45
  preferredBreakMinutes: number; // e.g. 10
  dailyMaxWorkMinutes: number; // e.g. 480 (8 hours)
  energyPeak: 'morning' | 'afternoon' | 'evening';
}

export interface UserProfile {
  id: string;
  name: string;
  role: RoleType;
  customRoleTitle?: string;
  focusArea?: string;
  theme: ThemeType;
  availability: UserAvailability;
  onboarded: boolean;
  activeIntegrations: string[];
}

export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';
export type TaskStatus = 'todo' | 'in_progress' | 'completed';

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: string; // ISO
  estimatedMinutes: number;
  remainingMinutes: number;
  priority: TaskPriority;
  status: TaskStatus;
  category?: string;
  projectId?: string;
  roleContext?: string;
  dependencies?: string[];
  sourceIntegration?: IntegrationProvider | 'manual';
  sourceUrl?: string;
  completedAt?: string;
  actualMinutesSpent?: number;
  tags?: string[];
}

export interface ScheduledSession {
  id: string;
  taskId?: string;
  projectId?: string;
  title: string;
  startTime: string; // ISO
  endTime: string; // ISO
  durationMinutes: number;
  sessionType: 'deep_work' | 'review' | 'commitment' | 'learning' | 'break';
  status: 'scheduled' | 'in_progress' | 'completed' | 'missed';
  isFixed: boolean;
  notes?: string;
  roleContext?: string;
  integrationSource?: IntegrationProvider;
}

export interface Goal {
  id: string;
  title: string;
  category: 'objective' | 'milestone' | 'course' | 'project';
  targetDate: string;
  progressPercentage: number;
  measurableCriteria: string[];
  linkedTaskIds: string[];
}

export type IntegrationProvider =
  | 'gmail'
  | 'google_classroom'
  | 'google_drive'
  | 'google_tasks'
  | 'google_calendar'
  | 'google_keep'
  | 'youtube'
  | 'slides'
  | 'picker'
  | 'maps';

export interface IntegrationConnection {
  id: string;
  provider: IntegrationProvider;
  name: string;
  category: 'communication' | 'academics' | 'storage' | 'tasks' | 'schedule' | 'notes' | 'media' | 'presentation' | 'navigation';
  status: 'connected' | 'disconnected' | 'syncing';
  lastSyncAt?: string;
  itemCount: number;
  description: string;
  actionLabel: string;
}

export interface SchedulingConflict {
  taskId: string;
  taskTitle: string;
  dueDate: string;
  requiredMinutes: number;
  availableMinutesBeforeDue: number;
  reason: string;
  proposedResolution: string;
}

export interface EngineOptimizationResult {
  scheduledSessions: ScheduledSession[];
  unscheduledTasks: Task[];
  conflicts: SchedulingConflict[];
  feasibilityScore: number;
  totalAllocatedMinutes: number;
  recommendations: string[];
}

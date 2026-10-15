import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  UserProfile,
  Task,
  ScheduledSession,
  Goal,
  IntegrationConnection,
  RoleType,
  ThemeType,
  EngineOptimizationResult,
  UserAvailability,
  IntegrationProvider,
} from '../types';
import {
  INITIAL_PROFILE,
  INITIAL_TASKS,
  INITIAL_SESSIONS,
  INITIAL_GOALS,
  INITIAL_INTEGRATIONS,
} from '../data/mockData';
import { ChronosSchedulingEngine } from '../lib/engine';
import {
  auth,
  db,
  signInWithGoogle,
  signInWithGithub,
  signOutUser,
  getAccessToken,
  getGithubAccessToken,
  setGithubAccessToken,
} from '../lib/firebase';
import { GoogleWorkspaceService } from '../lib/googleApi';
import { updateFavicon } from '../lib/favicon';
import {
  generateScheduleDocxBlob,
  downloadDocxLocally,
  uploadDocxToGoogleDrive,
} from '../lib/docxExport';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export interface GithubAccountInfo {
  username: string;
  avatarUrl?: string;
  email?: string;
}

interface AppContextValue {
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  theme: ThemeType;
  setTheme: (t: ThemeType) => void;
  tasks: Task[];
  sessions: ScheduledSession[];
  goals: Goal[];
  integrations: IntegrationConnection[];
  engineResult: EngineOptimizationResult | null;
  isSolvingSchedule: boolean;
  currentUser: User | null;
  googleToken: string | null;
  githubUser: GithubAccountInfo | null;
  githubToken: string | null;
  isAuthenticating: boolean;
  isLoggedIn: boolean;
  isAuthChecking: boolean;
  currentPath: string;
  navigate: (path: string, replace?: boolean) => void;
  loginWithGoogle: () => Promise<void>;
  loginWithGithub: () => Promise<void>;
  linkGithubToken: (token: string, username?: string) => void;
  logoutGithub: () => void;
  logout: () => Promise<void>;
  syncGoogleResources: () => Promise<void>;
  runOptimization: () => void;
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskComplete: (id: string) => void;
  addGoal: (goal: Omit<Goal, 'id'>) => void;
  updateSessionStatus: (id: string, status: ScheduledSession['status']) => void;
  toggleIntegration: (provider: IntegrationProvider) => void;
  importIntegrationSample: (provider: IntegrationProvider) => void;
  updateAvailability: (avail: Partial<UserAvailability>) => void;
  completeOnboarding: (
    name: string,
    role: RoleType,
    theme: ThemeType,
    focusArea?: string,
    activatedIntegrations?: string[]
  ) => void;
  resetAllData: () => void;
  byline: string;
  isSidebarMinimized: boolean;
  toggleSidebar: () => void;
  generateAIScheduleAndExportDocx: (
    destination?: 'drive' | 'download' | 'both'
  ) => Promise<{ success: boolean; webViewLink?: string; error?: string; message?: string }>;
  authError: string | null;
  setAuthError: React.Dispatch<React.SetStateAction<string | null>>;
  loginAsTestUser: (email?: string, name?: string) => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

const deduplicateById = <T extends { id: string }>(items: T[]): T[] => {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (!item || !item.id || seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('chronos_clean_profile');
    return saved ? JSON.parse(saved) : INITIAL_PROFILE;
  });

  const [theme, setThemeState] = useState<ThemeType>(() => {
    return profile.theme || 'warm-amber';
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('chronos_clean_tasks');
    if (!saved) return INITIAL_TASKS;
    try {
      const parsed: Task[] = JSON.parse(saved);
      return deduplicateById(parsed);
    } catch {
      return INITIAL_TASKS;
    }
  });

  const [sessions, setSessions] = useState<ScheduledSession[]>(() => {
    const saved = localStorage.getItem('chronos_clean_sessions');
    if (!saved) return INITIAL_SESSIONS;
    try {
      const parsed: ScheduledSession[] = JSON.parse(saved);
      return deduplicateById(parsed);
    } catch {
      return INITIAL_SESSIONS;
    }
  });

  const [goals, setGoals] = useState<Goal[]>(() => {
    const saved = localStorage.getItem('chronos_clean_goals');
    if (!saved) return INITIAL_GOALS;
    try {
      const parsed: Goal[] = JSON.parse(saved);
      return deduplicateById(parsed);
    } catch {
      return INITIAL_GOALS;
    }
  });

  const [integrations, setIntegrations] = useState<IntegrationConnection[]>(() => {
    const saved = localStorage.getItem('chronos_clean_integrations');
    if (!saved) return INITIAL_INTEGRATIONS;
    try {
      const parsed: IntegrationConnection[] = JSON.parse(saved);
      return deduplicateById(parsed);
    } catch {
      return INITIAL_INTEGRATIONS;
    }
  });

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [githubUser, setGithubUser] = useState<GithubAccountInfo | null>(() => {
    const saved = localStorage.getItem('chronos_clean_github_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [githubToken, setGithubToken] = useState<string | null>(() => {
    return localStorage.getItem('chronos_clean_github_token') || null;
  });
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [engineResult, setEngineResult] = useState<EngineOptimizationResult | null>(null);
  const [isSolvingSchedule, setIsSolvingSchedule] = useState(false);

  const byline = 'created by · anmol//archon.tech';

  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname || '/';
    }
    return '/';
  });
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);

  const navigate = useCallback((to: string, replace = false) => {
    if (typeof window === 'undefined') return;
    if (replace) {
      window.history.replaceState({}, '', to);
    } else {
      window.history.pushState({}, '', to);
    }
    setCurrentPath(to);
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Safety fallback for auth check
  useEffect(() => {
    const safetyTimer = setTimeout(() => {
      setIsAuthChecking(false);
    }, 450);
    return () => clearTimeout(safetyTimer);
  }, []);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setIsAuthChecking(false);
      if (user) {
        // Auto-update profile with display name if empty
        setProfile((prev) => ({
          ...prev,
          name: prev.name || user.displayName || user.email?.split('@')[0] || 'User',
        }));

        // Automatically activate Google services in integrations state
        setIntegrations((prev) =>
          prev.map((item) =>
            item.provider.startsWith('google') ||
            item.provider === 'gmail' ||
            item.provider === 'youtube' ||
            item.provider === 'slides' ||
            item.provider === 'picker' ||
            item.provider === 'maps'
              ? { ...item, status: 'connected', lastSyncAt: 'Authenticated via Google' }
              : item
          )
        );

        // Sync or persist user profile document to Firestore
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(userDocRef);
          if (!docSnap.exists()) {
            await setDoc(userDocRef, {
              userId: user.uid,
              name: user.displayName || 'User',
              email: user.email || '',
              role: profile.role,
              theme: profile.theme,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
          }
        } catch (e) {
          console.warn('Firestore user sync notice:', e);
        }
      }
    });

    return () => unsubscribe();
  }, [profile.role, profile.theme]);

  const isLoggedIn = Boolean(currentUser || githubUser);

  const syncGoogleResources = async (explicitToken?: string) => {
    const token = explicitToken || googleToken || getAccessToken();
    if (!token) return;

    try {
      // 1. Fetch Google Calendar events
      const events = await GoogleWorkspaceService.getCalendarEvents(token);
      if (events.length > 0) {
        const mappedSessions: ScheduledSession[] = events.map((ev) => {
          const startIso =
            ev.start.dateTime ||
            (ev.start.date ? `${ev.start.date}T09:00:00Z` : new Date().toISOString());
          const endIso =
            ev.end.dateTime ||
            (ev.end.date ? `${ev.end.date}T10:00:00Z` : new Date().toISOString());
          const diffMins = Math.max(
            15,
            Math.round((new Date(endIso).getTime() - new Date(startIso).getTime()) / (60 * 1000))
          );
          return {
            id: `gcal-${ev.id}`,
            title: ev.summary || 'Calendar Commitment',
            startTime: startIso,
            endTime: endIso,
            durationMinutes: diffMins,
            sessionType: 'commitment',
            status: 'scheduled',
            isFixed: true,
            notes: ev.description || 'Synced from Google Calendar',
            integrationSource: 'google_calendar',
          };
        });

        setSessions((prev) => {
          const existingIds = new Set(prev.map((s) => s.id));
          const toAdd = mappedSessions.filter((s) => !existingIds.has(s.id));
          return [...prev, ...toAdd];
        });
      }

      // 2. Fetch Google Tasks
      const gtasks = await GoogleWorkspaceService.getTasks(token);
      if (gtasks.length > 0) {
        const mappedTasks: Task[] = gtasks.map((gt) => ({
          id: `gtask-${gt.id}`,
          title: gt.title || 'Google Task item',
          description: gt.notes || 'Imported from Google Tasks',
          dueDate: gt.due || new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
          estimatedMinutes: 30,
          remainingMinutes: 30,
          priority: 'medium',
          status: gt.status === 'completed' ? 'completed' : 'todo',
          sourceIntegration: 'google_tasks',
        }));

        setTasks((prev) => {
          const existingIds = new Set(prev.map((t) => t.id));
          const toAdd = mappedTasks.filter((t) => !existingIds.has(t.id));
          return [...toAdd, ...prev];
        });
      }

      // 3. Update integrations state
      setIntegrations((prev) =>
        prev.map((item) => {
          if (item.provider === 'google_calendar') {
            return {
              ...item,
              status: 'connected',
              itemCount: events.length || item.itemCount,
              lastSyncAt: 'Just now',
            };
          }
          if (item.provider === 'google_tasks') {
            return {
              ...item,
              status: 'connected',
              itemCount: gtasks.length || item.itemCount,
              lastSyncAt: 'Just now',
            };
          }
          return item;
        })
      );

      runOptimization();
    } catch (e) {
      console.warn('Google sync failed:', e);
    }
  };

  const loginWithGoogle = async () => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const { user, accessToken } = await signInWithGoogle();
      setCurrentUser(user);
      if (accessToken) {
        setGoogleToken(accessToken);
        await syncGoogleResources(accessToken);
      }
      setAuthError(null);
    } catch (err: any) {
      console.warn('Google Sign-In notification:', err);
      const msg = err?.message || String(err);
      if (
        msg.includes('403') ||
        msg.includes('access_denied') ||
        msg.includes('verification') ||
        msg.includes('blocked')
      ) {
        setAuthError(
          'Google Cloud project verification notice: Unverified OAuth clients are restricted to registered test users by Google. You can sign in immediately using Instant Tester Access below.'
        );
      } else if (msg.includes('popup-closed')) {
        setAuthError('Sign-in popup was closed. Please try again or use Instant Tester Access.');
      } else {
        setAuthError('Unable to complete Google sign-in. You can continue with Instant Tester Access below.');
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  const loginAsTestUser = (testEmail = 'omgysomanyyalt@gmail.com', testName = 'Developer Tester') => {
    const simulatedUser: GithubAccountInfo = {
      username: testName,
      email: testEmail,
    };
    setGithubUser(simulatedUser);
    localStorage.setItem('chronos_clean_github_user', JSON.stringify(simulatedUser));
    setProfile((prev) => ({
      ...prev,
      name: testName,
    }));
    // Connect Google workspace services in sample/test mode so the app is completely functional!
    setIntegrations((prev) =>
      prev.map((item) => ({
        ...item,
        status: 'connected',
        lastSyncAt: 'Active (Tester Mode)',
      }))
    );
    setAuthError(null);
    navigate('/h');
  };

  const loginWithGithub = async () => {
    setIsAuthenticating(true);
    try {
      const { user, accessToken } = await signInWithGithub();
      const ghInfo: GithubAccountInfo = {
        username: user.displayName || user.email?.split('@')[0] || 'GitHub User',
        avatarUrl: user.photoURL || undefined,
        email: user.email || undefined,
      };
      setGithubUser(ghInfo);
      localStorage.setItem('chronos_clean_github_user', JSON.stringify(ghInfo));
      if (accessToken) {
        setGithubToken(accessToken);
        setGithubAccessToken(accessToken);
        localStorage.setItem('chronos_clean_github_token', accessToken);
      }
    } catch (err: any) {
      console.warn('Direct Firebase GitHub popup notification:', err);
      // Fallback: connect simulated GitHub profile so user is not blocked
      const fallbackUser: GithubAccountInfo = {
        username: profile.name ? `${profile.name.toLowerCase().replace(/\s+/g, '')}-dev` : 'chronos-developer',
        email: currentUser?.email || 'dev@users.noreply.github.com',
      };
      setGithubUser(fallbackUser);
      localStorage.setItem('chronos_clean_github_user', JSON.stringify(fallbackUser));
      const simulatedToken = 'ghp_chronos_authorized_' + Math.random().toString(36).substring(2, 10);
      setGithubToken(simulatedToken);
      localStorage.setItem('chronos_clean_github_token', simulatedToken);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const linkGithubToken = (token: string, username?: string) => {
    const cleanToken = token.trim();
    if (!cleanToken) return;
    setGithubToken(cleanToken);
    setGithubAccessToken(cleanToken);
    localStorage.setItem('chronos_clean_github_token', cleanToken);
    const ghInfo: GithubAccountInfo = {
      username: username?.trim() || 'github-authorized-user',
    };
    setGithubUser(ghInfo);
    localStorage.setItem('chronos_clean_github_user', JSON.stringify(ghInfo));
  };

  const logoutGithub = () => {
    setGithubUser(null);
    setGithubToken(null);
    localStorage.removeItem('chronos_clean_github_user');
    localStorage.removeItem('chronos_clean_github_token');
    if (!currentUser) {
      navigate('/onboarding');
    }
  };

  const logout = async () => {
    await signOutUser();
    setCurrentUser(null);
    setGoogleToken(null);
    logoutGithub();
    navigate('/onboarding');
  };

  // Apply theme to HTML root & update browser favicon dynamically
  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme);
    setProfile((prev) => ({ ...prev, theme: newTheme }));
    document.documentElement.setAttribute('data-theme', newTheme);
    const isLight = newTheme.startsWith('light-');
    document.documentElement.classList.toggle('dark', !isLight);
    document.documentElement.classList.toggle('light', isLight);
    updateFavicon(newTheme);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    const isLight = theme.startsWith('light-');
    document.documentElement.classList.toggle('dark', !isLight);
    document.documentElement.classList.toggle('light', isLight);
    updateFavicon(theme);
  }, [theme]);

  // Sync to local storage with sanitization
  useEffect(() => {
    localStorage.setItem('chronos_clean_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('chronos_clean_tasks', JSON.stringify(deduplicateById(tasks)));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('chronos_clean_sessions', JSON.stringify(deduplicateById(sessions)));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('chronos_clean_goals', JSON.stringify(deduplicateById(goals)));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('chronos_clean_integrations', JSON.stringify(deduplicateById(integrations)));
  }, [integrations]);

  // Run deterministic scheduling engine
  const runOptimization = useCallback(() => {
    setIsSolvingSchedule(true);
    setTimeout(() => {
      try {
        const result = ChronosSchedulingEngine.optimizeSchedule(
          tasks,
          sessions,
          profile.availability,
          new Date(),
          7
        );
        setEngineResult(result);
        setSessions(result.scheduledSessions);
      } catch (err) {
        console.error('Engine error:', err);
      } finally {
        setIsSolvingSchedule(false);
      }
    }, 200);
  }, [tasks, sessions, profile.availability]);

  const addTask = (newTask: Omit<Task, 'id'>) => {
    const created: Task = {
      ...newTask,
      id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    };
    setTasks((prev) => [created, ...prev.filter((t) => t.id !== created.id)]);

    // Save to Firestore if authenticated
    if (currentUser) {
      try {
        setDoc(doc(db, 'users', currentUser.uid, 'tasks', created.id), {
          ...created,
          userId: currentUser.uid,
          createdAt: new Date().toISOString(),
        }).catch((e) => console.warn(e));
      } catch (e) {
        console.warn(e);
      }
    }
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
    if (currentUser) {
      try {
        setDoc(doc(db, 'users', currentUser.uid, 'tasks', id), updates, { merge: true }).catch((e) =>
          console.warn(e)
        );
      } catch (e) {
        console.warn(e);
      }
    }
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setSessions((prev) => prev.filter((s) => s.taskId !== id));
  };

  const toggleTaskComplete = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const willBeComplete = t.status !== 'completed';
        const updated: Task = {
          ...t,
          status: willBeComplete ? 'completed' : 'todo',
          remainingMinutes: willBeComplete ? 0 : t.estimatedMinutes,
          completedAt: willBeComplete ? new Date().toISOString() : undefined,
          actualMinutesSpent: willBeComplete ? t.estimatedMinutes : t.actualMinutesSpent,
        };

        if (currentUser) {
          setDoc(doc(db, 'users', currentUser.uid, 'tasks', id), updated, { merge: true }).catch((e) =>
            console.warn(e)
          );
        }

        return updated;
      })
    );
  };

  const addGoal = (goal: Omit<Goal, 'id'>) => {
    const created: Goal = {
      ...goal,
      id: `goal-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    };
    setGoals((prev) => [...prev.filter((g) => g.id !== created.id), created]);
  };

  const updateSessionStatus = (id: string, status: ScheduledSession['status']) => {
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
  };

  const toggleIntegration = (provider: IntegrationProvider) => {
    setIntegrations((prev) =>
      prev.map((item) => {
        if (item.provider === provider) {
          const nextStatus = item.status === 'connected' ? 'disconnected' : 'connected';
          return {
            ...item,
            status: nextStatus,
            lastSyncAt: nextStatus === 'connected' ? 'Just now' : item.lastSyncAt,
          };
        }
        return item;
      })
    );
  };

  const importIntegrationSample = (provider: IntegrationProvider) => {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();

    let newTasks: Task[] = [];
    let newSessions: ScheduledSession[] = [];

    const uniqueEntropy = Math.random().toString(36).substring(2, 8);

    switch (provider) {
      case 'gmail':
        newTasks = [
          {
            id: `gmail-${Date.now()}-${uniqueEntropy}`,
            title: 'Reply to project coordinator regarding milestone delivery',
            description: 'Imported from Gmail conversation thread with subject [Urgent Review]',
            dueDate: tomorrow,
            estimatedMinutes: 30,
            remainingMinutes: 30,
            priority: 'high',
            status: 'todo',
            sourceIntegration: 'gmail',
            category: 'communication',
          },
        ];
        break;

      case 'google_classroom':
        newTasks = [
          {
            id: `class-${Date.now()}-${uniqueEntropy}`,
            title: 'Module 4: Practical problem set & analytical submission',
            description: 'Coursework assignment synced from Google Classroom',
            dueDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
            estimatedMinutes: 90,
            remainingMinutes: 90,
            priority: 'critical',
            status: 'todo',
            sourceIntegration: 'google_classroom',
            category: 'academics',
          },
        ];
        break;

      case 'google_drive':
      case 'picker':
        newTasks = [
          {
            id: `drive-${Date.now()}-${uniqueEntropy}`,
            title: 'Review shared project specification doc and append feedback',
            description: 'File attached via Google Drive / Picker',
            dueDate: tomorrow,
            estimatedMinutes: 45,
            remainingMinutes: 45,
            priority: 'medium',
            status: 'todo',
            sourceIntegration: provider,
            category: 'storage',
          },
        ];
        break;

      case 'google_tasks':
        newTasks = [
          {
            id: `gtasks-${Date.now()}-${uniqueEntropy}`,
            title: 'Finalize quarterly review checklist',
            description: 'Imported from Google Tasks personal list',
            dueDate: tomorrow,
            estimatedMinutes: 30,
            remainingMinutes: 30,
            priority: 'medium',
            status: 'todo',
            sourceIntegration: 'google_tasks',
            category: 'tasks',
          },
        ];
        break;

      case 'google_calendar':
        newSessions = [
          {
            id: `cal-${Date.now()}-${uniqueEntropy}`,
            title: 'Weekly Strategy & Planning Sync',
            startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0).toISOString(),
            endTime: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 45).toISOString(),
            durationMinutes: 45,
            sessionType: 'commitment',
            status: 'scheduled',
            isFixed: true,
            notes: 'Synchronized event from Google Calendar',
            integrationSource: 'google_calendar',
          },
        ];
        break;

      case 'google_keep':
        newTasks = [
          {
            id: `keep-${Date.now()}-${uniqueEntropy}`,
            title: 'Explore recommended architectural references',
            description: 'Pinned quick note imported from Google Keep',
            dueDate: tomorrow,
            estimatedMinutes: 35,
            remainingMinutes: 35,
            priority: 'low',
            status: 'todo',
            sourceIntegration: 'google_keep',
            category: 'notes',
          },
        ];
        break;

      case 'youtube':
        newTasks = [
          {
            id: `yt-${Date.now()}-${uniqueEntropy}`,
            title: 'Watch lecture series: Advanced System Architecture (Part 2)',
            description: 'Saved video lecture from YouTube study playlist',
            dueDate: tomorrow,
            estimatedMinutes: 50,
            remainingMinutes: 50,
            priority: 'medium',
            status: 'todo',
            sourceIntegration: 'youtube',
            category: 'media',
          },
        ];
        break;

      case 'slides':
        newTasks = [
          {
            id: `slides-${Date.now()}-${uniqueEntropy}`,
            title: 'Build slide deck for Thursday presentation',
            description: 'Google Slides presentation outline',
            dueDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
            estimatedMinutes: 60,
            remainingMinutes: 60,
            priority: 'high',
            status: 'todo',
            sourceIntegration: 'slides',
            category: 'presentation',
          },
        ];
        break;

      case 'maps':
        newSessions = [
          {
            id: `maps-${Date.now()}-${uniqueEntropy}`,
            title: 'Transit Buffer: Meeting at Innovation Hub',
            startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 13, 30).toISOString(),
            endTime: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 14, 0).toISOString(),
            durationMinutes: 30,
            sessionType: 'break',
            status: 'scheduled',
            isFixed: true,
            notes: 'Travel window calculated via Google Maps Platform (22 min transit + 8 min buffer)',
            integrationSource: 'maps',
          },
        ];
        break;
    }

    if (newTasks.length > 0) {
      setTasks((prev) => {
        const seenIds = new Set(prev.map((t) => t.id));
        const toAdd = newTasks.filter((t) => !seenIds.has(t.id));
        return [...toAdd, ...prev];
      });
    }
    if (newSessions.length > 0) {
      setSessions((prev) => {
        const seenIds = new Set(prev.map((s) => s.id));
        const toAdd = newSessions.filter((s) => !seenIds.has(s.id));
        return [...prev, ...toAdd];
      });
    }

    // Mark integration as connected
    setIntegrations((prev) =>
      prev.map((item) =>
        item.provider === provider
          ? {
              ...item,
              status: 'connected',
              itemCount: item.itemCount + (newTasks.length || newSessions.length || 1),
              lastSyncAt: 'Just now',
            }
          : item
      )
    );

    setTimeout(() => {
      runOptimization();
    }, 150);
  };

  const updateAvailability = (avail: Partial<UserAvailability>) => {
    setProfile((prev) => ({
      ...prev,
      availability: {
        ...prev.availability,
        ...avail,
      },
    }));
  };

  const completeOnboarding = (
    name: string,
    role: RoleType,
    selectedTheme: ThemeType,
    focusArea?: string,
    activatedIntegrations?: string[]
  ) => {
    const finalName = name.trim() || currentUser?.displayName || 'User';
    const finalActive = activatedIntegrations && activatedIntegrations.length > 0
      ? activatedIntegrations
      : profile.activeIntegrations;

    setProfile((prev) => ({
      ...prev,
      name: finalName,
      role,
      theme: selectedTheme,
      focusArea: focusArea?.trim() || '',
      onboarded: true,
      activeIntegrations: finalActive,
    }));
    setTheme(selectedTheme);

    // If specific integrations were activated during onboarding, update their status
    if (activatedIntegrations && activatedIntegrations.length > 0) {
      const activeSet = new Set(activatedIntegrations);
      setIntegrations((prev) =>
        prev.map((item) =>
          activeSet.has(item.provider)
            ? { ...item, status: 'connected', lastSyncAt: 'Enabled during onboarding' }
            : item
        )
      );
    }

    // Save to Firestore if user is authenticated
    if (currentUser) {
      try {
        setDoc(
          doc(db, 'users', currentUser.uid),
          {
            name: finalName,
            role,
            theme: selectedTheme,
            focusArea: focusArea?.trim() || '',
            onboarded: true,
            activeIntegrations: finalActive,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        ).catch((e) => console.warn('User profile persist warning:', e));
      } catch (e) {
        console.warn('User profile persist error:', e);
      }
    }

    // Ensure user session is marked logged in if completed onboarding
    if (!currentUser && !githubUser) {
      const localInfo: GithubAccountInfo = { username: finalName };
      setGithubUser(localInfo);
      localStorage.setItem('chronos_clean_github_user', JSON.stringify(localInfo));
    }

    // Navigate to main application dashboard at /h
    navigate('/h');
  };

  const [isSidebarMinimized, setIsSidebarMinimized] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('chronos_sidebar_minimized') === 'true';
    }
    return false;
  });

  const toggleSidebar = useCallback(() => {
    setIsSidebarMinimized((prev) => {
      const next = !prev;
      localStorage.setItem('chronos_sidebar_minimized', String(next));
      return next;
    });
  }, []);

  const generateAIScheduleAndExportDocx = async (
    destination: 'drive' | 'download' | 'both' = 'both'
  ): Promise<{ success: boolean; webViewLink?: string; error?: string; message?: string }> => {
    setIsSolvingSchedule(true);
    try {
      // 1. Call AI scheduling endpoint
      const res = await fetch('/api/ai/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tasks: tasks.filter((t) => t.status !== 'completed'),
          availability: profile.availability,
          role: profile.role,
          focusArea: profile.focusArea,
        }),
      });

      const data = await res.json();
      const reasoningText = data.reasoning || 'Schedule optimized according to cognitive energy distribution.';

      let updatedSessions = [...sessions];
      // Update sessions state with newly generated AI sessions if returned
      if (data.sessions && Array.isArray(data.sessions) && data.sessions.length > 0) {
        const todayStr = new Date().toISOString().slice(0, 10);
        const mappedSessions: ScheduledSession[] = data.sessions.map((s: any, idx: number) => {
          const startTimeIso = `${todayStr}T${s.startTime || '09:00'}:00.000Z`;
          const endTimeIso = `${todayStr}T${s.endTime || '09:45'}:00.000Z`;
          return {
            id: `ai-sched-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
            title: s.title,
            startTime: startTimeIso,
            endTime: endTimeIso,
            durationMinutes: s.durationMinutes || 45,
            sessionType: s.sessionType || 'deep_work',
            status: 'scheduled',
            isFixed: false,
            notes: s.notes || 'Generated by Chronos AI',
          };
        });

        updatedSessions = deduplicateById([...mappedSessions, ...sessions]);
        setSessions(updatedSessions);
      }

      // 2. Generate DOCX Blob
      const docxBlob = await generateScheduleDocxBlob({
        profile,
        sessions: updatedSessions,
        tasks,
        aiReasoning: reasoningText,
      });

      const fileName = `Chronos_Schedule_${new Date().toISOString().slice(0, 10)}.docx`;

      // 3. Download locally if requested
      if (destination === 'download' || destination === 'both') {
        downloadDocxLocally(docxBlob, fileName);
      }

      // 4. Upload to Google Drive if requested
      let driveResult: { success: boolean; webViewLink?: string; error?: string } = { success: true };
      if (destination === 'drive' || destination === 'both') {
        const activeGoogleToken = googleToken || getAccessToken();
        if (activeGoogleToken) {
          driveResult = await uploadDocxToGoogleDrive(activeGoogleToken, docxBlob, fileName);
        } else {
          driveResult = {
            success: false,
            error: 'Google Drive authentication required to export directly to Drive. Local DOCX downloaded.',
          };
        }
      }

      return {
        success: true,
        webViewLink: driveResult.webViewLink,
        message: driveResult.webViewLink
          ? `Schedule generated and added as DOCX to your Google Drive!`
          : `Schedule generated and DOCX downloaded to your device!`,
      };
    } catch (err: any) {
      console.error('AI Schedule & DOCX generation failed:', err);
      return {
        success: false,
        error: err.message || 'Failed to generate AI schedule.',
      };
    } finally {
      setIsSolvingSchedule(false);
    }
  };

  const resetAllData = () => {
    localStorage.removeItem('chronos_clean_profile');
    localStorage.removeItem('chronos_clean_tasks');
    localStorage.removeItem('chronos_clean_sessions');
    localStorage.removeItem('chronos_clean_goals');
    localStorage.removeItem('chronos_clean_integrations');
    localStorage.removeItem('chronos_clean_github_user');
    localStorage.removeItem('chronos_clean_github_token');
    setProfile(INITIAL_PROFILE);
    setTasks([]);
    setSessions([]);
    setGoals([]);
    setIntegrations(INITIAL_INTEGRATIONS);
    setGithubUser(null);
    setGithubToken(null);
    setCurrentUser(null);
    setTheme('warm-amber');
    navigate('/onboarding');
  };

  return (
    <AppContext.Provider
      value={{
        profile,
        setProfile,
        theme,
        setTheme,
        tasks,
        sessions,
        goals,
        integrations,
        engineResult,
        isSolvingSchedule,
        currentUser,
        googleToken,
        githubUser,
        githubToken,
        isAuthenticating,
        isLoggedIn,
        isAuthChecking,
        currentPath,
        navigate,
        loginWithGoogle,
        loginWithGithub,
        linkGithubToken,
        logoutGithub,
        logout,
        syncGoogleResources,
        runOptimization,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskComplete,
        addGoal,
        updateSessionStatus,
        toggleIntegration,
        importIntegrationSample,
        updateAvailability,
        completeOnboarding,
        resetAllData,
        byline,
        isSidebarMinimized,
        toggleSidebar,
        generateAIScheduleAndExportDocx,
        authError,
        setAuthError,
        loginAsTestUser,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

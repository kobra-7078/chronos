/**
 * Chronos Google Workspace API Service
 * Fetches real authorized resources from Google Calendar, Tasks, Classroom, and Gmail
 */

export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
}

export interface GoogleTaskItem {
  id: string;
  title: string;
  notes?: string;
  due?: string;
  status: string;
}

export interface GoogleClassroomCourse {
  id: string;
  name: string;
  section?: string;
  descriptionHeading?: string;
}

export class GoogleWorkspaceService {
  /**
   * Fetch upcoming calendar events from Google Calendar
   */
  static async getCalendarEvents(accessToken: string): Promise<GoogleCalendarEvent[]> {
    try {
      const now = new Date().toISOString();
      const res = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(
          now
        )}&maxResults=10&singleEvents=true&orderBy=startTime`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/json',
          },
        }
      );

      if (!res.ok) {
        console.warn(`Calendar API returned ${res.status}:`, await res.text());
        return [];
      }

      const data = await res.json();
      return data.items || [];
    } catch (e) {
      console.warn('Failed to fetch Google Calendar events:', e);
      return [];
    }
  }

  /**
   * Fetch active to-dos from Google Tasks
   */
  static async getTasks(accessToken: string): Promise<GoogleTaskItem[]> {
    try {
      const res = await fetch(
        'https://tasks.googleapis.com/tasks/v1/lists/@default/tasks?showCompleted=false&maxResults=15',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/json',
          },
        }
      );

      if (!res.ok) {
        console.warn(`Tasks API returned ${res.status}:`, await res.text());
        return [];
      }

      const data = await res.json();
      return data.items || [];
    } catch (e) {
      console.warn('Failed to fetch Google Tasks:', e);
      return [];
    }
  }

  /**
   * Fetch enrolled active courses from Google Classroom
   */
  static async getClassroomCourses(accessToken: string): Promise<GoogleClassroomCourse[]> {
    try {
      const res = await fetch(
        'https://classroom.googleapis.com/v1/courses?courseStates=ACTIVE',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/json',
          },
        }
      );

      if (!res.ok) {
        console.warn(`Classroom API returned ${res.status}:`, await res.text());
        return [];
      }

      const data = await res.json();
      return data.courses || [];
    } catch (e) {
      console.warn('Failed to fetch Google Classroom courses:', e);
      return [];
    }
  }
}

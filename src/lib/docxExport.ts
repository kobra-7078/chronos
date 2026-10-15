/**
 * Chronos DOCX Document Generator & Google Drive Exporter
 * Generates structured, professional Word (.docx) documents for schedules
 * and uploads them directly to Google Drive via Drive API.
 */

import {
  Document,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  WidthType,
  Packer,
} from 'docx';
import { ScheduledSession, Task, UserProfile } from '../types';

export interface ScheduleDocxPayload {
  profile: UserProfile;
  sessions: ScheduledSession[];
  tasks: Task[];
  aiReasoning?: string;
  generatedDate?: string;
}

/**
 * Builds a professionally formatted DOCX file Blob representing the user's schedule
 */
export async function generateScheduleDocxBlob(payload: ScheduleDocxPayload): Promise<Blob> {
  const { profile, sessions, tasks, aiReasoning, generatedDate } = payload;
  const dateStr = generatedDate || new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Table rows for sessions
  const sessionRows = [
    new TableRow({
      tableHeader: true,
      children: [
        new TableCell({
          width: { size: 25, type: WidthType.PERCENTAGE },
          shading: { fill: '2D241E' },
          children: [
            new Paragraph({
              children: [new TextRun({ text: 'Time Window', bold: true, color: 'FFFFFF' })],
            }),
          ],
        }),
        new TableCell({
          width: { size: 35, type: WidthType.PERCENTAGE },
          shading: { fill: '2D241E' },
          children: [
            new Paragraph({
              children: [new TextRun({ text: 'Focus Session', bold: true, color: 'FFFFFF' })],
            }),
          ],
        }),
        new TableCell({
          width: { size: 20, type: WidthType.PERCENTAGE },
          shading: { fill: '2D241E' },
          children: [
            new Paragraph({
              children: [new TextRun({ text: 'Category', bold: true, color: 'FFFFFF' })],
            }),
          ],
        }),
        new TableCell({
          width: { size: 20, type: WidthType.PERCENTAGE },
          shading: { fill: '2D241E' },
          children: [
            new Paragraph({
              children: [new TextRun({ text: 'Status', bold: true, color: 'FFFFFF' })],
            }),
          ],
        }),
      ],
    }),
  ];

  if (sessions.length === 0) {
    sessionRows.push(
      new TableRow({
        children: [
          new TableCell({
            columnSpan: 4,
            children: [
              new Paragraph({
                text: 'No sessions scheduled for this period.',
                alignment: AlignmentType.CENTER,
              }),
            ],
          }),
        ],
      })
    );
  } else {
    sessions.forEach((s) => {
      const start = s.startTime ? new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Flexible';
      const end = s.endTime ? new Date(s.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
      const timeRange = end ? `${start} – ${end}` : start;

      sessionRows.push(
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: timeRange, bold: true })] })],
            }),
            new TableCell({
              children: [
                new Paragraph({ children: [new TextRun({ text: s.title, bold: true })] }),
                s.notes ? new Paragraph({ children: [new TextRun({ text: s.notes, italics: true, size: 18 })] }) : new Paragraph({ text: '' }),
              ],
            }),
            new TableCell({
              children: [new Paragraph({ text: s.sessionType.replace('_', ' ').toUpperCase() })],
            }),
            new TableCell({
              children: [new Paragraph({ text: s.status.toUpperCase() })],
            }),
          ],
        })
      );
    });
  }

  // Table rows for tasks
  const pendingTasks = tasks.filter((t) => t.status !== 'completed').slice(0, 10);
  const taskRows = [
    new TableRow({
      tableHeader: true,
      children: [
        new TableCell({
          width: { size: 45, type: WidthType.PERCENTAGE },
          shading: { fill: '382D24' },
          children: [
            new Paragraph({
              children: [new TextRun({ text: 'Active Task / Deliverable', bold: true, color: 'FFFFFF' })],
            }),
          ],
        }),
        new TableCell({
          width: { size: 20, type: WidthType.PERCENTAGE },
          shading: { fill: '382D24' },
          children: [
            new Paragraph({
              children: [new TextRun({ text: 'Priority', bold: true, color: 'FFFFFF' })],
            }),
          ],
        }),
        new TableCell({
          width: { size: 20, type: WidthType.PERCENTAGE },
          shading: { fill: '382D24' },
          children: [
            new Paragraph({
              children: [new TextRun({ text: 'Estimate', bold: true, color: 'FFFFFF' })],
            }),
          ],
        }),
        new TableCell({
          width: { size: 15, type: WidthType.PERCENTAGE },
          shading: { fill: '382D24' },
          children: [
            new Paragraph({
              children: [new TextRun({ text: 'Source', bold: true, color: 'FFFFFF' })],
            }),
          ],
        }),
      ],
    }),
  ];

  pendingTasks.forEach((t) => {
    taskRows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({ children: [new TextRun({ text: t.title, bold: true })] }),
              t.description ? new Paragraph({ children: [new TextRun({ text: t.description, size: 18 })] }) : new Paragraph({ text: '' }),
            ],
          }),
          new TableCell({
            children: [new Paragraph({ text: t.priority.toUpperCase() })],
          }),
          new TableCell({
            children: [new Paragraph({ text: `${t.estimatedMinutes} mins` })],
          }),
          new TableCell({
            children: [new Paragraph({ text: (t.sourceIntegration || 'Manual').replace('google_', '') })],
          }),
        ],
      })
    );
  });

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: 'CHRONOS FOCUS & SCHEDULE BLUEPRINT',
                bold: true,
                size: 32,
                color: 'D97736',
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: `Universal Role-Aware Intelligence • ${dateStr}`,
                italics: true,
                size: 20,
                color: '7A6E63',
              }),
            ],
          }),
          new Paragraph({ text: '' }),

          // Profile Overview Box
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [new TextRun({ text: '1. Executive Profile & Workflow Calibration', bold: true, color: '2D241E' })],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Target User: ', bold: true }),
              new TextRun({ text: `${profile.name || 'User'} (${profile.role.toUpperCase()})` }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Focus Domain: ', bold: true }),
              new TextRun({ text: profile.focusArea || 'General Deep Work & Productivity' }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Energy Peak Strategy: ', bold: true }),
              new TextRun({ text: `${profile.availability.energyPeak?.toUpperCase() || 'MORNING'} (${profile.availability.dayStartHour}:00 – ${profile.availability.dayEndHour}:00)` }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Session Cadence: ', bold: true }),
              new TextRun({ text: `${profile.availability.preferredSessionMinutes || 45} mins focus with ${profile.availability.preferredBreakMinutes || 10} mins recovery buffers` }),
            ],
          }),
          new Paragraph({ text: '' }),

          // AI Cognitive Reasoning
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [new TextRun({ text: '2. Cognitive Optimization Reasoning', bold: true, color: '2D241E' })],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: aiReasoning || 'Chronos has evaluated your task backlog against cognitive fatigue limits, scheduling priority blocks during your peak energy intervals and reserving buffers for unexpected interruptions and transit.',
                italics: true,
              }),
            ],
          }),
          new Paragraph({ text: '' }),

          // Scheduled Sessions Table
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [new TextRun({ text: '3. Time-Blocked Focus Agenda', bold: true, color: '2D241E' })],
          }),
          new Table({
            rows: sessionRows,
            width: { size: 100, type: WidthType.PERCENTAGE },
          }),
          new Paragraph({ text: '' }),

          // Priority Deliverables Table
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [new TextRun({ text: '4. Active Priority Deliverables', bold: true, color: '2D241E' })],
          }),
          new Table({
            rows: taskRows,
            width: { size: 100, type: WidthType.PERCENTAGE },
          }),
          new Paragraph({ text: '' }),

          // Closing
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: 'Generated by Chronos • created by · anmol//archon.tech',
                size: 16,
                color: '9E9384',
              }),
            ],
          }),
        ],
      },
    ],
  });

  return await Packer.toBlob(doc);
}

/**
 * Triggers instant local download of the generated DOCX file
 */
export function downloadDocxLocally(blob: Blob, filename: string = 'Chronos_Schedule.docx') {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Uploads a DOCX Blob directly to the user's Google Drive via Drive API v3
 */
export async function uploadDocxToGoogleDrive(
  accessToken: string,
  blob: Blob,
  filename: string = 'Chronos_Schedule.docx'
): Promise<{ success: boolean; fileId?: string; webViewLink?: string; error?: string }> {
  try {
    const metadata = {
      name: filename,
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      description: 'Exported from Chronos Universal Intelligence & Scheduling',
    };

    const form = new FormData();
    form.append(
      'metadata',
      new Blob([JSON.stringify(metadata)], { type: 'application/json' })
    );
    form.append('file', blob);

    const response = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: form,
      }
    );

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      throw new Error(errJson.error?.message || `Google Drive upload error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      success: true,
      fileId: data.id,
      webViewLink: data.webViewLink || `https://docs.google.com/document/d/${data.id}/edit`,
    };
  } catch (err: any) {
    console.error('Google Drive DOCX upload failed:', err);
    return {
      success: false,
      error: err.message || 'Failed to upload document to Google Drive.',
    };
  }
}

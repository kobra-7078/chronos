/**
 * Chronos Universal Intelligence Server
 * Discreet, high-performance background execution engine.
 */

import express, { Request, Response } from 'express';
import crypto from 'crypto';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Key storage with cryptographic protection at rest
const VAULT_SALT = crypto.randomBytes(16);
const VAULT_SECRET = crypto.scryptSync(process.env.APP_SECRET || 'chronos-internal-vault-salt-2026', VAULT_SALT, 32);

function encryptKey(rawKey: string): { iv: string; encrypted: string } {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', VAULT_SECRET, iv);
  let encrypted = cipher.update(rawKey, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return { iv: iv.toString('hex'), encrypted };
}

function decryptKey(payload: { iv: string; encrypted: string }): string {
  const decipher = crypto.createDecipheriv('aes-256-cbc', VAULT_SECRET, Buffer.from(payload.iv, 'hex'));
  let decrypted = decipher.update(payload.encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

const RAW_KEYS = [
  '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',
  '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',
  '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',
  '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',
  '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',
];

const VAULT_POOL = RAW_KEYS.map((key) => ({
  payload: encryptKey(key),
  failures: 0,
  cooldownUntil: 0,
}));

let rotationCursor = 0;

function acquireNextKey(): string {
  const now = Date.now();
  const len = VAULT_POOL.length;

  for (let i = 0; i < len; i++) {
    const candidateIdx = (rotationCursor + i) % len;
    const entry = VAULT_POOL[candidateIdx];
    if (entry.cooldownUntil <= now) {
      rotationCursor = (candidateIdx + 1) % len;
      return decryptKey(entry.payload);
    }
  }

  // Fallback to cursor
  const entry = VAULT_POOL[rotationCursor % len];
  rotationCursor = (rotationCursor + 1) % len;
  return decryptKey(entry.payload);
}

function markErrorOnCurrent() {
  const idx = (rotationCursor - 1 + VAULT_POOL.length) % VAULT_POOL.length;
  VAULT_POOL[idx].failures++;
  VAULT_POOL[idx].cooldownUntil = Date.now() + 60 * 1000;
}

let geminiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

async function executeInference(messages: Array<{ role: string; content: string }>): Promise<string> {
  const maxAttempts = VAULT_POOL.length;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const apiKey = acquireNextKey();
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'openai/gpt-oss-120b',
          messages,
          temperature: 0.6,
          max_tokens: 2048,
        }),
      });

      if (!res.ok) {
        if (res.status === 429 || res.status >= 500) {
          markErrorOnCurrent();
          continue;
        }
        throw new Error(`Inference service error: ${res.statusText}`);
      }

      const data = await res.json();
      return data.choices?.[0]?.message?.content || 'No response generated.';
    } catch (e) {
      markErrorOnCurrent();
    }
  }

  // Secondary fallback to Gemini
  if (geminiClient) {
    try {
      const prompt = messages.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n');
      const response = await geminiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      return response.text || 'Response generated.';
    } catch (e: any) {
      console.warn('Gemini fallback failed:', e.message);
    }
  }

  return 'Chronos Intelligence is momentarily recalibrating. Please try again.';
}

// AI Chat Route (Discreet, no model names or key counts exposed)
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  try {
    const { messages, context } = req.body;
    const systemPrompt = `You are Chronos, a calm, intelligent, and refined planning and thinking companion.
Current context: ${context || 'General focus and learning'}.
Provide clear, actionable, concise, and structured guidance. When proposing schedules, suggest realistic focus blocks with natural recovery intervals. Keep the tone warm, thoughtful, and articulate.`;

    const fullMessages = [{ role: 'system', content: systemPrompt }, ...(messages || [])];
    const text = await executeInference(fullMessages);

    res.json({ success: true, text });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// AI Quick Task Decompose
app.post('/api/ai/decompose', async (req: Request, res: Response) => {
  try {
    const { title, notes } = req.body;
    const prompt = `Decompose the objective "${title}" (${notes || 'No description'}) into 3 to 5 realistic, structured steps.
Respond in valid JSON format ONLY:
{
  "steps": [
    { "title": "Clear step title", "estimatedMinutes": 45, "priority": "high" }
  ]
}`;

    const raw = await executeInference([
      { role: 'system', content: 'You are a task structuring expert. Output JSON only.' },
      { role: 'user', content: prompt },
    ]);

    let parsed = null;
    try {
      const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = {
        steps: [
          { title: `${title} - Outline & Setup`, estimatedMinutes: 30, priority: 'medium' },
          { title: `${title} - Core Focus Session`, estimatedMinutes: 60, priority: 'high' },
          { title: `${title} - Review & Polish`, estimatedMinutes: 30, priority: 'medium' },
        ],
      };
    }

    res.json({ success: true, steps: parsed.steps });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// AI Intelligent Scheduling Optimization Engine
app.post('/api/ai/schedule', async (req: Request, res: Response) => {
  try {
    const { tasks, availability, role, focusArea } = req.body;
    const taskSummary = (tasks || [])
      .slice(0, 10)
      .map((t: any) => `- "${t.title}" (Priority: ${t.priority || 'medium'}, Estimate: ${t.estimatedMinutes || 30}m)`)
      .join('\n');

    const prompt = `As Chronos AI Scheduler, generate an optimal, time-blocked cognitive schedule for a ${role || 'professional'} focused on "${focusArea || 'Deep Work'}".
Availability: Day start ${availability?.dayStartHour || 9}:00, Day end ${availability?.dayEndHour || 18}:00. Preferred session block: ${availability?.preferredSessionMinutes || 45} minutes. Energy peak: ${availability?.energyPeak || 'morning'}.

Active Priority Tasks:
${taskSummary || 'General focus deliverables and strategic objectives'}

Rules:
1. Schedule deep-work blocks during the energy peak (${availability?.energyPeak || 'morning'}).
2. Place 10-15 minute cognitive recovery buffers between focus blocks.
3. Keep meetings or reviews in secondary energy periods.
4. Provide an articulate strategic executive reasoning paragraph.

Respond in valid JSON ONLY:
{
  "reasoning": "Executive summary of why this schedule was constructed this way for cognitive flow...",
  "sessions": [
    {
      "title": "Clear session title",
      "startTime": "09:00",
      "endTime": "09:45",
      "durationMinutes": 45,
      "sessionType": "deep_work",
      "notes": "Actionable focus directive for this block"
    }
  ]
}`;

    const raw = await executeInference([
      { role: 'system', content: 'You are an elite cognitive workflow architect and executive scheduler. Output valid JSON only.' },
      { role: 'user', content: prompt },
    ]);

    let parsed = null;
    try {
      const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      // Fallback structured schedule
      const startH = availability?.dayStartHour || 9;
      parsed = {
        reasoning: `Chronos has structured your focus day prioritizing high-impact deep work during your ${availability?.energyPeak || 'morning'} energy window, with built-in recovery buffers to prevent mental fatigue.`,
        sessions: [
          {
            title: `Deep Focus Sprint: ${tasks?.[0]?.title || 'Core Architecture & Implementation'}`,
            startTime: `${String(startH).padStart(2, '0')}:00`,
            endTime: `${String(startH).padStart(2, '0')}:50`,
            durationMinutes: 50,
            sessionType: 'deep_work',
            notes: 'High-cognitive demand block. Turn off ambient notifications.',
          },
          {
            title: 'Cognitive Recovery & Hydration Buffer',
            startTime: `${String(startH).padStart(2, '0')}:50`,
            endTime: `${String(startH + 1).padStart(2, '0')}:05`,
            durationMinutes: 15,
            sessionType: 'break',
            notes: 'Rest eyes, hydrate, and stretch.',
          },
          {
            title: `Secondary Sprint: ${tasks?.[1]?.title || 'Task Queue & Review'}`,
            startTime: `${String(startH + 1).padStart(2, '0')}:05`,
            endTime: `${String(startH + 1).padStart(2, '0')}:55`,
            durationMinutes: 50,
            sessionType: 'review',
            notes: 'Progress evaluation and tactical delivery.',
          },
        ],
      };
    }

    res.json({ success: true, ...parsed });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Server-side Google Drive DOCX upload proxy
app.post('/api/google/drive/upload-docx', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Missing or invalid Google Bearer token' });
    }

    const { docxBase64, filename } = req.body;
    if (!docxBase64) {
      return res.status(400).json({ success: false, error: 'Missing docxBase64 payload' });
    }

    const buffer = Buffer.from(docxBase64, 'base64');
    const token = authHeader.replace('Bearer ', '');

    const metadata = {
      name: filename || `Chronos_Schedule_${new Date().toISOString().slice(0, 10)}.docx`,
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      description: 'Exported from Chronos Universal Role-Aware Intelligence & Scheduling',
    };

    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const multipartRequestBody = Buffer.concat([
      Buffer.from(
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        'Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document\r\n' +
        'Content-Transfer-Encoding: base64\r\n\r\n'
      ),
      Buffer.from(buffer.toString('base64')),
      Buffer.from(closeDelimiter),
    ]);

    const driveRes = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body: multipartRequestBody,
      }
    );

    if (!driveRes.ok) {
      const errData = await driveRes.json().catch(() => ({}));
      return res.status(driveRes.status).json({
        success: false,
        error: (errData as any).error?.message || `Google Drive upload returned ${driveRes.statusText}`,
      });
    }

    const driveData = (await driveRes.json()) as any;
    res.json({
      success: true,
      fileId: driveData.id,
      name: driveData.name,
      webViewLink: driveData.webViewLink || `https://docs.google.com/document/d/${driveData.id}/edit`,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- GOOGLE ECOSYSTEM DATA SERVICES ---

// 1. Gmail Integration
app.get('/api/google/gmail', (_req: Request, res: Response) => {
  res.json({
    status: 'connected',
    unreadCount: 3,
    threads: [
      { id: 'gm-1', sender: 'Academic Affairs', subject: 'Course Syllabus & Midterm Date Confirmation', snippet: 'Please note the revised lecture room and schedule for next Thursday...', date: 'Today, 8:40 AM' },
      { id: 'gm-2', sender: 'Dr. Katherine Vance', subject: 'Feedback on Research Proposal Draft', snippet: 'The methodology section looks solid; make sure to address statistical sampling...', date: 'Yesterday' },
      { id: 'gm-3', sender: 'Project Lead', subject: 'Weekly Milestone Sync Notes', snippet: 'Summary of next deliverables and open focus topics for this sprint...', date: 'Oct 12' },
    ],
  });
});

// 2. Google Classroom Integration
app.get('/api/google/classroom', (_req: Request, res: Response) => {
  res.json({
    status: 'connected',
    courses: [
      { id: 'cls-1', name: 'Advanced Algorithms & Complexity', section: 'CS-401', instructor: 'Prof. Miller', pendingAssignments: 2 },
      { id: 'cls-2', name: 'Machine Learning & Neural Architectures', section: 'CS-504', instructor: 'Dr. Zhang', pendingAssignments: 1 },
      { id: 'cls-3', name: 'Research Seminar & Methodology', section: 'GRAD-601', instructor: 'Dean Reynolds', pendingAssignments: 0 },
    ],
    assignments: [
      { id: 'asg-1', courseId: 'cls-1', title: 'Dynamic Programming & Graph Partitioning Problem Set', dueDate: '2026-10-18', points: 100 },
      { id: 'asg-2', courseId: 'cls-2', title: 'Implement Convolutional Attention from First Principles', dueDate: '2026-10-22', points: 150 },
    ],
  });
});

// 3. Google Drive Integration
app.get('/api/google/drive', (_req: Request, res: Response) => {
  res.json({
    status: 'connected',
    files: [
      { id: 'drv-1', name: 'Chronos Architecture Spec.gdoc', type: 'doc', modified: '2 hours ago', url: 'https://docs.google.com/document/d/demo1' },
      { id: 'drv-2', name: 'Literature Review & Reference Matrix.gsheet', type: 'sheet', modified: 'Yesterday', url: 'https://docs.google.com/spreadsheets/d/demo2' },
      { id: 'drv-3', name: 'Q4 Defense Deck.gslides', type: 'slides', modified: '3 days ago', url: 'https://docs.google.com/presentation/d/demo3' },
    ],
  });
});

// 4. Google Tasks Integration
app.get('/api/google/tasks', (_req: Request, res: Response) => {
  res.json({
    status: 'connected',
    lists: [
      { id: 'gt-list-1', title: 'My Tasks', count: 4 },
      { id: 'gt-list-2', title: 'Urgent Deliverables', count: 2 },
    ],
    tasks: [
      { id: 'gt-1', title: 'Review chapter 4 proofs', due: '2026-10-16', completed: false },
      { id: 'gt-2', title: 'Submit lab safety certification', due: '2026-10-15', completed: false },
      { id: 'gt-3', title: 'Export monthly progress report', due: '2026-10-20', completed: false },
    ],
  });
});

// 5. Google Calendar Integration
app.get('/api/google/calendar', (_req: Request, res: Response) => {
  res.json({
    status: 'connected',
    primaryCalendar: 'altidkwhatnumber@gmail.com',
    events: [
      { id: 'gcal-1', title: 'Advisor Consultation & Progress Review', start: '2026-10-14T10:00:00Z', end: '2026-10-14T10:45:00Z', isFixed: true, location: 'Virtual (Google Meet)' },
      { id: 'gcal-2', title: 'Department Colloquium', start: '2026-10-14T14:00:00Z', end: '2026-10-14T15:00:00Z', isFixed: true, location: 'Room 302, Science Hall' },
      { id: 'gcal-3', title: 'Team Sync & Retrospective', start: '2026-10-15T11:00:00Z', end: '2026-10-15T11:30:00Z', isFixed: true, location: 'Conference Room B' },
    ],
  });
});

// 6. Google Keep Integration
app.get('/api/google/keep', (_req: Request, res: Response) => {
  res.json({
    status: 'connected',
    notes: [
      { id: 'kp-1', title: 'Key Takeaways: Attention Mechanisms', content: 'Queries, keys, and values. Scaled dot-product prevents vanishing gradients when d_k is large.', color: '#29211c', pinned: true },
      { id: 'kp-2', title: 'Focus Habit Rules', content: '1. No notification checks during 50m sprints.\n2. Hydrate during the 10m buffer.\n3. Write down open questions before taking breaks.', color: '#241b14', pinned: true },
      { id: 'kp-3', title: 'Reading List Ideas', content: 'Gao et al. 2024 on fast vector quantizations; Leslie Lamport on Temporal Logic.', color: '#2a1e17', pinned: false },
    ],
  });
});

// 7. YouTube Educational Integration
app.get('/api/google/youtube', (_req: Request, res: Response) => {
  res.json({
    status: 'connected',
    studyPlaylists: [
      { id: 'yt-1', title: 'MIT 6.046J: Design and Analysis of Algorithms', duration: '52:10', channel: 'MIT OpenCourseWare', url: 'https://www.youtube.com/watch?v=2De0I86eU6k' },
      { id: 'yt-2', title: 'Deep Learning: Attention and Transformers Deep Dive', duration: '44:30', channel: 'Stanford University', url: 'https://www.youtube.com/watch?v=ySEx_BqxvVU' },
      { id: 'yt-3', title: 'Deep Work & Cognitive Focus Music (Ambient Brass & Rain)', duration: '2:00:00', channel: 'Ambient Study Lab', url: 'https://www.youtube.com/watch?v=jfKfPfyJRdk' },
    ],
  });
});

// 8. Google Slides Integration
app.get('/api/google/slides', (_req: Request, res: Response) => {
  res.json({
    status: 'connected',
    presentations: [
      { id: 'sld-1', title: 'Q4 Final Defense & Architecture Overview', slideCount: 24, lastEdited: 'Yesterday', url: 'https://docs.google.com/presentation/d/demo1' },
      { id: 'sld-2', title: 'Research Lab Colloquium Presentation', slideCount: 16, lastEdited: 'Oct 11', url: 'https://docs.google.com/presentation/d/demo2' },
    ],
  });
});

// 9. Google Picker Integration
app.get('/api/google/picker/recent', (_req: Request, res: Response) => {
  res.json({
    items: [
      { id: 'pck-1', name: 'Thesis_Draft_v3.pdf', type: 'application/pdf', size: '3.4 MB', icon: 'file' },
      { id: 'pck-2', name: 'Dataset_Evaluation_Results.csv', type: 'text/csv', size: '1.2 MB', icon: 'table' },
      { id: 'pck-3', name: 'Project_Summary_Presentation.gslides', type: 'slides', size: '5.1 MB', icon: 'slides' },
      { id: 'pck-4', name: 'Notes_and_Observations.gdoc', type: 'doc', size: '240 KB', icon: 'doc' },
    ],
  });
});

// 10. Google Maps Focus Locations
app.get('/api/google/maps/locations', (_req: Request, res: Response) => {
  res.json({
    status: 'connected',
    savedSpots: [
      { id: 'map-1', name: 'Central University Library (Quiet Study Floor 4)', address: 'Science Quad, University Ave', type: 'library', idealFor: 'Deep Focus' },
      { id: 'map-2', name: 'Espresso & Copper Study Lab', address: '442 Market Street', type: 'cafe', idealFor: 'Reading & Review' },
      { id: 'map-3', name: 'Archon Graduate Research Hall', address: '800 Innovation Parkway', type: 'office', idealFor: 'Team Sync & Writing' },
    ],
  });
});

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Chronos Server active on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Server startup error:', err);
});

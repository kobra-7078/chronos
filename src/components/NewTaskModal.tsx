import React, { useState } from 'react';
import { X, Sparkles, Plus, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TaskPriority, IntegrationProvider } from '../types';

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewTaskModal: React.FC<NewTaskModalProps> = ({ isOpen, onClose }) => {
  const { addTask, runOptimization } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState(45);
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [source, setSource] = useState<IntegrationProvider | 'manual'>('manual');
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [isDecomposing, setIsDecomposing] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addTask({
      title: title.trim(),
      description: description.trim(),
      dueDate: new Date(dueDate).toISOString(),
      estimatedMinutes: Number(estimatedMinutes),
      remainingMinutes: Number(estimatedMinutes),
      priority,
      status: 'todo',
      sourceIntegration: source,
      category: 'general',
    });

    onClose();
    setTimeout(() => {
      runOptimization();
    }, 150);
  };

  const handleDecompose = async () => {
    if (!title.trim() || isDecomposing) return;
    setIsDecomposing(true);

    try {
      const res = await fetch('/api/ai/decompose-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          totalEstimateHours: estimatedMinutes / 60,
        }),
      });

      const data = await res.json();
      if (data.success && data.decomposition?.subtasks) {
        data.decomposition.subtasks.forEach((st: any) => {
          addTask({
            title: st.title,
            description: `Part of: ${title}`,
            dueDate: new Date(dueDate).toISOString(),
            estimatedMinutes: st.estimatedMinutes || 45,
            remainingMinutes: st.estimatedMinutes || 45,
            priority: st.priority || 'medium',
            status: 'todo',
            sourceIntegration: source,
            category: 'general',
          });
        });
        onClose();
        setTimeout(() => {
          runOptimization();
        }, 150);
      }
    } catch (err) {
      console.warn(err);
    } finally {
      setIsDecomposing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="relative w-full max-w-lg glass-card rounded-3xl p-6 shadow-2xl border border-[var(--theme-border)] text-[var(--theme-text)]">
        <div className="flex items-center justify-between pb-4 border-b border-[var(--theme-border)]">
          <h3 className="text-base font-editorial font-bold text-white">
            Create Plan Item
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-[var(--theme-text-muted)] hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs">
          <div>
            <label className="block font-medium text-[var(--theme-text-muted)] mb-1">
              Title / Goal
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Complete lecture problem set or project brief"
              className="w-full px-3.5 py-2.5 text-xs bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[var(--theme-accent)]"
            />
          </div>

          <div>
            <label className="block font-medium text-[var(--theme-text-muted)] mb-1">
              Notes or Context (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Details or references..."
              className="w-full px-3.5 py-2 text-xs bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[var(--theme-accent)]"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-[var(--theme-text-muted)] mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-2.5 py-2 text-xs bg-black/30 border border-white/10 rounded-xl text-white"
              >
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-[var(--theme-text-muted)] mb-1">
                Duration (Mins)
              </label>
              <input
                type="number"
                min={15}
                step={15}
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                className="w-full px-2.5 py-2 text-xs bg-black/30 border border-white/10 rounded-xl text-white"
              >
              </input>
            </div>

            <div>
              <label className="block font-medium text-[var(--theme-text-muted)] mb-1">
                Target Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-2.5 py-2 text-xs bg-black/30 border border-white/10 rounded-xl text-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-[var(--theme-text-muted)] mb-1">
              Source Link / Integration
            </label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value as any)}
              className="w-full px-2.5 py-2 text-xs bg-black/30 border border-white/10 rounded-xl text-white"
            >
              <option value="manual">Manual Plan Item</option>
              <option value="gmail">Gmail</option>
              <option value="google_classroom">Google Classroom</option>
              <option value="google_drive">Google Drive</option>
              <option value="google_tasks">Google Tasks</option>
              <option value="google_keep">Google Keep</option>
              <option value="youtube">YouTube</option>
              <option value="slides">Google Slides</option>
            </select>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[var(--theme-border)]">
            <button
              type="button"
              onClick={handleDecompose}
              disabled={!title.trim() || isDecomposing}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--theme-border)] text-xs text-[var(--theme-accent-light)] hover:bg-white/5 transition-colors disabled:opacity-40"
              title="Split this objective into manageable 30-45m focus blocks"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isDecomposing ? 'Decomposing...' : 'Decompose Objective'}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 text-[var(--theme-text-muted)] hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[var(--theme-accent)] text-neutral-950 font-bold hover:opacity-90"
              >
                Save Plan Item
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

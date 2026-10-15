import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Check,
  CheckCircle2,
  Clock,
  Sparkles,
  Trash2,
  Layers,
  X,
  Mail,
  GraduationCap,
  Bookmark,
  CheckSquare,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Task, TaskPriority, TaskStatus, IntegrationProvider } from '../../types';

interface PlanViewProps {
  onOpenNewTask: () => void;
}

export const PlanView: React.FC<PlanViewProps> = ({ onOpenNewTask }) => {
  const {
    tasks,
    updateTask,
    deleteTask,
    toggleTaskComplete,
    importIntegrationSample,
    runOptimization,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'board' | 'list'>('board');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  const filteredTasks = React.useMemo(() => {
    const seen = new Set<string>();
    return tasks.filter((t) => {
      if (!t.id || seen.has(t.id)) return false;
      seen.add(t.id);
      const matchesSearch =
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesPriority = filterPriority === 'all' || t.priority === filterPriority;
      return matchesSearch && matchesPriority;
    });
  }, [tasks, searchQuery, filterPriority]);

  const columns: { id: TaskStatus; label: string; count: number }[] = [
    { id: 'todo', label: 'To Do', count: filteredTasks.filter((t) => t.status === 'todo').length },
    { id: 'in_progress', label: 'In Progress', count: filteredTasks.filter((t) => t.status === 'in_progress').length },
    { id: 'completed', label: 'Completed', count: filteredTasks.filter((t) => t.status === 'completed').length },
  ];

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="glass-card p-4 rounded-3xl border border-[var(--theme-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-[var(--theme-text-muted)]" />
            <input
              type="text"
              placeholder="Search plans & tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs bg-black/20 border border-[var(--theme-border)] rounded-xl focus:outline-none focus:border-[var(--theme-accent)] text-white w-48 sm:w-60"
            />
          </div>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-1.5 text-xs bg-black/20 border border-[var(--theme-border)] rounded-xl text-[var(--theme-text)] focus:outline-none focus:border-[var(--theme-accent)]"
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex bg-black/20 p-1 rounded-xl border border-[var(--theme-border)] text-xs">
            <button
              onClick={() => setActiveTab('board')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                activeTab === 'board'
                  ? 'bg-[var(--theme-accent-subtle)] text-[var(--theme-accent-light)]'
                  : 'text-[var(--theme-text-muted)] hover:text-white'
              }`}
            >
              Board
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                activeTab === 'list'
                  ? 'bg-[var(--theme-accent-subtle)] text-[var(--theme-accent-light)]'
                  : 'text-[var(--theme-text-muted)] hover:text-white'
              }`}
            >
              List
            </button>
          </div>

          {/* Quick Import from Google services */}
          <button
            onClick={() => importIntegrationSample('google_classroom')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--theme-border)] bg-black/20 hover:bg-black/40 text-xs text-[var(--theme-text)] font-medium transition-colors"
            title="Import an assignment from Google Classroom"
          >
            <GraduationCap className="w-3.5 h-3.5 text-[var(--theme-accent)]" />
            <span>Classroom</span>
          </button>

          <button
            onClick={() => importIntegrationSample('gmail')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--theme-border)] bg-black/20 hover:bg-black/40 text-xs text-[var(--theme-text)] font-medium transition-colors"
            title="Import task from Gmail"
          >
            <Mail className="w-3.5 h-3.5 text-[var(--theme-accent)]" />
            <span>Gmail</span>
          </button>

          {/* Create Task Button */}
          <button
            onClick={onOpenNewTask}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[var(--theme-accent)] text-neutral-950 font-bold text-xs shadow-md hover:opacity-90 transition-opacity"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>New Plan Item</span>
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      {activeTab === 'board' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {columns.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.id);
            return (
              <div
                key={col.id}
                className="glass-card rounded-3xl p-4 border border-[var(--theme-border)] flex flex-col min-h-[480px]"
              >
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--theme-border)]">
                  <span className="text-xs font-bold uppercase tracking-wider text-white">
                    {col.label}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-black/30 border border-white/5 text-[11px] font-mono text-[var(--theme-text-muted)]">
                    {colTasks.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                  {colTasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-[var(--theme-border)] transition-all shadow-sm space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span
                          className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                            task.priority === 'critical'
                              ? 'bg-rose-950/60 text-rose-300 border-rose-800/40'
                              : task.priority === 'high'
                              ? 'bg-amber-950/60 text-amber-300 border-amber-800/40'
                              : 'bg-white/5 text-[var(--theme-text-muted)] border-white/10'
                          }`}
                        >
                          {task.priority}
                        </span>

                        <button
                          onClick={() => deleteTask(task.id)}
                          className="text-[var(--theme-text-muted)] hover:text-rose-400 p-0.5 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <h4 className="text-xs font-semibold text-white leading-snug">
                        {task.title}
                      </h4>

                      {task.description && (
                        <p className="text-[11px] text-[var(--theme-text-muted)] line-clamp-2 leading-relaxed">
                          {task.description}
                        </p>
                      )}

                      <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-[var(--theme-text-muted)]">
                        <span className="font-mono text-[var(--theme-accent-light)] flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {task.estimatedMinutes}m
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              const nextStatus: TaskStatus =
                                task.status === 'todo'
                                  ? 'in_progress'
                                  : task.status === 'in_progress'
                                  ? 'completed'
                                  : 'todo';
                              updateTask(task.id, { status: nextStatus });
                            }}
                            className="text-[10px] text-[var(--theme-accent-light)] hover:underline"
                          >
                            Move
                          </button>
                          <button
                            onClick={() => toggleTaskComplete(task.id)}
                            className={`p-1 rounded-lg ${
                              task.status === 'completed'
                                ? 'text-emerald-400'
                                : 'text-[var(--theme-text-muted)] hover:text-white'
                            }`}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {colTasks.length === 0 && (
                    <div className="text-center py-14 text-xs text-[var(--theme-text-muted)]">
                      No items in this stage
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {activeTab === 'list' && (
        <div className="glass-card rounded-3xl border border-[var(--theme-border)] overflow-hidden">
          <table className="w-full text-left text-xs text-[var(--theme-text)]">
            <thead className="bg-black/20 border-b border-[var(--theme-border)] text-[var(--theme-text-muted)] uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Source</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredTasks.map((task) => (
                <tr key={task.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => toggleTaskComplete(task.id)}
                      className="p-1 rounded text-[var(--theme-text-muted)] hover:text-emerald-400"
                    >
                      <CheckCircle2
                        className={`w-4 h-4 ${
                          task.status === 'completed' ? 'text-emerald-400' : 'text-white/20'
                        }`}
                      />
                    </button>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-white">{task.title}</div>
                    {task.description && (
                      <div className="text-[11px] text-[var(--theme-text-muted)] line-clamp-1">{task.description}</div>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                        task.priority === 'critical'
                          ? 'bg-rose-950/60 text-rose-300 border-rose-800/40'
                          : task.priority === 'high'
                          ? 'bg-amber-950/60 text-amber-300 border-amber-800/40'
                          : 'bg-white/5 text-[var(--theme-text-muted)] border-white/10'
                      }`}
                    >
                      {task.priority}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[var(--theme-accent-light)]">
                    {task.estimatedMinutes}m
                  </td>
                  <td className="py-3.5 px-4 capitalize text-[var(--theme-text-muted)] font-mono text-[10px]">
                    {task.sourceIntegration?.replace('_', ' ') || 'Manual'}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="p-1 text-[var(--theme-text-muted)] hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredTasks.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-[var(--theme-text-muted)]">
                    No tasks created yet. Click "New Plan Item" above to begin.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

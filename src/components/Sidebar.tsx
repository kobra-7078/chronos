import React from 'react';
import {
  Compass,
  CheckSquare,
  Calendar,
  Sparkles,
  Database,
  SlidersHorizontal,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenOnboarding: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onOpenOnboarding,
}) => {
  const { resetAllData, isSidebarMinimized, toggleSidebar } = useApp();

  const navItems = [
    { id: 'overview', label: 'Overview', icon: Compass, subtext: 'Daily focus & agenda' },
    { id: 'plan', label: 'Plan & Tasks', icon: CheckSquare, subtext: 'Priorities & backlog' },
    { id: 'schedule', label: 'Schedule', icon: Calendar, subtext: 'Protected focus blocks' },
    { id: 'assistant', label: 'Assistant', icon: Sparkles, subtext: 'Contextual reasoning' },
  ];

  return (
    <aside
      className={`glass-card border-r border-[var(--theme-border)] flex flex-col justify-between shrink-0 hidden md:flex h-[calc(100vh-57px)] sticky top-[57px] bg-[var(--theme-surface-subtle)] transition-all duration-300 ease-in-out ${
        isSidebarMinimized ? 'w-16' : 'w-64'
      }`}
    >
      {/* Top Links & Minimize Toggle */}
      <div className="p-3 space-y-1.5">
        <div className="flex items-center justify-between px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--theme-text-muted)]">
          {!isSidebarMinimized && <span>Workspace</span>}
          <button
            onClick={toggleSidebar}
            className={`p-1.5 rounded-xl border border-[var(--theme-border)] hover:bg-black/5 dark:hover:bg-white/5 text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] transition-colors cursor-pointer ${
              isSidebarMinimized ? 'mx-auto' : ''
            }`}
            title={isSidebarMinimized ? 'Expand sidebar' : 'Minimize sidebar'}
          >
            {isSidebarMinimized ? (
              <ChevronRight className="w-3.5 h-3.5" />
            ) : (
              <ChevronLeft className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              title={isSidebarMinimized ? item.label : undefined}
              className={`w-full flex items-center rounded-2xl text-left transition-all cursor-pointer ${
                isSidebarMinimized
                  ? 'justify-center p-2.5'
                  : 'justify-between p-2.5'
              } ${
                isActive
                  ? 'bg-[var(--theme-accent-subtle)] border border-[var(--theme-accent)] text-[var(--theme-text)] font-semibold'
                  : 'text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-black/5 dark:hover:bg-white/[0.04] border border-transparent'
              }`}
            >
              <div className={`flex items-center ${isSidebarMinimized ? 'justify-center' : 'gap-3'}`}>
                <div
                  className={`p-1.5 rounded-xl border transition-colors ${
                    isActive
                      ? 'bg-[var(--theme-accent)] text-neutral-950 border-[var(--theme-accent)] shadow-sm'
                      : 'bg-black/5 dark:bg-white/5 border-[var(--theme-border)] text-[var(--theme-text-muted)]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                {!isSidebarMinimized && (
                  <div>
                    <span className="text-xs font-medium block">{item.label}</span>
                    <span className="text-[10px] text-[var(--theme-text-muted)] block line-clamp-1">
                      {item.subtext}
                    </span>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Bottom Actions */}
      <div className="p-3 border-t border-[var(--theme-border)] space-y-1.5">
        <button
          onClick={onOpenOnboarding}
          title={isSidebarMinimized ? 'Preferences & Goals' : undefined}
          className={`w-full flex items-center rounded-xl text-xs text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-black/5 dark:hover:bg-white/[0.04] transition-colors cursor-pointer ${
            isSidebarMinimized ? 'justify-center p-2' : 'gap-2.5 px-3 py-2'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5 shrink-0" />
          {!isSidebarMinimized && <span>Preferences &amp; Goals</span>}
        </button>

        <button
          onClick={() => {
            if (window.confirm('Reset all saved data and start fresh?')) {
              resetAllData();
            }
          }}
          title={isSidebarMinimized ? 'Reset' : 'Clear local state to start fresh'}
          className={`w-full flex items-center rounded-xl text-xs text-[var(--theme-text-muted)] hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer ${
            isSidebarMinimized ? 'justify-center p-2' : 'gap-2.5 px-3 py-2'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5 shrink-0" />
          {!isSidebarMinimized && <span>Reset</span>}
        </button>
      </div>
    </aside>
  );
};

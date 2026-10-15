/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Chronos - Universal Role-Aware Intelligence, Planning & Scheduling Platform
 * Editorial warm aesthetic with New York and SF Pro typography
 * By-line: created by · anmol//archon.tech (displayed only at the end)
 */

import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { OnboardingScreen } from './components/OnboardingScreen';
import { NewTaskModal } from './components/NewTaskModal';
import { CommandCenterView } from './components/views/CommandCenterView';
import { PlanView } from './components/views/PlanView';
import { ScheduleView } from './components/views/ScheduleView';
import { AIAssistantView } from './components/views/AIAssistantView';
import { IntegrationsView } from './components/views/IntegrationsView';
import {
  Compass,
  CheckSquare,
  Calendar,
  Sparkles,
  Database,
} from 'lucide-react';

const ChronosApp: React.FC = () => {
  const {
    byline,
    isLoggedIn,
    currentPath,
    navigate,
  } = useApp();
  const [currentTab, setCurrentTab] = useState<string>('overview');
  const [isNewTaskOpen, setIsNewTaskOpen] = useState<boolean>(false);

  // Whenever user boots the site, start into /onboarding; only permit /h if signed in
  useEffect(() => {
    if (currentPath !== '/h' && currentPath !== '/onboarding') {
      navigate('/onboarding', true);
    } else if (currentPath === '/h' && !isLoggedIn) {
      navigate('/onboarding', true);
    }
  }, [currentPath, isLoggedIn, navigate]);

  // If path is /onboarding, or if user is NOT logged in: ALWAYS render OnboardingScreen!
  // If signed in, OnboardingScreen displays a prominent "Continue to App" button pointing to /h
  if (currentPath !== '/h' || !isLoggedIn) {
    return <OnboardingScreen isModal={false} />;
  }

  const renderActiveView = () => {
    switch (currentTab) {
      case 'overview':
        return (
          <CommandCenterView
            onNavigateTab={setCurrentTab}
            onOpenNewTask={() => setIsNewTaskOpen(true)}
          />
        );
      case 'plan':
        return <PlanView onOpenNewTask={() => setIsNewTaskOpen(true)} />;
      case 'schedule':
        return <ScheduleView />;
      case 'assistant':
        return <AIAssistantView />;
      case 'integrations':
        return <IntegrationsView />;
      default:
        return (
          <CommandCenterView
            onNavigateTab={setCurrentTab}
            onOpenNewTask={() => setIsNewTaskOpen(true)}
          />
        );
    }
  };

  const mobileNav = [
    { id: 'overview', icon: Compass, label: 'Overview' },
    { id: 'plan', icon: CheckSquare, label: 'Plan' },
    { id: 'schedule', icon: Calendar, label: 'Schedule' },
    { id: 'assistant', icon: Sparkles, label: 'Assistant' },
    { id: 'integrations', icon: Database, label: 'Workspace' },
  ];

  return (
    <div className="min-h-screen bg-[var(--theme-bg)] text-[var(--theme-text)] flex flex-col selection:bg-[var(--theme-accent-subtle)] selection:text-[var(--theme-accent-light)]">
      <Header
        onOpenOnboarding={() => navigate('/onboarding')}
        onOpenNewTask={() => setIsNewTaskOpen(true)}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto pb-16 md:pb-0">
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          onOpenOnboarding={() => navigate('/onboarding')}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {renderActiveView()}

          {/* Byline only at the very end of the page verbatim */}
          <footer className="mt-16 pt-8 pb-4 border-t border-[var(--theme-border)] text-center text-xs text-[var(--theme-text-muted)] font-mono">
            {byline}
          </footer>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 glass-card border-t border-[var(--theme-border)] z-40 px-3 py-2 flex justify-around">
        {mobileNav.map((item) => {
          const isActive = currentTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`flex flex-col items-center gap-1 p-1 text-[10px] ${
                isActive ? 'text-[var(--theme-accent-light)] font-bold' : 'text-[var(--theme-text-muted)]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Task Creation Modal */}
      <NewTaskModal
        isOpen={isNewTaskOpen}
        onClose={() => setIsNewTaskOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <ChronosApp />
    </AppProvider>
  );
}

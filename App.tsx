

import React, { useState, useCallback } from 'react';
import { LanguageProvider, useLanguage } from './i18n';
import type { Project, AnalysisResult } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Sidebar } from './components/layout/Sidebar';
import { WorkspaceView } from './components/WorkspaceView';
import { ProjectView } from './components/ProjectView';
import { SettingsView } from './components/SettingsView';
import { v4 as uuidv4 } from 'uuid';
import { Button } from './components/ui/Button';
import { MenuIcon } from './components/icons/MenuIcon';
import { ThemeProvider } from './context/ThemeProvider';
import { useTheme } from './hooks/useTheme';
// Fix: `useApiKey` is exported from './hooks/useApiKey', not './context/ApiKeyProvider'.
import { ApiKeyProvider } from './context/ApiKeyProvider';
import { useApiKey } from './hooks/useApiKey';

// A simple polyfill for uuid if not available globally
const uuid = { v4: uuidv4 || (() => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)) };

export type View = 'workspace' | 'project' | 'settings' | 'chat';

const MainApp: React.FC = () => {
  const [projects, setProjects] = useLocalStorage<Project[]>('sentiment-analysis-projects', []);
  const [currentView, setCurrentView] = useState<View>('workspace');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { t } = useLanguage();
  const { theme } = useTheme();
  const { apiKey } = useApiKey();

  const handleCreateProject = () => {
    if (!apiKey) {
        alert(t('error.apiKeyRequired'));
        setCurrentView('settings');
        return;
    }
    if (projects.length >= 10) {
      alert(t('error.maxProjects'));
      return;
    }
    const newProject: Project = {
      id: uuid.v4(),
      name: `${t('workspace.newProjectName')} ${projects.length + 1}`,
      inputText: '',
      analysisResult: null,
      createdAt: new Date().toISOString(),
    };
    setProjects(prev => [newProject, ...prev]);
  };

  const handleSelectProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    setCurrentView('project');
  };

  const handleDeleteProject = (projectId: string) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
    if (selectedProjectId === projectId) {
        setSelectedProjectId(null);
        setCurrentView('workspace');
    }
  };

  const handleRenameProject = (projectId: string, newName: string) => {
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, name: newName } : p));
  };
  
  const updateProjectData = (projectId: string, data: { inputText?: string; analysisResult?: AnalysisResult | null }) => {
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, ...data } : p));
  };

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  const renderContent = () => {
    switch (currentView) {
      case 'project':
      case 'chat':
        if (selectedProject) {
          return <ProjectView 
                    key={selectedProject.id} 
                    project={selectedProject} 
                    updateProjectData={updateProjectData} 
                    currentView={currentView}
                    setCurrentView={setCurrentView}
                 />;
        }
        // Fallback if no project is selected
        setCurrentView('workspace');
        return null;
      case 'settings':
        return <SettingsView />;
      case 'workspace':
      default:
        return <WorkspaceView 
                    projects={projects}
                    onCreateProject={handleCreateProject}
                    onSelectProject={handleSelectProject}
                    onDeleteProject={handleDeleteProject}
                    onRenameProject={handleRenameProject}
                    onViewChange={setCurrentView}
                />;
    }
  };

  const gradientBackground = theme === 'gradient' ? {
    background: 'radial-gradient(ellipse 80% 50% at 50% -20%,rgba(120,119,198,0.3), transparent), radial-gradient(ellipse 80% 50% at 50% 120%,rgba(120,119,198,0.3), transparent)',
  } : {};

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans" style={gradientBackground}>
      <Sidebar 
        currentView={currentView} 
        onViewChange={setCurrentView} 
        isProjectSelected={!!selectedProject}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-screen relative">
        <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden absolute top-4 left-4 z-20"
            onClick={() => setIsSidebarOpen(true)}
        >
            <MenuIcon className="h-6 w-6" />
        </Button>
        {renderContent()}
      </main>
    </div>
  );
};

const App: React.FC = () => (
  <LanguageProvider>
    <ThemeProvider>
        <ApiKeyProvider>
            <MainApp />
        </ApiKeyProvider>
    </ThemeProvider>
  </LanguageProvider>
);

export default App;
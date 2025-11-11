

import React, { useState } from 'react';
import type { Project } from '../types';
import { useLanguage } from '../i18n';
import { Button } from './ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { PlusIcon } from './icons/PlusIcon';
import { EditIcon } from './icons/EditIcon';
import { TrashIcon } from './icons/TrashIcon';
import { Modal } from './ui/Modal';
import { BotIcon } from './icons/BotIcon';
import { useApiKey } from '../hooks/useApiKey';
import type { View } from '../App';


interface WorkspaceViewProps {
  projects: Project[];
  onCreateProject: () => void;
  onSelectProject: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
  onRenameProject: (projectId: string, newName: string) => void;
  onViewChange: (view: View) => void;
}

export const WorkspaceView: React.FC<WorkspaceViewProps> = ({
  projects,
  onCreateProject,
  onSelectProject,
  onDeleteProject,
  onRenameProject,
  onViewChange,
}) => {
  const { t } = useLanguage();
  const { apiKey } = useApiKey();
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState<Project | null>(null);
  const [newName, setNewName] = useState('');

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const handleRenameClick = (project: Project) => {
    setRenameTarget(project);
    setNewName(project.name);
    setIsRenameModalOpen(true);
  };

  const handleRenameSubmit = () => {
    if (renameTarget && newName.trim()) {
      onRenameProject(renameTarget.id, newName.trim());
    }
    setIsRenameModalOpen(false);
    setRenameTarget(null);
  };
  
  const handleDeleteClick = (projectId: string) => {
    setDeleteTargetId(projectId);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deleteTargetId) {
      onDeleteProject(deleteTargetId);
    }
    setIsDeleteModalOpen(false);
    setDeleteTargetId(null);
  };
  
  const handleCreateClick = () => {
    if (apiKey) {
      onCreateProject();
    } else {
      alert(t('error.apiKeyRequired'));
      onViewChange('settings');
    }
  };

  return (
    <div className="container mx-auto">
      <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--theme-gradient-start)] to-[var(--theme-gradient-end)]">
            {t('workspace.title')}
          </h1>
          <p className="mt-2 text-md text-muted-foreground">
            {t('workspace.subtitle')}
          </p>
        </div>
        <Button onClick={handleCreateClick} disabled={projects.length >= 10 && !!apiKey} className="w-full sm:w-auto">
          <PlusIcon className="h-4 w-4 mr-2" />
          {t('workspace.createNew')}
        </Button>
      </header>
      
      {projects.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {projects.map(project => (
            <Card key={project.id} className="transition-colors duration-200 flex flex-col bg-card">
              <CardHeader>
                <CardTitle className="text-lg">
                  {project.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between">
                <div>
                    <p className="text-sm text-muted-foreground mb-4 h-10">
                    {project.analysisResult 
                        ? t('workspace.reviewsAnalyzed').replace('{count}', project.analysisResult.detailedBreakdown.length.toString())
                        : t('workspace.noAnalysis')
                    }
                    </p>
                    <p className="text-xs text-muted-foreground/80">
                    {t('workspace.createdOn').replace('{date}', new Date(project.createdAt).toLocaleDateString())}
                    </p>
                </div>

                <div className="mt-4 pt-4 border-t border-border/50 flex justify-between items-center">
                    <Button variant="default" size="sm" onClick={() => onSelectProject(project.id)}>
                        {t('workspace.openProject')}
                    </Button>
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleRenameClick(project)}>
                            <EditIcon className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive/80" onClick={() => handleDeleteClick(project.id)}>
                            <TrashIcon className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 px-6 bg-card/30 rounded-2xl border-2 border-dashed border-border">
            <BotIcon className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-xl font-semibold text-foreground">{t('dashboard.ready.title')}</h3>
            <p className="mt-1 text-muted-foreground">Click '{t('workspace.createNew')}' to get started.</p>
        </div>
      )}

      <Modal isOpen={isRenameModalOpen} onClose={() => setIsRenameModalOpen(false)} title={t('workspace.renameTitle')}>
        <div className="space-y-4">
            <label htmlFor="projectName" className="text-sm font-medium text-popover-foreground">{t('workspace.renameInput')}</label>
            <input
                id="projectName"
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full h-10 bg-background border border-input rounded-md px-3 text-sm"
            />
            <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setIsRenameModalOpen(false)}>{t('workspace.cancelButton')}</Button>
                <Button onClick={handleRenameSubmit}>{t('workspace.renameButton')}</Button>
            </div>
        </div>
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title={t('workspace.confirmDeleteTitle')}>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{t('workspace.confirmDelete')}</p>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>{t('workspace.cancelButton')}</Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>{t('workspace.deleteButton')}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
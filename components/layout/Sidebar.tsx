
import React from 'react';
import { useLanguage } from '../../i18n';
import { BotIcon } from '../icons/BotIcon';
import { LayoutDashboardIcon } from '../icons/LayoutDashboardIcon';
import { MessageSquareIcon } from '../icons/MessageSquareIcon';
import { HomeIcon } from '../icons/HomeIcon';
import { SettingsIcon } from '../icons/SettingsIcon';
import type { View } from '../../App';

interface SidebarProps {
  currentView: View;
  onViewChange: (view: View) => void;
  isProjectSelected: boolean;
  isOpen: boolean;
  onClose: () => void;
}

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
  disabled?: boolean;
}> = ({ icon, label, isActive, onClick, disabled }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors duration-200 text-sm
        ${isActive ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {icon}
      <span className="ml-4 font-medium">{label}</span>
    </button>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, isProjectSelected, isOpen, onClose }) => {
  const { t } = useLanguage();

  const handleViewChange = (view: View) => {
    onViewChange(view);
    onClose(); // Close sidebar on mobile after navigation
  };

  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={`fixed inset-0 bg-black/60 z-30 transition-opacity md:hidden ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      <nav
        className={`fixed top-0 left-0 h-full w-64 bg-background border-r border-border p-4 flex flex-col z-40 transition-transform transform md:relative md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center mb-10">
          <BotIcon className="h-8 w-8" />
          <h2 className="ml-3 text-lg font-bold text-foreground">{t('sidebar.title')}</h2>
        </div>
        <div className="space-y-2 flex-1">
          <NavItem
            icon={<HomeIcon className="h-5 w-5" />}
            label={t('sidebar.workspace')}
            isActive={currentView === 'workspace'}
            onClick={() => handleViewChange('workspace')}
          />
          <NavItem
            icon={<LayoutDashboardIcon className="h-5 w-5" />}
            label={t('sidebar.dashboard')}
            isActive={currentView === 'project'}
            onClick={() => handleViewChange('project')}
            disabled={!isProjectSelected}
          />
          <NavItem
            icon={<MessageSquareIcon className="h-5 w-5" />}
            label={t('sidebar.chat')}
            isActive={currentView === 'chat'}
            onClick={() => handleViewChange('chat')}
            disabled={!isProjectSelected}
          />
        </div>
        <div className="space-y-2">
          <NavItem
              icon={<SettingsIcon className="h-5 w-5" />}
              label={t('sidebar.settings')}
              isActive={currentView === 'settings'}
              onClick={() => handleViewChange('settings')}
          />
        </div>
      </nav>
    </>
  );
};
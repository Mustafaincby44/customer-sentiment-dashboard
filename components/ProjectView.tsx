

import React, { useState, useCallback } from 'react';
import { analyzeCustomerReviews, generateSampleReviews } from '../services/geminiService';
import type { Project, AnalysisResult, SampleGenerationOptions } from '../types';
import { useLanguage } from '../i18n';
import { useApiKey } from '../hooks/useApiKey';

import WordCloud from './WordCloud';
import SummaryCard from './SummaryCard';
import LanguageSwitcher from './LanguageSwitcher';
import SampleGenerator from './SampleGenerator';
import CategoryScores from './CategoryScores';
import OverallScore from './OverallScore';
import ReviewBreakdown from './ReviewBreakdown';
import { ActionableInsights } from './ActionableInsights';

import { Button } from './ui/Button';
import { Textarea } from './ui/Textarea';
import { Switch } from './ui/Switch';
import { Label } from './ui/Label';
import { BotIcon } from './icons/BotIcon';
import { CloudIcon } from './icons/CloudIcon';
import { ChatView } from './ChatView';
import type { View } from '../App';
import { KeyIcon } from './icons/KeyIcon';


interface ProjectViewProps {
    project: Project;
    updateProjectData: (projectId: string, data: { inputText?: string; analysisResult?: AnalysisResult | null }) => void;
    currentView: View;
    setCurrentView: (view: View) => void;
}

const ApiKeyRequired: React.FC<{ onViewChange: (view: View) => void }> = ({ onViewChange }) => {
    const { t } = useLanguage();
    return (
        <div className="text-center py-16 px-6 bg-card/30 rounded-2xl border-2 border-dashed border-border">
            <KeyIcon className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-xl font-semibold text-foreground">{t('error.apiKeyRequiredTitle')}</h3>
            <p className="mt-1 text-muted-foreground">{t('error.apiKeyRequiredDesc')}</p>
            <Button onClick={() => onViewChange('settings')} className="mt-6">
                {t('sidebar.settings')}
            </Button>
        </div>
    );
};

export const ProjectView: React.FC<ProjectViewProps> = ({ project, updateProjectData, currentView, setCurrentView }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingSamples, setIsGeneratingSamples] = useState(false);
  const [loadingStage, setLoadingStage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isThinkingMode, setIsThinkingMode] = useState(false);
  const { t, language } = useLanguage();
  const { apiKey } = useApiKey();

  const handleAnalyze = useCallback(async () => {
    if (!apiKey) {
        setError(t('error.apiKeyRequired'));
        setCurrentView('settings');
        return;
    }
    if (!project.inputText.trim()) {
      setError(t('error.pasteReviews'));
      return;
    }
    setIsLoading(true);
    setError(null);
    updateProjectData(project.id, { analysisResult: null });
    setCurrentView('project');

    try {
      setLoadingStage(t('loading.stage1'));
      const result = await analyzeCustomerReviews(project.inputText, isThinkingMode, language, apiKey);
      setLoadingStage(t('loading.stage2'));
      updateProjectData(project.id, { analysisResult: result });

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : t('error.unknown'));
    } finally {
      setIsLoading(false);
      setLoadingStage('');
    }
  }, [project.id, project.inputText, isThinkingMode, t, language, updateProjectData, setCurrentView, apiKey]);

  const handleGenerateSamples = useCallback(async (options: SampleGenerationOptions) => {
    if (!apiKey) {
        setError(t('error.apiKeyRequired'));
        setCurrentView('settings');
        return;
    }
    setIsGeneratingSamples(true);
    setError(null);
    updateProjectData(project.id, { inputText: '', analysisResult: null });
    try {
      const samples = await generateSampleReviews(options, language, apiKey);
      updateProjectData(project.id, { inputText: samples });
    } catch (err) {
      console.error('Failed to generate samples:', err);
      setError(err instanceof Error ? err.message : t('error.unknown'));
    } finally {
      setIsGeneratingSamples(false);
    }
  }, [project.id, language, t, updateProjectData, apiKey, setCurrentView]);
  
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateProjectData(project.id, { inputText: e.target.value });
  };

  const renderDashboard = () => (
    <div className="grid gap-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
                <SummaryCard icon={<BotIcon />} title={t('project.summary.title')} description={t('project.summary.description')} summary={project.analysisResult!.executiveSummary} />
            </div>
            <OverallScore score={project.analysisResult!.overallScore} />
        </div>

      {project.analysisResult && project.analysisResult.actionableInsights.length > 0 && (
        <ActionableInsights insights={project.analysisResult.actionableInsights} />
      )}
      
      <CategoryScores scores={project.analysisResult!.categoryScores} />

      <ReviewBreakdown breakdown={project.analysisResult!.detailedBreakdown} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <WordCloud icon={<CloudIcon />} title={t('project.wordClouds.praises')} words={project.analysisResult!.praises} />
        <WordCloud icon={<CloudIcon />} title={t('project.wordClouds.complaints')} words={project.analysisResult!.complaints} />
      </div>
    </div>
  );

  const isActionDisabled = isLoading || isGeneratingSamples;
  
  if (!apiKey) {
    return (
        <div className="container mx-auto h-full flex flex-col">
            <header className="mb-8 flex justify-between items-start">
            <div>
                <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--theme-gradient-start)] to-[var(--theme-gradient-end)]">
                {project.name}
                </h1>
            </div>
            <LanguageSwitcher />
            </header>
            <div className="flex-1 overflow-y-auto pb-8">
                <ApiKeyRequired onViewChange={setCurrentView} />
            </div>
        </div>
    );
  }

  return (
    <div className="container mx-auto h-full flex flex-col">
        <header className="mb-8 flex justify-between items-start">
        <div>
            <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--theme-gradient-start)] to-[var(--theme-gradient-end)]">
            {project.name}
            </h1>
            <p className="mt-2 text-md text-muted-foreground">
            {t('app.subtitle')}
            </p>
        </div>
        <LanguageSwitcher />
        </header>

        {/* Main scrollable container for everything below the header */}
        <div className="flex-1 overflow-y-auto pb-8">
            {currentView !== 'chat' && (
                <div className="bg-card/50 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-border mb-8">
                    <Textarea
                        value={project.inputText}
                        onChange={handleTextChange}
                        placeholder={t('project.textarea.placeholder')}
                        className="min-h-[200px] text-base"
                        disabled={isActionDisabled}
                    />
                    <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <SampleGenerator onGenerate={handleGenerateSamples} isLoading={isGeneratingSamples} />
                        <div className="flex items-center space-x-3 self-end sm:self-center">
                        <Switch id="thinking-mode" checked={isThinkingMode} onCheckedChange={setIsThinkingMode} disabled={isActionDisabled} />
                        <Label htmlFor="thinking-mode" className="flex flex-col cursor-pointer">
                            <span className="font-medium text-foreground">{t('project.deepThinking.title')}</span>
                            <span className="text-xs text-muted-foreground">{t('project.deepThinking.description')}</span>
                        </Label>
                        </div>
                    </div>
                    <div className="mt-4 border-t border-border pt-4 flex justify-end">
                        <Button onClick={handleAnalyze} disabled={isActionDisabled || !project.inputText.trim()} className="w-full sm:w-auto">
                            {isLoading ? t('project.analyzingButton') : t('project.analyzeButton')}
                        </Button>
                    </div>
                </div>
            )}

            {error && (
            <div className="mb-6 bg-destructive/20 border border-destructive/50 text-destructive px-4 py-3 rounded-lg text-center">
                <strong>{t('error.title')}:</strong> {error}
            </div>
            )}

            {isLoading || isGeneratingSamples ? (
                <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-lg">{isLoading ? loadingStage : t('sampleGenerator.generating')}...</p>
                </div>
            ) : project.analysisResult ? (
                currentView === 'project' ? renderDashboard() : <ChatView project={project} />
            ) : (
                currentView !== 'chat' && (
                <div className="text-center py-16 px-6 bg-card/30 rounded-2xl border-2 border-dashed border-border">
                    <BotIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-xl font-semibold text-foreground">{t('project.ready.title')}</h3>
                    <p className="mt-1 text-muted-foreground">{t('project.ready.description')}</p>
                </div>
                )
            )}
        </div>
    </div>
  );
};
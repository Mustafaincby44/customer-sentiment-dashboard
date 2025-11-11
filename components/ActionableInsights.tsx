
import React from 'react';
import type { ActionableInsight } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';
import { LightbulbIcon } from './icons/LightbulbIcon';
import { useLanguage } from '../i18n';

interface ActionableInsightsProps {
  insights: ActionableInsight[];
}

export const ActionableInsights: React.FC<ActionableInsightsProps> = ({ insights }) => {
  const { t } = useLanguage();

  if (!insights || insights.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <LightbulbIcon />
          {t('project.actionableInsights.title')}
        </CardTitle>
        <CardDescription>{t('project.actionableInsights.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <div key={index} className="p-4 bg-accent/50 rounded-lg border border-border">
              <h4 className="font-semibold text-foreground mb-1">{insight.title}</h4>
              <p className="text-sm text-muted-foreground">{insight.description}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

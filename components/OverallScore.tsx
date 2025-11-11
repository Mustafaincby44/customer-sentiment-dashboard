
import React from 'react';
import type { OverallScore as OverallScoreType } from '../types';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from './ui/Card';
import { BotIcon } from './icons/BotIcon';
import { useLanguage } from '../i18n';

interface OverallScoreProps {
  score: OverallScoreType;
}

const getScoreColor = (score: number) => {
    if (score > 75) return 'text-[hsl(var(--chart-positive))]';
    if (score < 40) return 'text-[hsl(var(--chart-negative))]';
    return 'text-amber-400'; // Amber is a good neutral indicator
}

const OverallScore: React.FC<OverallScoreProps> = ({ score }) => {
    const { t } = useLanguage();
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <BotIcon />
          {t('project.overallScore.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <div className={`text-5xl sm:text-6xl font-bold ${getScoreColor(score.score)}`}>
            {score.score}
            <span className="text-3xl text-muted-foreground">/100</span>
        </div>
        <p className="mt-2 text-muted-foreground">{score.summary}</p>
      </CardContent>
    </Card>
  );
};

export default OverallScore;

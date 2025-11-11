
import React from 'react';
import type { CategoryScore } from '../types';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from './ui/Card';
import { TagsIcon } from './icons/TagsIcon';
import { useLanguage } from '../i18n';

interface CategoryScoresProps {
  scores: CategoryScore[];
}

const getSentimentEmoji = (score: number) => {
  if (score > 75) return '😊';
  if (score < 40) return '😠';
  return '😐';
};

const getCategoryColorVar = (category: string) => {
    switch (category) {
        case 'Product Quality': return 'hsl(var(--cat-quality))';
        case 'Price & Value': return 'hsl(var(--cat-price))';
        case 'Customer Service': return 'hsl(var(--cat-service))';
        case 'Logistics': return 'hsl(var(--cat-logistics))';
        default: return 'hsl(var(--muted))';
    }
}

export const CategoryScores: React.FC<CategoryScoresProps> = ({ scores }) => {
    const { t } = useLanguage();
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <TagsIcon />
          {t('project.categoryAnalysis.title')}
        </CardTitle>
        <CardDescription>{t('project.categoryAnalysis.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {scores.map((item, index) => (
                <div key={index} className="p-4 rounded-lg border-l-4 bg-accent" style={{borderColor: getCategoryColorVar(item.category)}}>
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold text-foreground">{item.category}</h4>
                        <span className="text-2xl">{getSentimentEmoji(item.score)}</span>
                    </div>
                    <div className="flex justify-between items-baseline">
                        <span className="text-3xl font-bold text-foreground">{item.score}<span className="text-lg text-muted-foreground">/100</span></span>
                        <span className="text-sm text-muted-foreground">{t('project.categoryAnalysis.weight')}: {(item.weight * 100).toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5 mt-3">
                        <div
                            style={{ width: `${item.score}%`, height: '100%', borderRadius: 'inherit', backgroundColor: getCategoryColorVar(item.category) }}
                        ></div>
                    </div>
                </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryScores;

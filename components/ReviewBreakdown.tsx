
import React, { useState, useMemo } from 'react';
import type { ReviewAnalysisDetail, Highlight } from '../types';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from './ui/Card';
import { TableIcon } from './icons/TableIcon';
import { useLanguage } from '../i18n';

interface ReviewBreakdownProps {
  breakdown: ReviewAnalysisDetail[];
}

const getSentimentClasses = (sentiment: 'Positive' | 'Negative' | 'Neutral') => {
  switch (sentiment) {
    case 'Positive': return 'bg-[hsl(var(--chart-positive))] text-[hsl(var(--chart-positive))] border-[hsl(var(--chart-positive))]';
    case 'Negative': return 'bg-[hsl(var(--chart-negative))] text-[hsl(var(--chart-negative))] border-[hsl(var(--chart-negative))]';
    case 'Neutral': return 'bg-[hsl(var(--chart-neutral))] text-[hsl(var(--chart-neutral))] border-[hsl(var(--chart-neutral))]';
  }
};

const getCategoryColor = (category: Highlight['category']) => {
    switch (category) {
        case 'Product Quality': return 'bg-[hsl(var(--cat-quality))]';
        case 'Price & Value': return 'bg-[hsl(var(--cat-price))]';
        case 'Customer Service': return 'bg-[hsl(var(--cat-service))]';
        case 'Logistics': return 'bg-[hsl(var(--cat-logistics))]';
        default: return 'bg-muted';
    }
}

const HighlightedText: React.FC<{ text: string; highlights: Highlight[] }> = ({ text, highlights }) => {
    if (!highlights || highlights.length === 0) {
      return <>{text}</>;
    }
  
    // Create a regex to find all highlighted phrases
    const regex = new RegExp(`(${highlights.map(h => h.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
    const parts = text.split(regex);
  
    return (
      <span>
        {parts.map((part, i) => {
          const highlight = highlights.find(h => h.text.toLowerCase() === part.toLowerCase());
          return highlight ? (
            <span key={i} className={`rounded px-1 ${getCategoryColor(highlight.category)}/30`}>
              {part}
            </span>
          ) : (
            <span key={i}>{part}</span>
          );
        })}
      </span>
    );
  };


export const ReviewBreakdown: React.FC<ReviewBreakdownProps> = ({ breakdown }) => {
    const { t } = useLanguage();
    const [filter, setFilter] = useState('');
    const [hoveredHighlights, setHoveredHighlights] = useState<Highlight[]>([]);

    const filteredBreakdown = useMemo(() => {
        if (!filter) return breakdown;
        return breakdown.filter(item => item.reviewText.toLowerCase().includes(filter.toLowerCase()));
    }, [breakdown, filter]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <TableIcon />
          {t('project.reviewBreakdown.title')}
        </CardTitle>
        <CardDescription>{t('project.reviewBreakdown.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <input
            type="text"
            placeholder={t('project.reviewBreakdown.filter')}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full h-10 bg-background border border-input rounded-md px-3 text-sm mb-4"
        />
        <div className="overflow-x-auto max-h-[500px] overflow-y-auto pr-2">
            <table className="w-full text-sm text-left text-muted-foreground">
                <thead className="text-xs text-foreground/80 uppercase bg-card/80 backdrop-blur-sm sticky top-0 hidden md:table-header-group">
                    <tr>
                        <th scope="col" className="px-6 py-3 w-3/5">{t('project.reviewBreakdown.review')}</th>
                        <th scope="col" className="px-6 py-3 text-center">{t('project.reviewBreakdown.sentiment')}</th>
                        <th scope="col" className="px-6 py-3 text-center">{t('project.reviewBreakdown.satisfaction')}</th>
                    </tr>
                </thead>
                <tbody className="block md:table-row-group">
                    {filteredBreakdown.map((item, index) => (
                        <tr key={index} 
                            className="block md:table-row bg-card/40 border-b border-border mb-4 md:mb-0"
                            onMouseEnter={() => setHoveredHighlights(item.highlights)}
                            onMouseLeave={() => setHoveredHighlights([])}
                        >
                            <td className="block md:table-cell p-4 md:px-6 md:py-4 text-foreground/90 md:w-3/5">
                                <div className="font-bold md:hidden mb-2 text-foreground/80 uppercase text-xs">{t('project.reviewBreakdown.review')}</div>
                                <HighlightedText text={item.reviewText} highlights={hoveredHighlights} />
                            </td>
                            <td className="block md:table-cell p-4 md:px-6 md:py-4 text-left md:text-center">
                                <div className="font-bold md:hidden mb-2 text-foreground/80 uppercase text-xs">{t('project.reviewBreakdown.sentiment')}</div>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full border bg-opacity-10 border-opacity-30 ${getSentimentClasses(item.sentiment)}`}>
                                    {item.sentiment}
                                </span>
                            </td>
                            <td className="block md:table-cell p-4 md:px-6 md:py-4 text-left md:text-center font-semibold text-lg text-foreground">
                                <div className="font-bold md:hidden mb-2 text-foreground/80 uppercase text-xs">{t('project.reviewBreakdown.satisfaction')}</div>
                                {item.satisfactionScore}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReviewBreakdown;

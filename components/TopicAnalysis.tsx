
import React from 'react';
import type { Topic } from '../types';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from './ui/Card';

interface TopicAnalysisProps {
  data: Topic[];
  title: string;
  description: string;
  icon: React.ReactNode;
}

const getSentimentColor = (sentiment: number) => {
  if (sentiment > 0.2) return 'var(--chart-positive)';
  if (sentiment < -0.2) return 'var(--chart-negative)';
  return 'var(--chart-neutral)';
};

const getSentimentTextColor = (sentiment: number) => {
    if (sentiment > 0.2) return 'text-[hsl(var(--chart-positive))]';
    if (sentiment < -0.2) return 'text-[hsl(var(--chart-negative))]';
    return 'text-[hsl(var(--chart-neutral))]';
}

const TopicAnalysis: React.FC<TopicAnalysisProps> = ({ data, title, icon, description }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {icon}
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {data && data.length > 0 ? (
            <div className="space-y-4">
            {data.sort((a,b) => b.count - a.count).map((topic, index) => (
                <div key={index} className="flex items-center justify-between gap-4 p-3 bg-accent rounded-lg">
                    <div className="flex-1">
                        <span className="font-semibold text-foreground">{topic.topic}</span>
                    </div>
                    <div className="flex items-center gap-3 w-48">
                        <div className="w-full bg-muted rounded-full h-2.5">
                            <div
                                className={`h-2.5 rounded-full`}
                                style={{ 
                                    backgroundColor: `hsl(${getSentimentColor(topic.sentiment)})`,
                                    width: `${(topic.sentiment + 1) / 2 * 100}%` 
                                }}
                            ></div>
                        </div>
                         <span className={`text-sm font-bold w-12 text-right ${getSentimentTextColor(topic.sentiment)}`}>
                             {topic.sentiment.toFixed(2)}
                         </span>
                    </div>
                    <div className="w-24 text-right">
                        <span className="text-sm text-muted-foreground">{topic.count} mentions</span>
                    </div>
                </div>
            ))}
            </div>
        ) : (
            <div className="text-center py-8 text-muted-foreground">
                <p>No specific topics could be identified from the provided reviews.</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TopicAnalysis;
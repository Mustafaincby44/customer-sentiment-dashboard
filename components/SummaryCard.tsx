
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from './ui/Card';

interface SummaryCardProps {
  summary: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

// A simple function to parse basic markdown-like text
const parseSummary = (text: string) => {
    return text.split('\n').filter(line => line.trim() !== '').map((line, index) => {
      line = line.trim();
      if (line.startsWith('### ') || line.startsWith('## ')) {
        return <h3 key={index} className="text-lg font-semibold text-primary mt-4 mb-2">{line.replace(/### |## /g, '')}</h3>;
      }
       if (line.startsWith('**') && line.endsWith('**')) {
         return <h3 key={index} className="text-lg font-semibold text-primary mt-4 mb-2">{line.replace(/\*\*/g, '')}</h3>;
       }
      if (line.startsWith('* ') || line.startsWith('- ')) {
        return <li key={index} className="ml-5 list-disc text-muted-foreground">{line.substring(2)}</li>;
      }
      return <p key={index} className="text-muted-foreground mb-2 leading-relaxed">{line}</p>;
    });
  };

const SummaryCard: React.FC<SummaryCardProps> = ({ summary, title, icon, description }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {icon}
          {title}
        </CardTitle>
        <CardDescription>
            {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="prose prose-invert max-w-none prose-p:text-muted-foreground prose-headings:text-primary">
            {parseSummary(summary)}
        </div>
      </CardContent>
    </Card>
  );
};

export default SummaryCard;
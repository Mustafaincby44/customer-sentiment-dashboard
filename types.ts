

import type { Chat } from '@google/genai';

export type Theme = 'dark' | 'light' | 'gradient' | 'corporate' | 'fun' | 'high-contrast';

export interface Project {
  id: string;
  name: string;
  inputText: string;
  analysisResult: AnalysisResult | null;
  createdAt: string;
  chatSession?: Chat;
}

export interface ReviewAnalysisDetail {
  reviewText: string;
  sentiment: 'Positive' | 'Negative' | 'Neutral';
  satisfactionScore: number; // 0-100
  highlights: Highlight[];
}

export interface Highlight {
  text: string;
  category: 'Product Quality' | 'Price & Value' | 'Customer Service' | 'Logistics';
}

export interface CategoryScore {
  category: 'Product Quality' | 'Price & Value' | 'Customer Service' | 'Logistics';
  score: number; // 0-100
  weight: number; // 0-1, sum of weights is 1
}

export interface OverallScore {
    score: number; // 0-100
    summary: string;
}

export interface ActionableInsight {
  title: string;
  description: string;
}

export interface AnalysisResult {
  overallScore: OverallScore;
  categoryScores: CategoryScore[];
  detailedBreakdown: ReviewAnalysisDetail[];
  executiveSummary: string; // The long-form markdown summary
  actionableInsights: ActionableInsight[];
  praises: WordCloudWord[];
  complaints: WordCloudWord[];
}

export interface WordCloudWord {
  text: string;
  value: number;
}

export interface ChatMessage {
    role: 'user' | 'model' | 'function';
    content: string;
}

export interface SampleGenerationOptions {
    topic: string;
    count: number;
    sentimentMix: 'balanced' | 'positive' | 'negative';
}

export type ApiKeyContextType = {
    apiKey: string | null;
    setApiKey: (key: string | null) => void;
};

// Fix: Add missing type definitions to resolve TypeScript errors.
export interface SentimentDataPoint {
  reviewNumber: number;
  sentiment: number;
}

export interface SentimentDistribution {
  positive: number;
  neutral: number;
  negative: number;
}

export interface Topic {
  topic: string;
  count: number;
  sentiment: number;
}
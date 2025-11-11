

import { GoogleGenAI, Type, Chat, FunctionDeclaration } from '@google/genai';
import type { AnalysisResult, SampleGenerationOptions, Project, ActionableInsight } from '../types';

const getAiClient = (apiKey: string) => {
    if (!apiKey) {
      throw new Error("API Key is not provided.");
    }
    return new GoogleGenAI({ apiKey });
};

const analysisSchema = {
    type: Type.OBJECT,
    properties: {
        overallScore: {
            type: Type.OBJECT,
            properties: {
                score: { type: Type.INTEGER, description: "A single, overall satisfaction score from 0 to 100, calculated based on all reviews and weighted category importance." },
                summary: { type: Type.STRING, description: "A very brief, one-sentence summary of the overall sentiment." },
            },
            required: ['score', 'summary'],
        },
        categoryScores: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    category: { type: Type.STRING, enum: ['Product Quality', 'Price & Value', 'Customer Service', 'Logistics'] },
                    score: { type: Type.INTEGER, description: "Satisfaction score for this category (0-100)." },
                    weight: { type: Type.NUMBER, description: "The importance/weight of this category based on the reviews' content (0.0 to 1.0). The sum of all weights should be 1.0." },
                },
                required: ['category', 'score', 'weight'],
            },
        },
        detailedBreakdown: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    reviewText: { type: Type.STRING },
                    sentiment: { type: Type.STRING, enum: ['Positive', 'Negative', 'Neutral'] },
                    satisfactionScore: { type: Type.INTEGER, description: "Score for this specific review (0-100)." },
                    highlights: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                text: { type: Type.STRING, description: "The exact phrase from the review." },
                                category: { type: Type.STRING, enum: ['Product Quality', 'Price & Value', 'Customer Service', 'Logistics'] },
                            },
                            required: ['text', 'category'],
                        }
                    }
                },
                required: ['reviewText', 'sentiment', 'satisfactionScore', 'highlights'],
            },
        },
        wordClouds: {
            type: Type.OBJECT,
            properties: {
                praises: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { text: { type: Type.STRING }, value: { type: Type.INTEGER } }, required: ['text', 'value'] } },
                complaints: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { text: { type: Type.STRING }, value: { type: Type.INTEGER } }, required: ['text', 'value'] } },
            },
            required: ['praises', 'complaints'],
        },
    },
    required: ['overallScore', 'categoryScores', 'detailedBreakdown', 'wordClouds'],
};


async function getFullAnalysis(reviews: string, apiKey: string) {
  const ai = getAiClient(apiKey);
  const prompt = `
    Analyze the following batch of customer reviews based on four key categories: Product Quality, Price & Value, Customer Service, and Logistics (shipping, delivery, packaging). For your response, you MUST provide a single JSON object matching the provided schema. Do not include any text, markdown, or any characters outside of the JSON object.

    Tasks:
    1.  **Overall Score**: Calculate a single, weighted overall satisfaction score from 0-100 and provide a one-sentence summary.
    2.  **Category Scores**: For each of the four categories, provide a score (0-100) and a weight (0.0-1.0) representing its importance based on how frequently and strongly it's mentioned in the reviews. The sum of all weights must be 1.0.
    3.  **Detailed Breakdown**: For each individual review, provide the original text, its sentiment (Positive, Negative, Neutral), a satisfaction score (0-100), and an array of 'highlights'. Each highlight must contain the exact text phrase from the review and which of the four categories it relates to.
    4.  **Word Clouds**: Identify the top 20 most frequent significant words/phrases for praises and complaints. Provide frequency counts.

    Reviews:
    ---
    ${reviews}
    ---
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: analysisSchema,
    },
  });

  try {
    const parsed = JSON.parse(response.text);
    return parsed;
  } catch (e) {
    console.error("Failed to parse analysis JSON:", response.text);
    throw new Error("The AI returned an invalid format for the analysis data. Please try again.");
  }
}

async function getExecutiveSummary(reviews: string, isThinkingMode: boolean, languageCode: string, apiKey: string): Promise<string> {
  const ai = getAiClient(apiKey);
  const model = isThinkingMode ? 'gemini-2.5-pro' : 'gemini-2.5-flash';
  const config = isThinkingMode ? { thinkingConfig: { thinkingBudget: 32768 } } : {};
  const languageMap: { [key: string]: string } = {
    en: 'English',
    tr: 'Turkish',
    ru: 'Russian',
    de: 'German',
    fr: 'French',
    es: 'Spanish',
    it: 'Italian',
    pt: 'Portuguese',
    pl: 'Polish',
    zh: 'Chinese',
    ja: 'Japanese',
    ar: 'Arabic',
  };
  const languageName = languageMap[languageCode] || 'English';

  const prompt = `
    Based on the following customer reviews, act as a senior business analyst.
    Generate a concise executive summary written in ${languageName}.
    The summary MUST identify the top 3 most critical and actionable areas for improvement for the business, referencing categories like Product Quality, Price, Customer Service, or Logistics.
    For each area, briefly explain the problem identified from the reviews and suggest a concrete next step.
    Format your response in markdown with clear headings for each of the 3 areas. Be insightful and strategic. The entire response must be in ${languageName}.

    Reviews:
    ---
    ${reviews}
    ---
  `;

  const response = await ai.models.generateContent({
    model: model,
    contents: prompt,
    config: config
  });
  
  return response.text;
}

async function getActionableInsights(analysisData: Omit<AnalysisResult, 'actionableInsights'>, languageCode: string, apiKey: string): Promise<ActionableInsight[]> {
    const ai = getAiClient(apiKey);
    const languageMap: { [key: string]: string } = {
      en: 'English',
      tr: 'Turkish',
      ru: 'Russian',
      de: 'German',
      fr: 'French',
      es: 'Spanish',
      it: 'Italian',
      pt: 'Portuguese',
      pl: 'Polish',
      zh: 'Chinese',
      ja: 'Japanese',
      ar: 'Arabic',
    };
    const languageName = languageMap[languageCode] || 'English';
  
    const prompt = `
      Based on the following sentiment analysis data, act as a senior business consultant.
      Your task is to provide a list of 2-3 highly specific, actionable recommendations for the business.
      Each recommendation should have a short, impactful "title" and a "description" explaining the reasoning and the suggested action.
      The entire response, including titles and descriptions, MUST be in ${languageName}.
      Focus on the areas with the lowest scores or highest negative feedback concentration.
  
      Analysis Data:
      ---
      Overall Score: ${analysisData.overallScore.score}/100
      Executive Summary: ${analysisData.executiveSummary}
      Category Scores:
      ${analysisData.categoryScores.map(c => `- ${c.category}: ${c.score}/100 (Weight: ${(c.weight * 100).toFixed(0)}%)`).join('\n')}
      ---
    `;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING }
            },
            required: ['title', 'description']
          }
        }
      }
    });
  
    try {
      const parsed = JSON.parse(response.text);
      return parsed;
    } catch (e) {
      console.error("Failed to parse actionable insights JSON:", response.text);
      return []; // Return empty array on failure
    }
}

export async function analyzeCustomerReviews(reviews: string, isThinkingMode: boolean, languageCode: string, apiKey: string): Promise<AnalysisResult> {
    const [analysisData, executiveSummary] = await Promise.all([
      getFullAnalysis(reviews, apiKey),
      getExecutiveSummary(reviews, isThinkingMode, languageCode, apiKey),
    ]);

    const partialResult = {
        overallScore: analysisData.overallScore,
        categoryScores: analysisData.categoryScores,
        detailedBreakdown: analysisData.detailedBreakdown,
        praises: analysisData.wordClouds.praises,
        complaints: analysisData.wordClouds.complaints,
        executiveSummary: executiveSummary,
    };

    const insights = await getActionableInsights(partialResult, languageCode, apiKey);
  
    return { ...partialResult, actionableInsights: insights };
}

// Function Declarations for AI Chat
const findReviewsFunction: FunctionDeclaration = {
    name: 'findReviews',
    description: 'Finds and returns specific reviews from the analysis based on sentiment or keywords.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        sentiment: { type: Type.STRING, enum: ['Positive', 'Negative', 'Neutral'], description: "Filter reviews by sentiment." },
        keywords: { type: Type.STRING, description: "A comma-separated list of keywords to search for in the reviews." },
      },
      required: [],
    },
};

const generateReportFunction: FunctionDeclaration = {
    name: 'generateReport',
    description: 'Generates a concise summary report of the entire analysis.',
    parameters: {
        type: Type.OBJECT,
        properties: {},
    },
};

export function createChat(project: Project, apiKey: string): Chat {
    const ai = getAiClient(apiKey);
    const context = `
    Executive Summary: ${project.analysisResult?.executiveSummary}
    Overall Score: ${project.analysisResult?.overallScore.score}/100
    Category Scores: ${project.analysisResult?.categoryScores.map(c => `${c.category}: ${c.score}/100`).join(', ')}
    `;
    const systemInstruction = `You are an expert business analyst AI. A user is asking about an analysis project named "${project.name}".
    Your role is to answer their follow-up questions about the data and perform tasks for them.
    You have been provided with the key data points from the report. Use this as your primary context.
    You have access to tools to find specific reviews or generate reports. If the user asks you to perform a task, use these tools.
    
    Initial Data:
    ---
    ${context}
    ---
    `;

    return ai.chats.create({
        model: 'gemini-2.5-pro', // Using pro for better function calling
        config: {
          systemInstruction: systemInstruction,
          tools: [{ functionDeclarations: [findReviewsFunction, generateReportFunction] }],
        },
      });
}

export async function generateSampleReviews(options: SampleGenerationOptions, languageCode: string, apiKey: string): Promise<string> {
    const ai = getAiClient(apiKey);
    const { topic, count, sentimentMix } = options;
    const languageMap: { [key: string]: string } = {
      en: 'English',
      tr: 'Turkish',
      ru: 'Russian',
      de: 'German',
      fr: 'French',
      es: 'Spanish',
      it: 'Italian',
      pt: 'Portuguese',
      pl: 'Polish',
      zh: 'Chinese',
      ja: 'Japanese',
      ar: 'Arabic',
    };
    const languageName = languageMap[languageCode] || 'English';

    const sentimentInstructions: { [key: string]: string } = {
        balanced: 'a balanced mix of positive, negative, and neutral sentiments.',
        positive: 'a majority of positive sentiments, with a few neutral or negative ones.',
        negative: 'a majority of negative sentiments, with a few neutral or positive ones.',
    }
  
    const prompt = `
      Generate a realistic-looking batch of exactly ${count} customer reviews for a generic "${topic}".
      The reviews MUST be written in ${languageName}.
      The reviews should have ${sentimentInstructions[sentimentMix]}
      They should mention specific features or aspects relevant to a ${topic}, touching upon things like product quality, price, customer service, and delivery.
      Each review must be on a new line. Do not add any extra titles, introductory text, markdown, or any other formatting. Just output the raw reviews, with each review on its own line.
    `;
  
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
  
    return response.text.trim();
  }
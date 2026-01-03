
import { GoogleGenAI, Type } from "@google/genai";
import { ContentRow, AnalysisResult } from "../types";

export const analyzeEditorialData = async (data: ContentRow[]): Promise<AnalysisResult> => {
  // Create instance inside function right before the API call to ensure it uses the most up-to-date API key
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Use high-density pipe-delimited string to maximize context window for large datasets
  const dataString = data.map((row, index) => 
    `${index + 1}|${row.headline.replace(/\|/g, ' ')}|${row.totalUsers}`
  ).join('\n');

  const prompt = `
    You are an Editorial Performance Analyst. I am providing you with a dataset of ${data.length} content records.
    
    CRITICAL: You MUST process and aggregate every single one of the ${data.length} records. DO NOT sample. DO NOT truncate. 
    
    DATA (Index | Headline | Users):
    ${dataString}

    ANALYSIS REQUIREMENTS:
    1. THEMES: Group ALL records into high-level themes. Calculate Count, Total Users, and Users Per Story.
    2. KEYWORD PERFORMANCE: Analyze performance for keywords: "Cancer", "Heart Attack", and other top entities.
    3. EXTREMES: Identify the single Top Performer and Bottom Performer by "Users Per Story".
    4. VERIFICATION: Set "totalRecordsAnalyzed" to the exact number of unique records (rows) you processed.

    Output a valid JSON object strictly following the schema.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          totalRecordsAnalyzed: { type: Type.INTEGER },
          themes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                theme: { type: Type.STRING },
                storyCount: { type: Type.INTEGER },
                totalUsers: { type: Type.INTEGER },
                usersPerStory: { type: Type.NUMBER }
              },
              required: ["theme", "storyCount", "totalUsers", "usersPerStory"]
            }
          },
          keywords: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                theme: { type: Type.STRING },
                topKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                topEntities: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["theme", "topKeywords", "topEntities"]
            }
          },
          keywordPerformance: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                keyword: { type: Type.STRING },
                storyCount: { type: Type.INTEGER },
                totalUsers: { type: Type.INTEGER },
                usersPerStory: { type: Type.NUMBER }
              },
              required: ["keyword", "storyCount", "totalUsers", "usersPerStory"]
            }
          },
          styles: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                style: { type: Type.STRING },
                avgUsersPerStory: { type: Type.NUMBER },
                notes: { type: Type.STRING }
              },
              required: ["style", "avgUsersPerStory", "notes"]
            }
          },
          recommendations: {
            type: Type.OBJECT,
            properties: {
              increase: { type: Type.ARRAY, items: { type: Type.STRING } },
              optimize: { type: Type.ARRAY, items: { type: Type.STRING } },
              decrease: { type: Type.ARRAY, items: { type: Type.STRING } },
              experiment: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["increase", "optimize", "decrease", "experiment"]
          },
          insights: { type: Type.ARRAY, items: { type: Type.STRING } },
          topPerformer: {
            type: Type.OBJECT,
            properties: {
              theme: { type: Type.STRING },
              metric: { type: Type.STRING },
              value: { type: Type.NUMBER },
              explanation: { type: Type.STRING },
              count: { type: Type.INTEGER },
              totalReach: { type: Type.INTEGER }
            },
            required: ["theme", "metric", "value", "explanation", "count", "totalReach"]
          },
          bottomPerformer: {
            type: Type.OBJECT,
            properties: {
              theme: { type: Type.STRING },
              metric: { type: Type.STRING },
              value: { type: Type.NUMBER },
              explanation: { type: Type.STRING },
              count: { type: Type.INTEGER },
              totalReach: { type: Type.INTEGER }
            },
            required: ["theme", "metric", "value", "explanation", "count", "totalReach"]
          }
        },
        required: ["totalRecordsAnalyzed", "themes", "keywords", "keywordPerformance", "styles", "recommendations", "insights", "topPerformer", "bottomPerformer"]
      }
    }
  });

  const resultText = response.text;
  if (!resultText) {
    throw new Error("Gemini returned an empty response.");
  }

  return JSON.parse(resultText);
};

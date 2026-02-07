
import { GoogleGenAI } from "@google/genai";
import { MissionDataStore } from "../types";

export const analyzeStudyData = async (data: MissionDataStore, monthLabel: string) => {
  // Creating a new instance right before the call as per guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const summary = Object.entries(data)
    .filter(([key]) => key.includes(monthLabel))
    .map(([date, day]) => ({
      date,
      sessionCount: day.sessions.filter(s => s.rating !== null).length,
      efficiency: day.efficiency,
      subjects: day.sessions.map(s => s.subject).filter(Boolean)
    }));

  const prompt = `
    Analyze this student's study data for ${monthLabel}. 
    Data: ${JSON.stringify(summary)}
    
    Provide:
    1. A summary of their strongest and weakest study habits.
    2. Correlations between specific subjects and efficiency ratings.
    3. Actionable advice for the upcoming month to improve focus or quantity based on their patterns.
    
    Keep the tone professional, encouraging, and data-driven.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "Failed to generate AI insights. Please ensure your API key is valid and try again.";
  }
};


import { GoogleGenAI, Modality } from "@google/genai";
import { MissionDataStore } from "../types";

export const analyzeStudyData = async (data: MissionDataStore, monthLabel: string) => {
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
    Provide a concise tactical report with 3 bullet points for improvement.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    return "Intelligence gathering failed. Check connection.";
  }
};

export const generateBriefingAudio = async (summaryText: string): Promise<string | null> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Act as a stern but motivational military study coach. Give a 30-second briefing based on this analysis: ${summaryText}. Start with 'Attention Candidate!'` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio || null;
  } catch (error) {
    console.error("TTS Error:", error);
    return null;
  }
};

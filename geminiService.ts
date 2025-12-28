
import { GoogleGenAI, Type } from "@google/genai";
import { Content } from "../types";

// Always use const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getAIRecommendations = async (history: string[], catalog: Content[]): Promise<string[]> => {
  if (history.length === 0) return [];

  const historyTitles = history.map(id => catalog.find(c => c.id === id)?.title).filter(Boolean);
  const prompt = `Com base nestes títulos assistidos: ${historyTitles.join(', ')}. Quais destes IDs de catálogo eu gostaria de ver a seguir? Responda apenas o JSON. Catálogo: ${JSON.stringify(catalog.map(c => ({ id: c.id, title: c.title, genre: c.genre })))}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    
    // The response.text property directly returns the string output.
    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error("Erro na Recomendação de IA:", error);
    return [];
  }
};

export const getSmartSearchDescription = async (query: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Forneça um fato interessante de 1 frase (em Português do Brasil) sobre: ${query}. Foque em relevância cinematográfica ou educativa.`,
    });
    // The response.text property directly returns the string output.
    return response.text || "";
  } catch {
    return "";
  }
};

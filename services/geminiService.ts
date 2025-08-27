import { GoogleGenAI } from "@google/genai";

const API_KEY = "AIzaSyCmjnJjXOdPM7QoABhTj4OSObzoC9HcTdQ";

export const geminiAI = new GoogleGenAI({ apiKey: API_KEY });

export const generateContent = async (contentParts: any[], systemInstruction?: string) => {
  try {
    const response = await geminiAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: contentParts },
      ...(systemInstruction && { config: { systemInstruction } }),
    });
    
    return response.text;
  } catch (error) {
    console.error("Error generating content with Gemini:", error);
    throw error;
  }
};

export const generateContentStream = async (
  contentParts: any[], 
  systemInstruction?: string, 
  onTextUpdate?: (text: string) => void
) => {
  try {
    const response = await geminiAI.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: { parts: contentParts },
      ...(systemInstruction && { config: { systemInstruction } }),
    });
    
    let fullText = '';
    
    for await (const chunk of response) {
      const chunkText = chunk.text || '';
      fullText += chunkText;
      if (onTextUpdate) {
        onTextUpdate(fullText);
      }
    }
    
    return fullText;
  } catch (error) {
    console.error("Error generating streaming content with Gemini:", error);
    throw error;
  }
};

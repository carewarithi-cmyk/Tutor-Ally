
import { GoogleGenAI, Type } from "@google/genai";
import { BehaviorType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getBehaviorAdvice = async (scenario: string, behaviorType: BehaviorType) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `As an expert educational psychologist and senior tutor mentor, provide actionable advice for the following situation involving ${behaviorType}: "${scenario}". 
    Focus on de-escalation, positive reinforcement, and underlying causes. Format your response clearly with headings.`,
    config: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
    },
  });
  return response.text;
};

export const createSimulatorChat = (behaviorType: BehaviorType, studentLevel: string) => {
  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: `You are a student named Alex during a tutoring session. You are exhibiting ${behaviorType}. 
      Your age level is ${studentLevel}. Be realistic, not overly aggressive, but represent the challenges a tutor might face with ${behaviorType}. 
      Do not break character. Respond to the tutor's attempts to help or redirect you.`,
    },
  });
};

export const generateStrategyLibrary = async () => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: "Generate a list of 5 diverse tutoring strategies for managing common difficult classroom behaviors.",
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            category: { type: Type.STRING },
          },
          required: ["title", "description", "category"]
        }
      }
    }
  });
  return JSON.parse(response.text);
};

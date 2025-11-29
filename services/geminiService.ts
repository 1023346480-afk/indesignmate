import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment variables");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateText = async (prompt: string, currentContext?: string): Promise<string> => {
  try {
    const ai = getClient();
    const modelId = 'gemini-2.5-flash';
    
    const contextPrompt = currentContext 
      ? `The user is editing a layout. The current text is: "${currentContext}". ` 
      : '';
    
    const fullPrompt = `${contextPrompt}Please generate creative copy based on this request: "${prompt}". Return ONLY the raw text to be placed in the design, no markdown formatting unless specifically asked. Keep it concise enough for a layout.`;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: fullPrompt,
    });

    return response.text || "No text generated.";
  } catch (error) {
    console.error("Gemini Text Error:", error);
    throw error;
  }
};

export const generateImage = async (prompt: string): Promise<string> => {
  try {
    const ai = getClient();
    // Using gemini-2.5-flash-image for standard image generation as per guidelines
    const modelId = 'gemini-2.5-flash-image'; 

    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          { text: prompt }
        ]
      },
      // Note: responseMimeType is not supported for nano banana series (flash-image)
    });

    // Iterate parts to find the image
    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          const base64Data = part.inlineData.data;
          // Assuming PNG usually, but could be JPEG. The API returns the mimeType.
          const mimeType = part.inlineData.mimeType || 'image/png';
          return `data:${mimeType};base64,${base64Data}`;
        }
      }
    }
    
    throw new Error("No image data returned from Gemini.");

  } catch (error) {
    console.error("Gemini Image Error:", error);
    throw error;
  }
};

export const checkApiKey = (): boolean => {
  return !!process.env.API_KEY;
};
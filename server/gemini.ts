import { GoogleGenAI } from "@google/genai";

// DON'T DELETE THIS COMMENT
// Follow these instructions when using this blueprint:
// - Note that the newest Gemini model series is "gemini-2.5-flash" or "gemini-2.5-pro"
//   - do not change this unless explicitly requested by the user

// This API key is from Gemini Developer API Key, not vertex AI API Key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function chatWithAI(
  message: string,
  conversationHistory: Array<{ role: string; content: string }>
): Promise<string> {
  try {
    const systemPrompt = `You are AstraMind, an intelligent AI assistant and personal life operating system. You help users manage their life, learning, and creativity through natural conversation.

Your capabilities:
- Help users plan their day and set goals
- Provide learning support and explain complex topics
- Offer productivity insights and suggestions
- Be conversational, supportive, and personalized
- Remember context from the conversation

Respond naturally and helpfully. Keep responses concise but informative.`;

    // Format conversation history for Gemini
    const contents = conversationHistory.map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    // Add the current message
    contents.push({
      role: "user",
      parts: [{ text: message }],
    });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt,
      },
      contents,
    });

    return response.text || "I'm sorry, I couldn't generate a response. Please try again.";
  } catch (error) {
    console.error("Error calling Gemini AI:", error);
    throw new Error("Failed to get AI response");
  }
}

export async function generateDailySummary(
  chats: number,
  goals: number,
  notes: number
): Promise<string[]> {
  try {
    const prompt = `Generate 3-4 brief, encouraging insights for a user's daily summary based on their activity:
- Chat conversations: ${chats}
- Goals worked on: ${goals}
- Notes created: ${notes}

Provide insights as a JSON array of strings. Focus on productivity patterns, suggestions, and encouragement.
Example: ["Great engagement today with ${chats} conversations!", "Keep the momentum on your ${goals} goals", "Your ${notes} notes show active learning"]`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "array",
          items: {
            type: "string",
          },
        },
      },
      contents: prompt,
    });

    const insights = JSON.parse(response.text || "[]");
    return insights.length > 0 ? insights : ["Keep up the great work!", "Every step forward counts."];
  } catch (error) {
    console.error("Error generating daily summary:", error);
    return ["Keep building your momentum!", "Great progress today."];
  }
}

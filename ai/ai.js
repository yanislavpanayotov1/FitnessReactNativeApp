import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

export async function generateWorkoutPlan(answers) {
    const prompt = `You are a fitness coach.
Create a personalized workout plan based on the following user responses:
- Goal: ${answers["4"]}
- Experience Level: ${answers["2"]}
- Current Training Focus: ${answers["1"]}
- Frequency: ${answers["5"]}
- Target Areas: ${answers["6"]}
- Preferences: ${answers["7"]}
Generate a plan suitable for this user.`;

    const result = await genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            temperature: 0.7,
        }
    });
    return result.candidates?.[0]?.content?.parts?.[0]?.text || "No plan generated";
}
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not defined in server environment variables.");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function generateWorkoutPlan(userAnswers) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `
        Create a personalized workout plan based on the following user data:
        ${JSON.stringify(userAnswers, null, 2)}

        Return ONLY a JSON object with this EXACT structure:
        {
            "name": "Plan Name",
            "description": "Brief description",
            "schedule": [
                {
                    "day": "Day 1",
                    "focus": "Target Area",
                    "exercises": [
                        {
                            "name": "Exercise Name",
                            "sets": 3,
                            "reps": "8-12",
                            "rest": "60s",
                            "weight": "20kg (optional)",
                            "notes": "Optional notes"
                        }
                    ]
                }
            ],
            "note": "Optional general note"
        }
        
        Do not include markdown formatting like \`\`\`json. Just the raw JSON string.
    `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean up markdown if present
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

    return JSON.parse(cleanText);
  } catch (error) {
    console.error("AI Generation Error:", error);
    throw new Error("Failed to generate workout plan");
  }
}

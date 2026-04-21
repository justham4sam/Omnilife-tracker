
import { GoogleGenAI, Type } from "@google/genai";
import { AppState, Task, Habit } from "../types";

/**
 * System instruction defining the persona and objectives for the AI coach.
 */
const getSystemInstruction = () => `
You are an empathetic but highly organized Life Coach and Data Analyst. 
Your goal is to look at a user's personal tracking data (Health, Debt, Learning, Habits, Tasks) and provide:
1. A brief, encouraging summary of their current status (2-3 sentences).
2. Three specific, actionable "Next Steps" or insights to improve their life right now.
Keep the tone professional, motivating, and concise.
`;

/**
 * Generates life coach insights using Gemini 3 Flash and the Google GenAI SDK.
 * Refined to use a single-pass with responseSchema for robust JSON extraction.
 */
export const generateLifeCoachInsights = async (data: AppState): Promise<{ summary: string; actions: string[] }> => {
  try {
    // API key is obtained directly from process.env.GEMINI_API_KEY per guidelines.
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    // Prepare a summarized version of data to focus model attention and manage token usage
    const todayStr = new Date().toISOString().split('T')[0];
    const contextData = {
      pendingTasks: data.tasks.filter(t => !t.completed).length,
      highPriorityTasks: data.tasks.filter(t => !t.completed && t.priority === 'high').map(t => t.title),
      activeHabitStreaks: data.habits.filter(h => h.streak > 3).map(h => h.name),
      habitsMissedToday: data.habits.filter(h => !h.logs.includes(todayStr)).map(h => h.name),
      totalDebt: data.debts.reduce((acc, curr) => acc + curr.balance, 0),
      currentRead: data.books.find(b => b.progress > 0 && b.progress < 100)?.title,
      recentSleep: data.health.slice(-3).map(h => h.sleepHours),
    };

    const prompt = `Analyze the following user data and provide empathetic coaching: ${JSON.stringify(contextData)}`;

    // Use 'gemini-3-flash-preview' for general text tasks.
    // responseSchema is defined to ensure the output adheres to the expected structure.
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: getSystemInstruction(),
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
              description: 'A brief, encouraging summary of current status.',
            },
            actions: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING,
              },
              description: 'Exactly three actionable next steps.',
            },
          },
          required: ["summary", "actions"],
        },
      }
    });

    // Extract text output from response; note response.text is a property, not a method.
    const text = response.text;
    if (!text) throw new Error("Empty response from AI Coach");

    const jsonResponse = JSON.parse(text);
    return {
        summary: jsonResponse.summary || "I've analyzed your progress. Keep focusing on small, daily wins.",
        actions: jsonResponse.actions || ["Continue tracking your habits", "Check your pending high-priority tasks", "Ensure you're getting consistent sleep"]
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      summary: "I'm having trouble connecting to your AI Coach right now. Rest assured, your data is safe.",
      actions: ["Check your connectivity", "Refresh the page", "Try again in a few moments"]
    };
  }
};

/**
 * Cleans up a potentially jumbled voice transcription and suggests a category.
 */
export const processBraindumpVoice = async (rawText: string): Promise<{ content: string; category: string }> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const prompt = `Clean up this voice transcription and suggest the best category from [General, Health, Finance, Learning, Habits, Work]. 
    Transcription: "${rawText}"`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "You are a helpful assistant that cleans up voice transcriptions. Fix grammar, remove filler words, and clarify jumbled sentences while keeping the original intent. Return a JSON object.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            content: {
              type: Type.STRING,
              description: 'The cleaned up transcription.',
            },
            category: {
              type: Type.STRING,
              enum: ['General', 'Health', 'Finance', 'Learning', 'Habits', 'Work'],
              description: 'The most appropriate category.',
            },
          },
          required: ["content", "category"],
        },
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from AI");

    const jsonResponse = JSON.parse(text);
    return {
        content: jsonResponse.content || rawText,
        category: jsonResponse.category || 'General'
    };
  } catch (error) {
    console.error("Gemini Voice Processing Error:", error);
    return {
      content: rawText,
      category: 'General'
    };
  }
};

/**
 * Validates a goal against the SMART framework.
 */
export const validateSMARTGoal = async (goalData: {
  title: string;
  specific: string;
  measurable: string;
  achievable: string;
  relevant: string;
  timeBound: string;
}): Promise<{
  score: number;
  feedback: { criteria: string; score: number; tip: string }[];
  overallSuggestion: string;
}> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const prompt = `Evaluate this goal details based on the SMART framework:
    Title: ${goalData.title}
    Specific: ${goalData.specific}
    Measurable: ${goalData.measurable}
    Achievable: ${goalData.achievable}
    Relevant: ${goalData.relevant}
    Time-Bound: ${goalData.timeBound}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "You are a world-class productivity expert. Evaluate the provided goal details using the SMART framework. Provide a score (1-10) for each part (S,M,A,R,T) and one high-impact tip for each. Also provide an overall synergy score out of 100.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER, description: "Overall synergy score out of 100" },
            feedback: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  criteria: { type: Type.STRING, enum: ["Specific", "Measurable", "Achievable", "Relevant", "Time-Bound"] },
                  score: { type: Type.NUMBER },
                  tip: { type: Type.STRING }
                },
                required: ["criteria", "score", "tip"]
              }
            },
            overallSuggestion: { type: Type.STRING }
          },
          required: ["score", "feedback", "overallSuggestion"],
        },
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from AI");
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini SMART Validation Error:", error);
    throw error;
  }
};

/**
 * Generates a morning briefing with prioritized tasks and logical steps.
 */
export const generateMorningBriefing = async (tasks: Task[], habits: Habit[]): Promise<{
    briefing: string;
    prioritizedTasks: { id: string; recommendedPriority: 'low'|'medium'|'high'; logicalOrder: number; reasoning: string }[];
}> => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return {
            briefing: "AI Coach is currently offline. Please set your API key in Settings.",
            prioritizedTasks: []
        };
    }
    try {
        const ai = new GoogleGenAI({ apiKey });
        const context = {
            tasks: tasks.filter(t => !t.completed).map(t => ({ id: t.id, title: t.title, dueDate: t.dueDate })),
            habits: habits.map(h => ({ name: h.name, streak: h.streak }))
        };

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Analyze my day. Pending tasks: ${JSON.stringify(context.tasks)}. Habits: ${JSON.stringify(context.habits)}.
            Suggest priority levels, put steps in logical order, and provide a 2-sentence motivating briefing.`,
            config: {
                systemInstruction: "You are a strategic productivity architect. Focus on sequencing: what must be done before another can start? Suggest realistic priorities.",
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        briefing: { type: Type.STRING },
                        prioritizedTasks: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    id: { type: Type.STRING },
                                    recommendedPriority: { type: Type.STRING, enum: ["low", "medium", "high"] },
                                    logicalOrder: { type: Type.NUMBER },
                                    reasoning: { type: Type.STRING }
                                },
                                required: ["id", "recommendedPriority", "logicalOrder", "reasoning"]
                            }
                        }
                    },
                    required: ["briefing", "prioritizedTasks"]
                }
            }
        });
        const text = response.text;
        if (!text) throw new Error("Empty AI response");
        return JSON.parse(text);
    } catch (error) {
        console.error("Morning Briefing Error:", error);
        return {
            briefing: "The strategist is unavailable. Focus on your top mission today.",
            prioritizedTasks: []
        };
    }
};

/**
 * Analyzes the user's performance and finds "flaws" or behavioral gaps.
 */
export const analyzeUserPerformance = async (data: any): Promise<{
    flaws: { title: string; observation: string; correction: string }[];
    recap: string;
}> => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return {
            flaws: [],
            recap: "Performance summary unavailable without API credentials."
        };
    }
    try {
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Review my performance based on this data: ${JSON.stringify(data)}. 
            Find errors/flaws in my execution or planning. Be direct but constructive.`,
            config: {
                systemInstruction: "You are a performance psychologist. Analyze patterns like procrastination, over-commitment, or ignoring high-priority tasks. Identify 'flaws' in the user's approach.",
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        flaws: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    title: { type: Type.STRING },
                                    observation: { type: Type.STRING },
                                    correction: { type: Type.STRING }
                                },
                                required: ["title", "observation", "correction"]
                            }
                        },
                        recap: { type: Type.STRING }
                    },
                    required: ["flaws", "recap"]
                }
            }
        });
        const text = response.text;
        if (!text) throw new Error("Empty AI response");
        return JSON.parse(text);
    } catch (error) {
        console.error("Performance Analysis Error:", error);
        return {
            flaws: [],
            recap: "Rest tonight. We'll analyze your resilience tomorrow."
        };
    }
};

/**
 * Optional Gemini API Integration Client
 * Provides GenAI acceleration while enforcing the Product Specification & Anti-AI Rules.
 */

const GEMINI_API_KEY_STORAGE = "resumetracker_gemini_api_key";
const GEMINI_MODEL_STORAGE = "resumetracker_gemini_model";

export const SYSTEM_PROMPT_INSTRUCTIONS = `You are an expert AI Career Engineer and Personal Brand Strategist.
Enforce strict anti-AI humanizer rules:
1. Banned Words: NEVER use delve, leverage, supercharge, game-changer, spearhead, testaments, beacon, tapestry, key takeaway, excited to announce, in today's fast-paced world, navigating, realm, harness, revolutionize, cutting-edge.
2. Formatting Rules: Avoid staccato fragment stacks (e.g. 'Think fast. Act faster. Win big.'). Cap em-dashes to a maximum of 1 per document. Limit emojis to 0-2 maximum; never use rocket ships (🚀) or fire (🔥) icons.
3. Conversational 8th-to-10th grade direct readability level.
4. Output clean, ready-to-use markdown.`;

export class GeminiClient {
  constructor() {
    this.apiKey = localStorage.getItem(GEMINI_API_KEY_STORAGE) || "";
    this.model = localStorage.getItem(GEMINI_MODEL_STORAGE) || "gemini-2.5-flash";
  }

  hasApiKey() {
    return Boolean(this.apiKey && this.apiKey.trim().length > 10);
  }

  setApiKey(key) {
    this.apiKey = key.trim();
    localStorage.setItem(GEMINI_API_KEY_STORAGE, this.apiKey);
  }

  setModel(model) {
    this.model = model;
    localStorage.setItem(GEMINI_MODEL_STORAGE, this.model);
  }

  clearApiKey() {
    this.apiKey = "";
    localStorage.removeItem(GEMINI_API_KEY_STORAGE);
  }

  /**
   * Calls the Gemini REST API v1beta
   */
  async generateContent(prompt, systemInstruction = SYSTEM_PROMPT_INSTRUCTIONS) {
    if (!this.hasApiKey()) {
      throw new Error("No Gemini API Key found. Please add one in Settings or use the built-in algorithmic engine.");
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;

    const body = {
      contents: [
        {
          parts: [{ text: prompt }]
        }
      ],
      systemInstruction: {
        parts: [{ text: systemInstruction }]
      },
      generationConfig: {
        temperature: 0.6,
        topP: 0.95
      }
    };

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `API error (${response.status})`);
    }

    const data = await response.json();
    const candidate = data.candidates?.[0];
    const text = candidate?.content?.parts?.[0]?.text || "";
    return text;
  }
}

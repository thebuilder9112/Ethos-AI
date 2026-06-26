import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// Initialize Gemini SDK with telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// API endpoint for comprehensive moral philosophy breakdown
app.post("/api/analyze", async (req, res) => {
  try {
    const { dilemma } = req.body;

    if (!dilemma || !dilemma.title || !dilemma.description) {
      return res.status(400).json({ error: "Invalid dilemma data provided." });
    }

    const prompt = `
      You are an elite, compassionate moral philosopher and Socratic guide. 
      Analyze the following ethical dilemma and provide an extensive, structured moral breakdown.
      
      Dilemma Title: ${dilemma.title}
      Context/Description: ${dilemma.description}
      
      Stated Options:
      ${dilemma.options?.map((o: any, idx: number) => `${idx + 1}. Option [${o.id}]: "${o.text}"`).join("\n") || "None specified"}
      
      Key Stakeholders:
      ${dilemma.stakeholders?.map((s: any) => `- ${s.name} (${s.role})`).join("\n") || "None specified"}
      
      Utilitarian Analysis State (User-entered ratings of net well-being on stakeholders):
      ${JSON.stringify(dilemma.utilitarianData)}
      
      Deontological / Kantian Integrity State (Universal rules and treating others as ends):
      ${JSON.stringify(dilemma.kantianData)}
      
      Virtue Ethics Balance (Finding the golden mean of character virtues):
      ${JSON.stringify(dilemma.virtueData)}
      
      Veil of Ignorance Perspective (Thinking without knowing which stakeholder they will be):
      "${dilemma.veilOfIgnoranceReflection || "No reflection entered yet."}"
      
      Examine this dilemma thoroughly through:
      1. Consequentialism / Utilitarianism (well-being, pleasure vs. pain, stakeholder optimization).
      2. Deontology (Kantian duties, categorical imperatives, universal law, treating humans as ends).
      3. Virtue Ethics (Aristotelian character development, golden means, excesses and deficiencies).
      4. Ethics of Care (empathy, special relational obligations, protecting the vulnerable).
      
      Synthesize these insights to provide:
      - A Socratic restatement of the ethical crux (summary).
      - Perspective-specific critiques (verdicts).
      - A comprehensive synthesis recommendation (recommendedPath) that helps them forge an ethical, noble path.
      - 3 custom, deep probing reflection questions specifically tailored to their narrative.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an expert moral philosopher. Provide deep, non-judgmental, structured ethical analysis. Focus on guiding clarity and Socratic wisdom.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
              description: "A profound Socratic summary of the central ethical conflict of this dilemma.",
            },
            utilitarianVerdict: {
              type: Type.STRING,
              description: "Consequentialist breakdown. Critically examine who benefits, who suffers, and what maximizes net good.",
            },
            deontologicalVerdict: {
              type: Type.STRING,
              description: "Deontological/Kantian breakdown. Analyze the duties at play, if the actions can be universalized, and if anyone is being used as a mere means.",
            },
            virtueVerdict: {
              type: Type.STRING,
              description: "Virtue Ethics breakdown. Critique the character traits required and how the user's virtue levels align with finding the golden mean.",
            },
            careEthicsVerdict: {
              type: Type.STRING,
              description: "Ethics of Care breakdown. Focus on relationship dependencies, empathy, caring bonds, and vulnerabilities.",
            },
            recommendedPath: {
              type: Type.STRING,
              description: "A thoughtful, comprehensive, non-prescriptive recommendation combining all frameworks to suggest an ethical course of action.",
            },
            probingQuestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Three deep, tailored, Socratic questions directly probing the core trade-offs of their situation.",
            },
          },
          required: ["summary", "utilitarianVerdict", "deontologicalVerdict", "virtueVerdict", "careEthicsVerdict", "recommendedPath", "probingQuestions"]
        }
      }
    });

    const textOutput = response.text || "{}";
    res.json(JSON.parse(textOutput));
  } catch (error: any) {
    console.error("Analysis Error:", error);
    res.status(500).json({ error: error.message || "Failed to analyze the dilemma." });
  }
});

// Socratic helper chat endpoint
app.post("/api/socratic/chat", async (req, res) => {
  try {
    const { dilemma, messages } = req.body;

    if (!dilemma || !messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Missing dilemma or chat messages." });
    }

    const contextPrompt = `
      You are Socrates, the ancient moral philosopher, serving as an empathetic, probing ethical counselor.
      The user is wrestling with a difficult decision:
      Dilemma Title: ${dilemma.title}
      Dilemma Context: ${dilemma.description}
      
      Your goal is NOT to tell them what to do. Your goal is to ask insightful, gentle, yet probing questions that expose their underlying values, uncover hidden assumptions, or reveal potential blind spots.
      
      Keep your responses relatively brief (2-3 sentences), highly conversational, and always end with a single, deep, Socratic question that follows naturally from their last statement.
      
      Here is the conversation history:
      ${messages.map(m => `${m.role === 'user' ? 'Seeker' : 'Socrates'}: ${m.text}`).join("\n")}
      
      Socrates:
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contextPrompt,
      config: {
        systemInstruction: "You are Socrates. Speak simply, deeply, and philosophically. Gently probe assumptions. Always end with exactly one profound moral question.",
      }
    });

    res.json({ text: response.text || "What lies at the heart of your values?" });
  } catch (error: any) {
    console.error("Chat Error:", error);
    res.status(500).json({ error: error.message || "Failed to conduct chat." });
  }
});

// Initialize Vite server or serve static build
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();

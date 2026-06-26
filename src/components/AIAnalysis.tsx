import React, { useState } from 'react';
import { Dilemma, PhilosophicalBreakdown } from '../types';
import { Sparkles, Brain, Scale, ShieldAlert, Compass, Heart, Award, ArrowRight, HelpCircle } from 'lucide-react';

interface AIAnalysisProps {
  dilemma: Dilemma;
  onSaveCompleted: (decision: string, reflection: string) => void;
}

const LOADING_STEPS = [
  "Summoning deep moral philosophy models...",
  "Evaluating utilitarian stakeholder payoffs...",
  "Running universalizability Kantian duty checks...",
  "Locating Golden Mean virtue alignments...",
  "Mapping Ethics of Care relational obligations...",
  "Composing tailored Socratic inquiries..."
];

export default function AIAnalysis({ dilemma, onSaveCompleted }: AIAnalysisProps) {
  const [analysis, setAnalysis] = useState<PhilosophicalBreakdown | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStepIdx, setLoadingStepIdx] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // User responses to the AI's generated reflection prompts
  const [promptResponses, setPromptResponses] = useState<string[]>(["", "", ""]);
  const [finalDecision, setFinalDecision] = useState("");
  const [finalReflection, setFinalReflection] = useState("");
  const [savedSuccess, setSavedSuccess] = useState(false);

  const triggerAnalysis = async () => {
    setLoading(true);
    setError(null);
    setAnalysis(null);
    setSavedSuccess(false);

    // Dynamic loading text step cycles
    let step = 0;
    const interval = setInterval(() => {
      step = (step + 1) % LOADING_STEPS.length;
      setLoadingStepIdx(step);
    }, 1800);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dilemma })
      });

      if (!response.ok) {
        throw new Error("The AI moral assembly is currently overloaded. Please try again.");
      }

      const data = await response.json();
      setAnalysis(data);
      setPromptResponses(["", "", ""]);
    } catch (err: any) {
      setError(err.message || "Failed to retrieve analysis.");
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  const handlePromptResponseChange = (idx: number, val: string) => {
    const updated = [...promptResponses];
    updated[idx] = val;
    setPromptResponses(updated);
  };

  const handleSaveFinal = () => {
    if (!finalDecision.trim()) return;
    
    // Synthesize prompt responses into final reflection if entered
    const fullReflection = `
PROMPTS REFLECTIONS:
${analysis?.probingQuestions.map((q, idx) => `Q: ${q}\nA: ${promptResponses[idx] || "Unanswered"}`).join("\n\n")}

FINAL SYNTHESIS REFLECTION:
${finalReflection}
    `;

    onSaveCompleted(finalDecision, fullReflection);
    setSavedSuccess(true);
  };

  return (
    <div id="ai-analysis-container" className="space-y-6">
      {!analysis && !loading && (
        <div id="trigger-panel" className="border border-[#F0EEE6] rounded-[24px] p-8 bg-white text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 bg-[#F2F1EC] text-[#5A5A40] rounded-full flex items-center justify-center mx-auto border border-[#D1CEC4]">
            <Brain className="w-6 h-6" />
          </div>
          <div className="space-y-1.5 max-w-lg mx-auto">
            <h4 className="text-base font-bold text-[#2D2B26] font-serif">
              Generate Socratic Moral Breakdown
            </h4>
            <p className="text-xs text-[#7C7971] leading-relaxed font-medium">
              We will compile your current stakeholder utility matrix, Kantian duties, and virtue sliders, 
              and present your dilemma to our philosophical AI to produce a profound, 
              multi-framework analysis.
            </p>
          </div>

          <button
            id="trigger-analysis-btn"
            onClick={triggerAnalysis}
            className="px-6 py-3 bg-[#5A5A40] hover:bg-[#484833] text-white rounded-xl text-xs font-semibold shadow-md transition-all flex items-center gap-2 mx-auto cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#F0E6D2]" />
            <span>Consult AI Moral Advisor</span>
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div id="loading-panel" className="border border-[#F0EEE6] rounded-[24px] p-12 bg-[#FCFBF9] text-center space-y-4 flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-3 border-[#5A5A40] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-[#5A5A40] uppercase tracking-widest animate-pulse">
            Analyzing Ethical Crux...
          </p>
          <p className="text-xs text-[#5D5B54] font-serif italic max-w-xs leading-normal">
            "{LOADING_STEPS[loadingStepIdx]}"
          </p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div id="error-panel" className="bg-rose-50 border border-rose-250 text-rose-800 text-xs p-4 rounded-xl font-medium">
          {error}
        </div>
      )}

      {/* Analysis Output */}
      {analysis && !loading && (
        <div id="analysis-results" className="space-y-6">
          {/* Summary */}
          <div className="bg-[#FCFBF9] border border-[#E5E2D9] rounded-[20px] p-5 space-y-2">
            <h4 className="text-sm font-bold text-[#5A5A40] uppercase tracking-widest flex items-center gap-1.5 font-serif italic">
              <Brain className="w-4 h-4 text-[#5A5A40]" />
              Socratic Ethical Crux Restatement
            </h4>
            <p className="text-xs text-[#3D3B36] leading-relaxed font-medium">
              {analysis.summary}
            </p>
          </div>

          {/* Framework Verdict Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Consequentialism */}
            <div className="border border-[#F0EEE6] bg-white p-5 rounded-[24px] space-y-2.5 shadow-xs">
              <h5 className="text-[11px] font-bold text-[#5A5A40] bg-[#F2F1EC] px-2.5 py-0.5 rounded-full border border-[#D1CEC4] flex items-center gap-1.5 w-fit uppercase tracking-widest">
                <Scale className="w-3.5 h-3.5" />
                Utilitarian Calculus
              </h5>
              <p className="text-xs text-[#5D5B54] leading-relaxed">
                {analysis.utilitarianVerdict}
              </p>
            </div>

            {/* Deontology */}
            <div className="border border-[#F0EEE6] bg-white p-5 rounded-[24px] space-y-2.5 shadow-xs">
              <h5 className="text-[11px] font-bold text-rose-800 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-100 flex items-center gap-1.5 w-fit uppercase tracking-widest">
                <ShieldAlert className="w-3.5 h-3.5" />
                Deontological Duties
              </h5>
              <p className="text-xs text-[#5D5B54] leading-relaxed">
                {analysis.deontologicalVerdict}
              </p>
            </div>

            {/* Virtue Ethics */}
            <div className="border border-[#F0EEE6] bg-white p-5 rounded-[24px] space-y-2.5 shadow-xs">
              <h5 className="text-[11px] font-bold text-[#5A5A40] bg-[#FCFBF9] px-2.5 py-0.5 rounded-full border border-[#E5E2D9] flex items-center gap-1.5 w-fit uppercase tracking-widest">
                <Compass className="w-3.5 h-3.5" />
                Aristotelian Virtue
              </h5>
              <p className="text-xs text-[#5D5B54] leading-relaxed">
                {analysis.virtueVerdict}
              </p>
            </div>

            {/* Ethics of Care */}
            <div className="border border-[#F0EEE6] bg-white p-5 rounded-[24px] space-y-2.5 shadow-xs">
              <h5 className="text-[11px] font-bold text-sky-800 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-100 flex items-center gap-1.5 w-fit uppercase tracking-widest">
                <Heart className="w-3.5 h-3.5" />
                Ethics of Care
              </h5>
              <p className="text-xs text-[#5D5B54] leading-relaxed">
                {analysis.careEthicsVerdict}
              </p>
            </div>
          </div>

          {/* AI Recommended Path */}
          <div className="border border-[#5A5A40] bg-[#F2F1EC]/80 text-[#3D3B36] p-6 rounded-[24px] space-y-3">
            <h4 className="text-sm font-bold text-[#5A5A40] uppercase tracking-widest flex items-center gap-2 font-serif italic">
              <Award className="w-4.5 h-4.5 text-[#5A5A40]" />
              The Synthesis Path (Nuanced Recommendation)
            </h4>
            <p className="text-xs text-[#4E4C44] leading-relaxed whitespace-pre-line font-sans">
              {analysis.recommendedPath}
            </p>
          </div>

          {/* Socratic Guided Reflection Prompts */}
          <div className="border-t border-[#F0EEE6] pt-6 space-y-4">
            <h4 className="text-sm font-bold text-[#2D2B26] font-serif flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-[#5A5A40]" />
              Dynamic Guided Reflection Prompts
            </h4>
            <p className="text-xs text-[#7C7971] italic font-serif leading-relaxed">
              Contemplate and answer these questions before sealing your final ethical decision.
            </p>

            <div className="space-y-4">
              {analysis.probingQuestions.map((q, idx) => (
                <div id={`reflection-prompt-card-${idx}`} key={idx} className="bg-[#FCFBF9] border border-[#F0EEE6] rounded-[20px] p-4 space-y-2.5">
                  <p className="text-xs font-bold text-[#5A5A40] font-serif italic">
                    Prompt {idx + 1}: {q}
                  </p>
                  <textarea
                    id={`prompt-response-textarea-${idx}`}
                    rows={2}
                    value={promptResponses[idx]}
                    onChange={(e) => handlePromptResponseChange(idx, e.target.value)}
                    placeholder="Reflect on this question deeply and write your moral rationale..."
                    className="w-full p-3 bg-white border border-[#E5E2D9] rounded-xl text-xs text-[#5A5A40] placeholder-[#C2C0B8] focus:outline-hidden focus:ring-1 focus:ring-[#5A5A40] focus:border-[#5A5A40]"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Final Choice Submission Form */}
          <div className="border-t border-[#F0EEE6] pt-6 space-y-4">
            <h4 className="text-sm font-bold text-[#2D2B26] font-serif">
              Seal Your Decision & Post-Reflection
            </h4>

            <div className="space-y-4 bg-[#FCFBF9] border border-[#E5E2D9] p-5 rounded-[24px]">
              <div>
                <label htmlFor="final-decision-input" className="block text-xs font-bold text-[#5A5A40] uppercase tracking-widest mb-1.5">
                  Which path have you chosen?
                </label>
                <input
                  id="final-decision-input"
                  type="text"
                  value={finalDecision}
                  onChange={(e) => setFinalDecision(e.target.value)}
                  placeholder="e.g., 'Anonymously leak files to protective regulators rather than press, safeguarding both public good and NDA integrity.'"
                  className="w-full px-3 py-2.5 border border-[#E5E2D9] rounded-xl text-xs bg-white text-[#3D3B36] focus:outline-hidden focus:ring-1 focus:ring-[#5A5A40] font-medium placeholder-[#C2C0B8]"
                />
              </div>

              <div>
                <label htmlFor="final-reflection-input" className="block text-xs font-bold text-[#5A5A40] uppercase tracking-widest mb-1.5">
                  Final Moral Rationale & Lessons
                </label>
                <textarea
                  id="final-reflection-input"
                  rows={3}
                  value={finalReflection}
                  onChange={(e) => setFinalReflection(e.target.value)}
                  placeholder="Reflect on what you have learned about your own character, values, and duty through this exercise."
                  className="w-full p-3 bg-white border border-[#E5E2D9] rounded-xl text-xs text-[#3D3B36] focus:outline-hidden focus:ring-1 focus:ring-[#5A5A40] leading-normal placeholder-[#C2C0B8]"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  id="save-final-decision-btn"
                  onClick={handleSaveFinal}
                  disabled={!finalDecision.trim()}
                  className="px-5 py-2.5 bg-[#5A5A40] hover:bg-[#484833] text-white text-xs font-semibold rounded-xl shadow-sm transition-colors cursor-pointer disabled:bg-[#DEDCD4] disabled:text-[#A09D94] disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>Conclude Moral Inquiry</span>
                </button>

                {savedSuccess && (
                  <p id="save-success-notification" className="text-xs text-[#5A5A40] font-serif italic animate-pulse">
                    ✓ Decision sealed and logged to your local journal!
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

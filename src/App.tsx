import React, { useState, useEffect } from 'react';
import { Dilemma } from './types';
import DilemmaInput from './components/DilemmaInput';
import UtilitarianCalc from './components/UtilitarianCalc';
import DeontologyTest from './components/DeontologyTest';
import VirtueMean from './components/VirtueMean';
import RawlsVeil from './components/RawlsVeil';
import SocraticChat from './components/SocraticChat';
import AIAnalysis from './components/AIAnalysis';
import HistoryLog from './components/HistoryLog';
import { Scale, ShieldCheck, Compass, EyeOff, FileText, Brain, MessageSquare, BookOpen, AlertCircle } from 'lucide-react';

const createEmptyDilemma = (): Dilemma => ({
  id: `dil_${Date.now()}`,
  title: "",
  description: "",
  options: [],
  stakeholders: [],
  utilitarianData: { options: [] },
  kantianData: [],
  virtueData: [
    { virtueName: "Honesty", deficiency: "Deceitfulness", excess: "Bluntness/Tactlessness", meanDescription: "Truthfulness in communication", userValue: 50, explanation: "" },
    { virtueName: "Courage", deficiency: "Cowardice", excess: "Rashness/Recklessness", meanDescription: "Standing firm for moral truth", userValue: 50, explanation: "" },
    { virtueName: "Fairness", deficiency: "Bias/Selfishness", excess: "Rigid Legalism", meanDescription: "Giving everyone their ethical due", userValue: 50, explanation: "" },
    { virtueName: "Compassion", deficiency: "Apathy/Callousness", excess: "Enabling Dependency", meanDescription: "Active empathy toward suffering", userValue: 50, explanation: "" }
  ],
  veilOfIgnoranceReflection: "",
  createdAt: new Date().toISOString(),
  status: 'draft'
});

type LeftTab = 'dilemma' | 'utilitarian' | 'deontology' | 'virtue' | 'veil';
type RightTab = 'analysis' | 'chat' | 'history';

export default function App() {
  const [activeDilemma, setActiveDilemma] = useState<Dilemma>(createEmptyDilemma());
  const [leftTab, setLeftTab] = useState<LeftTab>('dilemma');
  const [rightTab, setRightTab] = useState<RightTab>('analysis');

  // Load a draft from local storage on startup if available
  useEffect(() => {
    try {
      const activeDraft = localStorage.getItem("ethical_dilemma_active_draft");
      if (activeDraft) {
        setActiveDilemma(JSON.parse(activeDraft));
      }
    } catch (e) {
      console.error("Failed to load active draft", e);
    }
  }, []);

  // Save changes to draft
  const handleDilemmaChange = (updated: Dilemma) => {
    setActiveDilemma(updated);
    try {
      localStorage.setItem("ethical_dilemma_active_draft", JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save active draft", e);
    }
  };

  const handleReset = () => {
    const confirmed = window.confirm("Are you sure you want to clear the active workspace and start fresh?");
    if (!confirmed) return;
    const fresh = createEmptyDilemma();
    setActiveDilemma(fresh);
    try {
      localStorage.setItem("ethical_dilemma_active_draft", JSON.stringify(fresh));
    } catch (e) {
      console.error(e);
    }
    setLeftTab('dilemma');
  };

  // When loaded from HistoryLog
  const handleLoadSession = (loaded: Dilemma) => {
    setActiveDilemma(loaded);
    try {
      localStorage.setItem("ethical_dilemma_active_draft", JSON.stringify(loaded));
    } catch (e) {
      console.error(e);
    }
    setLeftTab('dilemma');
  };

  const handleSaveCompleted = (decision: string, reflection: string) => {
    const completedDilemma: Dilemma = {
      ...activeDilemma,
      status: 'completed',
      finalDecision: decision,
      finalReflection: reflection,
      createdAt: new Date().toISOString()
    };

    setActiveDilemma(completedDilemma);

    try {
      // Save draft as the active
      localStorage.setItem("ethical_dilemma_active_draft", JSON.stringify(completedDilemma));

      // Append to the list of completed decisions
      const raw = localStorage.getItem("ethical_decisions");
      const parsed: Dilemma[] = raw ? JSON.parse(raw) : [];
      const index = parsed.findIndex(d => d.id === completedDilemma.id);
      if (index >= 0) {
        parsed[index] = completedDilemma;
      } else {
        parsed.push(completedDilemma);
      }
      localStorage.setItem("ethical_decisions", JSON.stringify(parsed));
      
      // Notify components (e.g., HistoryLog) to refresh
      window.dispatchEvent(new Event("local_decisions_updated"));
    } catch (err) {
      console.error("Error saving completed decision", err);
    }
  };

  return (
    <div id="app-root-layout" className="min-h-screen bg-[#F7F5F0] flex flex-col antialiased text-[#3D3B36]">
      {/* Top Header Navigation */}
      <header id="app-header" className="bg-white border-b border-[#E5E2D9] px-6 py-4 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#5A5A40] flex items-center justify-center shrink-0">
              <div className="w-2.5 h-2.5 bg-white rotate-45"></div>
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-serif font-semibold tracking-tight text-[#5A5A40] flex items-center gap-2">
                <span>Ethos AI / Eunoia</span>
              </h1>
              <p className="text-xs text-[#7C7971] font-medium">
                Structured philosophical frameworks & guided moral reflections
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] uppercase font-bold text-[#A09D94] tracking-wider">Active Session</p>
              <p className="text-xs font-semibold text-[#5D5B54] font-serif">
                {activeDilemma.title ? `"${activeDilemma.title}"` : "Drafting New Dilemma"}
              </p>
            </div>
            <button
              id="global-reset-btn"
              onClick={handleReset}
              className="px-5 py-2 text-xs font-semibold rounded-full border border-[#D1CEC4] hover:bg-[#F0EEE6] text-[#5A5A40] transition-colors cursor-pointer"
            >
              Start Fresh
            </button>
          </div>
        </div>
      </header>

      {/* Main Grid Content */}
      <main id="app-main-grid" className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Hand: Interactive Moral Frameworks (2 Columns wide) */}
        <section id="workspace-left" className="lg:col-span-2 space-y-4 flex flex-col">
          {/* Framework Tab Selectors */}
          <div className="flex overflow-x-auto pb-1 gap-1 border-b border-[#E5E2D9]">
            <button
              id="tab-select-dilemma"
              onClick={() => setLeftTab('dilemma')}
              className={`px-4 py-2 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap border-b-2 pb-2 ${
                leftTab === 'dilemma'
                  ? 'text-[#5A5A40] border-[#5A5A40] font-bold'
                  : 'text-[#7C7971] border-transparent hover:text-[#5A5A40]'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>1. Define Dilemma</span>
            </button>
            <button
              id="tab-select-utilitarian"
              onClick={() => setLeftTab('utilitarian')}
              className={`px-4 py-2 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap border-b-2 pb-2 ${
                leftTab === 'utilitarian'
                  ? 'text-[#5A5A40] border-[#5A5A40] font-bold'
                  : 'text-[#7C7971] border-transparent hover:text-[#5A5A40]'
              }`}
            >
              <Scale className="w-4 h-4" />
              <span>2. Utilitarianism</span>
            </button>
            <button
              id="tab-select-deontology"
              onClick={() => setLeftTab('deontology')}
              className={`px-4 py-2 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap border-b-2 pb-2 ${
                leftTab === 'deontology'
                  ? 'text-[#5A5A40] border-[#5A5A40] font-bold'
                  : 'text-[#7C7971] border-transparent hover:text-[#5A5A40]'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>3. Deontology (Kantian)</span>
            </button>
            <button
              id="tab-select-virtue"
              onClick={() => setLeftTab('virtue')}
              className={`px-4 py-2 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap border-b-2 pb-2 ${
                leftTab === 'virtue'
                  ? 'text-[#5A5A40] border-[#5A5A40] font-bold'
                  : 'text-[#7C7971] border-transparent hover:text-[#5A5A40]'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>4. Virtue Mean</span>
            </button>
            <button
              id="tab-select-veil"
              onClick={() => setLeftTab('veil')}
              className={`px-4 py-2 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap border-b-2 pb-2 ${
                leftTab === 'veil'
                  ? 'text-[#5A5A40] border-[#5A5A40] font-bold'
                  : 'text-[#7C7971] border-transparent hover:text-[#5A5A40]'
              }`}
            >
              <EyeOff className="w-4 h-4" />
              <span>5. Veil of Ignorance</span>
            </button>
          </div>

          {/* Active Framework Worksheet Container */}
          <div id="framework-worksheet-card" className="bg-white border border-[#F0EEE6] rounded-[24px] sm:rounded-[32px] p-6 sm:p-10 shadow-xs flex-1">
            {leftTab === 'dilemma' && (
              <DilemmaInput
                dilemma={activeDilemma}
                onChange={handleDilemmaChange}
                onReset={() => {
                  const fresh = createEmptyDilemma();
                  setActiveDilemma(fresh);
                  localStorage.setItem("ethical_dilemma_active_draft", JSON.stringify(fresh));
                }}
              />
            )}

            {leftTab === 'utilitarian' && (
              <UtilitarianCalc
                dilemma={activeDilemma}
                onChange={handleDilemmaChange}
              />
            )}

            {leftTab === 'deontology' && (
              <DeontologyTest
                dilemma={activeDilemma}
                onChange={handleDilemmaChange}
              />
            )}

            {leftTab === 'virtue' && (
              <VirtueMean
                dilemma={activeDilemma}
                onChange={handleDilemmaChange}
              />
            )}

            {leftTab === 'veil' && (
              <RawlsVeil
                dilemma={activeDilemma}
                onChange={handleDilemmaChange}
              />
            )}
          </div>
        </section>

        {/* Right Hand: AI Advice & Moral Logs (1 Column wide) */}
        <section id="workspace-right" className="space-y-4 flex flex-col">
          {/* Right Selector Tabs */}
          <div className="flex gap-1 border-b border-[#E5E2D9]">
            <button
              id="tab-right-analysis"
              onClick={() => setRightTab('analysis')}
              className={`flex-1 py-2 text-center text-xs font-bold rounded-t-xl transition-all flex items-center justify-center gap-1 cursor-pointer border-t border-x ${
                rightTab === 'analysis'
                  ? 'bg-white border-[#E5E2D9] text-[#5A5A40] font-bold shadow-xs'
                  : 'bg-transparent border-transparent text-[#7C7971] hover:text-[#5A5A40]'
              }`}
            >
              <Brain className="w-4 h-4 text-[#5A5A40]" />
              <span>AI Advisor</span>
            </button>
            <button
              id="tab-right-chat"
              onClick={() => setRightTab('chat')}
              className={`flex-1 py-2 text-center text-xs font-bold rounded-t-xl transition-all flex items-center justify-center gap-1 cursor-pointer border-t border-x ${
                rightTab === 'chat'
                  ? 'bg-white border-[#E5E2D9] text-[#5A5A40] font-bold shadow-xs'
                  : 'bg-transparent border-transparent text-[#7C7971] hover:text-[#5A5A40]'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-[#5A5A40]" />
              <span>Socratic Chat</span>
            </button>
            <button
              id="tab-right-history"
              onClick={() => setRightTab('history')}
              className={`flex-1 py-2 text-center text-xs font-bold rounded-t-xl transition-all flex items-center justify-center gap-1 cursor-pointer border-t border-x ${
                rightTab === 'history'
                  ? 'bg-white border-[#E5E2D9] text-[#5A5A40] font-bold shadow-xs'
                  : 'bg-transparent border-transparent text-[#7C7971] hover:text-[#5A5A40]'
              }`}
            >
              <BookOpen className="w-4 h-4 text-[#5A5A40]" />
              <span>Journal Ledger</span>
            </button>
          </div>

          {/* Right Tab Content Panel */}
          <div id="right-tab-content-container" className="flex-1 flex flex-col">
            {rightTab === 'analysis' && (
              <div id="advisor-view-inner" className="bg-white border border-[#F0EEE6] rounded-[24px] p-6 shadow-xs flex-1">
                {(!activeDilemma.title || !activeDilemma.description) ? (
                  <div className="text-center py-10 space-y-2">
                    <AlertCircle className="w-10 h-10 text-[#7C7971] mx-auto" />
                    <p className="text-xs font-bold text-[#5A5A40] uppercase tracking-wide">Awaiting Dilemma Definition</p>
                    <p className="text-[11px] text-[#7C7971] max-w-xs mx-auto">
                      Please enter a Title and Description for your dilemma in the first tab before consulting the moral advisor.
                    </p>
                  </div>
                ) : (
                  <AIAnalysis
                    dilemma={activeDilemma}
                    onSaveCompleted={handleSaveCompleted}
                  />
                )}
              </div>
            )}

            {rightTab === 'chat' && (
              <div id="chat-view-inner" className="flex-1">
                {(!activeDilemma.title || !activeDilemma.description) ? (
                  <div className="bg-white border border-[#F0EEE6] rounded-[24px] p-8 text-center space-y-2 flex-1">
                    <AlertCircle className="w-10 h-10 text-[#7C7971] mx-auto" />
                    <p className="text-xs font-bold text-[#5A5A40] uppercase tracking-wide">Inquiry Locked</p>
                    <p className="text-[11px] text-[#7C7971]">
                      Define your dilemma context first to grant Socrates a focal point for inquiry.
                    </p>
                  </div>
                ) : (
                  <SocraticChat dilemma={activeDilemma} />
                )}
              </div>
            )}

            {rightTab === 'history' && (
              <div id="history-view-inner" className="bg-white border border-[#F0EEE6] rounded-[24px] p-6 shadow-xs flex-1">
                <HistoryLog
                  onLoadSession={handleLoadSession}
                  activeDilemmaId={activeDilemma.id}
                />
              </div>
            )}
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer id="app-footer" className="bg-white border-t border-[#F0EEE6] text-[#7C7971] text-center py-5 mt-auto text-[10px] font-bold tracking-widest uppercase">
        <div className="max-w-7xl mx-auto px-4">
          Philosophy Stack • Eunoia Ethical Studio • Guided by Kant, Mill, and Aristotle
        </div>
      </footer>
    </div>
  );
}

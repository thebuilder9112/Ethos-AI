export interface Stakeholder {
  id: string;
  name: string;
  role: string; // e.g., "Customer", "Employee", "Self", "Society"
}

export interface OptionImpact {
  stakeholderId: string;
  // Score from -5 (extreme harm) to +5 (extreme benefit)
  score: number;
  explanation: string;
}

export interface UtilitarianOption {
  id: string;
  description: string;
  impacts: OptionImpact[]; // one impact per stakeholder
}

export interface KantianTest {
  id: string; // matches option id
  universalizabilityScore: number; // 1 to 5
  universalizabilityExplanation: string;
  treatsAsEnd: boolean; // treats people as ends, not mere means
  treatsAsEndExplanation: string;
  dutyAlignment: number; // 1 to 5 (alignment with moral duty)
  dutyExplanation: string;
}

export interface VirtueAssessment {
  virtueName: string;
  deficiency: string; // extreme deficiency (e.g., Cowardice)
  excess: string;      // extreme excess (e.g., Rashness)
  meanDescription: string; // the golden mean (e.g., Courage)
  userValue: number;  // 0 to 100, where 50 is the perfect golden mean
  explanation: string;
}

export interface Dilemma {
  id: string;
  title: string;
  description: string;
  options: { id: string; text: string }[];
  stakeholders: Stakeholder[];
  utilitarianData: {
    options: UtilitarianOption[];
  };
  kantianData: KantianTest[];
  virtueData: VirtueAssessment[];
  veilOfIgnoranceReflection: string;
  createdAt: string;
  status: 'draft' | 'analyzing' | 'completed';
  finalDecision?: string;
  finalReflection?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

export interface SocraticSession {
  dilemmaId: string;
  messages: ChatMessage[];
}

export interface PhilosophicalBreakdown {
  summary: string;
  utilitarianVerdict: string;
  deontologicalVerdict: string;
  virtueVerdict: string;
  careEthicsVerdict: string;
  recommendedPath: string;
  probingQuestions: string[];
}

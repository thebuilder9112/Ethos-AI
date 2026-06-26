import React from 'react';
import { Dilemma, KantianTest } from '../types';
import { ShieldCheck, HelpCircle, Check, X, BookOpen } from 'lucide-react';

interface DeontologyTestProps {
  dilemma: Dilemma;
  onChange: (dilemma: Dilemma) => void;
}

export default function DeontologyTest({ dilemma, onChange }: DeontologyTestProps) {

  const handleKantianValueChange = (optionId: string, field: keyof KantianTest, value: any) => {
    const updatedKantian = dilemma.kantianData.map(test => {
      if (test.id !== optionId) return test;
      return { ...test, [field]: value };
    });

    onChange({
      ...dilemma,
      kantianData: updatedKantian
    });
  };

  const getKantianDataForOption = (optionId: string): KantianTest => {
    const found = dilemma.kantianData.find(k => k.id === optionId);
    if (found) return found;
    return {
      id: optionId,
      universalizabilityScore: 3,
      universalizabilityExplanation: "",
      treatsAsEnd: true,
      treatsAsEndExplanation: "",
      dutyAlignment: 3,
      dutyExplanation: ""
    };
  };

  return (
    <div id="deontology-test-container" className="space-y-6">
      <div id="deontology-intro" className="bg-[#FCFBF9] border border-[#E5E2D9] p-4 rounded-[20px]">
        <div className="flex gap-2.5">
          <ShieldCheck className="w-5 h-5 text-[#5A5A40] shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-[#5A5A40] uppercase tracking-widest mb-1 font-serif italic">
              Duty-Based Ethics (Deontology & Kantianism)
            </h4>
            <p className="text-xs text-[#5D5B54] leading-relaxed">
              Deontology focuses on <strong>moral rules, duties, and intentions</strong> rather than consequences. 
              Immanuel Kant proposed that an action is ethical if it adheres to the 
              <strong> Categorical Imperative</strong>. Test your options against these absolute principles below.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {dilemma.options.map((opt, idx) => {
          const kantData = getKantianDataForOption(opt.id);

          return (
            <div id={`deontology-card-${idx}`} key={opt.id} className="border border-[#F0EEE6] rounded-[24px] overflow-hidden shadow-xs bg-white">
              <div className="bg-[#FCFBF9] border-b border-[#F0EEE6] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-xs font-bold text-[#5A5A40] uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#5A5A40] text-white flex items-center justify-center text-[10px] font-bold">
                    {idx + 1}
                  </span>
                  Kant's Integrity Test
                </span>
                <p className="text-sm font-semibold text-[#2D2B26] font-serif line-clamp-1 max-w-md italic">
                  "{opt.text}"
                </p>
              </div>

              <div className="p-5 space-y-6">
                {/* 1. Universalizability Test */}
                <div id={`deontology-universal-${idx}`} className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h5 className="text-sm font-bold text-[#2D2B26]">
                        1. The Formula of Universal Law
                      </h5>
                      <p className="text-xs text-[#7C7971] max-w-xl font-serif italic leading-relaxed">
                        Can you universalize this option? If <em>everyone</em> in the world did this action in similar circumstances, would the system collapse or remain moral? (e.g., universal lying breaks communication).
                      </p>
                    </div>
                    <span className="font-mono text-xs font-bold text-[#5A5A40] bg-[#F2F1EC] border border-[#D1CEC4] px-2 py-0.5 rounded-sm shrink-0">
                      Score: {kantData.universalizabilityScore}/5
                    </span>
                  </div>

                  <div className="flex gap-4 items-center">
                    <span className="text-[10px] text-rose-600 font-bold uppercase tracking-widest">Contradiction</span>
                    <input
                      id={`deontology-unv-slider-${idx}`}
                      type="range"
                      min="1"
                      max="5"
                      value={kantData.universalizabilityScore}
                      onChange={(e) => handleKantianValueChange(opt.id, "universalizabilityScore", parseInt(e.target.value, 10))}
                      className="flex-1 h-1.5 bg-[#F2F1EC] rounded-lg appearance-none cursor-pointer accent-[#5A5A40]"
                    />
                    <span className="text-[10px] text-[#5A5A40] font-bold uppercase tracking-widest">Universal Law</span>
                  </div>

                  <textarea
                    id={`deontology-unv-explain-${idx}`}
                    rows={2}
                    value={kantData.universalizabilityExplanation}
                    onChange={(e) => handleKantianValueChange(opt.id, "universalizabilityExplanation", e.target.value)}
                    placeholder="If everyone behaved this way, what happens? (e.g., 'If everyone leaked confidential files, corporate trust is destroyed, but public transparency increases.')"
                    className="w-full p-3 border border-[#E5E2D9] bg-[#FCFBF9] rounded-xl text-xs text-[#3D3B36] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#5A5A40] placeholder-[#C2C0B8]"
                  />
                </div>

                {/* 2. Treats People as Ends formulation */}
                <div id={`deontology-respect-${idx}`} className="space-y-3 border-t border-[#F2F1EC] pt-4">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div>
                      <h5 className="text-sm font-bold text-[#2D2B26]">
                        2. The Formula of Humanity (Respect)
                      </h5>
                      <p className="text-xs text-[#7C7971] max-w-xl font-serif italic leading-relaxed">
                        Does this option treat other people as <strong>ends in themselves</strong> (valuable, rational beings), or merely as <strong>means to an end</strong> (using them to get what you want, e.g., lying to a customer)?
                      </p>
                    </div>

                    <button
                      id={`deontology-respect-toggle-${idx}`}
                      onClick={() => handleKantianValueChange(opt.id, "treatsAsEnd", !kantData.treatsAsEnd)}
                      className={`px-4 py-1.5 rounded-full text-[10px] font-bold border flex items-center gap-1 transition-all cursor-pointer shrink-0 ${
                        kantData.treatsAsEnd 
                          ? "bg-[#F2F1EC] text-[#5A5A40] border-[#D1CEC4]" 
                          : "bg-rose-50 text-rose-700 border-rose-200/50"
                      }`}
                    >
                      {kantData.treatsAsEnd ? (
                        <>
                          <Check className="w-3 h-3 text-[#5A5A40]" />
                          <span>Treats as End</span>
                        </>
                      ) : (
                        <>
                          <X className="w-3 h-3 text-rose-600" />
                          <span>Uses as Mere Means</span>
                        </>
                      )}
                    </button>
                  </div>

                  <textarea
                    id={`deontology-respect-explain-${idx}`}
                    rows={2}
                    value={kantData.treatsAsEndExplanation}
                    onChange={(e) => handleKantianValueChange(opt.id, "treatsAsEndExplanation", e.target.value)}
                    placeholder="Explain how this option respects or violates individual human dignity..."
                    className="w-full p-3 border border-[#E5E2D9] bg-[#FCFBF9] rounded-xl text-xs text-[#3D3B36] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#5A5A40] placeholder-[#C2C0B8]"
                  />
                </div>

                {/* 3. Alignment with Moral Duty */}
                <div id={`deontology-duty-${idx}`} className="space-y-3 border-t border-[#F2F1EC] pt-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h5 className="text-sm font-bold text-[#2D2B26]">
                        3. Alignment with Moral Duty
                      </h5>
                      <p className="text-xs text-[#7C7971] max-w-xl font-serif italic leading-relaxed">
                        Does this action align with core universal duties (such as Honesty, Fidelity, Non-maleficence, Justice, and Beneficence)? An action done out of raw self-interest holds no moral worth for Kant.
                      </p>
                    </div>
                    <span className="font-mono text-xs font-bold text-[#5A5A40] bg-[#F2F1EC] border border-[#D1CEC4] px-2 py-0.5 rounded-sm shrink-0">
                      Alignment: {kantData.dutyAlignment}/5
                    </span>
                  </div>

                  <div className="flex gap-4 items-center">
                    <span className="text-[10px] text-rose-600 font-bold uppercase tracking-widest">Self-Interest</span>
                    <input
                      id={`deontology-duty-slider-${idx}`}
                      type="range"
                      min="1"
                      max="5"
                      value={kantData.dutyAlignment}
                      onChange={(e) => handleKantianValueChange(opt.id, "dutyAlignment", parseInt(e.target.value, 10))}
                      className="flex-1 h-1.5 bg-[#F2F1EC] rounded-lg appearance-none cursor-pointer accent-[#5A5A40]"
                    />
                    <span className="text-[10px] text-[#5A5A40] font-bold uppercase tracking-widest">Pure Duty</span>
                  </div>

                  <textarea
                    id={`deontology-duty-explain-${idx}`}
                    rows={2}
                    value={kantData.dutyExplanation}
                    onChange={(e) => handleKantianValueChange(opt.id, "dutyExplanation", e.target.value)}
                    placeholder="Which universal duties are you honoring or failing to honor here? (e.g., 'Honors duty of truthfulness but fails duty of professional confidentiality.')"
                    className="w-full p-3 border border-[#E5E2D9] bg-[#FCFBF9] rounded-xl text-xs text-[#3D3B36] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#5A5A40] placeholder-[#C2C0B8]"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

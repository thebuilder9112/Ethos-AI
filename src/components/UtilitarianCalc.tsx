import React from 'react';
import { Dilemma, UtilitarianOption } from '../types';
import { Scale, Heart, AlertTriangle, MessageSquare } from 'lucide-react';

interface UtilitarianCalcProps {
  dilemma: Dilemma;
  onChange: (dilemma: Dilemma) => void;
}

export default function UtilitarianCalc({ dilemma, onChange }: UtilitarianCalcProps) {
  const getStakeholderName = (id: string) => {
    return dilemma.stakeholders.find(s => s.id === id)?.name || "Unknown Stakeholder";
  };

  const getStakeholderRole = (id: string) => {
    return dilemma.stakeholders.find(s => s.id === id)?.role || "";
  };

  const handleImpactScoreChange = (optionId: string, stakeholderId: string, score: number) => {
    const updatedOptions = dilemma.utilitarianData.options.map(opt => {
      if (opt.id !== optionId) return opt;
      const impacts = opt.impacts.map(imp => {
        if (imp.stakeholderId !== stakeholderId) return imp;
        return { ...imp, score };
      });
      return { ...opt, impacts };
    });

    onChange({
      ...dilemma,
      utilitarianData: {
        ...dilemma.utilitarianData,
        options: updatedOptions
      }
    });
  };

  const handleImpactExplanationChange = (optionId: string, stakeholderId: string, explanation: string) => {
    const updatedOptions = dilemma.utilitarianData.options.map(opt => {
      if (opt.id !== optionId) return opt;
      const impacts = opt.impacts.map(imp => {
        if (imp.stakeholderId !== stakeholderId) return imp;
        return { ...imp, explanation };
      });
      return { ...opt, impacts };
    });

    onChange({
      ...dilemma,
      utilitarianData: {
        ...dilemma.utilitarianData,
        options: updatedOptions
      }
    });
  };

  // Ensure utilitarianData options match current dilemma options and stakeholders
  const syncUtilitarianData = (): UtilitarianOption[] => {
    return dilemma.options.map(opt => {
      const existingOpt = dilemma.utilitarianData.options?.find(o => o.id === opt.id);
      const impacts = dilemma.stakeholders.map(stk => {
        const existingImpact = existingOpt?.impacts?.find(i => i.stakeholderId === stk.id);
        return {
          stakeholderId: stk.id,
          score: existingImpact ? existingImpact.score : 0,
          explanation: existingImpact ? existingImpact.explanation : ""
        };
      });
      return {
        id: opt.id,
        description: opt.text,
        impacts
      };
    });
  };

  const currentUtilOptions = syncUtilitarianData();

  // Calculate totals for each option
  const optionTotals = currentUtilOptions.map(opt => {
    const total = opt.impacts.reduce((sum, imp) => sum + imp.score, 0);
    return {
      id: opt.id,
      text: opt.description,
      total
    };
  });

  const getScoreColor = (score: number) => {
    if (score > 0) return "text-[#5A5A40] bg-[#F2F1EC] border-[#D1CEC4]";
    if (score < 0) return "text-rose-700 bg-rose-50 border-rose-200/50";
    return "text-[#7C7971] bg-[#FCFBF9] border-[#E5E2D9]";
  };

  return (
    <div id="utilitarian-calc-container" className="space-y-6">
      <div id="utilitarian-intro" className="bg-[#FCFBF9] border border-[#E5E2D9] p-4 rounded-[20px]">
        <div className="flex gap-2.5">
          <Scale className="w-5 h-5 text-[#5A5A40] shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-[#5A5A40] uppercase tracking-widest mb-1 font-serif italic">
              Consequentialist Analysis (Utilitarianism)
            </h4>
            <p className="text-xs text-[#5D5B54] leading-relaxed">
              Utilitarianism states that the ethically correct option is the one that produces the 
              <strong> greatest net happiness or well-being for the greatest number of people</strong>. 
              Score the potential impact of each course of action on your stakeholders below.
            </p>
          </div>
        </div>
      </div>

      {/* Real-time utility score comparison chart */}
      {optionTotals.length > 0 && (
        <div id="utility-scoreboard" className="border border-[#F0EEE6] bg-white p-5 rounded-[24px] shadow-xs">
          <h5 className="text-xs font-bold text-[#7C7971] uppercase mb-4 tracking-widest">
            Net Well-Being Index (Comparative Scoreboard)
          </h5>
          <div className="space-y-4">
            {optionTotals.map((opt, idx) => {
              const maxPossible = dilemma.stakeholders.length * 5;
              const minPossible = dilemma.stakeholders.length * -5;
              const percentage = maxPossible !== minPossible 
                ? ((opt.total - minPossible) / (maxPossible - minPossible)) * 100 
                : 50;

              return (
                <div id={`scoreboard-opt-${idx}`} key={opt.id} className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-[#2D2B26] font-serif text-sm line-clamp-1 flex-1 pr-4">
                      {idx + 1}. {opt.text}
                    </span>
                    <span className={`font-mono px-2 py-0.5 rounded-sm border text-[11px] font-bold ${
                      opt.total > 0 ? "bg-[#F2F1EC] text-[#5A5A40] border-[#D1CEC4]" :
                      opt.total < 0 ? "bg-rose-50 text-rose-700 border-rose-200/50" :
                      "bg-[#FCFBF9] text-[#7C7971] border-[#E5E2D9]"
                    }`}>
                      Net Impact: {opt.total > 0 ? `+${opt.total}` : opt.total}
                    </span>
                  </div>
                  <div className="w-full bg-[#F2F1EC] h-2.5 rounded-full overflow-hidden relative">
                    <div 
                      className={`h-full transition-all duration-300 ${
                        opt.total > 0 ? "bg-[#5A5A40]" :
                        opt.total < 0 ? "bg-rose-500" :
                        "bg-[#A09D94]"
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                    {/* Neutral center tick */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-[#DEDCD4]" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Interactive rating cards */}
      <div id="utility-calculator" className="space-y-6">
        {currentUtilOptions.map((opt, optIdx) => (
          <div id={`util-opt-card-${optIdx}`} key={opt.id} className="border border-[#F0EEE6] rounded-[24px] overflow-hidden shadow-xs bg-white">
            <div className="bg-[#FCFBF9] border-b border-[#F0EEE6] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs font-bold text-[#5A5A40] uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-[#5A5A40] text-white flex items-center justify-center text-[10px] font-bold">
                  {optIdx + 1}
                </span>
                Option {optIdx + 1} Impacts
              </span>
              <p className="text-sm font-semibold text-[#2D2B26] font-serif line-clamp-1 max-w-md italic">
                "{opt.description}"
              </p>
            </div>

            {opt.impacts.length === 0 ? (
              <div className="p-6 text-center text-[#A09D94] text-xs font-medium">
                No stakeholders defined. Go to the "Define Dilemma" tab to add stakeholders.
              </div>
            ) : (
              <div className="divide-y divide-[#F2F1EC]">
                {opt.impacts.map((imp, impIdx) => (
                  <div id={`util-impact-${optIdx}-${impIdx}`} key={imp.stakeholderId} className="p-5 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="text-sm font-semibold text-[#2D2B26]">
                          {getStakeholderName(imp.stakeholderId)}
                        </span>
                        <span className="text-xs text-[#7C7971] font-serif italic ml-2">
                          ({getStakeholderRole(imp.stakeholderId)})
                        </span>
                      </div>
                      
                      {/* Score Indicator Badge */}
                      <div className="flex items-center gap-2">
                        {imp.score > 0 && <Heart className="w-3.5 h-3.5 text-[#5A5A40] fill-[#5A5A40]" />}
                        {imp.score < 0 && <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />}
                        <span className={`text-xs font-mono font-bold px-2 py-0.5 border rounded-sm ${getScoreColor(imp.score)}`}>
                          {imp.score > 0 ? `+${imp.score}` : imp.score}
                        </span>
                      </div>
                    </div>

                    {/* Interactive Slider */}
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] font-bold text-rose-600 uppercase tracking-widest">Severe Harm</span>
                      <input
                        id={`util-slider-${optIdx}-${impIdx}`}
                        type="range"
                        min="-5"
                        max="5"
                        value={imp.score}
                        onChange={(e) => handleImpactScoreChange(opt.id, imp.stakeholderId, parseInt(e.target.value, 10))}
                        className="flex-1 h-1.5 bg-[#F2F1EC] rounded-lg appearance-none cursor-pointer accent-[#5A5A40]"
                      />
                      <span className="text-[10px] font-bold text-[#5A5A40] uppercase tracking-widest">High Benefit</span>
                    </div>

                    {/* Short explanation input */}
                    <div className="flex gap-2.5 items-center bg-[#FCFBF9] p-2.5 rounded-xl border border-[#F0EEE6]">
                      <MessageSquare className="w-3.5 h-3.5 text-[#A09D94] shrink-0" />
                      <input
                        id={`util-explain-${optIdx}-${impIdx}`}
                        type="text"
                        value={imp.explanation}
                        onChange={(e) => handleImpactExplanationChange(opt.id, imp.stakeholderId, e.target.value)}
                        placeholder="Why is it scored this way? (e.g., Loses job security, gains peace of mind)"
                        className="w-full text-xs bg-transparent border-none outline-hidden text-[#5A5A40] placeholder-[#C2C0B8]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

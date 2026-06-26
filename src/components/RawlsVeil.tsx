import React, { useState } from 'react';
import { Dilemma } from '../types';
import { EyeOff, Eye, Sparkles, MessageSquare } from 'lucide-react';

interface RawlsVeilProps {
  dilemma: Dilemma;
  onChange: (dilemma: Dilemma) => void;
}

export default function RawlsVeil({ dilemma, onChange }: RawlsVeilProps) {
  const [veilLowered, setVeilLowered] = useState(false);

  const handleReflectionChange = (val: string) => {
    onChange({
      ...dilemma,
      veilOfIgnoranceReflection: val
    });
  };

  return (
    <div id="rawls-veil-container" className="space-y-6">
      <div id="veil-intro" className="bg-[#FCFBF9] border border-[#E5E2D9] p-4 rounded-[20px]">
        <div className="flex gap-2.5">
          <EyeOff className="w-5 h-5 text-[#5A5A40] shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-[#5A5A40] uppercase tracking-widest mb-1 font-serif italic">
              Social Contract & Rawls' Veil of Ignorance
            </h4>
            <p className="text-xs text-[#5D5B54] leading-relaxed font-sans">
              Political philosopher John Rawls proposed that to make a truly fair decision, you must think from behind a 
              <strong> "Veil of Ignorance."</strong> Behind this veil, you know nothing of your own station, class, wealth, 
              or personal interests. Toggle the veil to temporarily anonymize your identity and see if your choice remains just.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Veil Toggle */}
      <div id="veil-interactive-panel" className="border border-[#F0EEE6] rounded-[24px] p-5 bg-white shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3.5 border-b border-[#F2F1EC]">
          <div>
            <h5 className="text-sm font-bold text-[#2D2B26] font-serif">
              The Veil Thought Experiment
            </h5>
            <p className="text-xs text-[#7C7971] italic font-serif leading-normal">
              Anonymize roles to inspect the system free of self-interested bias.
            </p>
          </div>

          <button
            id="toggle-veil-btn"
            onClick={() => setVeilLowered(!veilLowered)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 cursor-pointer ${
              veilLowered 
                ? "bg-[#5A5A40] text-white border-[#5A5A40] hover:bg-[#484833] shadow-sm" 
                : "bg-white hover:bg-[#FCFBF9] text-[#5A5A40] border-[#D1CEC4] shadow-xs"
            }`}
          >
            {veilLowered ? (
              <>
                <Eye className="w-4 h-4 text-[#F0E6D2]" />
                <span>Lift the Veil (De-anonymize)</span>
              </>
            ) : (
              <>
                <EyeOff className="w-4 h-4 text-[#5A5A40]" />
                <span>Lower the Veil (Anonymize)</span>
              </>
            )}
          </button>
        </div>

        {/* Dynamic Stakeholders list depending on Veil state */}
        <div className="space-y-3">
          <p className="text-xs font-bold text-[#5A5A40] uppercase tracking-widest">
            {veilLowered ? "Anonymized Stakeholder Matrix (View from behind the Veil):" : "Your Declared Stakeholders:"}
          </p>

          {dilemma.stakeholders.length === 0 ? (
            <p className="text-xs text-[#A09D94] italic font-medium">No stakeholders added yet. Add stakeholders in the Define Dilemma tab.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {dilemma.stakeholders.map((stk, idx) => (
                <div 
                  id={`veil-stakeholder-card-${idx}`}
                  key={stk.id} 
                  className={`p-4.5 rounded-xl border transition-all duration-300 ${
                    veilLowered 
                      ? "bg-[#5A5A40] text-white border-[#5A5A40] shadow-inner" 
                      : "bg-[#FCFBF9] text-[#3D3B36] border-[#F0EEE6]"
                  }`}
                >
                  <p className="text-sm font-semibold">
                    {veilLowered ? `Anonymized Subject #${idx + 1}` : stk.name}
                  </p>
                  <p className={`text-xs font-serif italic mt-0.5 ${veilLowered ? "text-white/70" : "text-[#7C7971]"}`}>
                    {veilLowered ? "Role and relationship obscured by Veil" : `Role: ${stk.role}`}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {veilLowered && (
          <div id="veil-active-notification" className="bg-[#FCFBF9] text-[#3D3B36] p-4 rounded-xl border border-[#D1CEC4] text-xs leading-relaxed font-sans flex items-start gap-2.5 shadow-xs">
            <Sparkles className="w-4.5 h-4.5 text-[#5A5A40] shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#5A5A40] font-serif font-bold">Behind the Veil:</strong> You could wake up tomorrow as any of these Anonymized Subjects. 
              As Subject #1, Subject #2, or Subject #3. If you had to sign a "Social Contract" before entering this world, 
              which of your options would guarantee fair, survivable outcomes for the <em>least advantaged</em>?
            </div>
          </div>
        )}
      </div>

      {/* Reflection prompt */}
      <div id="veil-reflection-input" className="space-y-1.5">
        <label htmlFor="veil-reflection-textarea" className="block text-xs font-bold text-[#5A5A40] uppercase tracking-widest">
          Social Contract Reflection (Veil of Ignorance)
        </label>
        <div className="flex gap-2.5 items-start bg-[#FCFBF9] p-3 rounded-xl border border-[#E5E2D9]">
          <MessageSquare className="w-4 h-4 text-[#A09D94] mt-1 shrink-0" />
          <textarea
            id="veil-reflection-textarea"
            rows={4}
            value={dilemma.veilOfIgnoranceReflection}
            onChange={(e) => handleReflectionChange(e.target.value)}
            placeholder="e.g., 'If I were Patient A (the respected elder), option B would leave me to die, which feels unfair. If I were Patient B, option A ignores my long career potential. However, looking from behind the veil, allocating resources based on potential life-years is more universally fair to society...'"
            className="w-full text-xs bg-transparent border-none outline-hidden text-[#3D3B36] placeholder-[#C2C0B8] leading-relaxed"
          />
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { Dilemma, VirtueAssessment } from '../types';
import { Compass, Sparkles, MessageSquare } from 'lucide-react';

interface VirtueMeanProps {
  dilemma: Dilemma;
  onChange: (dilemma: Dilemma) => void;
}

export default function VirtueMean({ dilemma, onChange }: VirtueMeanProps) {

  const handleVirtueValueChange = (virtueName: string, value: number) => {
    const updatedVirtues = dilemma.virtueData.map(v => {
      if (v.virtueName !== virtueName) return v;
      return { ...v, userValue: value };
    });

    onChange({
      ...dilemma,
      virtueData: updatedVirtues
    });
  };

  const handleVirtueExplanationChange = (virtueName: string, explanation: string) => {
    const updatedVirtues = dilemma.virtueData.map(v => {
      if (v.virtueName !== virtueName) return v;
      return { ...v, explanation };
    });

    onChange({
      ...dilemma,
      virtueData: updatedVirtues
    });
  };

  // Help determine qualitative state based on value
  const getVirtueState = (v: VirtueAssessment) => {
    const val = v.userValue;
    if (val < 35) {
      return {
        label: `Deficiency: ${v.deficiency}`,
        color: "text-[#5D5B54] bg-[#F2F1EC] border-[#D1CEC4]",
        desc: "You are exhibiting too little of this virtue. This is a deficiency vice."
      };
    } else if (val >= 35 && val <= 65) {
      return {
        label: `The Golden Mean: ${v.virtueName}`,
        color: "text-[#5A5A40] bg-white border-[#5A5A40] font-bold",
        desc: "Excellent. You are hitting the Aristotelian golden mean—the balanced ideal of this character trait."
      };
    } else {
      return {
        label: `Excess: ${v.excess}`,
        color: "text-rose-700 bg-rose-50 border-rose-200/50",
        desc: "You are taking this quality to an extreme, turning a noble trait into a vice of excess."
      };
    }
  };

  return (
    <div id="virtue-mean-container" className="space-y-6">
      <div id="virtue-intro" className="bg-[#FCFBF9] border border-[#E5E2D9] p-4 rounded-[20px]">
        <div className="flex gap-2.5">
          <Compass className="w-5 h-5 text-[#5A5A40] shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-[#5A5A40] uppercase tracking-widest mb-1 font-serif italic">
              Aristotelian Virtue Ethics (The Golden Mean)
            </h4>
            <p className="text-xs text-[#5D5B54] leading-relaxed">
              Virtue Ethics focuses on <strong>moral character and integrity</strong>. Aristotle taught that a virtue 
              is the <strong>Golden Mean</strong> between two vices: 
              a <strong>deficiency</strong> (too little) and an <strong>excess</strong> (too much). 
              Position where your intended action lies for each virtue below and strive for the balanced center (35% to 65%).
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {dilemma.virtueData.map((v, idx) => {
          const state = getVirtueState(v);

          return (
            <div id={`virtue-card-${idx}`} key={v.virtueName} className="border border-[#F0EEE6] rounded-[24px] bg-white p-5 space-y-4 shadow-xs flex flex-col justify-between">
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <h5 className="text-sm font-bold text-[#2D2B26] flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-[#5A5A40]" />
                    {v.virtueName}
                  </h5>
                  <span className="text-xs text-[#7C7971] font-serif italic">
                    Ideal: 50% / Current: {v.userValue}%
                  </span>
                </div>
                <p className="text-xs text-[#7C7971] italic font-serif">
                  "{v.meanDescription}"
                </p>
              </div>

              {/* Graphical Balance Beam */}
              <div className="space-y-3 bg-[#FCFBF9] p-3.5 rounded-xl border border-[#F0EEE6]">
                <div className="flex justify-between text-[10px] font-bold text-[#7C7971] px-1 uppercase tracking-wider">
                  <span className="text-[#A09D94]">← {v.deficiency}</span>
                  <span className="text-[#5A5A40]">★ {v.virtueName}</span>
                  <span className="text-rose-700">{v.excess} →</span>
                </div>

                <div className="relative pt-1">
                  <input
                    id={`virtue-slider-${idx}`}
                    type="range"
                    min="0"
                    max="100"
                    value={v.userValue}
                    onChange={(e) => handleVirtueValueChange(v.virtueName, parseInt(e.target.value, 10))}
                    className="w-full h-1.5 bg-[#F2F1EC] rounded-lg appearance-none cursor-pointer accent-[#5A5A40]"
                  />
                  {/* Ideal center tick */}
                  <div className="absolute left-1/2 top-0 bottom-0 w-0.5 h-3.5 bg-[#5A5A40] -mt-1 pointer-events-none" />
                </div>

                <div className={`p-2.5 rounded-lg border text-xs space-y-0.5 leading-snug transition-colors ${state.color}`}>
                  <p className="font-bold uppercase tracking-wider text-[10px]">{state.label}</p>
                  <p className="text-[#5D5B54] font-medium font-serif italic">{state.desc}</p>
                </div>
              </div>

              {/* Moral Reflection text for this virtue */}
              <div className="space-y-1.5 pt-1">
                <label htmlFor={`virtue-explain-${idx}`} className="block text-[10px] font-bold text-[#7C7971] uppercase tracking-widest">
                  Reflection: How does your decision honor this virtue?
                </label>
                <div className="flex gap-2 items-start bg-[#FCFBF9] p-2.5 rounded-xl border border-[#E5E2D9]">
                  <MessageSquare className="w-3.5 h-3.5 text-[#A09D94] mt-0.5 shrink-0" />
                  <textarea
                    id={`virtue-explain-${idx}`}
                    rows={2}
                    value={v.explanation}
                    onChange={(e) => handleVirtueExplanationChange(v.virtueName, e.target.value)}
                    placeholder="e.g., 'To speak out requires high courage, but doing so tactfully ensures compassion towards innocent peers.'"
                    className="w-full text-xs bg-transparent border-none outline-hidden text-[#5A5A40] placeholder-[#C2C0B8] resize-none"
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

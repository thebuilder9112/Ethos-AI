import React from 'react';
import { Dilemma } from '../types';
import { Book, Calendar, Trash2, ArrowUpRight, CheckCircle } from 'lucide-react';

interface HistoryLogProps {
  dilemmas: Dilemma[];
  onLoadSession: (dilemma: Dilemma) => void;
  onDeleteSession: (id: string) => void;
  activeDilemmaId: string;
}

export default function HistoryLog({ dilemmas, onLoadSession, onDeleteSession, activeDilemmaId }: HistoryLogProps) {
  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmed = window.confirm("Are you sure you want to delete this moral reflection from your archive?");
    if (confirmed) {
      onDeleteSession(id);
    }
  };

  return (
    <div id="history-log-container" className="space-y-6">
      <div id="history-intro" className="bg-[#FCFBF9] border border-[#E5E2D9] p-4 rounded-[20px]">
        <div className="flex gap-2.5">
          <Book className="w-5 h-5 text-[#5A5A40] shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-[#5A5A40] uppercase tracking-widest mb-1 font-serif italic">
              Your Ethical Journal & Archive
            </h4>
            <p className="text-xs text-[#5D5B54] leading-relaxed">
              This acts as your personal ledger of moral reflection. 
              Review the complex dilemmas you have parsed and loaded here. 
              Use this archive to track how your ethical decision rules evolve over time.
            </p>
          </div>
        </div>
      </div>

      {dilemmas.length === 0 ? (
        <div id="empty-history" className="text-center py-12 border border-dashed border-[#E5E2D9] rounded-[24px] space-y-2 bg-white">
          <p className="text-xs text-[#7C7971] font-medium">Your ethical ledger is currently blank.</p>
          <p className="text-[10px] text-[#A09D94] font-serif italic">Complete any dilemma analysis and seal your decision to log it here.</p>
        </div>
      ) : (
        <div id="history-grid" className="grid grid-cols-1 gap-4">
          {dilemmas.map((item, idx) => {
            const isActive = item.id === activeDilemmaId;
            const dateStr = item.createdAt 
              ? new Date(item.createdAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })
              : "Ongoing";

            return (
              <div
                id={`history-card-${idx}`}
                key={item.id}
                onClick={() => onLoadSession(item)}
                className={`border text-left rounded-[24px] p-5 space-y-3.5 cursor-pointer transition-all hover:border-[#5A5A40] hover:shadow-xs bg-white relative ${
                  isActive ? "ring-1 ring-[#5A5A40] border-[#5A5A40] bg-[#FCFBF9]" : "border-[#F0EEE6]"
                }`}
              >
                {/* Header */}
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-0.5">
                    <span className="text-xs font-serif italic text-[#A09D94] flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {dateStr}
                    </span>
                    <h5 className="text-base font-bold text-[#2D2B26] font-serif">
                      {item.title || "Untitled Dilemma"}
                    </h5>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      id={`delete-history-btn-${idx}`}
                      onClick={(e) => handleDelete(item.id, e)}
                      className="text-[#A09D94] hover:text-rose-600 p-1 rounded transition-colors"
                      title="Delete Entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[10px] bg-[#F2F1EC] border border-[#D1CEC4] text-[#5A5A40] px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                      <span>Load</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>

                {/* Subtitle / desc */}
                <p className="text-xs text-[#5D5B54] line-clamp-2 leading-relaxed">
                  {item.description}
                </p>

                {/* Decision result */}
                {item.finalDecision && (
                  <div className="bg-[#FCFBF9] border border-[#5A5A40]/35 p-3 rounded-xl flex items-start gap-2.5 text-xs leading-normal">
                    <CheckCircle className="w-4 h-4 text-[#5A5A40] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-[#5A5A40] uppercase tracking-wider text-[10px] block mb-0.5">Sealed Action:</span>{" "}
                      <span className="text-[#3D3B36] font-serif italic">"{item.finalDecision}"</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

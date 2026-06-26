import React, { useState } from 'react';
import { Dilemma, Stakeholder } from '../types';
import { Plus, Trash, HelpCircle, BookOpen } from 'lucide-react';

interface DilemmaInputProps {
  dilemma: Dilemma;
  onChange: (dilemma: Dilemma) => void;
  onReset: () => void;
}

const SAMPLE_DILEMMAS = [
  {
    title: "The Whistleblower's Loyalty",
    description: "You have discovered that your tech company is secretly selling user location data to third-party brokers without explicit consent, violating their privacy policy. Reporting it internally has been ignored by management. If you leak the files to the press, you protect millions of users but break your non-disclosure agreement, lose your career, and jeopardize your family's financial stability.",
    options: [
      { id: "leak", text: "Leak the documents anonymously to a major newspaper to protect user privacy." },
      { id: "silent", text: "Remain silent to maintain company loyalty, keep your job, and protect your family's livelihood." }
    ],
    stakeholders: [
      { id: "self", name: "Myself", role: "Whistleblower / Employee" },
      { id: "family", name: "My Family", role: "Financial Dependents" },
      { id: "users", name: "App Users", role: "Victims of Privacy Violations" },
      { id: "company", name: "Company Executives / Shareholders", role: "Contractual Partners" }
    ]
  },
  {
    title: "Resource Allocation in Crisis",
    description: "You are the administrator of a rural hospital with only one ICU ventilator remaining. Two patients arrive simultaneously in critical condition. Patient A is a 72-year-old retired schoolteacher who has served the local community for 40 years. Patient B is a 24-year-old medical student with a long, promising career of saving lives ahead of them. Both have equal immediate clinical need.",
    options: [
      { id: "elderly", text: "Allocate the ventilator to Patient A (the 72-year-old teacher) on a first-come / gratitude basis." },
      { id: "youth", text: "Allocate the ventilator to Patient B (the 24-year-old medical student) based on potential life-years saved." }
    ],
    stakeholders: [
      { id: "teacher", name: "Patient A (72yo Teacher)", role: "Respected Elder" },
      { id: "student", name: "Patient B (24yo Student)", role: "Promising Youth" },
      { id: "society", name: "The Community", role: "Beneficiary of Public Goods" },
      { id: "admin", name: "Myself (Hospital Admin)", role: "Duty-bound Decision Maker" }
    ]
  }
];

export default function DilemmaInput({ dilemma, onChange, onReset }: DilemmaInputProps) {
  const [newOption, setNewOption] = useState("");
  const [newStakeholderName, setNewStakeholderName] = useState("");
  const [newStakeholderRole, setNewStakeholderRole] = useState("");

  const handleLoadSample = (sample: typeof SAMPLE_DILEMMAS[0]) => {
    const updated: Dilemma = {
      ...dilemma,
      title: sample.title,
      description: sample.description,
      options: sample.options.map(o => ({ ...o })),
      stakeholders: sample.stakeholders.map(s => ({ ...s })),
      utilitarianData: {
        options: sample.options.map(o => ({
          id: o.id,
          description: o.text,
          impacts: sample.stakeholders.map(s => ({
            stakeholderId: s.id,
            score: 0,
            explanation: ""
          }))
        }))
      },
      kantianData: sample.options.map(o => ({
        id: o.id,
        universalizabilityScore: 3,
        universalizabilityExplanation: "",
        treatsAsEnd: true,
        treatsAsEndExplanation: "",
        dutyAlignment: 3,
        dutyExplanation: ""
      })),
      virtueData: [
        { virtueName: "Honesty", deficiency: "Deceitfulness", excess: "Bluntness/Tactlessness", meanDescription: "Truthfulness in communication", userValue: 50, explanation: "" },
        { virtueName: "Courage", deficiency: "Cowardice", excess: "Rashness/Recklessness", meanDescription: "Standing firm for moral truth", userValue: 50, explanation: "" },
        { virtueName: "Fairness", deficiency: "Bias/Selfishness", excess: "Rigid Legalism", meanDescription: "Giving everyone their ethical due", userValue: 50, explanation: "" },
        { virtueName: "Compassion", deficiency: "Apathy/Callousness", excess: "Enabling Dependency", meanDescription: "Active empathy toward suffering", userValue: 50, explanation: "" }
      ]
    };
    onChange(updated);
  };

  const handleFieldChange = (key: keyof Dilemma, value: any) => {
    onChange({
      ...dilemma,
      [key]: value
    });
  };

  const addOption = () => {
    if (!newOption.trim()) return;
    const optId = `opt_${Date.now()}`;
    const updatedOptions = [...dilemma.options, { id: optId, text: newOption }];
    
    // Sync utilitarian options
    const updatedUtilitarianOptions = [
      ...dilemma.utilitarianData.options,
      {
        id: optId,
        description: newOption,
        impacts: dilemma.stakeholders.map(s => ({
          stakeholderId: s.id,
          score: 0,
          explanation: ""
        }))
      }
    ];

    // Sync Kantian data
    const updatedKantian = [
      ...dilemma.kantianData,
      {
        id: optId,
        universalizabilityScore: 3,
        universalizabilityExplanation: "",
        treatsAsEnd: true,
        treatsAsEndExplanation: "",
        dutyAlignment: 3,
        dutyExplanation: ""
      }
    ];

    onChange({
      ...dilemma,
      options: updatedOptions,
      utilitarianData: { options: updatedUtilitarianOptions },
      kantianData: updatedKantian
    });
    setNewOption("");
  };

  const removeOption = (id: string) => {
    onChange({
      ...dilemma,
      options: dilemma.options.filter(o => o.id !== id),
      utilitarianData: {
        options: dilemma.utilitarianData.options.filter(o => o.id !== id)
      },
      kantianData: dilemma.kantianData.filter(k => k.id !== id)
    });
  };

  const addStakeholder = () => {
    if (!newStakeholderName.trim()) return;
    const sId = `stk_${Date.now()}`;
    const newStk: Stakeholder = {
      id: sId,
      name: newStakeholderName,
      role: newStakeholderRole || "Affected Party"
    };
    const updatedStk = [...dilemma.stakeholders, newStk];

    // Append impact entries for this new stakeholder in all utilitarian options
    const updatedUtilOptions = dilemma.utilitarianData.options.map(opt => ({
      ...opt,
      impacts: [
        ...opt.impacts,
        { stakeholderId: sId, score: 0, explanation: "" }
      ]
    }));

    onChange({
      ...dilemma,
      stakeholders: updatedStk,
      utilitarianData: { options: updatedUtilOptions }
    });

    setNewStakeholderName("");
    setNewStakeholderRole("");
  };

  const removeStakeholder = (id: string) => {
    onChange({
      ...dilemma,
      stakeholders: dilemma.stakeholders.filter(s => s.id !== id),
      utilitarianData: {
        options: dilemma.utilitarianData.options.map(opt => ({
          ...opt,
          impacts: opt.impacts.filter(imp => imp.stakeholderId !== id)
        }))
      }
    });
  };

  return (
    <div id="dilemma-input-container" className="space-y-6">
      {/* Sample presets loader */}
      <div id="sample-presets" className="bg-[#FCFBF9] border border-[#E5E2D9] p-4 rounded-[20px]">
        <div className="flex items-center gap-2 mb-3 text-[#5A5A40] font-medium text-sm">
          <BookOpen className="w-4 h-4 text-[#5A5A40]" />
          <span className="font-serif italic text-base">Need inspiration? Load a classical ethical scenario:</span>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          {SAMPLE_DILEMMAS.map((sample, idx) => (
            <button
              id={`load-sample-${idx}`}
              key={idx}
              onClick={() => handleLoadSample(sample)}
              className="px-4 py-1.5 text-xs font-semibold bg-white hover:bg-[#F2F1EC] text-[#5A5A40] border border-[#D1CEC4] rounded-full shadow-xs transition-colors cursor-pointer"
            >
              {sample.title}
            </button>
          ))}
          <button
            id="reset-dilemma-btn"
            onClick={onReset}
            className="px-4 py-1.5 text-xs font-semibold bg-[#5A5A40] hover:opacity-90 text-white rounded-full shadow-xs transition-colors ml-auto cursor-pointer"
          >
            Clear Fields
          </button>
        </div>
      </div>

      {/* Main Fields */}
      <div id="main-fields" className="space-y-4">
        <div>
          <label htmlFor="dilemma-title" className="block text-xs font-bold text-[#7C7971] uppercase tracking-widest mb-1.5">
            Dilemma Title
          </label>
          <input
            id="dilemma-title"
            type="text"
            value={dilemma.title}
            onChange={(e) => handleFieldChange("title", e.target.value)}
            placeholder="e.g., Leaking Confidential Client Data"
            className="w-full px-4 py-2.5 border border-[#E5E2D9] rounded-xl text-sm bg-[#FCFBF9] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#5A5A40] transition-all text-[#3D3B36]"
          />
        </div>

        <div>
          <label htmlFor="dilemma-description" className="block text-xs font-bold text-[#7C7971] uppercase tracking-widest mb-1.5">
            Describe the Dilemma
          </label>
          <textarea
            id="dilemma-description"
            rows={4}
            value={dilemma.description}
            onChange={(e) => handleFieldChange("description", e.target.value)}
            placeholder="Detail the ethical conflict. What values are in tension? What are the pressures or limitations?"
            className="w-full px-4 py-2.5 border border-[#E5E2D9] rounded-xl text-sm bg-[#FCFBF9] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#5A5A40] transition-all text-[#3D3B36] leading-relaxed font-serif text-base"
          />
        </div>
      </div>

      {/* Options Builder */}
      <div id="options-builder" className="border-t border-[#E5E2D9] pt-4">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-bold text-[#7C7971] uppercase tracking-widest">
            Available Courses of Action (Options)
          </label>
          <span className="text-[10px] text-[#A09D94] uppercase tracking-wider font-bold">Add at least two options</span>
        </div>
        
        <div className="space-y-2 mb-3">
          {dilemma.options.map((opt, idx) => (
            <div id={`option-row-${idx}`} key={opt.id} className="flex items-center gap-2 bg-[#FCFBF9] p-3 rounded-xl border border-[#F0EEE6]">
              <span className="text-xs font-bold text-[#5A5A40] bg-[#F2F1EC] border border-[#D1CEC4] w-6 h-6 rounded-full flex items-center justify-center">
                {idx + 1}
              </span>
              <p className="text-sm text-[#4A4842] flex-1 font-serif leading-relaxed">{opt.text}</p>
              <button
                id={`remove-option-${idx}`}
                onClick={() => removeOption(opt.id)}
                className="text-[#A09D94] hover:text-rose-600 p-1.5 rounded-full hover:bg-rose-50 transition-colors cursor-pointer"
                title="Remove Option"
              >
                <Trash className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            id="new-option-input"
            type="text"
            value={newOption}
            onChange={(e) => setNewOption(e.target.value)}
            placeholder="Describe an option (e.g., Tell the truth, wait for investigation...)"
            className="flex-1 px-4 py-2 border border-[#E5E2D9] rounded-xl text-xs bg-[#FCFBF9] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#5A5A40] text-[#3D3B36]"
            onKeyDown={(e) => e.key === 'Enter' && addOption()}
          />
          <button
            id="add-option-btn"
            onClick={addOption}
            className="p-2.5 bg-[#5A5A40] hover:opacity-90 text-white rounded-xl transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stakeholders Builder */}
      <div id="stakeholders-builder" className="border-t border-[#E5E2D9] pt-4">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-bold text-[#7C7971] uppercase tracking-widest">
            Key Stakeholders
          </label>
          <span className="text-[10px] text-[#A09D94] uppercase tracking-wider font-bold">Those affected by your decision</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          {dilemma.stakeholders.map((s, idx) => (
            <div id={`stakeholder-row-${idx}`} key={s.id} className="flex items-center justify-between bg-[#FCFBF9] p-3 rounded-xl border border-[#F0EEE6]">
              <div>
                <p className="text-sm font-semibold text-[#2D2B26]">{s.name}</p>
                <p className="text-xs text-[#7C7971] font-serif italic">{s.role}</p>
              </div>
              <button
                id={`remove-stakeholder-${idx}`}
                onClick={() => removeStakeholder(s.id)}
                className="text-[#A09D94] hover:text-rose-600 p-1 rounded-full hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <Trash className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            id="stakeholder-name-input"
            type="text"
            value={newStakeholderName}
            onChange={(e) => setNewStakeholderName(e.target.value)}
            placeholder="Stakeholder name (e.g., Customers, Colleagues)"
            className="flex-1 px-4 py-2 border border-[#E5E2D9] rounded-xl text-xs bg-[#FCFBF9] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#5A5A40] text-[#3D3B36]"
          />
          <input
            id="stakeholder-role-input"
            type="text"
            value={newStakeholderRole}
            onChange={(e) => setNewStakeholderRole(e.target.value)}
            placeholder="Role/Relationship (e.g., Client, Manager)"
            className="flex-1 px-4 py-2 border border-[#E5E2D9] rounded-xl text-xs bg-[#FCFBF9] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#5A5A40] text-[#3D3B36]"
            onKeyDown={(e) => e.key === 'Enter' && addStakeholder()}
          />
          <button
            id="add-stakeholder-btn"
            onClick={addStakeholder}
            className="px-4 py-2 bg-[#5A5A40] hover:opacity-90 text-white text-xs font-semibold rounded-xl transition-all flex items-center gap-1 justify-center cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
}

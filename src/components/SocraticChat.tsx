import React, { useState, useRef, useEffect } from 'react';
import { Dilemma, ChatMessage } from '../types';
import { Send, Sparkles, MessageSquare, RefreshCw } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface SocraticChatProps {
  dilemma: Dilemma;
  userId?: string;
}

const SUGGESTED_QUESTIONS = [
  "What is the single most important value you wish to protect here?",
  "Are you treating anyone in this situation as a mere instrument to your own comfort?",
  "If your choice became a universal rule for everyone in the world, what would happen?",
  "Whose suffering or wellbeing is being ignored in your current thoughts?"
];

export default function SocraticChat({ dilemma, userId }: SocraticChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load chat session on mount or dilemma/user change
  useEffect(() => {
    const loadSession = async () => {
      if (!userId || !dilemma.id) {
        // Fallback to initial local state
        setMessages([
          {
            id: "initial",
            role: "model",
            text: `Greetings, seeker. I am here to help you inspect the foundations of your choices regarding "${dilemma.title || 'this dilemma'}". Tell me, what lies at the absolute core of the tension in your heart regarding this dilemma?`,
            timestamp: new Date().toLocaleTimeString()
          }
        ]);
        return;
      }

      try {
        const docRef = doc(db, 'users', userId, 'socraticSessions', dilemma.id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data && Array.isArray(data.messages)) {
            setMessages(data.messages);
            return;
          }
        }
        
        // No existing session: start a new one
        const initialMessages: ChatMessage[] = [
          {
            id: "initial",
            role: "model",
            text: `Greetings, seeker. I am here to help you inspect the foundations of your choices regarding "${dilemma.title || 'this dilemma'}". Tell me, what lies at the absolute core of the tension in your heart regarding this dilemma?`,
            timestamp: new Date().toLocaleTimeString()
          }
        ];
        setMessages(initialMessages);
        await setDoc(docRef, {
          dilemmaId: dilemma.id,
          userId,
          messages: initialMessages
        });
      } catch (err) {
        console.error("Failed to load Socratic session from Firestore:", err);
      }
    };

    loadSession();
  }, [dilemma.id, userId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString()
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    // Save user's message to Firestore immediately
    if (userId && dilemma.id) {
      try {
        const docRef = doc(db, 'users', userId, 'socraticSessions', dilemma.id);
        await setDoc(docRef, {
          dilemmaId: dilemma.id,
          userId,
          messages: updatedMessages
        }, { merge: true });
      } catch (err) {
        console.error("Failed to save user message to Firestore:", err);
      }
    }

    try {
      const response = await fetch("/api/socratic/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dilemma,
          messages: updatedMessages.map(m => ({ role: m.role, text: m.text }))
        })
      });

      if (!response.ok) {
        throw new Error("Socratic counselor seems deep in contemplation. Try again shortly.");
      }

      const data = await response.json();
      const modelMsg: ChatMessage = {
        id: `msg_${Date.now() + 1}`,
        role: 'model',
        text: data.text,
        timestamp: new Date().toLocaleTimeString()
      };
      
      const finalMessages = [...updatedMessages, modelMsg];
      setMessages(finalMessages);

      // Save model's response to Firestore
      if (userId && dilemma.id) {
        try {
          const docRef = doc(db, 'users', userId, 'socraticSessions', dilemma.id);
          await setDoc(docRef, {
            dilemmaId: dilemma.id,
            userId,
            messages: finalMessages
          }, { merge: true });
        } catch (err) {
          console.error("Failed to save Socrates response to Firestore:", err);
        }
      }
    } catch (err: any) {
      const errMessage = `Forgive me, my mind wandered: ${err.message}`;
      const errMsg: ChatMessage = {
        id: `msg_err`,
        role: 'model',
        text: errMessage,
        timestamp: new Date().toLocaleTimeString()
      };
      
      const finalErrMessages = [...updatedMessages, errMsg];
      setMessages(finalErrMessages);

      if (userId && dilemma.id) {
        try {
          const docRef = doc(db, 'users', userId, 'socraticSessions', dilemma.id);
          await setDoc(docRef, {
            dilemmaId: dilemma.id,
            userId,
            messages: finalErrMessages
          }, { merge: true });
        } catch (dbErr) {
          console.error("Failed to save error response to Firestore:", dbErr);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const resetChat = async () => {
    const initialMessages: ChatMessage[] = [
      {
        id: "initial",
        role: "model",
        text: `Greetings, seeker. Let us begin our Socratic inquiry anew. What aspect of this decision weighs heaviest on your conscience?`,
        timestamp: new Date().toLocaleTimeString()
      }
    ];
    setMessages(initialMessages);

    if (userId && dilemma.id) {
      try {
        const docRef = doc(db, 'users', userId, 'socraticSessions', dilemma.id);
        await setDoc(docRef, {
          dilemmaId: dilemma.id,
          userId,
          messages: initialMessages
        });
      } catch (err) {
        console.error("Failed to reset Socratic session in Firestore:", err);
      }
    }
  };

  return (
    <div id="socratic-chat-container" className="flex flex-col h-[520px] bg-[#FCFBF9] border border-[#E5E2D9] rounded-[24px] overflow-hidden shadow-xs">
      {/* Header */}
      <div className="bg-white border-b border-[#F0EEE6] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#5A5A40] animate-pulse" />
          <span className="text-xs font-bold text-[#5A5A40] uppercase tracking-widest font-serif italic">
            Socratic Ethical Inquiry
          </span>
        </div>
        <button
          id="reset-chat-btn"
          onClick={resetChat}
          className="p-1 hover:bg-[#F2F1EC] rounded-lg text-[#A09D94] hover:text-[#5A5A40] transition-colors cursor-pointer"
          title="Reset Conversation"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Suggested Starting Questions */}
      {messages.length === 1 && (
        <div id="suggested-prompts" className="p-4 bg-white border-b border-[#F2F1EC] space-y-2.5">
          <p className="text-[10px] font-bold text-[#7C7971] uppercase tracking-widest">
            Or select a Socratic inquiry path:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTED_QUESTIONS.map((q, idx) => (
              <button
                id={`suggested-q-${idx}`}
                key={idx}
                onClick={() => handleSendMessage(q)}
                className="text-left text-xs bg-[#FCFBF9] border border-[#E5E2D9] text-[#5D5B54] px-3 py-2 rounded-xl hover:bg-[#F2F1EC] hover:text-[#5A5A40] hover:border-[#D1CEC4] transition-colors cursor-pointer leading-relaxed font-serif italic"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat Messages Panel */}
      <div id="chat-messages-scroll" className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={m.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-[20px] p-4 text-xs shadow-xs leading-relaxed ${
                  isUser
                    ? 'bg-[#5A5A40] text-white rounded-br-none'
                    : 'bg-white text-[#3D3B36] border border-[#F0EEE6] rounded-bl-none font-serif leading-relaxed'
                }`}
              >
                {!isUser && (
                  <div className="flex items-center gap-1.5 mb-1.5 pb-1.5 border-b border-[#F2F1EC] text-[10px] font-bold text-[#5A5A40] uppercase tracking-widest font-serif italic">
                    <Sparkles className="w-3.5 h-3.5 text-[#5A5A40]" />
                    <span>Socrates</span>
                  </div>
                )}
                <p className="whitespace-pre-wrap">{m.text}</p>
              </div>
              <span className="text-[10px] text-[#A09D94] font-serif italic mt-1 px-1">
                {m.timestamp}
              </span>
            </div>
          );
        })}
        {loading && (
          <div className="flex flex-col items-start">
            <div className="bg-white text-[#3D3B36] border border-[#F0EEE6] rounded-[20px] rounded-bl-none p-4 shadow-xs flex items-center gap-2.5">
              <div className="flex space-x-1.5">
                <span className="w-2 h-2 bg-[#5A5A40] rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-[#5A5A40] rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 bg-[#5A5A40] rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
              <span className="text-xs text-[#7C7971] italic font-serif">Socrates is contemplating...</span>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <div id="chat-input-bar" className="bg-white border-t border-[#F0EEE6] p-3.5">
        <div className="flex gap-2">
          <input
            id="socratic-user-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(input)}
            placeholder="Type your reflection or ethical question..."
            disabled={loading}
            className="flex-1 px-4 py-2.5 border border-[#E5E2D9] rounded-xl text-xs bg-[#FCFBF9] focus:bg-white focus:outline-hidden text-[#3D3B36] placeholder-[#C2C0B8] focus:ring-1 focus:ring-[#5A5A40]"
          />
          <button
            id="send-chat-btn"
            onClick={() => handleSendMessage(input)}
            disabled={loading || !input.trim()}
            className="p-3 bg-[#5A5A40] hover:bg-[#484833] text-white rounded-xl disabled:bg-[#DEDCD4] disabled:text-[#A09D94] transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

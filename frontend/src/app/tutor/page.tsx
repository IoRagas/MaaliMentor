"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  BookOpen,
  Lightbulb,
  TrendingUp,
  Shield,
  PiggyBank,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import GlassCard from "@/components/GlassCard";
import VoiceButton from "@/components/VoiceButton";
import ConceptBadge from "@/components/ConceptBadge";

interface Message {
  id: string;
  role: "user" | "tutor";
  text: string;
  concepts?: { name: string; mastery: number }[];
  timestamp: string;
}

const suggestedTopics = [
  { label: "Budgeting Basics", urdu: "بجٹ بنانا", icon: PiggyBank, query: "Mujhe budget banane ke baare mein batayein" },
  { label: "Inflation Explained", urdu: "مہنگائی", icon: TrendingUp, query: "Mehengai kya hoti hai aur ye savings ko kaise nuksan pahunchati hai?" },
  { label: "Islamic Banking", urdu: "اسلامی بینکاری", icon: Shield, query: "Islamic banking aur Shariah-compliant mutual funds kya hain?" },
  { label: "Investing 101", urdu: "سرمایہ کاری", icon: Lightbulb, query: "Sarmayakari shuru karne ke liye mujhe kya karna hoga?" },
  { label: "Mutual Funds", urdu: "میوچل فنڈز", icon: BookOpen, query: "Mutual funds kya hote hain aur in mein kaise invest karte hain?" },
];

export default function TutorPage() {
  const [userId, setUserId] = useState(1);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "tutor",
      text: "Assalam-o-Alaikum! 👋 Main Maali Mentor hoon — aapka AI financial coach. Aap mujhse koi bhi financial sawal Urdu ya Roman Urdu mein pooch sakte hain. Main bol kar aur likh kar, dono tarah madad kar sakta hoon. Aaj aap kya seekhna chahein ge?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [voiceState, setVoiceState] = useState<"idle" | "recording" | "processing">("idle");
  const [showTopics, setShowTopics] = useState(true);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea height as text flows
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [input]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedId = localStorage.getItem("user_id");
      if (storedId) {
        setUserId(parseInt(storedId));
      }
    }
  }, []);

  // Pre-load concept lesson if redirected from the dashboard graph
  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const concept = searchParams.get("concept");
      if (concept) {
        const queryMap: Record<string, string> = {
          budgeting: "Mujhe budget banane ke baare mein batayein",
          saving: "Mujhe saving ke baare mein aur savings account ke baare mein batayein",
          emergency_funds: "Emergency funds kya hote hain aur inhein kaise banate hain?",
          inflation: "Mehengai kya hoti hai aur ye savings ko kaise nuksan pahunchati hai?",
          investing: "Sarmayakari shuru karne ke liye mujhe kya karna hoga?",
          mutual_funds: "Mutual funds kya hote hain aur in mein kaise invest karte hain?",
          islamic_banking: "Islamic banking aur Shariah-compliant mutual funds kya hain?",
          stock_market: "Stock market kya hota hai aur shares kaise khareedte hain?",
          diversification: "Sarmayakari mein diversification ya risk kam karne ka tarika kya hai?",
        };
        const query = queryMap[concept];
        if (query) {
          const timer = setTimeout(() => {
            sendMessage(query);
          }, 800);
          return () => clearTimeout(timer);
        }
      }
    }
  }, [userId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch("http://localhost:8000/api/tutor/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          message: text.trim(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const tutorMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: "tutor",
          text: data.tutor_response,
          concepts: data.detected_concepts?.map((c: string) => ({
            name: c.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
            mastery: 50,
          })),
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, tutorMsg]);
      } else {
        throw new Error("API error");
      }
    } catch (err) {
      console.error(err);
      const fallbackMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "tutor",
        text: "Maaf kijiyega, system abhi masroof hai. Lekin bachat aur sarmayakari ke rules hamesha yaad rakhein!",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleVoice = async () => {
    if (voiceState === "idle") {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // Detect browser supported mime type
        let mimeType = "audio/webm";
        let extension = "webm";
        if (typeof MediaRecorder !== "undefined") {
          if (MediaRecorder.isTypeSupported("audio/webm")) {
            mimeType = "audio/webm";
            extension = "webm";
          } else if (MediaRecorder.isTypeSupported("audio/ogg")) {
            mimeType = "audio/ogg";
            extension = "ogg";
          } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
            mimeType = "audio/mp4";
            extension = "mp4";
          } else if (MediaRecorder.isTypeSupported("audio/wav")) {
            mimeType = "audio/wav";
            extension = "wav";
          }
        }

        const mediaRecorder = new MediaRecorder(stream, { mimeType });
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          setVoiceState("processing");
          const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
          
          try {
            const formData = new FormData();
            formData.append("file", audioBlob, `recording.${extension}`);
            formData.append("user_id", userId.toString());

            const res = await fetch("http://localhost:8000/api/tutor/voice", {
              method: "POST",
              body: formData,
            });

            if (res.ok) {
              const data = await res.json();
              
              if (data.user_transcript) {
                const voiceUserMsg: Message = {
                  id: Date.now().toString(),
                  role: "user",
                  text: data.user_transcript,
                  timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                };
                
                const voiceTutorMsg: Message = {
                  id: (Date.now() + 1).toString(),
                  role: "tutor",
                  text: data.tutor_text_response,
                  concepts: data.detected_concepts?.map((c: string) => ({
                    name: c.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
                    mastery: 50,
                  })),
                  timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                };
                
                setMessages((prev) => [...prev, voiceUserMsg, voiceTutorMsg]);

                if (data.audio_response_url) {
                  const audio = new Audio(`http://localhost:8000${data.audio_response_url}`);
                  audio.play().catch(e => console.error("Audio playback error:", e));
                }
              }
            }
          } catch (err) {
            console.error("Voice processing error:", err);
          } finally {
            setVoiceState("idle");
          }
        };

        mediaRecorder.start();
        setVoiceState("recording");
      } catch (err) {
        console.error("Mic access denied or error:", err);
      }
    } else if (voiceState === "recording") {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex min-h-screen">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Chat header */}
          <header className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-6 py-4 border-b border-white/5 bg-slate-900/60 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                <Lightbulb size={18} className="text-white" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Maali Mentor AI</h2>
                <span className="text-xs text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Online — Bol kar seekhein
                </span>
              </div>
            </div>
            <button
              className="lg:hidden text-slate-400 hover:text-white transition-colors"
              onClick={() => setShowTopics(!showTopics)}
            >
              <BookOpen size={20} />
            </button>
          </header>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 pb-36 md:pb-6 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-in-up`}
              >
                <div
                  className={`max-w-[80%] md:max-w-[70%] ${
                    msg.role === "user"
                      ? "bg-emerald-600/20 border border-emerald-500/30 rounded-2xl rounded-br-md"
                      : "bg-slate-800/60 border border-white/10 rounded-2xl rounded-bl-md"
                  } px-5 py-4`}
                >
                  <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                    {msg.text}
                  </p>
                  {msg.concepts && msg.concepts.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-white/5">
                      {msg.concepts.map((c) => (
                        <ConceptBadge key={c.name} name={c.name} mastery={c.mastery} />
                      ))}
                    </div>
                  )}
                  <span className="block text-xs text-slate-500 mt-2 text-right">
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start animate-fade-in">
                <div className="bg-slate-800/60 border border-white/10 rounded-2xl rounded-bl-md px-5 py-4">
                  <div className="flex items-center gap-1.5">
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input area */}
          <div className="sticky bottom-20 md:bottom-0 px-4 md:px-6 py-4 border-t border-white/5 bg-slate-900/80 backdrop-blur-xl">
            <div className="flex items-end gap-3 max-w-4xl mx-auto">
              <VoiceButton
                state={voiceState}
                onClick={handleVoice}
                size="md"
              />
              <div className="flex-1 relative max-h-[180px] flex items-center">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage(input);
                    }
                  }}
                  placeholder="Apna sawal yahan likhein ya mic daba kar bolein..."
                  rows={1}
                  className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-base resize-none focus:outline-none focus:border-emerald-500/40 focus:ring-4 focus:ring-emerald-500/5 transition-all duration-200 overflow-y-auto min-h-[56px] max-h-[180px] leading-relaxed"
                />
              </div>
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim()}
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 flex-shrink-0
                  ${
                    input.trim()
                      ? "bg-emerald-500 hover:bg-emerald-600 text-white hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                      : "bg-slate-700 text-slate-500 cursor-not-allowed"
                  }`}
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Suggested Topics Sidebar */}
        <aside
          className={`border-l border-white/5 bg-slate-900/30 backdrop-blur-sm w-72 flex-shrink-0 hidden lg:block overflow-y-auto`}
        >
          <div className="p-5">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Suggested Topics
            </h3>
            <div className="space-y-2">
              {suggestedTopics.map((topic) => (
                <button
                  key={topic.label}
                  onClick={() => sendMessage(topic.query)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl text-left border border-white/5 bg-white/5 hover:bg-emerald-500/10 hover:border-emerald-500/20 transition-all duration-200 group"
                >
                  <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-emerald-500/15 transition-colors">
                    <topic.icon size={16} className="text-slate-400 group-hover:text-emerald-400 transition-colors" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-white block">{topic.label}</span>
                    <span className="text-xs text-slate-500" dir="rtl">{topic.urdu}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

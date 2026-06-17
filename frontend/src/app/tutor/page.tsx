"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  BookOpen,
  Lightbulb,
  TrendingUp,
  Shield,
  PiggyBank,
  Volume2,
  Pause,
  Play,
  Square,
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
  const [messages, setMessages] = useState<Message[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [voiceState, setVoiceState] = useState<"idle" | "recording" | "processing">("idle");
  const [showTopics, setShowTopics] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [useWebSocket, setUseWebSocket] = useState(true); // Default to live streaming mode
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  // Close WebSocket on unmount
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  // Helper to play base64-encoded audio directly
  const playBase64Audio = (base64Data: string) => {
    stopAudio();
    try {
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "audio/mpeg" });
      const blobUrl = URL.createObjectURL(blob);
      playAudioUrl(blobUrl);
    } catch (e) {
      console.error("Error decoding base64 audio:", e);
    }
  };

  // Helper to play audio URL with controls
  const playAudioUrl = (url: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }

    const audio = new Audio();
    audio.preload = "auto";
    audio.playbackRate = 1.15; // Slightly faster for natural rhythm
    audioRef.current = audio;

    audio.addEventListener("canplaythrough", () => {
      audio.play().catch(e => console.error("Audio playback error:", e));
      setIsPlaying(true);
      setIsPaused(false);
    }, { once: true });

    audio.addEventListener("ended", () => {
      setIsPlaying(false);
      setIsPaused(false);
      audioRef.current = null;
    }, { once: true });

    audio.addEventListener("error", (e) => {
      console.error("Audio load error:", e);
      setIsPlaying(false);
      setIsPaused(false);
      audioRef.current = null;
    }, { once: true });

    audio.src = url;
    audio.load();
  };

  const togglePauseResume = () => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) {
      audioRef.current.play();
      setIsPaused(false);
    } else {
      audioRef.current.pause();
      setIsPaused(true);
    }
  };

  const stopAudio = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.src = "";
    audioRef.current = null;
    setIsPlaying(false);
    setIsPaused(false);
  };

  // Auto-resize textarea height
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

  // Load chat history from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("tutor_chat_history");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.length > 0) {
            setMessages(parsed);
            setHasLoaded(true);
            return;
          }
        } catch (e) {
          console.error("Failed to parse saved chat history:", e);
        }
      }

      // Seed default welcome message
      setMessages([
        {
          id: "1",
          role: "tutor",
          text: "Assalam-o-Alaikum! 👋 Main Maali Mentor hoon — aapka AI financial coach. Aap mujhse koi bhi financial sawal Urdu ya Roman Urdu mein pooch sakte hain. Main bol kar aur likh kar, dono tarah madad kar sakta hoon. Aaj aap kya seekhna chahein ge?",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
      setHasLoaded(true);
    }
  }, []);

  // Save chat history to localStorage on messages update
  useEffect(() => {
    if (typeof window !== "undefined" && hasLoaded && messages.length > 0) {
      // Keep up to the last 10 messages (which corresponds to 5 previous Q&A chats)
      const chatsToSave = messages.slice(-10);
      localStorage.setItem("tutor_chat_history", JSON.stringify(chatsToSave));
    }
  }, [messages, hasLoaded]);

  const [masteryScores, setMasteryScores] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchMastery = async () => {
      if (!userId) return;
      try {
        const res = await fetch(`http://localhost:8000/api/auth/dashboard/${userId}`);
        if (res.ok) {
          const result = await res.json();
          const scores: Record<string, number> = {};
          result.concept_mastery?.forEach((m: { concept_name: string; mastery_score: number }) => {
            scores[m.concept_name] = m.mastery_score;
          });
          setMasteryScores(scores);
        }
      } catch (err) {
        console.error("Error fetching concept mastery for tutor page:", err);
      }
    };
    fetchMastery();
  }, [userId]);

  // Pre-load concept lesson if redirected from dashboard
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
          tax_filer: "Salana tax planning aur active tax filer banne ke kya faide hain?",
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

  // Connect and manage WebSocket connection
  const connectWebSocket = (): Promise<WebSocket> => {
    return new Promise((resolve, reject) => {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        resolve(socketRef.current);
        return;
      }

      const wsUrl = `ws://localhost:8000/api/tutor/ws?user_id=${userId}`;
      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        resolve(ws);
      };

      ws.onerror = (err) => {
        console.error("WebSocket connection error:", err);
        reject(err);
      };

      ws.onclose = () => {
        socketRef.current = null;
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === "text_chunk") {
            setIsTyping(false);
            setMessages((prev) => {
              const last = prev[prev.length - 1];
              if (last && last.role === "tutor" && last.id === "streaming-tutor") {
                return [
                  ...prev.slice(0, -1),
                  { ...last, text: last.text + data.text }
                ];
              } else {
                return [
                  ...prev,
                  {
                    id: "streaming-tutor",
                    role: "tutor",
                    text: data.text,
                    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                  }
                ];
              }
            });
          }
          
          else if (data.type === "user_transcript") {
            setIsTyping(true);
            setMessages((prev) => [
              ...prev,
              {
                id: Date.now().toString(),
                role: "user",
                text: data.text,
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              }
            ]);
          }

          else if (data.type === "status") {
            setIsTyping(true);
          }

          else if (data.type === "metadata") {
            setIsTyping(false);
            setMessages((prev) => {
              // Replace streaming placeholder message with final formatted response
              const filtered = prev.filter(m => m.id !== "streaming-tutor");
              const tutorMsg: Message = {
                id: Date.now().toString(),
                role: "tutor",
                text: data.roman_urdu,
                concepts: data.detected_concepts?.map((c: string) => ({
                  name: c.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
                  mastery: masteryScores[c] ?? 0,
                })),
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              };
              return [...filtered, tutorMsg];
            });

            if (data.audio_base64) {
              playBase64Audio(data.audio_base64);
            }
          }
        } catch (e) {
          console.error("Error parsing WS frame:", e);
        }
      };
    });
  };

  // RESTful Fallback
  const sendMessageREST = async (text: string) => {
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
            mastery: masteryScores[c] ?? 0,
          })),
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, tutorMsg]);

        if (data.audio_response_base64) {
          playBase64Audio(data.audio_response_base64);
        }
      } else {
        throw new Error("REST API failure");
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

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    stopAudio();

    if (useWebSocket) {
      try {
        const ws = await connectWebSocket();
        const userMsg: Message = {
          id: Date.now().toString(),
          role: "user",
          text: text.trim(),
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setIsTyping(true);

        ws.send(JSON.stringify({
          type: "text_message",
          text: text.trim()
        }));
      } catch (err) {
        console.error("WS error, falling back to REST:", err);
        await sendMessageREST(text);
      }
    } else {
      await sendMessageREST(text);
    }
  };

  const handleVoice = async () => {
    if (voiceState === "idle") {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1, sampleRate: 16000 } });
        
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

        const mediaRecorder = new MediaRecorder(stream, {
          mimeType,
          audioBitsPerSecond: 16000
        });
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        let ws: WebSocket | null = null;
        if (useWebSocket) {
          try {
            ws = await connectWebSocket();
            setVoiceState("recording");
          } catch (e) {
            console.error("Failed to connect WS for voice streaming");
          }
        }

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            if (useWebSocket && ws && ws.readyState === WebSocket.OPEN) {
              ws.send(event.data);
            } else {
              audioChunksRef.current.push(event.data);
            }
          }
        };

        mediaRecorder.onstop = async () => {
          setVoiceState("processing");

          if (useWebSocket && ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "stop_speaking" }));
            setVoiceState("idle");
            return;
          }

          // REST Fallback
          const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
          
          try {
            const formData = new FormData();
            formData.append("audio", audioBlob, `recording.${extension}`);
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
                    mastery: masteryScores[c] ?? 0,
                  })),
                  timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                };
                
                setMessages((prev) => [...prev, voiceUserMsg, voiceTutorMsg]);

                if (data.audio_response_base64) {
                  playBase64Audio(data.audio_response_base64);
                }
              }
            }
          } catch (err) {
            console.error("Voice processing error:", err);
          } finally {
            setVoiceState("idle");
          }
        };

        // If using WS, record in 500ms slice chunks
        mediaRecorder.start(useWebSocket ? 500 : undefined);
        if (!useWebSocket) {
          setVoiceState("recording");
        }
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
            <div className="flex items-center gap-4">
              {/* Glowing WebSocket toggle */}
              <div className="hidden sm:flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10">
                <span className="text-xs font-semibold text-slate-400 select-none">Live Streaming</span>
                <button
                  onClick={() => {
                    if (socketRef.current) {
                      socketRef.current.close();
                    }
                    setUseWebSocket(!useWebSocket);
                  }}
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none relative ${
                    useWebSocket ? "bg-emerald-500" : "bg-slate-700"
                  }`}
                  title={useWebSocket ? "Disable WebSocket Streaming" : "Enable WebSocket Streaming"}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                      useWebSocket ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
              <button
                className="lg:hidden text-slate-400 hover:text-white transition-colors"
                onClick={() => setShowTopics(!showTopics)}
              >
                <BookOpen size={20} />
              </button>
            </div>
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

          {/* Audio playback controls */}
          {isPlaying && (
            <div className="sticky bottom-36 md:bottom-20 z-40 px-4 md:px-6 flex justify-center animate-fade-in">
              <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-emerald-900/70 border border-emerald-500/30 backdrop-blur-xl shadow-lg shadow-emerald-500/10">
                <Volume2 size={18} className="text-emerald-400 animate-pulse" />
                <span className="text-sm text-emerald-200 font-medium">AI Awaaz chal rahi hai...</span>
                <button
                  onClick={togglePauseResume}
                  className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all duration-200"
                  title={isPaused ? "Resume" : "Pause"}
                >
                  {isPaused ? <Play size={16} /> : <Pause size={16} />}
                </button>
                <button
                  onClick={stopAudio}
                  className="w-9 h-9 rounded-lg bg-red-500/20 hover:bg-red-500/40 flex items-center justify-center text-red-300 hover:text-red-200 transition-all duration-200"
                  title="Stop"
                >
                  <Square size={14} />
                </button>
              </div>
            </div>
          )}

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

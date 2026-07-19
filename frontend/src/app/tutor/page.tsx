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
import { apiUrl, wsUrl, fetchWithAuth, getAuthToken } from "@/lib/api";

interface Message {
  id: string;
  role: "user" | "tutor";
  text: string;
  concepts?: { name: string; mastery: number }[];
  timestamp: string;
  audioBase64?: string;
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
  
  // Custom states
  const [isUrdu, setIsUrdu] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<"topics" | "dictionary">("topics");

  // Audio Player State
  const [activeAudioMessageId, setActiveAudioMessageId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.15);

  // Dictionary Search State
  const [dictionaryTerms, setDictionaryTerms] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTerm, setSelectedTerm] = useState<any | null>(null);

  const filteredTerms = dictionaryTerms.filter((term) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      (term.term && term.term.toLowerCase().includes(query)) ||
      (term.urdu_term && term.urdu_term.includes(query)) ||
      (term.definition && term.definition.toLowerCase().includes(query)) ||
      (term.urdu_definition && term.urdu_definition.includes(query))
    );
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  // Global Language Synchronization
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsUrdu(localStorage.getItem("global_lang") === "ur");
      const handleLangChange = () => {
        setIsUrdu(localStorage.getItem("global_lang") === "ur");
      };
      window.addEventListener("languageChange", handleLangChange);
      return () => window.removeEventListener("languageChange", handleLangChange);
    }
  }, []);

  // Fetch dictionary entries
  useEffect(() => {
    const fetchDictionary = async () => {
      try {
        const res = await fetchWithAuth("/api/tutor/dictionary");
        if (res.ok) {
          const data = await res.json();
          setDictionaryTerms(data);
        }
      } catch (err) {
        console.error("Failed to fetch dictionary terms:", err);
      }
    };
    fetchDictionary();
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
    audio.playbackRate = playbackSpeed; // Slightly faster for natural rhythm
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

  // Custom Audio Player Methods
  const playMessageAudio = (msgId: string, base64Data: string) => {
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

      const audio = new Audio();
      audio.preload = "auto";
      audio.playbackRate = playbackSpeed;
      audioRef.current = audio;
      setActiveAudioMessageId(msgId);
      setIsPlaying(true);
      setIsPaused(false);

      audio.addEventListener("loadedmetadata", () => {
        setDuration(audio.duration);
      });

      audio.addEventListener("timeupdate", () => {
        setCurrentTime(audio.currentTime);
      });

      audio.addEventListener("canplaythrough", () => {
        audio.play().catch(e => console.error("Audio playback error:", e));
      }, { once: true });

      audio.addEventListener("ended", () => {
        setIsPlaying(false);
        setIsPaused(false);
        setActiveAudioMessageId(null);
        setCurrentTime(0);
        setDuration(0);
        audioRef.current = null;
      }, { once: true });

      audio.addEventListener("error", (e) => {
        console.error("Audio error:", e);
        setIsPlaying(false);
        setIsPaused(false);
        setActiveAudioMessageId(null);
        setCurrentTime(0);
        setDuration(0);
        audioRef.current = null;
      }, { once: true });

      audio.src = blobUrl;
      audio.load();
    } catch (e) {
      console.error("Error decoding base64 audio:", e);
    }
  };

  const togglePauseResumeMessage = () => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) {
      audioRef.current.play();
      setIsPaused(false);
    } else {
      audioRef.current.pause();
      setIsPaused(true);
    }
  };

  const handleSeek = (newTime: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const changeSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  };

  const stopMessageAudio = () => {
    stopAudio();
    setActiveAudioMessageId(null);
    setCurrentTime(0);
    setDuration(0);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
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
      const lang = localStorage.getItem("global_lang");
      const welcomeText = lang === "ur"
        ? "السلام علیکم! 👋 میں مالی مینٹر ہوں — آپ کا اے آئی فنانشل کوچ۔ آپ مجھ سے کوئی بھی مالیاتی سوال اردو یا رومن اردو میں پوچھ سکتے ہیں۔ میں بول کر اور لکھ کر، دونوں طرح مدد کر سکتا ہوں۔ آج آپ کیا سیکھنا چاہیں گے؟"
        : "Assalam-o-Alaikum! 👋 Main Maali Mentor hoon — aapka AI financial coach. Aap mujhse koi bhi financial sawal Urdu ya Roman Urdu mein pooch sakte hain. Main bol kar aur likh kar, dono tarah madad kar sakta hoon. Aaj aap kya seekhna chahein ge?";
      setMessages([
        {
          id: "1",
          role: "tutor",
          text: welcomeText,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
      setHasLoaded(true);
    }
  }, []);

  // Intercept and load quiz review questions if user requested help on incorrect answers
  useEffect(() => {
    if (typeof window !== "undefined" && hasLoaded) {
      const reviewQuestionsStr = localStorage.getItem("quiz_review_questions");
      if (reviewQuestionsStr) {
        try {
          localStorage.removeItem("quiz_review_questions");
          const questionsList = JSON.parse(reviewQuestionsStr);
          if (questionsList && questionsList.length > 0) {
            const lang = localStorage.getItem("global_lang");
            const isUr = lang === "ur";
            const reviewPrompt = isUr
              ? `میں نے ابھی ابھی کوئز دیا اور ان سوالات میں غلطی کی۔ براہ کرم ان تصورات کی وضاحت کریں:\n\n${questionsList.map((q: any, i: number) => `سوال ${i + 1}: "${q.question}"\nمیرا جواب: "${q.userAnswer}"\nدرست جواب: "${q.correctAnswer}"\nوضاحت: "${q.explanation}"`).join("\n\n")}`
              : `Maine abhi abhi quiz diya aur in sawalat mein ghalti ki. Please in concepts ko wazeh karein:\n\n${questionsList.map((q: any, i: number) => `Sawal ${i + 1}: "${q.question}"\nMera Jawab: "${q.userAnswer}"\nSahi Jawab: "${q.correctAnswer}"\nWazahat: "${q.explanation}"`).join("\n\n")}`;
            
            const welcomeMsg = isUr
              ? "چلو آپ کے کوئز کی غلطیوں کا جائزہ لیتے ہیں اور ان تصورات کو گہرائی سے سمجھتے ہیں! 💡"
              : "Chalo aapke quiz ki ghaltiyon ka jaiza lete hain aur in concepts ko gehrai se samajhte hain! 💡";
            
            setMessages([
              {
                id: "1",
                role: "tutor",
                text: welcomeMsg,
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              }
            ]);
            
            setTimeout(() => {
              sendMessage(reviewPrompt);
            }, 600);
          }
        } catch (e) {
          console.error("Failed to trigger quiz review chat seed:", e);
        }
      }
    }
  }, [hasLoaded]);

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
        const res = await fetchWithAuth(`/api/auth/dashboard/${userId}`);
        if (res.ok) {
          const result = await res.json();
          const scores: Record<string, number> = {};
          result.concept_mastery?.forEach((m: { concept_name: string; mastery_score: number }) => {
            scores[m.concept_name] = m.mastery_score;
          });
          setMasteryScores(scores);
          localStorage.setItem("dashboard_data", JSON.stringify(result));
          localStorage.setItem("current_level", result.current_level.toString());
          localStorage.setItem("current_xp", result.current_xp.toString());
        } else {
          throw new Error("Failed to fetch dashboard data");
        }
      } catch (err) {
        console.warn("Tutor page dashboard fetch failed, attempting local cache lookup:", err);
        
        const cachedData = localStorage.getItem("dashboard_data");
        if (cachedData) {
          try {
            const parsed = JSON.parse(cachedData);
            const scores: Record<string, number> = {};
            parsed.concept_mastery?.forEach((m: { concept_name: string; mastery_score: number }) => {
              scores[m.concept_name] = m.mastery_score;
            });
            setMasteryScores(scores);
            return;
          } catch (e) {
            console.error("Error parsing cached dashboard data:", e);
          }
        }

        const currentLevel = parseInt(localStorage.getItem("current_level") || "1");
        const localConceptToLevel: Record<string, number> = {
          budgeting: 1,
          saving: 2,
          emergency_funds: 3,
          inflation: 4,
          investing: 5,
          mutual_funds: 6,
          islamic_banking: 7,
          stock_market: 8,
          diversification: 9,
          tax_filer: 10,
        };
        const scores: Record<string, number> = {};
        Object.entries(localConceptToLevel).forEach(([concept_name, lvl]) => {
          let score = 0;
          if (lvl < currentLevel) {
            score = 85;
          } else if (lvl === currentLevel) {
            score = 30;
          }
          scores[concept_name] = score;
        });
        setMasteryScores(scores);
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

      const token = getAuthToken() || "";
      const wsUrlStr = wsUrl(`/api/tutor/ws?user_id=${userId}&token=${token}`);
      const ws = new WebSocket(wsUrlStr);
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
            const msgId = Date.now().toString();
            setMessages((prev) => {
              // Replace streaming placeholder message with final formatted response
              const filtered = prev.filter(m => m.id !== "streaming-tutor");
              const tutorMsg: Message = {
                id: msgId,
                role: "tutor",
                text: data.roman_urdu,
                concepts: data.detected_concepts?.map((c: string) => ({
                  name: c.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
                  mastery: masteryScores[c] ?? 0,
                })),
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                audioBase64: data.audio_base64,
              };
              return [...filtered, tutorMsg];
            });

            if (data.audio_base64) {
              playMessageAudio(msgId, data.audio_base64);
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
      const res = await fetchWithAuth("/api/tutor/chat", {
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
        const msgId = (Date.now() + 1).toString();
        const tutorMsg: Message = {
          id: msgId,
          role: "tutor",
          text: data.tutor_response,
          concepts: data.detected_concepts?.map((c: string) => ({
            name: c.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
            mastery: masteryScores[c] ?? 0,
          })),
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          audioBase64: data.audio_response_base64,
        };
        setMessages((prev) => [...prev, tutorMsg]);

        if (data.audio_response_base64) {
          playMessageAudio(msgId, data.audio_response_base64);
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

            const res = await fetchWithAuth("/api/tutor/voice", {
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
                
                const voiceTutorMsgId = (Date.now() + 1).toString();
                const voiceTutorMsg: Message = {
                  id: voiceTutorMsgId,
                  role: "tutor",
                  text: data.tutor_text_response,
                  concepts: data.detected_concepts?.map((c: string) => ({
                    name: c.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
                    mastery: masteryScores[c] ?? 0,
                  })),
                  timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                  audioBase64: data.audio_response_base64,
                };
                
                setMessages((prev) => [...prev, voiceUserMsg, voiceTutorMsg]);

                if (data.audio_response_base64) {
                  playMessageAudio(voiceTutorMsgId, data.audio_response_base64);
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
    <div className="flex min-h-screen" dir={isUrdu ? "rtl" : "ltr"}>
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
              <div style={{ textAlign: isUrdu ? "right" : "left" }}>
                <h2 className="text-base font-bold text-white">
                  {isUrdu ? "مالی مینٹر AI" : "Maali Mentor AI"}
                </h2>
                <span className="text-xs text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {isUrdu ? "آن لائن — بول کر سیکھیں" : "Online — Bol kar seekhein"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Glowing WebSocket toggle */}
              <div className="hidden sm:flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10">
                <span className="text-xs font-semibold text-slate-400 select-none">
                  {isUrdu ? "لائیو اسٹریمنگ" : "Live Streaming"}
                </span>
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
                  title={useWebSocket ? (isUrdu ? "لائیو اسٹریمنگ بند کریں" : "Disable WebSocket Streaming") : (isUrdu ? "لائیو اسٹریمنگ کھولیں" : "Enable WebSocket Streaming")}
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
                  style={{ textAlign: isUrdu && msg.role === "tutor" && msg.text.match(/[\u0600-\u06FF]/) ? "right" : "left" }}
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

                  {/* Inline custom voice controls */}
                  {msg.audioBase64 && (
                    <div className="mt-3 p-2.5 rounded-xl bg-slate-950/60 border border-white/5 flex flex-col gap-2 w-full max-w-sm text-slate-300 animate-fade-in" dir="ltr">
                      <div className="flex items-center gap-2">
                        {activeAudioMessageId === msg.id && isPlaying && !isPaused ? (
                          <button
                            onClick={togglePauseResumeMessage}
                            className="w-7 h-7 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 flex items-center justify-center transition-colors"
                          >
                            <Pause size={12} className="fill-current" />
                          </button>
                        ) : activeAudioMessageId === msg.id && isPaused ? (
                          <button
                            onClick={togglePauseResumeMessage}
                            className="w-7 h-7 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 flex items-center justify-center transition-colors"
                          >
                            <Play size={12} className="fill-current ml-0.5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => playMessageAudio(msg.id, msg.audioBase64!)}
                            className="w-7 h-7 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 flex items-center justify-center transition-colors"
                          >
                            <Play size={12} className="fill-current ml-0.5" />
                          </button>
                        )}
                        {activeAudioMessageId === msg.id && (isPlaying || isPaused) && (
                          <button
                            onClick={stopMessageAudio}
                            className="w-7 h-7 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 flex items-center justify-center transition-colors"
                          >
                            <Square size={10} className="fill-current" />
                          </button>
                        )}
                        <span className="text-[9px] font-mono text-slate-500">
                          {activeAudioMessageId === msg.id
                            ? `${formatTime(currentTime)} / ${formatTime(duration)}`
                            : "0:00 / 0:00"}
                        </span>
                        <div className="ml-auto flex gap-1">
                          {[1.0, 1.25, 1.5].map((speed) => (
                            <button
                              key={speed}
                              onClick={() => changeSpeed(speed)}
                              className={`px-1 py-0.5 rounded text-[8px] font-bold border transition-colors ${
                                playbackSpeed === speed
                                  ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
                                  : "bg-slate-900/50 text-slate-500 border-white/5 hover:text-white"
                              }`}
                            >
                              {speed}x
                            </button>
                          ))}
                        </div>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={activeAudioMessageId === msg.id ? duration || 100 : 100}
                        value={activeAudioMessageId === msg.id ? currentTime : 0}
                        onChange={(e) => handleSeek(parseFloat(e.target.value))}
                        disabled={activeAudioMessageId !== msg.id}
                        className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                      />
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
                  placeholder={isUrdu ? "اپنا سوال یہاں لکھیں یا مائیک دبا کر بولیں..." : "Apna sawal yahan likhein ya mic daba kar bolein..."}
                  rows={1}
                  className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-base resize-none focus:outline-none focus:border-emerald-500/40 focus:ring-4 focus:ring-emerald-500/5 transition-all duration-200 overflow-y-auto min-h-[56px] max-h-[180px] leading-relaxed"
                  style={{ textAlign: isUrdu ? "right" : "left", direction: isUrdu ? "rtl" : "ltr" }}
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
                <Send size={18} className={isUrdu ? "transform rotate-180" : ""} />
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar for Topics and Dictionary */}
        <aside
          className={`border-l border-white/5 bg-slate-900/30 backdrop-blur-sm w-72 flex-shrink-0 hidden lg:block overflow-y-auto`}
        >
          <div className="p-5">
            {/* Tab switch buttons */}
            <div className="flex border-b border-white/5 mb-4">
              <button
                onClick={() => setSidebarTab("topics")}
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
                  sidebarTab === "topics"
                    ? "text-emerald-400 border-emerald-500"
                    : "text-slate-500 border-transparent hover:text-slate-300"
                }`}
              >
                {isUrdu ? "موضوعات" : "Suggested Topics"}
              </button>
              <button
                onClick={() => setSidebarTab("dictionary")}
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
                  sidebarTab === "dictionary"
                    ? "text-cyan-400 border-cyan-500"
                    : "text-slate-500 border-transparent hover:text-slate-300"
                }`}
              >
                {isUrdu ? "لغت (ڈکشنری)" : "Dictionary"}
              </button>
            </div>

            {sidebarTab === "topics" ? (
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
                    <div style={{ textAlign: isUrdu ? "right" : "left" }}>
                      <span className="text-sm font-medium text-white block">{isUrdu ? topic.urdu : topic.label}</span>
                      <span className="text-xs text-slate-500" dir="rtl">{topic.urdu}</span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Dictionary Search Input */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder={isUrdu ? "لفظ تلاش کریں..." : "Search financial term..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                    style={{ textAlign: isUrdu ? "right" : "left", direction: isUrdu ? "rtl" : "ltr" }}
                  />
                </div>

                {/* Dictionary List */}
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                  {filteredTerms.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-4">
                      {isUrdu ? "کوئی لفظ نہیں ملا۔" : "No terms found."}
                    </p>
                  ) : (
                    filteredTerms.map((item) => {
                      const isExpanded = selectedTerm?.term === item.term;
                      return (
                        <div
                          key={item.term}
                          className={`p-3 rounded-xl border transition-all duration-200 ${
                            isExpanded
                              ? "bg-cyan-500/10 border-cyan-500/30"
                              : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10"
                          }`}
                        >
                          <div
                            onClick={() => setSelectedTerm(isExpanded ? null : item)}
                            className="flex justify-between items-center cursor-pointer select-none"
                          >
                            <span className="text-sm font-semibold text-white">{item.term}</span>
                            <span className="text-xs text-cyan-400 font-urdu" dir="rtl">{item.urdu_term}</span>
                          </div>

                          {isExpanded && (
                            <div className="mt-2.5 pt-2.5 border-t border-white/5 space-y-2 text-xs text-slate-300 animate-fade-in" style={{ textAlign: isUrdu ? "right" : "left" }}>
                              <p className="leading-relaxed font-urdu font-medium" dir="rtl">
                                {item.definition}
                              </p>
                              {item.example && (
                                <div className="p-2 rounded bg-slate-950/60 border border-white/5 text-right" dir="rtl">
                                  <span className="font-bold text-cyan-400 block mb-0.5">{isUrdu ? "مثال:" : "Example:"}</span>
                                  <p className="italic text-slate-400">{item.example}</p>
                                </div>
                              )}
                              {item.related_concepts && item.related_concepts.length > 0 && (
                                <div className="flex flex-wrap gap-1 items-center pt-1">
                                  <span className="text-[10px] text-slate-500 mr-1">{isUrdu ? "متعلقہ:" : "Related:"}</span>
                                  {item.related_concepts.map((rc: string) => (
                                    <span key={rc} className="px-1.5 py-0.5 rounded bg-white/5 text-[9px] text-slate-400 capitalize">
                                      {rc.replace("_", " ")}
                                    </span>
                                  ))}
                                </div>
                              )}
                              <button
                                onClick={() => sendMessage(isUrdu ? `${item.term} (${item.urdu_term}) کے بارے میں مزید تفصیل بتائیں۔` : `Mujhe ${item.term} (${item.urdu_term}) ke baare mein mazeed samjhayein`)}
                                className="w-full mt-2 py-1.5 px-3 rounded-lg bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 transition-colors text-[10px] text-center block"
                              >
                                {isUrdu ? "ٹیوٹر سے پوچھیں" : "Ask Tutor"}
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

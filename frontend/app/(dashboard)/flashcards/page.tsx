
"use client";

import { useState } from "react";
import {
  Brain, Upload, Youtube, Loader2, ChevronLeft, ChevronRight,
  RotateCcw, Sparkles, FileText, RefreshCw,
} from "lucide-react";
import { getOrCreateSessionId, resetSessionId } from "@/lib/session";

interface Flashcard {
  question: string;
  answer: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function FlashcardsPage() {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"pdf" | "youtube">("pdf");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  // FIX: Use shared session from localStorage
  const [sessionId, setSessionId] = useState<string>(getOrCreateSessionId);

  const handleNewSession = () => {
    const newId = resetSessionId();
    setSessionId(newId);
    setCards([]);
    setError(null);
  };

  const handleFileUploadAndGenerate = async (file: File) => {
    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("session_id", sessionId);

    try {
      const uploadRes = await fetch(`${API_URL}/process-pdf`, {
        method: "POST",
        body: formData,
      });
      if (!uploadRes.ok) {
        const err = await uploadRes.json();
        throw new Error(err.detail || "PDF upload failed");
      }

      const res = await fetch(`${API_URL}/generate-flashcards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId }),
      });
      const data = await res.json();
      if (res.ok) {
        setCards(data.flashcards);
        setCurrentIdx(0);
        setFlipped(false);
      } else {
        throw new Error(data.detail);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleYoutubeGenerate = async () => {
    if (!youtubeUrl) return;
    setLoading(true);
    setError(null);

    try {
      const videoRes = await fetch(`${API_URL}/process-video`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: youtubeUrl, session_id: sessionId }),
      });
      if (!videoRes.ok) {
        const err = await videoRes.json();
        throw new Error(err.detail || "Video processing failed");
      }

      const res = await fetch(`${API_URL}/generate-flashcards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId }),
      });
      const data = await res.json();
      if (res.ok) {
        setCards(data.flashcards);
        setCurrentIdx(0);
        setFlipped(false);
      } else {
        throw new Error(data.detail);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const next = () => {
    setFlipped(false);
    setTimeout(() => setCurrentIdx((i) => (i + 1) % cards.length), 150);
  };
  const prev = () => {
    setFlipped(false);
    setTimeout(
      () => setCurrentIdx((i) => (i - 1 + cards.length) % cards.length),
      150
    );
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-sm">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-700 text-gray-900">Flashcards</h1>
            <p className="text-gray-400 text-sm">
              Session: <span className="font-mono text-xs">{sessionId.slice(-10)}</span>
            </p>
          </div>
        </div>
        <button
          onClick={handleNewSession}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-500 border border-gray-200 rounded-lg hover:border-violet-300 hover:text-violet-600 transition-all"
        >
          <RefreshCw className="w-3 h-3" /> New Session
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          ⚠️ {error}
        </div>
      )}

      {/* Upload Section */}
      {cards.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm mb-8">
          <h2 className="font-display text-lg font-700 text-gray-900 mb-5">
            Generate Flashcards From
          </h2>

          <div className="flex gap-2 mb-6">
            {(["pdf", "youtube"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  mode === m
                    ? "bg-violet-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                {m === "pdf" ? (
                  <FileText className="w-4 h-4" />
                ) : (
                  <Youtube className="w-4 h-4" />
                )}
                {m === "pdf" ? "PDF Upload" : "YouTube URL"}
              </button>
            ))}
          </div>

          {mode === "pdf" ? (
            <label className="block cursor-pointer">
              <div className="border-2 border-dashed border-violet-200 rounded-2xl p-10 text-center hover:border-violet-400 hover:bg-violet-50/50 transition-all group">
                <div className="w-14 h-14 rounded-2xl bg-violet-50 flex items-center justify-center mx-auto mb-4 group-hover:bg-violet-100 transition-colors">
                  <Upload className="w-7 h-7 text-violet-500" />
                </div>
                <p className="font-display font-600 text-gray-800 mb-1">
                  Drop PDF here or click to upload
                </p>
                <p className="text-gray-400 text-sm">
                  Extracts text, creates embeddings, generates flashcards
                </p>
              </div>
              <input
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFileUploadAndGenerate(f);
                  e.target.value = "";
                }}
              />
            </label>
          ) : (
            <div className="flex gap-3">
              <input
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
              />
              <button
                onClick={handleYoutubeGenerate}
                disabled={loading || !youtubeUrl}
                className="px-5 py-3 bg-violet-600 text-white rounded-xl text-sm font-medium hover:bg-violet-700 disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                Generate
              </button>
            </div>
          )}

          {loading && (
            <div className="mt-6 flex items-center justify-center gap-3 text-violet-600">
              <Loader2 className="w-5 h-5 animate-spin" />
              <p className="text-sm font-medium">
                Processing content and generating flashcards...
              </p>
            </div>
          )}
        </div>
      )}

      {/* Flashcards display */}
      {cards.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-gray-500">
              Card{" "}
              <span className="font-700 text-gray-900">{currentIdx + 1}</span>{" "}
              of {cards.length}
            </p>
            <div className="flex-1 mx-4 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-violet-500 to-purple-600 rounded-full transition-all"
                style={{ width: `${((currentIdx + 1) / cards.length) * 100}%` }}
              />
            </div>
            <button
              onClick={() => {
                setCards([]);
                setCurrentIdx(0);
                setFlipped(false);
              }}
              className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>

          {/* 3D flip card */}
          <div
            className="flashcard-container w-full mb-8"
            style={{ height: "320px" }}
          >
            <div
              className={`flashcard-inner w-full h-full cursor-pointer ${
                flipped ? "flipped" : ""
              }`}
              onClick={() => setFlipped(!flipped)}
            >
              <div className="flashcard-front absolute inset-0 bg-white rounded-3xl border border-violet-100 shadow-lg shadow-violet-50 flex flex-col items-center justify-center p-10 text-center">
                <div className="px-3 py-1 bg-violet-50 rounded-full text-xs font-600 text-violet-600 mb-6">
                  QUESTION
                </div>
                <p className="font-display text-xl md:text-2xl font-700 text-gray-800 leading-snug">
                  {cards[currentIdx]?.question}
                </p>
                <p className="text-sm text-gray-400 mt-6 flex items-center gap-1.5">
                  <RotateCcw className="w-3.5 h-3.5" /> Click to reveal answer
                </p>
              </div>
              <div className="flashcard-back absolute inset-0 bg-gradient-to-br from-violet-600 to-purple-700 rounded-3xl flex flex-col items-center justify-center p-10 text-center">
                <div className="px-3 py-1 bg-white/20 rounded-full text-xs font-600 text-white/80 mb-6">
                  ANSWER
                </div>
                <p className="font-display text-xl md:text-2xl font-700 text-white leading-snug">
                  {cards[currentIdx]?.answer}
                </p>
                <p className="text-sm text-white/50 mt-6 flex items-center gap-1.5">
                  <RotateCcw className="w-3.5 h-3.5" /> Click to flip back
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4">
            <button
              onClick={prev}
              className="w-11 h-11 rounded-xl border border-gray-200 bg-white text-gray-600 flex items-center justify-center hover:border-violet-300 hover:text-violet-600 transition-all shadow-sm"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex gap-1.5">
              {cards.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setCurrentIdx(i); setFlipped(false); }}
                  className={`h-2 rounded-full transition-all ${
                    i === currentIdx
                      ? "w-6 bg-violet-600"
                      : "w-2 bg-gray-200 hover:bg-gray-300"
                  }`}
                />
              ))}
            </div>
            <button
              onClick={next}
              className="w-11 h-11 rounded-xl border border-gray-200 bg-white text-gray-600 flex items-center justify-center hover:border-violet-300 hover:text-violet-600 transition-all shadow-sm"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-10">
            <h3 className="font-display font-700 text-gray-800 mb-4">
              All Flashcards ({cards.length})
            </h3>
            <div className="grid md:grid-cols-2 gap-3">
              {cards.map((card, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setCurrentIdx(i);
                    setFlipped(false);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className={`text-left p-4 rounded-xl border transition-all hover:-translate-y-0.5 ${
                    i === currentIdx
                      ? "border-violet-300 bg-violet-50"
                      : "border-gray-100 bg-white hover:border-violet-200"
                  }`}
                >
                  <p className="text-xs font-600 text-violet-500 mb-1.5">
                    Card {i + 1}
                  </p>
                  <p className="text-sm text-gray-700 font-medium line-clamp-2">
                    {card.question}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

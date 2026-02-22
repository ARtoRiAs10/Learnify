
"use client";

import { useEffect, useState } from "react";
import {
  Youtube, Loader2, Copy, Check, ExternalLink, FileText,
  Sparkles, Play, Clock, ChevronRight, RefreshCw,
} from "lucide-react";
import { getOrCreateSessionId, resetSessionId } from "@/lib/session";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function YoutubePage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<{
    title?: string;
    duration?: string;
    chunks?: number;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // FIX: Use shared session from localStorage
  const [sessionId, setSessionId] = useState<string>(getOrCreateSessionId);

  const [isMounted, setIsMounted] = useState(false);

  // 2. Use useEffect to set the ID after the component mounts on the client
  useEffect(() => {
    setIsMounted(true);
    setSessionId(getOrCreateSessionId());
  }, []);

  const handleNewSession = () => {
    const newId = resetSessionId();
    setSessionId(newId);
    setTranscript(null);
    setMetadata(null);
    setError(null);
  };

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-red-500" />
      </div>
    );
  }

  const processVideo = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setTranscript(null);
    setMetadata(null);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/process-video`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim(), session_id: sessionId }),
      });
      const data = await res.json();
      if (res.ok) {
        setTranscript(
          data.transcript || "Transcript processed and indexed successfully."
        );
        setMetadata({
          title: data.title,
          duration: data.duration,
          chunks: data.chunks,
        });
      } else {
        throw new Error(data.detail || "Failed to process video");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyTranscript = () => {
    if (transcript) {
      navigator.clipboard.writeText(transcript);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getVideoId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    return match?.[1];
  };

  const videoId = getVideoId(url);

  const exampleUrls = [
    { title: "CS50 Intro to AI", url: "https://youtube.com/watch?v=eey1-RFIe9Y" },
    { title: "ML Crash Course", url: "https://youtube.com/watch?v=NWONeJKn6kc" },
    { title: "Python Tutorial", url: "https://youtube.com/watch?v=_uQrJ0TkZlc" },
  ];

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center shadow-sm">
            <Youtube className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-700 text-gray-900">
              YouTube Transcript
            </h1>
            <p className="text-gray-400 text-sm">
              Session: <span className="font-mono text-xs">{sessionId.slice(-10)}</span>
            </p>
          </div>
        </div>
        <button
          onClick={handleNewSession}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-500 border border-gray-200 rounded-lg hover:border-red-300 hover:text-red-600 transition-all"
        >
          <RefreshCw className="w-3 h-3" /> New Session
        </button>
      </div>

      {error && (
        <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          ⚠️ {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mb-6">
        <label className="block text-sm font-600 text-gray-700 mb-3">
          YouTube URL
        </label>
        <div className="flex gap-3">
          <div className="flex-1 flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 focus-within:border-red-400 focus-within:ring-2 focus-within:ring-red-100 transition-all">
            <Youtube className="w-4 h-4 text-red-500 shrink-0" />
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && processVideo()}
              placeholder="https://youtube.com/watch?v=..."
              className="flex-1 py-3 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none"
            />
          </div>
          <button
            onClick={processVideo}
            disabled={loading || !url.trim()}
            className="px-5 py-3 bg-gradient-to-r from-red-500 to-orange-600 text-white rounded-xl text-sm font-600 hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2 shadow-sm"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            Process
          </button>
        </div>

        <div className="mt-4">
          <p className="text-xs text-gray-400 mb-2.5">Try an example:</p>
          <div className="flex flex-wrap gap-2">
            {exampleUrls.map((ex) => (
              <button
                key={ex.url}
                onClick={() => setUrl(ex.url)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600 hover:border-red-200 hover:text-red-600 hover:bg-red-50 transition-all"
              >
                <Play className="w-3 h-3" /> {ex.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {videoId && !transcript && !loading && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm mb-6 flex items-center gap-4">
          <img
            src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
            alt="Video thumbnail"
            className="w-32 h-20 rounded-xl object-cover"
          />
          <div className="flex-1">
            <p className="text-sm font-600 text-gray-800 mb-1">Video Preview</p>
            <p className="text-xs text-gray-400 font-mono break-all">{url}</p>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1 mt-2"
            >
              <ExternalLink className="w-3 h-3" /> Open on YouTube
            </a>
          </div>
        </div>
      )}

      {loading && (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 shadow-sm text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-7 h-7 text-red-500 animate-spin" />
          </div>
          <p className="font-display font-700 text-gray-800 mb-1">
            Extracting Transcript
          </p>
          <p className="text-gray-400 text-sm">
            Fetching captions and building vector index...
          </p>
          <div className="mt-5 space-y-1.5">
            {[
              "Fetching video captions",
              "Chunking transcript",
              "Creating embeddings",
              "Indexing to vector store",
            ].map((step, i) => (
              <div
                key={step}
                className="flex items-center gap-2 text-xs text-gray-400 justify-center"
              >
                <div
                  className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"
                  style={{ animationDelay: `${i * 0.3}s` }}
                />
                {step}
              </div>
            ))}
          </div>
        </div>
      )}

      {transcript && metadata && (
        <div>
          <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-100 rounded-2xl p-5 mb-5 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-red-500 flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
              <p className="font-600 text-gray-900 text-sm">Transcript processed!</p>
            </div>
            {metadata.title && (
              <div className="flex items-center gap-1.5 text-xs text-gray-600">
                <FileText className="w-3.5 h-3.5 text-red-500" /> {metadata.title}
              </div>
            )}
            {metadata.duration && (
              <div className="flex items-center gap-1.5 text-xs text-gray-600">
                <Clock className="w-3.5 h-3.5 text-red-500" /> {metadata.duration}
              </div>
            )}
            {metadata.chunks && (
              <div className="flex items-center gap-1.5 text-xs text-gray-600">
                <Sparkles className="w-3.5 h-3.5 text-red-500" />{" "}
                {metadata.chunks} chunks indexed
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-5">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="font-display font-700 text-gray-900">Transcript</h3>
              <button
                onClick={copyTranscript}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-all"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <div className="px-5 py-4 max-h-80 overflow-y-auto">
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap font-mono text-xs">
                {transcript}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-display font-700 text-gray-900 mb-4">What's Next?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { href: "/chat", icon: "💬", title: "Chat with Content", desc: "Ask questions" },
                { href: "/flashcards", icon: "🧠", title: "Generate Flashcards", desc: "Create study cards" },
                { href: "/quiz", icon: "📊", title: "Take a Quiz", desc: "Test understanding" },
              ].map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-red-200 hover:bg-red-50/50 transition-all group"
                >
                  <span className="text-xl">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-600 text-gray-800">{item.title}</p>
                    <p className="text-xs text-gray-400">{item.desc}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-red-400 transition-colors shrink-0" />
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

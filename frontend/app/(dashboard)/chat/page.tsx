
"use client";

import { useState, useRef, useEffect } from "react";
import {
  Send, Upload, FileText, X, MessageSquare,
  Sparkles, Bot, User, Loader2
} from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";


function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return `session_${Date.now()}`;
  const stored = localStorage.getItem("learnai_session_id");
  if (stored) return stored;
  const newId = `session_${Date.now()}`;
  localStorage.setItem("learnai_session_id", newId);
  return newId;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [sessionId] = useState<string>(getOrCreateSessionId);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFileUpload = async (file: File) => {
    if (!file || file.type !== "application/pdf") {
      alert("Please upload a PDF file.");
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("session_id", sessionId);

    try {
      const res = await fetch(`${API_URL}/process-pdf`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setUploadedFile(file.name);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `✅ **${file.name}** uploaded and indexed! Processed **${data.pages} pages** into **${data.chunks} chunks**. Ask me anything about it.`,
            timestamp: new Date(),
          },
        ]);
      } else {
        throw new Error(data.detail || "Upload failed");
      }
    } catch (err: any) {
      alert(`Upload error: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          session_id: sessionId,
          history: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!res.ok || !res.body) {
        const err = await res.json();
        throw new Error(err.detail || "Request failed");
      }

      // Add empty assistant message to stream into
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "", timestamp: new Date() },
      ]);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let aiContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const rawChunk = decoder.decode(value);
        const lines = rawChunk.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") break;
          try {
            const parsed = JSON.parse(data);
            if (parsed.error) throw new Error(parsed.error);
            aiContent += parsed.content || "";
            setMessages((prev) => {
              const updated = [...prev];
              updated[updated.length - 1] = {
                role: "assistant",
                content: aiContent,
                timestamp: new Date(),
              };
              return updated;
            });
          } catch {}
        }
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `⚠️ **Error:** ${err.message}. Make sure the backend is running at \`${API_URL}\`.`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    "Summarize the main topics",
    "What are the key takeaways?",
    "Explain the concepts simply",
    "Create 3 study questions",
  ];

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-sm">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-display font-700 text-gray-900 text-lg">AI Chat</h1>
              <p className="text-xs text-gray-400">
                RAG-powered · Session: <span className="font-mono">{sessionId.slice(-8)}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {uploadedFile && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-700">
                <FileText className="w-3.5 h-3.5" />
                <span className="max-w-[140px] truncate">{uploadedFile}</span>
                <button onClick={() => setUploadedFile(null)}>
                  <X className="w-3 h-3 hover:text-red-500 transition-colors" />
                </button>
              </div>
            )}

            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors disabled:opacity-50"
            >
              {uploading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Upload className="w-3.5 h-3.5" />
              )}
              {uploading ? "Uploading..." : "Upload PDF"}
            </button>

            <input
              ref={fileRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
                e.target.value = "";
              }}
            />
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div
        className="flex-1 overflow-y-auto px-4 py-6 relative"
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const file = e.dataTransfer.files[0];
          if (file) handleFileUpload(file);
        }}
      >
        <div className="max-w-3xl mx-auto space-y-5">
          {/* Empty state */}
          {messages.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-indigo-200">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="font-display text-2xl font-700 text-gray-800 mb-2">
                Start a Conversation
              </h2>
              <p className="text-gray-400 text-sm max-w-sm mx-auto mb-8">
                Upload a PDF first, or just ask a question. The AI will answer
                using your indexed content as context.
              </p>
              <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => setInput(s)}
                    className="text-xs text-left px-3 py-2.5 bg-white border border-gray-200 rounded-xl hover:border-indigo-300 hover:text-indigo-600 transition-colors shadow-sm"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message list */}
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${
                  msg.role === "user"
                    ? "bg-indigo-600"
                    : "bg-gradient-to-br from-violet-500 to-purple-600"
                }`}
              >
                {msg.role === "user" ? (
                  <User className="w-4 h-4 text-white" />
                ) : (
                  <Bot className="w-4 h-4 text-white" />
                )}
              </div>

              <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                  msg.role === "user"
                    ? "bg-gradient-to-br from-indigo-500 to-violet-600 text-white rounded-tr-sm"
                    : "bg-white border border-gray-100 shadow-sm rounded-tl-sm"
                }`}
              >
                {msg.role === "assistant" ? (
                  <div className="prose prose-sm max-w-none text-gray-700 prose-p:leading-relaxed">
                    <ReactMarkdown>{msg.content || "▋"}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                )}
                <p
                  className={`text-xs mt-1.5 ${
                    msg.role === "user" ? "text-white/60" : "text-gray-400"
                  }`}
                >
                  {msg.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                <div className="flex gap-1.5 items-center">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Drag overlay */}
        {dragOver && (
          <div className="absolute inset-0 bg-indigo-50/95 border-2 border-dashed border-indigo-400 rounded-xl flex items-center justify-center z-10 m-4">
            <div className="text-center">
              <Upload className="w-10 h-10 text-indigo-500 mx-auto mb-2" />
              <p className="text-indigo-600 font-display font-700 text-xl">
                Drop PDF here
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Input bar */}
      <div className="bg-white border-t border-gray-200 px-4 py-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-3 items-end">
            <div className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Ask anything about your content... (Enter to send, Shift+Enter for newline)"
                className="w-full bg-transparent text-sm text-gray-800 placeholder-gray-400 resize-none outline-none leading-relaxed max-h-32"
                rows={1}
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-violet-600 text-white rounded-xl flex items-center justify-center hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity shadow-md shadow-indigo-200 shrink-0"
            >
              <Send className="w-4.5 h-4.5" />
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">
            Responses are grounded in your uploaded content via RAG
          </p>
        </div>
      </div>
    </div>
  );
}

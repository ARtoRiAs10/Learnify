
"use client";

import { useState } from "react";
import {
  BarChart3, Upload, Youtube, Loader2, CheckCircle,
  XCircle, Sparkles, FileText, Trophy, RotateCcw, RefreshCw,
} from "lucide-react";
import { getOrCreateSessionId, resetSessionId } from "@/lib/session";

interface Option { label: string; text: string; }
interface QuizQuestion {
  question: string;
  options: Option[];
  correct_answer: string;
  explanation: string;
}
interface QuizResult {
  score: number;
  total: number;
  answers: {
    question: string;
    selected: string;
    correct: string;
    is_correct: boolean;
    explanation: string;
  }[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function QuizPage() {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"pdf" | "youtube">("pdf");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // FIX: Use shared session from localStorage
  const [sessionId, setSessionId] = useState<string>(getOrCreateSessionId);

  const handleNewSession = () => {
    const newId = resetSessionId();
    setSessionId(newId);
    setQuestions([]);
    setResult(null);
    setError(null);
  };

  const handleFileAndGenerate = async (file: File) => {
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

      const res = await fetch(`${API_URL}/generate-quiz`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId }),
      });
      const data = await res.json();
      if (res.ok) {
        setQuestions(data.questions);
        setAnswers({});
        setResult(null);
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

      const res = await fetch(`${API_URL}/generate-quiz`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId }),
      });
      const data = await res.json();
      if (res.ok) {
        setQuestions(data.questions);
        setAnswers({});
        setResult(null);
      } else {
        throw new Error(data.detail);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const submitQuiz = () => {
    if (Object.keys(answers).length < questions.length) {
      alert("Please answer all questions before submitting.");
      return;
    }
    setSubmitting(true);
    const results: QuizResult["answers"] = questions.map((q, i) => ({
      question: q.question,
      selected: answers[i],
      correct: q.correct_answer,
      is_correct: answers[i] === q.correct_answer,
      explanation: q.explanation,
    }));
    const score = results.filter((r) => r.is_correct).length;
    setResult({ score, total: questions.length, answers: results });
    setSubmitting(false);
  };

  const scorePercent = result
    ? Math.round((result.score / result.total) * 100)
    : 0;
  const scoreGradient =
    scorePercent >= 80
      ? "from-emerald-500 to-teal-600"
      : scorePercent >= 60
      ? "from-amber-500 to-orange-600"
      : "from-red-500 to-rose-600";

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-700 text-gray-900">Quiz</h1>
            <p className="text-gray-400 text-sm">
              Session: <span className="font-mono text-xs">{sessionId.slice(-10)}</span>
            </p>
          </div>
        </div>
        <button
          onClick={handleNewSession}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-500 border border-gray-200 rounded-lg hover:border-emerald-300 hover:text-emerald-600 transition-all"
        >
          <RefreshCw className="w-3 h-3" /> New Session
        </button>
      </div>

      {error && (
        <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          ⚠️ {error}
        </div>
      )}

      {questions.length === 0 && !result && (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
          <h2 className="font-display text-lg font-700 text-gray-900 mb-5">
            Generate Quiz From
          </h2>
          <div className="flex gap-2 mb-6">
            {(["pdf", "youtube"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  mode === m
                    ? "bg-emerald-600 text-white shadow-sm"
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
              <div className="border-2 border-dashed border-emerald-200 rounded-2xl p-10 text-center hover:border-emerald-400 hover:bg-emerald-50/50 transition-all group">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4 group-hover:bg-emerald-100">
                  <Upload className="w-7 h-7 text-emerald-500" />
                </div>
                <p className="font-display font-600 text-gray-800 mb-1">
                  Drop PDF here or click to upload
                </p>
                <p className="text-gray-400 text-sm">
                  We'll create a quiz from the content
                </p>
              </div>
              <input
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFileAndGenerate(f);
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
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
              />
              <button
                onClick={handleYoutubeGenerate}
                disabled={loading || !youtubeUrl}
                className="px-5 py-3 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2"
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
            <div className="mt-6 flex items-center justify-center gap-3 text-emerald-600">
              <Loader2 className="w-5 h-5 animate-spin" />
              <p className="text-sm font-medium">
                Processing content and generating quiz...
              </p>
            </div>
          )}
        </div>
      )}

      {questions.length > 0 && !result && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 font-medium">
              {questions.length} questions · {Object.keys(answers).length} answered
            </p>
            <div className="w-32 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all"
                style={{
                  width: `${(Object.keys(answers).length / questions.length) * 100}%`,
                }}
              />
            </div>
          </div>

          {questions.map((q, qi) => (
            <div key={qi} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="flex items-start gap-3 mb-5">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 text-xs font-700 flex items-center justify-center shrink-0 mt-0.5">
                  {qi + 1}
                </div>
                <p className="font-display font-600 text-gray-900 leading-snug">
                  {q.question}
                </p>
              </div>
              <div className="grid grid-cols-1 gap-2.5 ml-10">
                {q.options.map((opt) => (
                  <button
                    key={opt.label}
                    onClick={() =>
                      setAnswers((prev) => ({ ...prev, [qi]: opt.label }))
                    }
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm transition-all border ${
                      answers[qi] === opt.label
                        ? "border-emerald-400 bg-emerald-50 text-emerald-800"
                        : "border-gray-100 bg-gray-50 text-gray-700 hover:border-emerald-200 hover:bg-emerald-50/50"
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-700 shrink-0 ${
                        answers[qi] === opt.label
                          ? "bg-emerald-500 text-white"
                          : "bg-white border border-gray-200 text-gray-500"
                      }`}
                    >
                      {opt.label}
                    </span>
                    {opt.text}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <button
            onClick={submitQuiz}
            disabled={submitting || Object.keys(answers).length < questions.length}
            className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-700 rounded-2xl shadow-lg hover:opacity-90 disabled:opacity-50 transition-all text-lg flex items-center justify-center gap-2"
          >
            {submitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Trophy className="w-5 h-5" />
            )}
            Submit Quiz
          </button>
        </div>
      )}

      {result && (
        <div>
          <div
            className={`bg-gradient-to-br ${scoreGradient} rounded-3xl p-8 text-center text-white mb-8`}
          >
            <Trophy className="w-12 h-12 mx-auto mb-4 opacity-80" />
            <p className="font-display text-6xl font-800 mb-1">{scorePercent}%</p>
            <p className="text-white/80 text-lg mb-2">
              {result.score} / {result.total} correct
            </p>
            <p className="text-white/60 text-sm">
              {scorePercent >= 80
                ? "🎉 Excellent work!"
                : scorePercent >= 60
                ? "👍 Good effort!"
                : "📚 Keep studying!"}
            </p>
          </div>

          <div className="space-y-4 mb-6">
            {result.answers.map((a, i) => (
              <div
                key={i}
                className={`bg-white rounded-2xl border p-5 ${
                  a.is_correct ? "border-emerald-200" : "border-red-200"
                }`}
              >
                <div className="flex items-start gap-3 mb-3">
                  {a.is_correct ? (
                    <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  )}
                  <p className="font-display font-600 text-gray-900 text-sm leading-snug">
                    {a.question}
                  </p>
                </div>
                <div className="ml-8 space-y-1.5 text-xs">
                  <p className="text-gray-500">
                    Your answer:{" "}
                    <span
                      className={
                        a.is_correct
                          ? "text-emerald-600 font-600"
                          : "text-red-600 font-600"
                      }
                    >
                      {a.selected}
                    </span>
                  </p>
                  {!a.is_correct && (
                    <p className="text-gray-500">
                      Correct:{" "}
                      <span className="text-emerald-600 font-600">{a.correct}</span>
                    </p>
                  )}
                  <p className="text-gray-400 mt-2 leading-relaxed">{a.explanation}</p>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => {
              setQuestions([]);
              setResult(null);
              setAnswers({});
            }}
            className="w-full py-3 bg-gray-100 text-gray-700 font-600 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" /> Try Another Quiz
          </button>
        </div>
      )}
    </div>
  );
}

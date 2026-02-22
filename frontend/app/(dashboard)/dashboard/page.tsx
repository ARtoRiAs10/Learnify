"use client";

import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import {
  MessageSquare, Brain, BarChart3, Youtube, FileText,
  Sparkles, ArrowRight, BookOpen, Zap, TrendingUp
} from "lucide-react";

const quickActions = [
  {
    href: "/chat",
    icon: MessageSquare,
    title: "Start Chatting",
    desc: "Ask questions about your uploaded content using RAG-powered AI",
    gradient: "from-indigo-500 to-blue-600",
    bg: "bg-indigo-50",
    border: "border-indigo-100 hover:border-indigo-300",
    shadow: "hover:shadow-indigo-100",
  },
  {
    href: "/flashcards",
    icon: Brain,
    title: "Flashcards",
    desc: "Auto-generate 10–15 study cards from any YouTube video or PDF",
    gradient: "from-violet-500 to-purple-600",
    bg: "bg-violet-50",
    border: "border-violet-100 hover:border-violet-300",
    shadow: "hover:shadow-violet-100",
  },
  {
    href: "/quiz",
    icon: BarChart3,
    title: "Take a Quiz",
    desc: "Test your knowledge with 5–10 multiple choice questions",
    gradient: "from-emerald-500 to-teal-600",
    bg: "bg-emerald-50",
    border: "border-emerald-100 hover:border-emerald-300",
    shadow: "hover:shadow-emerald-100",
  },
  {
    href: "/youtube",
    icon: Youtube,
    title: "YouTube Transcript",
    desc: "Paste a YouTube URL to extract and study the transcript",
    gradient: "from-red-500 to-orange-600",
    bg: "bg-red-50",
    border: "border-red-100 hover:border-red-300",
    shadow: "hover:shadow-red-100",
  },
];

const features = [
  { icon: Zap, title: "RAG Technology", desc: "Answers grounded in your content" },
  { icon: BookOpen, title: "Smart Chunking", desc: "Optimal context retrieval" },
  { icon: TrendingUp, title: "Gemini AI", desc: "Free tier, production quality" },
];

export default function DashboardPage() {
  const { user } = useUser();
  const firstName = user?.firstName || "Learner";

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      {/* Welcome Header */}
      <div className="mb-10">
        <div className="flex items-center gap-2 text-sm text-indigo-600 font-medium mb-2">
          <Sparkles className="w-4 h-4" />
          <span>AI-Powered Learning</span>
        </div>
        <h1 className="font-display text-4xl font-800 text-gray-900 mb-2">
          Welcome back, {firstName} 👋
        </h1>
        <p className="text-gray-500 text-lg max-w-xl">
          Upload a PDF or YouTube video, then generate flashcards, take quizzes, or chat with your content using contextual AI.
        </p>
      </div>

      {/* How it works banner */}
      <div className="mb-10 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-700 p-6 md:p-8 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h2 className="font-display text-2xl font-700 text-white mb-2">How LearnAI Works</h2>
            <p className="text-indigo-200 text-sm max-w-lg leading-relaxed">
              Upload your content → AI chunks & embeds it into a vector store → You chat, quiz, or review flashcards with full RAG context. Every answer is grounded in your actual material.
            </p>
          </div>
          <div className="flex gap-4 shrink-0">
            {features.map((f) => (
              <div key={f.title} className="text-center">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mx-auto mb-1.5">
                  <f.icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-xs font-600 text-white">{f.title}</p>
                <p className="text-xs text-indigo-200">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="font-display text-xl font-700 text-gray-900 mb-5">What would you like to do?</h2>
        <div className="grid md:grid-cols-2 gap-5">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className={`group bg-white rounded-2xl border ${action.border} p-6 flex items-start gap-5 hover:shadow-lg ${action.shadow} transition-all hover:-translate-y-0.5`}
            >
              <div className={`w-14 h-14 ${action.bg} rounded-2xl flex items-center justify-center shrink-0`}>
                <div className={`w-8 h-8 bg-gradient-to-br ${action.gradient} rounded-xl flex items-center justify-center shadow-sm`}>
                  <action.icon className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h3 className="font-display font-700 text-gray-900 text-lg">{action.title}</h3>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-1 transition-all shrink-0" />
                </div>
                <p className="text-gray-500 text-sm leading-relaxed">{action.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Upload hint */}
      <div className="rounded-2xl bg-gray-50 border border-gray-200 border-dashed p-8 text-center">
        <div className="w-12 h-12 bg-white rounded-2xl border border-gray-200 flex items-center justify-center mx-auto mb-4 shadow-sm">
          <FileText className="w-6 h-6 text-gray-400" />
        </div>
        <h3 className="font-display font-700 text-gray-800 text-lg mb-2">Start by uploading content</h3>
        <p className="text-gray-400 text-sm mb-5 max-w-sm mx-auto">
          Head to any section above — each page lets you upload a PDF or paste a YouTube URL before generating content.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link href="/chat" className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5" /> Open Chat
          </Link>
          <Link href="/youtube" className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:border-gray-300 transition-colors flex items-center gap-1.5">
            <Youtube className="w-3.5 h-3.5 text-red-500" /> YouTube Transcript
          </Link>
        </div>
      </div>
    </div>
  );
}

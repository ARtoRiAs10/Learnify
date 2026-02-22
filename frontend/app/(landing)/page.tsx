import Link from "next/link";
import { SignInButton, SignUpButton, SignedIn, SignedOut } from "@clerk/nextjs";
import {
  BookOpen, Brain, Zap, Youtube, FileText, MessageSquare,
  ChevronRight, Sparkles, BarChart3, CheckCircle, ArrowRight
} from "lucide-react";

const features = [
  {
    icon: Youtube,
    title: "YouTube Processing",
    desc: "Paste any YouTube URL and instantly extract transcripts to study from.",
    color: "from-red-500 to-orange-500",
    bg: "bg-red-50",
  },
  {
    icon: FileText,
    title: "PDF Intelligence",
    desc: "Upload PDFs and let AI parse, chunk, and understand every page.",
    color: "from-blue-500 to-cyan-500",
    bg: "bg-blue-50",
  },
  {
    icon: Brain,
    title: "Smart Flashcards",
    desc: "Auto-generate 10–15 targeted flashcards with key concepts.",
    color: "from-violet-500 to-purple-500",
    bg: "bg-violet-50",
  },
  {
    icon: BarChart3,
    title: "Adaptive Quizzes",
    desc: "5–10 multiple choice questions with instant scoring and feedback.",
    color: "from-emerald-500 to-teal-500",
    bg: "bg-emerald-50",
  },
  {
    icon: MessageSquare,
    title: "RAG-Powered Chat",
    desc: "Ask questions and get streaming, context-aware answers from your content.",
    color: "from-amber-500 to-yellow-500",
    bg: "bg-amber-50",
  },
  {
    icon: Zap,
    title: "Instant Results",
    desc: "Powered by Gemini AI with vector embeddings for lightning-fast retrieval.",
    color: "from-pink-500 to-rose-500",
    bg: "bg-pink-50",
  },
];

const steps = [
  { num: "01", title: "Upload Content", desc: "Add a YouTube URL or upload a PDF document." },
  { num: "02", title: "AI Processes", desc: "Our system chunks, embeds, and indexes your content." },
  { num: "03", title: "Learn Smarter", desc: "Chat, quiz, and review flashcards powered by your material." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen mesh-bg overflow-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="font-display text-xl font-700 text-gray-900">LearnAI</span>
          </div>
          <div className="flex items-center gap-3">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-lg hover:opacity-90 transition-opacity shadow-sm">
                  Get Started Free
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard" className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-lg hover:opacity-90 transition-opacity shadow-sm flex items-center gap-1">
                Go to Dashboard <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </SignedIn>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-24 px-6">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-sm font-medium mb-8">
            <Sparkles className="w-3.5 h-3.5" />
            Powered by Gemini AI + RAG Technology
          </div>

          {/* Headline */}
          <h1 className="font-display text-6xl md:text-7xl font-800 text-gray-900 leading-[1.05] mb-6">
            Turn Any Content
            <br />
            Into a{" "}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-600 bg-clip-text text-transparent">
                Learning Experience
              </span>
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                <path d="M2 10 Q75 2 150 8 Q225 14 298 6" stroke="url(#g)" strokeWidth="3" strokeLinecap="round"/>
                <defs>
                  <linearGradient id="g" x1="0" y1="0" x2="300" y2="0">
                    <stop offset="0%" stopColor="#6366f1"/>
                    <stop offset="100%" stopColor="#a855f7"/>
                  </linearGradient>
                </defs>
              </svg>
            </span>
          </h1>

          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Paste a YouTube URL or upload a PDF. LearnAI generates flashcards, quizzes, and
            lets you chat with your content — all powered by contextual AI.
          </p>

          {/* CTA Buttons */}
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <SignedOut>
              <SignUpButton mode="modal">
                <button className="group px-8 py-4 bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold rounded-xl shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 hover:-translate-y-0.5 transition-all text-base flex items-center gap-2">
                  Start Learning Free
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </SignUpButton>
              <SignInButton mode="modal">
                <button className="px-8 py-4 bg-white text-gray-700 font-semibold rounded-xl border border-gray-200 hover:border-indigo-300 hover:text-indigo-600 transition-all text-base shadow-sm">
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard" className="group px-8 py-4 bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold rounded-xl shadow-lg shadow-indigo-200 hover:shadow-xl hover:-translate-y-0.5 transition-all text-base flex items-center gap-2">
                Open Dashboard
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </SignedIn>
          </div>

          {/* Hero Visual */}
          <div className="mt-20 relative">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-300 to-transparent" />
            <div className="glass rounded-3xl border border-white/60 shadow-2xl shadow-indigo-100/50 p-6 md:p-8 max-w-4xl mx-auto">
              {/* Mock UI */}
              <div className="flex gap-4 h-80">
                {/* Sidebar mock */}
                <div className="w-48 bg-gray-900 rounded-2xl p-4 flex flex-col gap-2 shrink-0">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-400 to-violet-500 mb-3" />
                  {["Chat", "Flashcards", "Quiz", "YouTube"].map((item, i) => (
                    <div key={item} className={`h-8 rounded-lg px-3 flex items-center gap-2 text-xs font-medium ${i === 0 ? "bg-indigo-600 text-white" : "text-gray-400 hover:bg-gray-800"}`}>
                      <div className="w-3 h-3 rounded bg-current opacity-60" />
                      {item}
                    </div>
                  ))}
                </div>
                {/* Chat mock */}
                <div className="flex-1 flex flex-col gap-3">
                  <div className="flex gap-3 items-end">
                    <div className="w-7 h-7 rounded-full bg-gray-200 shrink-0" />
                    <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-2.5 text-xs text-gray-700 shadow-sm max-w-xs">
                      What are the key concepts from the uploaded PDF?
                    </div>
                  </div>
                  <div className="flex gap-3 items-end flex-row-reverse">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 shrink-0" />
                    <div className="chat-user rounded-2xl rounded-br-sm px-4 py-2.5 text-xs max-w-xs">
                      Based on your PDF, the 3 key concepts are: 1) Vector embeddings for semantic search, 2) RAG architecture for context-aware responses, 3) Chunking strategies for optimal retrieval...
                    </div>
                  </div>
                  <div className="flex gap-3 items-end">
                    <div className="w-7 h-7 rounded-full bg-gray-200 shrink-0" />
                    <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-2.5 text-xs text-gray-700 shadow-sm">
                      Generate flashcards from this content
                    </div>
                  </div>
                  {/* Typing indicator */}
                  <div className="flex gap-3 items-end flex-row-reverse">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 shrink-0" />
                    <div className="bg-gray-100 rounded-2xl px-4 py-3 flex gap-1.5 items-center">
                      {[0,1,2].map(i => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-700 text-gray-900 mb-4">How It Works</h2>
            <p className="text-gray-500 text-lg">Three simple steps to smarter learning</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={step.num} className="relative">
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-indigo-300 to-transparent -translate-x-8 z-0" />
                )}
                <div className="glass rounded-2xl p-8 hover:-translate-y-1 transition-transform relative z-10">
                  <div className="font-display text-5xl font-800 bg-gradient-to-r from-indigo-200 to-violet-200 bg-clip-text text-transparent mb-4">
                    {step.num}
                  </div>
                  <h3 className="font-display text-xl font-600 text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 bg-white/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-700 text-gray-900 mb-4">Everything You Need to Learn</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">A complete AI-powered study toolkit in one place</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="group bg-white rounded-2xl p-6 border border-gray-100 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-50 hover:-translate-y-1 transition-all">
                <div className={`w-12 h-12 ${f.bg} rounded-xl flex items-center justify-center mb-5`}>
                  <div className={`w-6 h-6 bg-gradient-to-br ${f.color} rounded flex items-center justify-center`}>
                    <f.icon className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>
                <h3 className="font-display text-lg font-600 text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-12 md:p-16 text-center overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
            <div className="relative">
              <h2 className="font-display text-4xl md:text-5xl font-800 text-white mb-4">
                Ready to Transform Your Learning?
              </h2>
              <p className="text-indigo-200 text-lg mb-8 max-w-lg mx-auto">
                Join now and start converting any content into an interactive study session.
              </p>
              <SignedOut>
                <SignUpButton mode="modal">
                  <button className="px-8 py-4 bg-white text-indigo-700 font-semibold rounded-xl hover:bg-indigo-50 transition-colors text-base shadow-lg flex items-center gap-2 mx-auto">
                    Get Started — It&apos;s Free <ChevronRight className="w-4 h-4" />
                  </button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <Link href="/dashboard" className="inline-flex px-8 py-4 bg-white text-indigo-700 font-semibold rounded-xl hover:bg-indigo-50 transition-colors text-base shadow-lg items-center gap-2">
                  Open Dashboard <ChevronRight className="w-4 h-4" />
                </Link>
              </SignedIn>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <BookOpen className="w-3 h-3 text-white" />
            </div>
            <span className="font-display font-600 text-gray-800">LearnAI</span>
          </div>
          <p className="text-gray-400 text-sm">Built for Learning · Powered by Gemini AI</p>
          <div className="flex items-center gap-1 text-green-600 text-sm">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Free Tier Available</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

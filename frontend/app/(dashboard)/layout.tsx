"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import {
  BookOpen, MessageSquare, Brain, BarChart3, Youtube,
  Menu, X, ChevronRight, Sparkles, FileText, Home
} from "lucide-react";

const navItems = [
  { href: "/dashboard", icon: Home, label: "Dashboard", color: "from-gray-400 to-gray-500" },
  { href: "/chat", icon: MessageSquare, label: "Chat", color: "from-indigo-400 to-blue-500" },
  { href: "/flashcards", icon: Brain, label: "Flashcards", color: "from-violet-400 to-purple-500" },
  { href: "/quiz", icon: BarChart3, label: "Quiz", color: "from-emerald-400 to-teal-500" },
  { href: "/youtube", icon: Youtube, label: "YouTube", color: "from-red-400 to-orange-500" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-30 w-64 sidebar flex flex-col transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        {/* Logo */}
        <div className="px-5 py-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <BookOpen className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <p className="font-display text-white font-700 text-lg leading-none">LearnAI</p>
              <p className="text-xs text-white/40 mt-0.5">AI Study Assistant</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          <p className="text-xs font-600 text-white/30 uppercase tracking-wider px-3 mb-3">Navigation</p>
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                  active
                    ? "bg-white/10 text-white"
                    : "text-white/50 hover:bg-white/5 hover:text-white/80"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center shrink-0 ${active ? "opacity-100 shadow-sm" : "opacity-50 group-hover:opacity-80"} transition-opacity`}>
                  <item.icon className="w-4 h-4 text-white" />
                </div>
                <span className="font-medium text-sm">{item.label}</span>
                {active && <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-60" />}
              </Link>
            );
          })}

          <div className="pt-4 mt-4 border-t border-white/10">
            <p className="text-xs font-600 text-white/30 uppercase tracking-wider px-3 mb-3">Upload Content</p>
            <Link
              href="/chat"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/50 hover:bg-white/5 hover:text-white/80 transition-all group"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shrink-0 opacity-50 group-hover:opacity-80 transition-opacity">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <span className="font-medium text-sm">Upload PDF</span>
            </Link>
          </div>
        </nav>

        {/* AI Badge */}
        <div className="px-4 py-4 border-t border-white/10">
          <div className="bg-gradient-to-r from-indigo-500/20 to-violet-500/20 rounded-xl p-3 border border-white/10">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
              <span className="text-xs font-600 text-indigo-200">Powered by Gemini</span>
            </div>
            <p className="text-xs text-white/40">Free tier · RAG enabled</p>
          </div>
          <div className="flex items-center gap-3 mt-3 px-1">
            <UserButton afterSignOutUrl="/" />
            <div>
              <p className="text-xs text-white/60">Your Account</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar (mobile) */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-gray-100">
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <BookOpen className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-display font-700 text-gray-900">LearnAI</span>
          </div>
          <UserButton afterSignOutUrl="/" />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

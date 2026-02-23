/**
 * FIX: This page was MISSING — causing the 404 when clicking
 * "Get Started Free" / "Start Learning Free".
 *
 * Clerk reads NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up and redirects
 * here. Without this file Next.js returns 404.
 */
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen mesh-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="font-display text-2xl font-700 text-gray-900">LearnAI</span>
          </div>
          <p className="text-gray-500 text-sm">Create your account — start learning smarter today</p>
        </div>
        <SignUp
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "shadow-xl shadow-indigo-100/50 border border-gray-100 rounded-2xl",
              headerTitle: "font-display font-700",
              formButtonPrimary: "bg-gradient-to-r from-indigo-500 to-violet-600 hover:opacity-90 transition-opacity",
            },
          }}
        />
      </div>
    </div>
  );
}

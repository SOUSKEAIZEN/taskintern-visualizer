"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { registerUser } from "../../lib/actions/auth";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Simplified logic since it's dummy
  }

  return (
    <div className="h-full flex items-center justify-center gradient-hero px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Background blobs for premium feel removed for minimal theme */}

      <div className="max-w-md w-full space-y-8 bg-bg-card p-10 rounded-card shadow-premium z-10 relative border border-border-default">
        <div>
          <h2 className="mt-6 text-center text-[42px] font-heading font-extrabold text-text-heading tracking-tight leading-tight">
            {isLogin ? "Welcome back" : "Create an account"}
          </h2>
          <p className="mt-2 text-center text-base font-body text-text-secondary">
            {isLogin ? "Sign in to continue your journey" : "Start your DSA mastery today"}
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <button
            onClick={() => signIn("credentials", { callbackUrl: "/portal" })}
            className="btn-primary w-full py-4 text-[16px]"
          >
            Sign In (Dummy Login)
          </button>
        </div>

        <div className="mt-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border-default" />
            </div>
            <div className="relative flex justify-center text-sm font-body">
              <span className="px-4 bg-bg-card text-text-placeholder font-medium tracking-wide">Or continue with</span>
            </div>
          </div>

          <div className="mt-8">
            <button
              onClick={() => signIn("google", { callbackUrl: "/portal" })}
              className="btn-secondary w-full py-4 text-[16px]"
            >
              <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Sign in with Google
            </button>
          </div>
        </div>

        <div className="flex items-center justify-center mt-8">
          <p className="text-[14px] text-text-secondary font-body font-medium">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
          </p>
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="ml-2 text-[14px] font-heading font-bold text-primary hover:text-primary-hover transition-colors"
          >
            {isLogin ? "Sign up" : "Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
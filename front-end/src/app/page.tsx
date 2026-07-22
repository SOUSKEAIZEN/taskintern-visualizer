"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

type AuthState = "LOGIN" | "REGISTER" | "OTP";

export default function LoginPage() {
  const [authState, setAuthState] = useState<AuthState>("LOGIN");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError(res.error);
      } else {
        window.location.href = "/portal";
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to register");
      } else {
        setAuthState("OTP");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Invalid OTP");
        setLoading(false);
      } else {
        // Automatically sign in upon successful verification
        const signInRes = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (signInRes?.error) {
          setError(signInRes.error);
          setLoading(false);
        } else {
          window.location.href = "/portal";
        }
      }
    } catch (err) {
      setError("An unexpected error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex items-center justify-center gradient-hero px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="max-w-md w-full space-y-8 bg-bg-card p-10 rounded-card shadow-premium z-10 relative border border-border-default">
        <div>
          <h2 className="mt-2 text-center text-[36px] font-heading font-extrabold text-text-heading tracking-tight leading-tight">
            {authState === "LOGIN" && "Welcome back"}
            {authState === "REGISTER" && "Create an account"}
            {authState === "OTP" && "Verify your email"}
          </h2>
          <p className="mt-2 text-center text-base font-body text-text-secondary">
            {authState === "LOGIN" && "Sign in to continue your journey"}
            {authState === "REGISTER" && "Start your DSA mastery today"}
            {authState === "OTP" && "Enter the 6-digit code sent to your email"}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-lg text-center">
            {error}
          </div>
        )}

        <div className="mt-8">
          {authState === "LOGIN" && (
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <input
                  type="email"
                  required
                  placeholder="Email address"
                  className="w-full px-4 py-3 bg-bg-main border border-border-default rounded-lg focus:outline-none focus:border-primary text-text-heading"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <input
                  type="password"
                  required
                  placeholder="Password"
                  className="w-full px-4 py-3 bg-bg-main border border-border-default rounded-lg focus:outline-none focus:border-primary text-text-heading"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-4 text-[16px] flex justify-center items-center"
              >
                {loading ? "Signing in..." : "Secure Sign In"}
              </button>
            </form>
          )}

          {authState === "REGISTER" && (
            <form onSubmit={handleRegister} className="space-y-6">
              <div>
                <input
                  type="text"
                  required
                  placeholder="Full Name"
                  className="w-full px-4 py-3 bg-bg-main border border-border-default rounded-lg focus:outline-none focus:border-primary text-text-heading"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <input
                  type="email"
                  required
                  placeholder="Email address"
                  className="w-full px-4 py-3 bg-bg-main border border-border-default rounded-lg focus:outline-none focus:border-primary text-text-heading"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <input
                  type="password"
                  required
                  placeholder="Password"
                  className="w-full px-4 py-3 bg-bg-main border border-border-default rounded-lg focus:outline-none focus:border-primary text-text-heading"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-4 text-[16px] flex justify-center items-center"
              >
                {loading ? "Creating account..." : "Continue"}
              </button>
            </form>
          )}

          {authState === "OTP" && (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div>
                <input
                  type="text"
                  required
                  placeholder="6-digit OTP code"
                  className="w-full px-4 py-3 bg-bg-main border border-border-default rounded-lg focus:outline-none focus:border-primary text-text-heading text-center tracking-widest text-xl"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-4 text-[16px] flex justify-center items-center"
              >
                {loading ? "Verifying..." : "Verify & Log In"}
              </button>
            </form>
          )}
        </div>

        {(authState === "LOGIN" || authState === "REGISTER") && (
          <>
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
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Sign in with Google
                </button>
              </div>
            </div>

            <div className="flex items-center justify-center mt-8">
              <p className="text-[14px] text-text-secondary font-body font-medium">
                {authState === "LOGIN" ? "Don't have an account?" : "Already have an account?"}
              </p>
              <button
                onClick={() => {
                  setAuthState(authState === "LOGIN" ? "REGISTER" : "LOGIN");
                  setError("");
                }}
                className="ml-2 text-[14px] font-heading font-bold text-primary hover:text-primary-hover transition-colors"
              >
                {authState === "LOGIN" ? "Sign up" : "Sign in"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
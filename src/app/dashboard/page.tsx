"use client";

import { useEffect, useState } from "react";
import { logger } from "../../../lib/logger";
import { fetchUserDashboardData } from "../../../lib/actions/progress";

// TypeScript interfaces mirroring our Prisma Schema
interface QuizScore {
  id: string;
  topicId: string;
  score: number;
  totalQuestions: number;
  attemptedAt: Date;
}

interface ModuleProgress {
  id: string;
  topicId: string;
  isCompleted: boolean;
  lastAccessed: Date;
}

interface DashboardData {
  id: string;
  email: string;
  name: string | null;
  progress: ModuleProgress[];
  scores: QuizScore[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // In a production app, this ID comes from your Authentication session (e.g., NextAuth)
  // For this build, we are using a placeholder ID to demonstrate the UI/Backend connection.
  const CURRENT_USER_ID = "placeholder-student-id-123"; 

  useEffect(() => {
    const loadDashboard = async () => {
      logger.info(`Client State: Mounting Dashboard UI and fetching data for User ${CURRENT_USER_ID}`);
      setIsLoading(true);
      
      try {
        const result = await fetchUserDashboardData(CURRENT_USER_ID);
        
        if (result.success && result.data) {
          logger.info("Client State: Successfully populated Dashboard with database records.");
          // @ts-ignore - bypassing strict type mapping for the mockup
          setData(result.data);
        } else {
          logger.warn("Client Warning: No data found, or user does not exist yet.");
          setError("No learning history found. Complete a module to see your stats here!");
        }
      } catch (err) {
        logger.error("Client Error: Dashboard failed to load.", err);
        setError("Failed to load dashboard data. Check your database connection.");
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <div className="animate-pulse flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Fetching Learning Analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Dashboard Header */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-2">Student Dashboard</h1>
          <p className="text-slate-500">Welcome back. Here is a summary of your algorithmic journey.</p>
        </div>
        <div className="text-right hidden sm:block">
          <div className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-full border border-indigo-100">
            Active Learner
          </div>
        </div>
      </div>

      {error ? (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-6 rounded-2xl text-center font-medium">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Module Progress Card */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">✓</span>
              Module Progress
            </h2>
            
            <div className="space-y-4">
              {data?.progress.length === 0 ? (
                <p className="text-slate-400 italic">No modules started yet.</p>
              ) : (
                data?.progress.map((mod) => (
                  <div key={mod.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 transition-colors hover:border-slate-300">
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-700 capitalize">{mod.topicId.replace('-', ' ')}</span>
                      <span className="text-xs text-slate-400">Last accessed: {new Date(mod.lastAccessed).toLocaleDateString()}</span>
                    </div>
                    {mod.isCompleted ? (
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">Completed</span>
                    ) : (
                      <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">In Progress</span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quiz History Card */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">★</span>
              Quiz History
            </h2>
            
            <div className="space-y-4">
              {data?.scores.length === 0 ? (
                <p className="text-slate-400 italic">No quizzes attempted yet.</p>
              ) : (
                data?.scores.map((quiz) => (
                  <div key={quiz.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 transition-colors hover:border-slate-300">
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-700 capitalize">{quiz.topicId.replace('-', ' ')}</span>
                      <span className="text-xs text-slate-400">{new Date(quiz.attemptedAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-indigo-600">{quiz.score}</span>
                      <span className="text-sm font-semibold text-slate-400">/ {quiz.totalQuestions}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
        </div>
      )}
    </div>
  );
}
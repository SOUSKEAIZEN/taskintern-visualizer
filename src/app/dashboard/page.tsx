"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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

// Total number of visualization modules available in the app
const TOTAL_MODULES = 6; 

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const CURRENT_USER_ID = "placeholder-student-id-123"; 

  useEffect(() => {
    const loadDashboard = async () => {
      logger.info(`Dashboard UI: Mounting and fetching data for User ${CURRENT_USER_ID}`);
      setIsLoading(true);
      
      try {
        const result = await fetchUserDashboardData(CURRENT_USER_ID);
        
        if (result.success && result.data) {
          logger.info("Dashboard UI: Successfully fetched database records.");
          setData(result.data as DashboardData);
        } else {
          logger.warn("Dashboard UI Warning: No data found, or user does not exist yet.");
          setError("No learning history found. Complete a module to see your stats here!");
        }
      } catch (err) {
        logger.error("Dashboard UI Error: Failed to load data.", err);
        setError("Failed to load dashboard data. Check your database connection.");
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (isLoading) {
    logger.info("Dashboard UI: Rendering loading state...");
    return (
      <div className="flex items-center justify-center h-full w-full">
        <div className="animate-pulse flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Fetching Analytics...</p>
        </div>
      </div>
    );
  }

  // --- Metric Calculations ---
  logger.info("Dashboard UI: Calculating performance metrics...");
  
  const completedModulesCount = data?.progress.filter(mod => mod.isCompleted).length || 0;
  const completionPercentage = Math.round((completedModulesCount / TOTAL_MODULES) * 100);
  
  let performanceTier = "Novice";
  let tierColor = "text-amber-600 bg-amber-50 border-amber-100";
  if (completionPercentage > 25 && completionPercentage <= 75) {
    performanceTier = "Intermediate";
    tierColor = "text-indigo-600 bg-indigo-50 border-indigo-100";
  } else if (completionPercentage > 75) {
    performanceTier = "Expert";
    tierColor = "text-emerald-600 bg-emerald-50 border-emerald-100";
  }

  // --- Recent Activity Logic ---
  const sortedProgress = [...(data?.progress || [])].sort(
    (a, b) => new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime()
  );
  const recentActivity = sortedProgress.slice(0, 3);
  const lastAccessedModule = recentActivity.length > 0 ? recentActivity[0] : null;

  logger.info(`Dashboard UI: Metrics calculated. Completion: ${completionPercentage}%, Tier: ${performanceTier}`);

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Dashboard Header */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="flex-1 w-full">
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-2">Dashboard</h1>
          <p className="text-slate-500 mb-6">Here is a summary of your algorithmic journey and visualizations.</p>
          
          {/* Progress Bar */}
          <div className="w-full max-w-md">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-semibold text-slate-700">Overall Progress</span>
              <span className="font-bold text-indigo-600">{completionPercentage}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5">
              <div 
                className="bg-indigo-600 h-2.5 rounded-full transition-all duration-1000 ease-out" 
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-4">
          <div className={`text-sm font-semibold px-4 py-2 rounded-full border ${tierColor}`}>
            Tier: {performanceTier}
          </div>
          {lastAccessedModule && (
            <Link 
              href={`/modules/${lastAccessedModule.topicId}`}
              className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
              onClick={() => logger.info(`Dashboard UI: User clicked Resume Learning for ${lastAccessedModule.topicId}`)}
            >
              Resume: {lastAccessedModule.topicId.replace('-', ' ')} &rarr;
            </Link>
          )}
        </div>
      </div>

      {error ? (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-6 rounded-2xl text-center font-medium">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Recent Activity Card */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">⚡</span>
              Recent Activity
            </h2>
            
            <div className="space-y-4">
              {recentActivity.length === 0 ? (
                <p className="text-slate-400 italic">No modules started yet.</p>
              ) : (
                recentActivity.map((mod) => (
                  <div key={mod.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 transition-colors hover:border-slate-300">
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-700 capitalize">{mod.topicId.replace('-', ' ')}</span>
                      <span className="text-xs text-slate-400">Accessed: {new Date(mod.lastAccessed).toLocaleDateString()}</span>
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
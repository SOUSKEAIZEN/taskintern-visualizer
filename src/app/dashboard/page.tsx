// src/app/dashboard/page.tsx
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
  theoryCompleted: boolean; // Granular theory tracking
  visualizationsCompleted: string[]; // Granular visualizer tracking
  isCompleted: boolean;
  lastAccessed: Date;
  timeSpent: number; 
}

interface DashboardData {
  id: string;
  email: string;
  name: string | null;
  progress: ModuleProgress[];
  scores: QuizScore[];
}

// Master list to calculate "Pending" statuses
const ALL_MODULES = [
  { id: "arrays", label: "Array Operations" },
  { id: "searching", label: "Searching Algorithms" },
  { id: "hashmaps", label: "Hash Maps" },
  { id: "linked-lists", label: "Linked Lists" },
  { id: "stacks", label: "Stacks" },
  { id: "queues", label: "Queues" },
  { id: "trees", label: "Trees & BST" },
  { id: "heaps", label: "Heaps" },
  { id: "graphs", label: "Graphs (BFS/DFS)" },
];

// Configuration for calculating independent percentages
// Adjust the 'visCount' to match the exact number of interactive visualizations per page
const MODULE_CONFIG: Record<string, { hasTheory: boolean, visCount: number }> = {
  "arrays": { hasTheory: true, visCount: 4 }, 
  "searching": { hasTheory: true, visCount: 2 }, // Linear, Binary
  "hashmaps": { hasTheory: true, visCount: 1 },  // Chaining
  "linked-lists": { hasTheory: true, visCount: 3 },
  "stacks": { hasTheory: true, visCount: 2 },
  "queues": { hasTheory: true, visCount: 2 },
  "trees": { hasTheory: true, visCount: 3 },
  "heaps": { hasTheory: true, visCount: 2 },
  "graphs": { hasTheory: true, visCount: 2 },
};

const TOTAL_MODULES = ALL_MODULES.length; 

// Helper function to format seconds into mm:ss
const formatTime = (totalSeconds: number) => {
  if (!totalSeconds) return "0m 0s";
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}m ${s}s`;
};

const DashboardPage = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSynced, setLastSynced] = useState<Date>(new Date());

  const CURRENT_USER_ID = "placeholder-student-id-123"; 

  useEffect(() => {
    let pollInterval: NodeJS.Timeout;

    const loadDashboard = async (isBackgroundSync = false) => {
      if (!isBackgroundSync) {
        logger.info(`Dashboard UI Step 1: Initial mount. Fetching data for User ${CURRENT_USER_ID}`);
        setIsLoading(true);
      } else {
        logger.info(`Dashboard UI Step 1 [Background]: Running background sync for User ${CURRENT_USER_ID}...`);
      }
      
      try {
        const result = await fetchUserDashboardData(CURRENT_USER_ID);
        
        if (result.success && result.data) {
          if (!isBackgroundSync) logger.info("Dashboard UI Step 2: Successfully fetched initial database records.");
          setData(result.data as DashboardData);
          setLastSynced(new Date());
        } else if (!isBackgroundSync) {
          logger.warn("Dashboard UI Point of Failure: No data found, or user does not exist yet.");
          setError("No learning history found. Complete a module to see your stats here!");
        }
      } catch (err) {
        logger.error("Dashboard UI Point of Failure: Failed to load data.", err);
        if (!isBackgroundSync) setError("Failed to load dashboard data. Check your database connection.");
      } finally {
        if (!isBackgroundSync) setIsLoading(false);
      }
    };

    // Initial load
    loadDashboard();

    // Set up polling for instant sync feel (every 10 seconds)
    pollInterval = setInterval(() => {
      loadDashboard(true);
    }, 10000);

    return () => clearInterval(pollInterval);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <div className="animate-pulse flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
          <p className="text-slate-500 font-medium">Fetching Real-Time Analytics...</p>
        </div>
      </div>
    );
  }

  // --- Metric Calculations ---
  logger.info("Dashboard UI Step 3: Calculating granular metrics (Percentages, Time, Tiers)...");
  
  const userProgress = data?.progress || [];
  
  // Generate Master List with Independent Percentages
  const moduleStatusList = ALL_MODULES.map(module => {
    const dbRecord = userProgress.find(p => p.topicId === module.id);
    const config = MODULE_CONFIG[module.id];
    const totalPossibleSteps = (config?.hasTheory ? 1 : 0) + (config?.visCount || 0);
    
    if (!dbRecord) {
      return { ...module, status: "Pending", timeSpent: 0, percentage: 0 };
    }

    // Granular Calculation
    const theoryScore = dbRecord.theoryCompleted ? 1 : 0;
    const visScore = dbRecord.visualizationsCompleted?.length || 0;
    const currentSteps = theoryScore + visScore;
    
    // Guard against over-100% if visualizations change
    const calculatedPercentage = Math.min(100, Math.round((currentSteps / totalPossibleSteps) * 100));
    
    // Check master completion flag or if calculated percentage is 100
    const isActuallyComplete = dbRecord.isCompleted || calculatedPercentage === 100;

    return { 
      ...module, 
      status: isActuallyComplete ? "Completed" : "Started", 
      timeSpent: dbRecord.timeSpent,
      percentage: calculatedPercentage
    };
  });

  const completedModules = moduleStatusList.filter(mod => mod.status === "Completed");
  const startedModules = moduleStatusList.filter(mod => mod.status === "Started");
  
  const completionPercentage = Math.round((completedModules.length / TOTAL_MODULES) * 100);
  
  // Calculate Time & Speed
  const totalTimeSeconds = userProgress.reduce((acc, mod) => acc + (mod.timeSpent || 0), 0);
  const avgTimePerCompleted = completedModules.length > 0 
    ? Math.round(completedModules.reduce((acc, mod) => acc + (mod.timeSpent || 0), 0) / completedModules.length) 
    : 0;

  // Codeforces-style Tiers
  let performanceTier = "Newbie";
  let tierColor = "text-slate-600 bg-slate-100 border-slate-200";
  
  if (completionPercentage > 0 && completionPercentage <= 25) {
    performanceTier = "Pupil";
    tierColor = "text-green-600 bg-green-50 border-green-200";
  } else if (completionPercentage > 25 && completionPercentage <= 75) {
    performanceTier = "Specialist";
    tierColor = "text-cyan-600 bg-cyan-50 border-cyan-200";
  } else if (completionPercentage > 75 && completionPercentage < 100) {
    performanceTier = "Expert";
    tierColor = "text-indigo-600 bg-indigo-50 border-indigo-200";
  } else if (completionPercentage === 100) {
    performanceTier = "Grandmaster";
    tierColor = "text-red-600 bg-red-50 border-red-200";
  }

  const lastAccessedModule = [...userProgress].sort(
    (a, b) => new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime()
  )[0];

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Dashboard Header */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="flex-1 w-full">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Dashboard</h1>
            <span className="text-xs font-medium bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full animate-pulse">
              Live Sync Active
            </span>
          </div>
          <p className="text-slate-500 mb-6">Real-time overview of your algorithmic journey.</p>
          
          <div className="w-full max-w-md">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-semibold text-slate-700">Overall Syllabus Progress</span>
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
          <div className={`text-sm font-bold px-5 py-2 rounded-full border shadow-sm ${tierColor}`}>
            Tier: {performanceTier}
          </div>
          {lastAccessedModule && (
            <Link 
              href="/portal"
              className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
            >
              Resume Learning &rarr;
            </Link>
          )}
          <span className="text-xs text-slate-400">
            Last synced: {lastSynced.toLocaleTimeString()}
          </span>
        </div>
      </div>

      {error ? (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-6 rounded-2xl text-center font-medium shadow-sm">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Speed & Analytics Card */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">⏱️</span>
              Speed Analytics
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Total Time</p>
                <p className="text-2xl font-black text-slate-800">{formatTime(totalTimeSeconds)}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Avg. Finish</p>
                <p className="text-2xl font-black text-slate-800">{formatTime(avgTimePerCompleted)}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Started</p>
                <p className="text-2xl font-black text-slate-800">{startedModules.length} / {TOTAL_MODULES}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Finished</p>
                <p className="text-2xl font-black text-slate-800">{completedModules.length} / {TOTAL_MODULES}</p>
              </div>
            </div>
          </div>

          {/* Module Master Status Card */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">📋</span>
              Module Status
            </h2>
            
            <div className="space-y-4 max-h-[340px] overflow-y-auto custom-scrollbar pr-2">
              {moduleStatusList.map((mod) => (
                <div key={mod.id} className="flex flex-col p-4 rounded-xl bg-slate-50 border border-slate-100 gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm text-slate-700">{mod.label}</span>
                      <span className="text-xs text-slate-400">Time: {formatTime(mod.timeSpent)}</span>
                    </div>
                    
                    {mod.status === "Completed" && (
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">Completed</span>
                    )}
                    {mod.status === "Started" && (
                      <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">{mod.percentage}%</span>
                    )}
                    {mod.status === "Pending" && (
                      <span className="px-3 py-1 bg-slate-200 text-slate-500 text-xs font-bold rounded-full">Pending</span>
                    )}
                  </div>

                  {/* Individual Module Progress Bar */}
                  <div className="w-full bg-slate-200 rounded-full h-1.5">
                    <div 
                      className={`h-1.5 rounded-full transition-all duration-700 ease-out ${mod.status === 'Completed' ? 'bg-emerald-500' : 'bg-amber-500'}`}
                      style={{ width: `${mod.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
// src/app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { getSession, signOut } from "next-auth/react";
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
  
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("Student");

  useEffect(() => {
    let pollInterval: NodeJS.Timeout;

    const loadDashboard = async (isBackgroundSync = false) => {
      let currentId = userId;
      let currentName = userName;

      if (!currentId) {
        const session = await getSession();
        if (session?.user?.id) {
          currentId = session.user.id;
          currentName = session.user.name || session.user.email?.split("@")[0] || "Student";
          setUserId(currentId);
          setUserName(currentName);
        } else {
          setError("User not authenticated.");
          setIsLoading(false);
          return;
        }
      }

      if (!isBackgroundSync) {
        logger.info(`Dashboard UI Step 1: Initial mount. Fetching data for User ${currentId}`);
        setIsLoading(true);
      } else {
        logger.info(`Dashboard UI Step 1 [Background]: Running background sync for User ${currentId}...`);
      }
      
      try {
        const result = await fetchUserDashboardData(currentId);
        
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
      if (userId) loadDashboard(true);
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

    // Granular Calculation: Strict 50% Theory, 50% Visualizations
    const theoryPercentage = dbRecord.theoryCompleted && config?.hasTheory ? 50 : 0;
    
    let visPercentage = 0;
    if (config?.visCount && config.visCount > 0) {
      const visScore = dbRecord.visualizationsCompleted?.length || 0;
      visPercentage = (visScore / config.visCount) * 50;
    } else if (dbRecord.theoryCompleted) {
      // If a module has no visualizations, theory completion implies 100%
      visPercentage = 50;
    }
    
    // Guard against over-100% if visualizations change
    const calculatedPercentage = Math.min(100, Math.round(theoryPercentage + visPercentage));
    
    // Check master completion flag or if calculated percentage is 100
    const isActuallyComplete = dbRecord.isCompleted || calculatedPercentage === 100;

    return { 
      ...module, 
      status: isActuallyComplete ? "Completed" : "Started", 
      timeSpent: dbRecord.timeSpent,
      percentage: isActuallyComplete ? 100 : calculatedPercentage
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
  let tierColor = "text-text-secondary bg-bg-main border-border-default";
  
  if (completionPercentage > 0 && completionPercentage <= 25) {
    performanceTier = "Pupil";
    tierColor = "text-accent-success bg-accent-success/10 border-accent-success/20";
  } else if (completionPercentage > 25 && completionPercentage <= 75) {
    performanceTier = "Specialist";
    tierColor = "text-accent-cyan bg-accent-cyan/10 border-accent-cyan/20";
  } else if (completionPercentage > 75 && completionPercentage < 100) {
    performanceTier = "Expert";
    tierColor = "text-primary bg-primary/10 border-primary/20";
  } else if (completionPercentage === 100) {
    performanceTier = "Grandmaster";
    tierColor = "text-accent-error bg-accent-error/10 border-accent-error/20";
  }

  const lastAccessedModule = [...userProgress].sort(
    (a, b) => new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime()
  )[0];

  return (
    <div className="max-w-5xl mx-auto p-8 h-full flex flex-col gap-8 animate-in fade-in duration-500">
      
      {/* Dashboard Header */}
      <div className="bg-bg-card p-8 rounded-card shadow-premium flex flex-col md:flex-row justify-between items-start md:items-end gap-6 shrink-0 border border-transparent">
        <div className="flex-1 w-full">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-[42px] font-heading font-extrabold text-text-heading tracking-tight">{userName}</h1>
            <span className="text-[13px] font-heading font-bold bg-accent-success/10 text-accent-success px-3 py-1 rounded-tag animate-pulse">
              Live Sync Active
            </span>
          </div>
          <p className="text-[16px] text-text-secondary font-body mb-8">Real-time overview of your algorithmic journey.</p>
          
          <div className="w-full max-w-md">
            <div className="flex justify-between text-[14px] mb-3">
              <span className="font-heading font-bold text-text-heading tracking-wide">Overall Syllabus Progress</span>
              <span className="font-heading font-extrabold text-primary tabular-nums">{completionPercentage}%</span>
            </div>
            <div className="w-full bg-bg-main rounded-tag h-2">
              <div 
                className="bg-primary h-2 rounded-tag transition-all duration-1000 ease-out" 
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-4">
          <div className="flex gap-3">
            <div className={`text-[13px] flex items-center justify-center font-heading font-bold px-4 py-2 rounded-tag border shadow-sm ${tierColor}`}>
              Tier: {performanceTier}
            </div>
            <button 
              onClick={() => signOut({ callbackUrl: "/" })}
              className="px-6 py-2 bg-bg-main border border-border-default hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-500 text-text-secondary text-[14px] font-heading font-bold rounded-btn transition-colors shadow-sm"
            >
              Sign Out
            </button>
          </div>
          <Link 
            href="/portal"
            className="px-6 py-3 bg-text-heading hover:opacity-90 text-bg-main text-[14px] font-heading font-bold rounded-btn transition-opacity shadow-sm"
          >
            {lastAccessedModule ? "Resume Learning \u2192" : "Start Learning \u2192"}
          </Link>
          <span className="text-[13px] font-mono text-text-placeholder">
            Last synced: {lastSynced.toLocaleTimeString()}
          </span>
        </div>
      </div>

      {error ? (
        <div className="bg-accent-warning/10 border border-accent-warning text-accent-warning p-6 rounded-card text-center font-heading font-bold shadow-sm">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1 min-h-0">
          
          {/* Speed & Analytics Card */}
          <div className="bg-bg-card p-8 rounded-card shadow-premium border border-transparent">
            <h2 className="text-[22px] font-heading font-bold text-text-heading mb-6 flex items-center gap-3">
              <span className="w-10 h-10 rounded-2xl bg-accent-info/10 flex items-center justify-center text-accent-info">⏱️</span>
              Speed Analytics
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-bg-main p-5 rounded-[20px] border border-border-default">
                <p className="text-[13px] text-text-secondary font-heading font-bold uppercase tracking-widest mb-2">Total Time</p>
                <p className="text-[28px] font-mono font-bold text-text-heading tabular-nums">{formatTime(totalTimeSeconds)}</p>
              </div>
              <div className="bg-bg-main p-5 rounded-[20px] border border-border-default">
                <p className="text-[13px] text-text-secondary font-heading font-bold uppercase tracking-widest mb-2">Avg. Finish</p>
                <p className="text-[28px] font-mono font-bold text-text-heading tabular-nums">{formatTime(avgTimePerCompleted)}</p>
              </div>
              <div className="bg-bg-main p-5 rounded-[20px] border border-border-default">
                <p className="text-[13px] text-text-secondary font-heading font-bold uppercase tracking-widest mb-2">Started</p>
                <p className="text-[28px] font-mono font-bold text-text-heading tabular-nums">{startedModules.length} / {TOTAL_MODULES}</p>
              </div>
              <div className="bg-bg-main p-5 rounded-[20px] border border-border-default">
                <p className="text-[13px] text-text-secondary font-heading font-bold uppercase tracking-widest mb-2">Finished</p>
                <p className="text-[28px] font-mono font-bold text-text-heading tabular-nums">{completedModules.length} / {TOTAL_MODULES}</p>
              </div>
            </div>
          </div>

          {/* Module Master Status Card */}
          <div className="bg-bg-card p-8 rounded-card shadow-premium border border-transparent flex flex-col min-h-0">
            <h2 className="text-[22px] font-heading font-bold text-text-heading mb-6 flex items-center gap-3 shrink-0">
              <span className="w-10 h-10 rounded-2xl bg-accent-success/10 flex items-center justify-center text-accent-success">📋</span>
              Module Status
            </h2>
            
            <div className="space-y-4 overflow-y-auto custom-scrollbar pr-4 flex-1 min-h-0">
              {moduleStatusList.map((mod) => (
                <Link href={`/learn?module=${mod.id}`} key={mod.id} className="block group">
                  <div className="flex flex-col p-5 rounded-[20px] bg-bg-main border border-border-default gap-4 group-hover:border-primary transition-colors hover:shadow-md cursor-pointer">
                    <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="font-heading font-bold text-[16px] text-text-heading tracking-wide">{mod.label}</span>
                      <span className="text-[13px] font-mono text-text-secondary mt-1 tabular-nums">Time: {formatTime(mod.timeSpent)}</span>
                    </div>
                    
                    {mod.status === "Completed" && (
                      <span className="px-3 py-1 bg-accent-success/10 text-accent-success text-[13px] font-heading font-bold rounded-tag">Completed</span>
                    )}
                    {mod.status === "Started" && (
                      <span className="px-3 py-1 bg-accent-warning/10 text-accent-warning text-[13px] font-heading font-bold rounded-tag tabular-nums">{mod.percentage}%</span>
                    )}
                    {mod.status === "Pending" && (
                      <span className="px-3 py-1 bg-border-default text-text-secondary text-[13px] font-heading font-bold rounded-tag">Pending</span>
                    )}
                  </div>

                  {/* Individual Module Progress Bar */}
                  <div className="w-full bg-bg-card rounded-tag h-1.5 border border-border-default">
                    <div 
                      className={`h-1.5 rounded-tag transition-all duration-700 ease-out ${mod.status === 'Completed' ? 'bg-accent-success' : 'bg-accent-warning'}`}
                      style={{ width: `${mod.percentage}%` }}
                    ></div>
                  </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
          
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
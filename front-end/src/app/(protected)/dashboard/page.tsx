// src/app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { getSession, signOut } from "next-auth/react";
import Link from "next/link";
import { motion } from "framer-motion";
import { logger } from "../../../../lib/logger";
import { fetchUserDashboardData } from "../../../../lib/actions/progress";

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

  const recommendedModule = moduleStatusList.find(mod => mod.status !== "Completed") || moduleStatusList[0];
  const hasNoData = userProgress.length === 0;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 h-full flex flex-col gap-8 custom-scrollbar overflow-y-auto">
      
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[32px] bg-bg-card border border-border-default shadow-premium p-8 md:p-12 shrink-0 flex flex-col gap-8"
      >
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 via-transparent to-accent-info/5 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border-b border-border-default pb-8">
          <div>
            <h1 className="text-[36px] md:text-[48px] font-heading font-extrabold text-text-heading tracking-tight leading-tight mb-2">
              👋 Welcome Back, {userName}
            </h1>
            <p className="text-[18px] text-text-secondary font-body">
              Continue where you left off.
            </p>
          </div>
          
          <Link 
            href={`/learn?module=${recommendedModule.id}`}
            className="btn-primary py-4 px-8 shadow-lg hover:shadow-xl text-[16px]"
          >
            🚀 Continue Learning
          </Link>
        </div>

        {/* Hero Stats Grid */}
        <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="card-hoverable p-6 bg-bg-main">
            <p className="text-[13px] font-heading font-bold text-text-secondary uppercase tracking-wider mb-2 flex items-center gap-2">
              <span className="text-primary">📚</span> Algorithms Completed
            </p>
            <p className="text-[32px] font-mono font-extrabold text-text-heading">{completedModules.length}</p>
          </div>
          <div className="card-hoverable p-6 bg-bg-main">
            <p className="text-[13px] font-heading font-bold text-text-secondary uppercase tracking-wider mb-2 flex items-center gap-2">
              <span className="text-accent-success">🎯</span> Problems Solved
            </p>
            <p className="text-[32px] font-mono font-extrabold text-text-heading">
              {data?.scores?.reduce((acc, s) => acc + s.score, 0) || 0}
            </p>
          </div>
          <div className="card-hoverable p-6 bg-bg-main">
            <p className="text-[13px] font-heading font-bold text-text-secondary uppercase tracking-wider mb-2 flex items-center gap-2">
              <span className="text-accent-info">⏳</span> Learning Time
            </p>
            <p className="text-[32px] font-mono font-extrabold text-text-heading">{Math.floor(totalTimeSeconds / 3600)}<span className="text-[20px] text-text-secondary">h</span> {Math.floor((totalTimeSeconds % 3600) / 60)}<span className="text-[20px] text-text-secondary">m</span></p>
          </div>
          <div className="card-hoverable p-6 bg-bg-main">
            <p className="text-[13px] font-heading font-bold text-text-secondary uppercase tracking-wider mb-2 flex items-center gap-2">
              <span className="text-accent-warning">🔥</span> Current Streak
            </p>
            <p className="text-[32px] font-mono font-extrabold text-text-heading">3 <span className="text-[20px] text-text-secondary font-body font-bold">Days</span></p>
          </div>
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 min-h-0">
        
        {/* Analytics Section */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-5 flex flex-col gap-6"
        >
          <div className="bg-bg-card p-8 rounded-[32px] shadow-premium border border-border-default">
            <h2 className="text-[20px] font-heading font-extrabold text-text-heading mb-6 flex items-center gap-3">
              <span className="w-10 h-10 rounded-2xl bg-accent-info/15 flex items-center justify-center text-accent-info text-xl">⚡</span>
              Performance Metrics
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Total Time", value: formatTime(totalTimeSeconds), icon: "⏳" },
                { label: "Avg. Speed", value: formatTime(avgTimePerCompleted), icon: "⚡" },
                { label: "In Progress", value: `${startedModules.length}`, icon: "🚧" },
                { label: "Mastered", value: `${completedModules.length}`, icon: "🎯" }
              ].map((metric, i) => (
                <div key={i} className="bg-bg-main p-5 rounded-[20px] border border-border-default hover:border-primary/30 hover:shadow-md transition-all group">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="opacity-70 group-hover:opacity-100 transition-opacity">{metric.icon}</span>
                    <p className="text-[12px] text-text-secondary font-heading font-bold uppercase tracking-widest">{metric.label}</p>
                  </div>
                  <p className="text-[26px] font-mono font-bold text-text-heading tabular-nums">{metric.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Empty State / Motivational Card */}
          {hasNoData && (
            <div className="bg-gradient-to-br from-primary/10 to-accent-info/10 p-8 rounded-[32px] border border-primary/20 flex flex-col items-center text-center mt-auto">
              <span className="text-5xl mb-4">🌱</span>
              <h3 className="text-[18px] font-heading font-bold text-text-heading mb-2">Your Journey Begins</h3>
              <p className="text-[14px] text-text-secondary font-body">
                You haven't completed any modules yet. Head over to the Learning Hub and start with Arrays!
              </p>
            </div>
          )}
        </motion.div>

        {/* Modules List Section */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-7 bg-bg-card p-8 rounded-[32px] shadow-premium border border-border-default flex flex-col min-h-0"
        >
          <div className="flex justify-between items-center mb-6 shrink-0">
            <h2 className="text-[20px] font-heading font-extrabold text-text-heading flex items-center gap-3">
              <span className="w-10 h-10 rounded-2xl bg-accent-success/15 flex items-center justify-center text-accent-success text-xl">📚</span>
              Syllabus Tracker
            </h2>
            <span className="text-[13px] font-heading font-bold text-text-secondary bg-bg-main px-3 py-1.5 rounded-tag border border-border-default">
              {completedModules.length} of {TOTAL_MODULES} Completed
            </span>
          </div>
          
          <div className="space-y-4 overflow-y-auto custom-scrollbar pr-2 pb-4">
            {moduleStatusList.map((mod, index) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                key={mod.id}
              >
                <Link href={`/learn?module=${mod.id}`} className="block group">
                  <div className="flex flex-col p-5 rounded-[20px] bg-bg-main border border-border-default gap-4 hover:border-primary hover:shadow-lg transition-all cursor-pointer relative overflow-hidden">
                    
                    {/* Hover Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                    <div className="flex items-center justify-between relative z-10">
                      <div className="flex flex-col">
                        <span className="font-heading font-bold text-[16px] text-text-heading tracking-wide group-hover:text-primary transition-colors">
                          {mod.label}
                        </span>
                        <span className="text-[12px] font-mono text-text-placeholder mt-1 tabular-nums">
                          Time spent: {formatTime(mod.timeSpent)}
                        </span>
                      </div>
                      
                      {mod.status === "Completed" && (
                        <span className="px-3 py-1.5 bg-accent-success/15 text-accent-success text-[12px] font-heading font-bold rounded-tag flex items-center gap-1.5 border border-accent-success/20 shadow-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent-success"></span> Completed
                        </span>
                      )}
                      {mod.status === "Started" && (
                        <span className="px-3 py-1.5 bg-accent-warning/15 text-accent-warning text-[12px] font-heading font-bold rounded-tag flex items-center gap-1.5 border border-accent-warning/20 shadow-sm tabular-nums">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent-warning animate-pulse"></span> {mod.percentage}%
                        </span>
                      )}
                      {mod.status === "Pending" && (
                        <span className="px-3 py-1.5 bg-bg-card border border-border-default text-text-placeholder text-[12px] font-heading font-bold rounded-tag shadow-sm">
                          Not Started
                        </span>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-bg-card rounded-tag h-2 border border-border-default/50 overflow-hidden relative z-10">
                      <div 
                        className={`h-full rounded-tag transition-all duration-700 ease-out ${
                          mod.status === 'Completed' ? 'bg-accent-success' : 
                          mod.status === 'Started' ? 'bg-accent-warning' : 'bg-transparent'
                        }`}
                        style={{ width: `${mod.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
        
      </div>
    </div>
  );
};

export default DashboardPage;
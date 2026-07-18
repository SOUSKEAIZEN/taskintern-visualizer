"use server";

import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { logger } from "../logger";

// Prisma 7 specific Singleton using the pg adapter
const prismaClientSingleton = () => {
  let connectionString = process.env.DATABASE_URL || "";
  // The pg driver treats sslmode=require as verify-full, which breaks Aiven certs. We strip it out and manually pass ssl: rejectUnauthorized: false.
  connectionString = connectionString.replace("?sslmode=require", "");
  
  // Initialize the PostgreSQL connection pool with SSL configured for Aiven
  const pool = new Pool({ 
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
  const adapter = new PrismaPg(pool);
  
  // @ts-ignore - Prisma 5.14.0 experimental driverAdapters type mismatch
  return new PrismaClient({ adapter });
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;

/**
 * Helper Function: Ensures a user exists in the database to prevent Foreign Key constraint errors.
 */
async function ensureUserExists(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    logger.info(`DB Helper [ensureUserExists]: User ${userId} not found. Creating auto-generated profile...`);
    await prisma.user.create({
      data: {
        id: userId,
        email: `${userId}@student.taskintern.com`, // Required by schema
        name: "Student Profile",
      },
    });
    logger.info(`DB Helper [ensureUserExists]: User ${userId} successfully created.`);
  }
}

/**
 * Server Action: Marks the theory portion of a specific educational module as complete.
 */
export async function markTheoryComplete(userId: string, topicId: string) {
  logger.info(`DB Action Start [markTheoryComplete]: Initiated for User ${userId}, Topic ${topicId}`);
  
  try {
    await ensureUserExists(userId); // Fixes the Foreign Key constraint!

    logger.info(`DB Step 1 [markTheoryComplete]: Executing Prisma upsert to set theoryCompleted flag.`);
    const progress = await prisma.moduleProgress.upsert({
      where: {
        userId_topicId: { userId, topicId }
      },
      update: {
        theoryCompleted: true,
        lastAccessed: new Date(),
      },
      create: {
        userId,
        topicId,
        theoryCompleted: true,
      },
    });

    logger.info(`DB Step 2 [markTheoryComplete]: Upsert successful. Record ID: ${progress.id}`);
    return { success: true, data: progress };
  } catch (error) {
    logger.error(`DB Point of Failure [markTheoryComplete]: Exception caught while updating theory progress for User ${userId}`, error);
    return { success: false, error: "Database operation failed." };
  }
}

/**
 * Server Action: Marks a specific visualization within a module as complete.
 */
export async function markVisualizationComplete(userId: string, topicId: string, visualizationId: string) {
  logger.info(`DB Action Start [markVisualizationComplete]: Initiated for User ${userId}, Topic ${topicId}, Visualization ${visualizationId}`);
  
  try {
    await ensureUserExists(userId);

    logger.info(`DB Step 1 [markVisualizationComplete]: Fetching existing record to check current visualizations completed.`);
    const existingRecord = await prisma.moduleProgress.findUnique({
      where: { userId_topicId: { userId, topicId } }
    });

    // Check if it's already in the array to avoid duplicates
    const currentVisualizations = existingRecord?.visualizationsCompleted || [];
    if (currentVisualizations.includes(visualizationId)) {
      logger.info(`DB Step 2 [markVisualizationComplete]: Visualization ${visualizationId} already marked complete. Skipping update.`);
      return { success: true, data: existingRecord };
    }

    const updatedVisualizations = [...currentVisualizations, visualizationId];

    logger.info(`DB Step 3 [markVisualizationComplete]: Executing Prisma upsert to append visualization ID to array.`);
    const progress = await prisma.moduleProgress.upsert({
      where: {
        userId_topicId: { userId, topicId }
      },
      update: {
        visualizationsCompleted: updatedVisualizations,
        lastAccessed: new Date(),
      },
      create: {
        userId,
        topicId,
        visualizationsCompleted: [visualizationId],
      },
    });

    logger.info(`DB Step 4 [markVisualizationComplete]: Upsert successful. Record ID: ${progress.id}. Total visualizations: ${updatedVisualizations.length}`);
    return { success: true, data: progress };
  } catch (error) {
    logger.error(`DB Point of Failure [markVisualizationComplete]: Exception caught while updating visualization progress for User ${userId}`, error);
    return { success: false, error: "Database operation failed." };
  }
}

/**
 * Server Action: Marks a specific educational module as complete or incomplete, and aggregates time spent.
 */
export async function updateModuleProgress(userId: string, topicId: string, isCompleted: boolean = false, timeSpentSeconds: number = 0) {
  logger.info(`DB Action Start [updateModuleProgress]: Initiated for User ${userId}, Topic ${topicId} | Payload: { isCompleted: ${isCompleted}, timeSpent: +${timeSpentSeconds}s }`);
  
  try {
    await ensureUserExists(userId);

    logger.info(`DB Step 1 [updateModuleProgress]: Checking for existing record to prevent overwriting prior completions.`);
    const existingRecord = await prisma.moduleProgress.findUnique({
      where: { userId_topicId: { userId, topicId } }
    });

    // Safety checks for completion state
    const finalIsCompleted = isCompleted || (existingRecord?.isCompleted ?? false);
    const newlyCompleted = finalIsCompleted && !existingRecord?.isCompleted;

    logger.info(`DB Step 2 [updateModuleProgress]: Executing Prisma upsert for User ${userId}. Aggregating time data...`);
    const progress = await prisma.moduleProgress.upsert({
      where: {
        userId_topicId: { userId, topicId }
      },
      update: {
        isCompleted: finalIsCompleted,
        timeSpent: { increment: timeSpentSeconds },
        lastAccessed: new Date(),
        completedAt: newlyCompleted ? new Date() : existingRecord?.completedAt,
      },
      create: {
        userId,
        topicId,
        isCompleted: finalIsCompleted,
        timeSpent: timeSpentSeconds,
        completedAt: finalIsCompleted ? new Date() : null,
      },
    });

    logger.info(`DB Step 3 [updateModuleProgress]: Upsert successful. Record ID: ${progress.id} | Total Time on DB: ${progress.timeSpent}s`);
    return { success: true, data: progress };
  } catch (error) {
    logger.error(`DB Point of Failure [updateModuleProgress]: Exception caught while updating progress for User ${userId}`, error);
    return { success: false, error: "Database operation failed." };
  }
}

/**
 * Server Action: Saves a user's quiz score to the database.
 */
export async function submitQuizScore(userId: string, topicId: string, score: number, totalQuestions: number) {
  logger.info(`DB Action Start [submitQuizScore]: Initiated for User ${userId}, Topic ${topicId} with score ${score}/${totalQuestions}`);
  
  try {
    await ensureUserExists(userId);

    logger.info(`DB Step 1 [submitQuizScore]: Executing Prisma create for User ${userId}`);
    const quizRecord = await prisma.quizScore.create({
      data: {
        userId,
        topicId,
        score,
        totalQuestions,
      },
    });

    logger.info(`DB Step 2 [submitQuizScore]: Creation successful. Record ID: ${quizRecord.id}`);
    return { success: true, data: quizRecord };
  } catch (error) {
    logger.error(`DB Point of Failure [submitQuizScore]: Exception caught while saving score for User ${userId}`, error);
    return { success: false, error: "Database operation failed." };
  }
}

/**
 * Server Action: Fetches all learning analytics for a specific user to display on their Dashboard.
 */
export async function fetchUserDashboardData(userId: string) {
  logger.info(`DB Action Start [fetchUserDashboardData]: Initiated for User ${userId}`);
  
  try {
    // If the dashboard is loaded before anything else, create the user!
    await ensureUserExists(userId);

    logger.info(`DB Step 1 [fetchUserDashboardData]: Querying Prisma for unique User ${userId} and relational data (progress, scores)`);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        progress: true,
        scores: {
          orderBy: { attemptedAt: 'desc' }
        },
      }
    });

    logger.info(`DB Step 2 [fetchUserDashboardData]: Query execution complete`);

    if (!user) {
      logger.warn(`DB Point of Failure [fetchUserDashboardData]: User ${userId} not found in the database. Returning null state to client.`);
      return { success: false, error: "User not found." };
    }

    logger.info(`DB Step 3 [fetchUserDashboardData]: Data validation passed. Retrieved ${user.progress.length} progress records and ${user.scores.length} score records for User ${userId}`);
    return { success: true, data: user };
  } catch (error) {
    logger.error(`DB Point of Failure [fetchUserDashboardData]: Exception caught while fetching dashboard data for User ${userId}`, error);
    return { success: false, error: "Database operation failed." };
  }
}
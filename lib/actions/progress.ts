"use server";

import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { logger } from "../logger";

// Prisma 7 specific Singleton using the pg adapter
const prismaClientSingleton = () => {
  const connectionString = process.env.DATABASE_URL;
  // Initialize the PostgreSQL connection pool
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  
  return new PrismaClient({ adapter });
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;

/**
 * Server Action: Marks a specific educational module as complete or incomplete.
 */
export async function updateModuleProgress(userId: string, topicId: string, isCompleted: boolean = true) {
  logger.info(`DB Action Start [updateModuleProgress]: Initiated for User ${userId}, Topic ${topicId}`);
  
  try {
    logger.info(`DB Step 1 [updateModuleProgress]: Executing Prisma upsert for User ${userId}`);
    const progress = await prisma.moduleProgress.upsert({
      where: {
        userId_topicId: { userId, topicId }
      },
      update: {
        isCompleted,
        lastAccessed: new Date(),
      },
      create: {
        userId,
        topicId,
        isCompleted,
      },
    });

    logger.info(`DB Step 2 [updateModuleProgress]: Upsert successful. Record ID: ${progress.id}`);
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
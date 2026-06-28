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
  logger.info(`DB Action: Attempting to update progress for User ${userId} on Topic ${topicId}`);
  
  try {
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

    logger.info(`DB Success: Progress updated for User ${userId}.`, progress.id);
    return { success: true, data: progress };
  } catch (error) {
    logger.error(`DB Failure: Failed to update progress for User ${userId}`, error);
    return { success: false, error: "Database operation failed." };
  }
}

/**
 * Server Action: Saves a user's quiz score to the database.
 */
export async function submitQuizScore(userId: string, topicId: string, score: number, totalQuestions: number) {
  logger.info(`DB Action: Submitting Quiz Score (${score}/${totalQuestions}) for User ${userId} on Topic ${topicId}`);
  
  try {
    const quizRecord = await prisma.quizScore.create({
      data: {
        userId,
        topicId,
        score,
        totalQuestions,
      },
    });

    logger.info(`DB Success: Quiz score saved for User ${userId}.`, quizRecord.id);
    return { success: true, data: quizRecord };
  } catch (error) {
    logger.error(`DB Failure: Failed to save quiz score for User ${userId}`, error);
    return { success: false, error: "Database operation failed." };
  }
}

/**
 * Server Action: Fetches all learning analytics for a specific user to display on their Dashboard.
 */
export async function fetchUserDashboardData(userId: string) {
  logger.info(`DB Action: Fetching full dashboard analytics for User ${userId}`);
  
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        progress: true,
        scores: {
          orderBy: { attemptedAt: 'desc' }
        },
      }
    });

    if (!user) {
      logger.warn(`DB Warning: Attempted to fetch dashboard for non-existent User ${userId}`);
      return { success: false, error: "User not found." };
    }

    logger.info(`DB Success: Successfully retrieved dashboard data for User ${userId}`);
    return { success: true, data: user };
  } catch (error) {
    logger.error(`DB Failure: Failed to fetch dashboard data for User ${userId}`, error);
    return { success: false, error: "Database operation failed." };
  }
}
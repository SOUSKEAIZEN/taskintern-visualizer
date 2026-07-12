import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const dbUrl = new URL(process.env.DATABASE_URL || '')
dbUrl.search = '' // Strip ?sslmode=require
const pool = new Pool({ 
  connectionString: dbUrl.toString(),
  ssl: { rejectUnauthorized: false }
})
const adapter = new PrismaPg(pool)
export const prisma = new PrismaClient({ adapter })

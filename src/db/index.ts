import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import "dotenv/config";
import { hypothesesTable } from "./schemas/hypotheses";
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

export const db = drizzle(pool, {
  schema: {
    hypotheses: hypothesesTable,
  },
});

export * from "./schemas";

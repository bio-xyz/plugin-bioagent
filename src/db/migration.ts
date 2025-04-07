import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pkg from "pg";
import "dotenv/config";
import { existsSync, writeFileSync } from "fs";
import path from "path";
import { logger } from "@elizaos/core";

const { Pool } = pkg;

/**
 * Check if the migrations have been run before
 */
const getMigrationFlag = (): boolean => {
  const flagPath = path.join(process.cwd(), ".migration-complete");
  return existsSync(flagPath);
};

/**
 * Set the migration flag to indicate migrations have been run
 */
const setMigrationFlag = (): void => {
  const flagPath = path.join(process.cwd(), ".migration-complete");
  writeFileSync(flagPath, new Date().toISOString());
};

/**
 * Run database migrations if they haven't been run yet
 */
export const migrateDb = async (): Promise<void> => {
  // Check if migrations have already been run
  if (getMigrationFlag()) {
    logger.info("Migrations already applied, skipping...");
    return;
  }

  if (!process.env.POSTGRES_URL) {
    logger.warn(
      "POSTGRES_URL environment variable is not set, skipping migrations"
    );
    return;
  }

  try {
    logger.info("Running database migrations...");

    const pool = new Pool({
      connectionString: process.env.POSTGRES_URL,
    });

    const db = drizzle(pool);

    // Run migrations from the drizzle directory
    await migrate(db, { migrationsFolder: "drizzle" });

    // Set flag to avoid running migrations again
    setMigrationFlag();

    logger.info("Migrations completed successfully");

    // Close the pool to avoid hanging connections
    await pool.end();
  } catch (error) {
    logger.error("Error running migrations:", error);
    throw error;
  }
};

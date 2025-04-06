import { text, timestamp, uuid } from "drizzle-orm/pg-core";
import { pgSchema } from "drizzle-orm/pg-core";
import { driveTypeEnum } from "./customTypes";

const biographPgSchema = pgSchema("biograph");

export const driveSyncTable = biographPgSchema.table("drive_sync", {
  id: text("id").notNull().primaryKey(),
  startPageToken: text("start_page_token").notNull(),
  driveType: driveTypeEnum("drive_type").notNull(),
  lastSyncAt: timestamp("last_sync_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
});

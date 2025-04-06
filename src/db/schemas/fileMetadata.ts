import { text, bigint, timestamp } from "drizzle-orm/pg-core";
import { pgSchema } from "drizzle-orm/pg-core";

const biographPgSchema = pgSchema("biograph");

export const fileMetadataTable = biographPgSchema.table("file_metadata", {
  id: text("id").notNull(),
  hash: text("hash").notNull().primaryKey(),
  fileName: text("file_name").notNull(),
  fileSize: bigint("file_size", { mode: "number" }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
  modifiedAt: timestamp("modified_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
  tags: text("tags").array(),
});

// Type for selecting data (matches the table structure)
export type FileMetadata = typeof fileMetadataTable.$inferSelect;

// Type for inserting data (useful for creating new records)
export type NewFileMetadata = typeof fileMetadataTable.$inferInsert;

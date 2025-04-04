import { text, bigint, timestamp, uuid } from "drizzle-orm/pg-core";
import { pgSchema } from "drizzle-orm/pg-core";

const biographPgSchema = pgSchema("biograph");

export const fileMetadataTable = biographPgSchema.table("file_metadata", {
  id: uuid("id").notNull().defaultRandom(),
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

export type FileMetadata = typeof fileMetadataTable.$inferSelect;
export type NewFileMetadata = typeof fileMetadataTable.$inferInsert;

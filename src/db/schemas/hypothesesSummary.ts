import { uuid, text, timestamp, numeric } from "drizzle-orm/pg-core";
import { pgSchema } from "drizzle-orm/pg-core";
import { hypothesesTable } from "./hypotheses";

const biographPgSchema = pgSchema("biograph");

export const hypothesesSummaryTable = biographPgSchema.table(
  "hypotheses_summary",
  {
    id: uuid("id").notNull().primaryKey().defaultRandom(),
    hypothesisId: uuid("hypothesis_id")
      .notNull()
      .references(() => hypothesesTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    summary: text("summary").notNull(),
    keywords: text("keywords").array(),
    scientificEntities: text("scientific_entities").array(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
  }
);

export type HypothesesSummary = typeof hypothesesSummaryTable.$inferSelect;
export type NewHypothesesSummary = typeof hypothesesSummaryTable.$inferInsert;

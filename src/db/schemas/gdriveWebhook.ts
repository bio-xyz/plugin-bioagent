import { text, pgSchema, timestamp } from "drizzle-orm/pg-core";

const biographSchema = pgSchema("biograph");

export const gdriveWebhookSubscriptionsTable = biographSchema.table(
  "gdrive_webhook_subscriptions",
  {
    kind: text("kind"),
    id: text("id").notNull().primaryKey(),
    resourceId: text("resource_id").notNull(),
    resourceUri: text("resource_uri"),
    expiration: timestamp("expiration", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  }
);

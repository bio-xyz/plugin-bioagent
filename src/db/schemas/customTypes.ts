import { pgEnum } from "drizzle-orm/pg-core";

export const hypothesisStatusEnum = pgEnum("hypothesis_status", [
  "pending",
  "approved",
  "rejected",
]);

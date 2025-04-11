import { pgEnum } from "drizzle-orm/pg-core";

export const hypothesisStatusEnum = pgEnum("hypothesis_status", [
  "pending",
  "approved",
  "rejected",
]);

export const driveTypeEnum = pgEnum("drive_type", [
  "shared_folder",
  "shared_drive",
]);

export const fileStatusEnum = pgEnum("file_status", [
  "pending",
  "processed",
  "failed",
]);

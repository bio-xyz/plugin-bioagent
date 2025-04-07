import type { Config } from "drizzle-kit";
import "dotenv/config";

export default {
  schema: "./src/db/schemas/*",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.POSTGRES_URL!,
  },
  schemaFilter: ["biograph"],
  migrations: {
    schema: "biograph",
  },
} satisfies Config;

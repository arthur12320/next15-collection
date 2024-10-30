import { env } from "@/env/server";
import { defineConfig } from "drizzle-kit";


export default defineConfig({
    schema: "./src/db/schema/index.ts",
    dialect: "postgresql",
    out: "./src/db/migrations",
    dbCredentials: {
        url: env.POSTGRES_URL!,
    },
    verbose: true,
    strict: true,
});
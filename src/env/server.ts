import { createEnv } from "@t3-oss/env-core";
import { z, ZodError } from "zod";

export const env = createEnv({
    server: {
        NODE_ENV: z.enum(["development", "production", "local"]),
        POSTGRES_URL: z.string().url(),
        NEXTAUTH_SECRET: z.string(),
        GOOGLE_CLIENT_ID: z.string(),
        GOOGLE_CLIENT_SECRET: z.string(),
        NEXTAUTH_URL: z.string().url(),
    },
    onValidationError: (error: ZodError) => {
        console.error("❌ Invalid environment variables:");
        console.error(
            "❌ Invalid environment variables:",
            error.flatten().fieldErrors,
        );
        throw new Error("Invalid environment variables");
    },
    emptyStringAsUndefined: true,
    // eslint-disable-next-line n/no-process-env
    runtimeEnv: process.env,
});
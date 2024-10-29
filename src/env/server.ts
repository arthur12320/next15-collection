import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
    server: {
        NODE_ENV: z.enum(["development", "production", "local"]),
        POSTGRES_URL: z.string().url(),
    },
    emptyStringAsUndefined: true,
    runtimeEnv: process.env,
});
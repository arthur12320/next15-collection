import { env } from "@/env/server";
import { NextAuthOptions } from "next-auth";


import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: env.GOOGLE_CLIENT_ID as string,
            clientSecret: env.GOOGLE_CLIENT_SECRET as string,
            authorization: {
                params: {
                    redirect_uri: `${env.NEXTAUTH_URL}/api/auth/callback/google`,
                },
            },
        }),
    ],
    pages: {
        signIn: "/",
    },
    secret: env.NEXTAUTH_SECRET,
};

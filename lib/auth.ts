import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import { users, sessions, accounts, verifications, User } from "@/db/schema";
import { emailOTP } from "better-auth/plugins";
import { eq } from "drizzle-orm";
import { AuthSession } from "./auth-types";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: users,
      session: sessions,
      account: accounts,
      verification: verifications,
    }
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        console.log({ email, otp, type })
        // Implement the sendVerificationOTP method
      },
      allowedAttempts: 5,
      otpLength: 4,
      expiresIn: 1000
    })
  ],
  callbacks: {
    async session({ session, user }: { session: AuthSession, user: User }) {
      try {
        // Fetch the user with role from database
        const dbUser = await db.query.users.findFirst({
          where: eq(users.id, user.id),
          columns: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        });

        if (dbUser) {
          return {
            ...session,
            user: {
              ...session!.user,
              id: dbUser.id,
              name: dbUser.name || session!.user.name,
              email: dbUser.email || session!.user.email,
              role: dbUser.role,
            },
          };
        }
      } catch (error) {
        console.error("Error fetching user role in session callback:", error);
      }

      return session;
    },
  },
  trustedOrigins: ["http://localhost:3000"],
});

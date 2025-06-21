import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins"
import { eq } from "drizzle-orm";
import { users, sessions, accounts, verifications, User } from "@/db/schema";
import type { AuthSession } from "./auth-types";
import { db } from "@/db";
import { sendEmail } from "./sendEmail";
import { resetPasswordTemplate } from "@/templates/sendResetPassword";
import { verifyEmailTemplate } from "@/templates/verifyEmail";

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
    minPasswordLength: 8,
    maxPasswordLength: 50,
    autoSignIn: false,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      console.log(`Password reset token been sent to email : ${user.email}`)

      await sendEmail({
        to: user.email,
        subject: 'Reset your password',
        html: resetPasswordTemplate(url),
        text: `Reset your password by clicking: ${url}`
      });
    },
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

  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      console.log(`Verification token been sent to email : ${user.email}`)

      await sendEmail({
        to: user.email,
        subject: 'Verify your email address',
        html: verifyEmailTemplate(url),
        text: `Welcome! Please verify your email by clicking: ${url}`
      });
    },
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },

  callbacks: {
    async session({ session, user }: { session: AuthSession, user: User }) {
      try {
        const dbUser = await db.query.users.findFirst({
          where: eq(users.id, user.id),
          columns: {
            id: true,
            name: true,
            email: true,
            role: true,
            emailVerified: true,
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
              emailVerified: dbUser.emailVerified,
            },
          };
        }
      } catch (error) {
        console.error("Error fetching user data in session callback:", error);
      }
      return session;
    },
  },

  plugins: [admin()],
  trustedOrigins: [process.env.BETTER_AUTH_URL!],
});

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import { users, sessions, accounts, verifications, User } from "@/db/schema";
import { eq } from "drizzle-orm";
import { AuthSession } from "./auth-types";
import { sendEmail } from "./sendEmail";

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
    requireEmailVerification: true,
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
    sendVerificationEmail: async ({ user, url, token }) => {
      await sendEmail({
        to: user.email,
        subject: 'Verify your email address',
        html: `
          <h2>Welcome to YourApp!</h2>
          <p>Please verify your email address to complete your registration.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${url}?token=${token}" 
               style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Verify Email Address
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            Or copy and paste this link: ${url}?token=${token}
          </p>
        `,
        text: `Welcome! Please verify your email by clicking: ${url}?token=${token}`
      });
    },

    sendResetPassword: async ({ email, url }: { email: string, url: string }) => {
      await sendEmail({
        to: email,
        subject: 'Reset your password',
        html: `
          <h2>Password Reset Request</h2>
          <p>You requested to reset your password. Click the button below to continue:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${url}" 
               style="background: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Reset Password
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            This link will expire in 15 minutes.<br>
            If you didn't request this, please ignore this email.
          </p>
          <p style="color: #666; font-size: 14px;">
            Or copy and paste this link: ${url}
          </p>
        `,
        text: `Reset your password by clicking: ${url}`
      });
    },

    sendOnSignUp: true,
    autoSignInAfterVerification: true, // Sign user in after email verification
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

  trustedOrigins: ["http://localhost:3000"],
});

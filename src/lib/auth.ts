import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { loginSchema } from "@/validators/auth";
import { SESSION_MAX_AGE } from "@/lib/constants";
import { mergeGuestCartIntoUserCart } from "@/services/cart.service";
import { getCartSessionId } from "@/lib/cart-session";
import type { UserRole } from "@/types";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt", maxAge: SESSION_MAX_AGE },
  pages: { signIn: "/login", error: "/login", verifyRequest: "/verify-email" },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),

    Credentials({
      name: "credentials",
      credentials: {
        email:    { label: "Email",    type: "email"    },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        const user = await db.user.findUnique({
          where: { email: email.toLowerCase().trim() },
          select: {
            id: true, email: true, name: true, image: true,
            password: true, role: true, isOwner: true,
            isActive: true, deletedAt: true, emailVerified: true,
            loginAttempts: true, lockedUntil: true,
          },
        });

        if (!user || !user.password) return null;
        if (user.deletedAt)           return null;
        if (!user.isActive)           throw new Error("ACCOUNT_SUSPENDED");
        if (user.lockedUntil && user.lockedUntil > new Date()) throw new Error("ACCOUNT_LOCKED");

        // FIX BUG-2: enforce email verification when platform setting requires it
        if (!user.emailVerified) {
          const settings = await db.platformSettings.findFirst({
            select: { requireEmailVerification: true },
          });
          if (settings?.requireEmailVerification) {
            throw new Error("EMAIL_NOT_VERIFIED");
          }
        }

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
          const attempts = user.loginAttempts + 1;
          const lockedUntil = attempts >= 5
            ? new Date(Date.now() + 15 * 60 * 1000)
            : null;
          await db.user.update({
            where: { id: user.id },
            data: { loginAttempts: attempts, lockedUntil },
          });
          return null;
        }

        // Reset failed attempts on success
        await db.user.update({
          where: { id: user.id },
          data: { loginAttempts: 0, lockedUntil: null },
        });

        return { id: user.id, email: user.email, name: user.name, image: user.image, role: user.role as UserRole };
      },
    }),
  ],

  callbacks: {
    // FIX BUG-3: refresh role from DB on every JWT rotation (not just sign-in)
    async jwt({ token, user, account, trigger }) {
      // Initial sign-in: populate from user object
      if (user) {
        token.id   = user.id;
        token.role = (user as { role: UserRole }).role;
      }

      // FIX BUG-3: on every token refresh, re-fetch role from DB
      // This ensures role changes by admin propagate within the refresh window
      if (trigger === "update" || (!user && token.id)) {
        const dbUser = await db.user.findUnique({
          where: { id: token.id as string },
          select: { role: true, isActive: true, deletedAt: true },
        });
        // Invalidate token if user deleted or suspended
        if (!dbUser || !dbUser.isActive || dbUser.deletedAt) {
          return null as unknown as typeof token; // force sign-out
        }
        token.role = dbUser.role as UserRole;
      }

      // OAuth sign-in: ensure role is populated
      if (account && token.email) {
        const dbUser = await db.user.findUnique({
          where: { email: token.email },
          select: { id: true, role: true },
        });
        if (dbUser) {
          token.id   = dbUser.id;
          token.role = dbUser.role as UserRole;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id   = token.id as string;
        session.user.role = token.role as UserRole;
      }
      return session;
    },

    async signIn({ user, account }) {
      if (account?.provider !== "credentials" && user.email) {
        const dbUser = await db.user.findUnique({
          where: { email: user.email },
          select: { isActive: true, deletedAt: true },
        });
        if (dbUser?.deletedAt)    return false;
        if (!dbUser?.isActive)    return "/login?error=AccountSuspended";
      }
      return true;
    },
  },

  events: {
    async createUser({ user }) {
      if (user.id) {
        await db.user.update({
          where: { id: user.id },
          data: { role: "CUSTOMER", emailVerified: new Date() },
        });
        // Create wishlist for new OAuth user
        await db.wishlist.create({ data: { userId: user.id } }).catch(() => {});
      }
    },
  },
});

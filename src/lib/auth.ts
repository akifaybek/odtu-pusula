import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "./prisma";

const isProduction = process.env.NODE_ENV === "production";
const sessionMaxAge = 7 * 24 * 60 * 60;

function isSafeInternalRedirect(url: string, baseUrl: string): boolean {
  if (url.startsWith("/")) {
    return true;
  }

  try {
    const redirectUrl = new URL(url);
    const allowedBase = new URL(baseUrl);
    return redirectUrl.origin === allowedBase.origin;
  } catch {
    return false;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions["adapter"],
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email ve şifre gereklidir");
        }

        if (!credentials.email.endsWith("@metu.edu.tr")) {
          throw new Error("Sadece @metu.edu.tr mail adresleri ile giriş yapabilirsiniz");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          throw new Error("Geçersiz email veya şifre");
        }

        if (user.isBanned) {
          throw new Error("Hesabınız askıya alınmıştır. Destek için iletişime geçin.");
        }

        if (!user.emailVerified) {
          throw new Error("EMAIL_NOT_VERIFIED");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Geçersiz email veya şifre");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          emailVerified: user.emailVerified,
          role: user.role,
          isBanned: user.isBanned,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: sessionMaxAge,
    updateAge: 24 * 60 * 60,
  },
  jwt: {
    maxAge: sessionMaxAge,
  },
  cookies: {
    sessionToken: {
      name: `${isProduction ? "__Host-" : ""}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: isProduction,
      },
    },
    callbackUrl: {
      name: `${isProduction ? "__Secure-" : ""}next-auth.callback-url`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: isProduction,
      },
    },
    csrfToken: {
      name: `${isProduction ? "__Host-" : ""}next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: isProduction,
      },
    },
  },
  pages: {
    signIn: "/login",
    newUser: "/register",
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      if (isSafeInternalRedirect(url, baseUrl)) {
        return url.startsWith("/") ? `${baseUrl}${url}` : url;
      }
      return baseUrl;
    },
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.emailVerified = user.emailVerified;
        token.role = user.role;
        token.isBanned = user.isBanned;
      }

      if (trigger === "update") {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id },
          select: { role: true, isBanned: true, emailVerified: true },
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.isBanned = dbUser.isBanned;
          token.emailVerified = dbUser.emailVerified;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.emailVerified = token.emailVerified as Date | null;
        session.user.role = token.role;
        session.user.isBanned = token.isBanned;
      }
      return session;
    },
  },
};

import { DefaultSession, DefaultUser } from "next-auth";
import { Role } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      emailVerified: Date | null;
      role: Role;
      isBanned: boolean;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
    emailVerified: Date | null;
    role: Role;
    isBanned: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    emailVerified: Date | null;
    role: Role;
    isBanned: boolean;
  }
}

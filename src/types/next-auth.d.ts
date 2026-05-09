import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** The user's postal address. */
      role?: "CONSUMER" | "PROVIDER" | "ADMIN"; // Adicione o tipo para 'role'
      isSiteAuthenticated?: boolean; // Adicione o tipo para 'isSiteAuthenticated'
    } & DefaultSession["user"];
  }

  /**
   * The shape of the user object returned in the OAuth providers' `profile` callback,
   * or the JWT `token` if using a credentials provider.
   */
  interface User {
    role?: "CONSUMER" | "PROVIDER" | "ADMIN"; // Adicione o tipo para 'role'
    isSiteAuthenticated?: boolean; // Adicione o tipo para 'isSiteAuthenticated'
  }
}

// Se você estiver usando JWTs, também pode precisar estender o tipo JWT
declare module "next-auth/jwt" {
  interface JWT {
    role?: "CONSUMER" | "PROVIDER" | "ADMIN";
    isSiteAuthenticated?: boolean;
  }
}
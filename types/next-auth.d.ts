import { DefaultSession } from "next-auth"

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role?: string;
      description?: string;
      subscriptionPlan?: string;
    } & DefaultSession['user'];
  }

  interface User {
    role?: string;
    description?: string;
    subscriptionPlan?: string;
  }

  interface AdapterUser {
    role?: string;
    description?: string;
    subscriptionPlan?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: string;
    description?: string;
    subscriptionPlan?: string;
  }
}
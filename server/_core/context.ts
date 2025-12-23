import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { getAuthUser, AuthUser } from "../lib/auth";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: AuthUser | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: AuthUser | null = null;

  try {
    user = await getAuthUser(opts.req);
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}

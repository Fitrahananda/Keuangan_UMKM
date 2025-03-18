import { Context, Next } from "hono";
import { prisma } from "../config/database";

export const prismaMiddleware = async (c: Context, next: Next) => {
  c.set("prisma", prisma);
  await next();
};

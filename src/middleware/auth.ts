import { Context, Next } from "hono";
import { verifyToken } from "../utils/jwt";

export const authenticate = async (c: Context, next: Next) => {
  try {
    const authHeader = c.req.header("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return c.json({ error: "No token provided" }, 401);
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    c.set("user", decoded);
    await next();
  } catch (error) {
    return c.json({ error: "Invalid token" }, 401);
  }
};

export const authorize = (roles: string[]) => {
  return async (c: Context, next: Next) => {
    const user = c.get("user");
    if (!roles.includes(user.role)) {
      return c.json({ error: "Unauthorized access" }, 403);
    }
    await next();
  };
};

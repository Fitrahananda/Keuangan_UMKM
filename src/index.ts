import { Hono } from "hono";
import { serve } from "@hono/node-server";
import auth from "./routes/auth";
import user from "./routes/user";
import { errorHandler } from "./middleware/errorHandler";
import { prismaMiddleware } from "./middleware/prisma";
import { connectDB, disconnectDB } from "./config/database";
import * as dotenv from "dotenv";
import logger from "./utils/logger";

dotenv.config();

const app = new Hono();

// Add Prisma middleware
app.use("*", prismaMiddleware);

// Add logging middleware
app.use("*", async (c, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  logger.info(
    {
      method: c.req.method,
      path: c.req.path,
      status: c.res.status,
      duration: `${ms}ms`,
    },
    "Request completed"
  );
});

// Mount routes
app.route("/auth", auth);
app.route("/user", user);

// Error handling middleware
app.onError(errorHandler);

// 404 handler
app.notFound((c) => {
  logger.warn({ path: c.req.path }, "Route not found");
  return c.json({ status: "error", message: "URL not found" }, 404);
});

// Server start
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    logger.info("Database connected successfully");

    // Start the server
    serve({
      fetch: app.fetch,
      port: +PORT,
    });
    logger.info(`🚀 Server is running on port ${PORT}`);
  } catch (error) {
    logger.error({ error }, "Failed to start server");
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on("SIGINT", async () => {
  logger.info("Received SIGINT. Starting graceful shutdown...");
  await disconnectDB();
  logger.info("Database disconnected");
  process.exit();
});

process.on("SIGTERM", async () => {
  logger.info("Received SIGTERM. Starting graceful shutdown...");
  await disconnectDB();
  logger.info("Database disconnected");
  process.exit();
});

startServer();

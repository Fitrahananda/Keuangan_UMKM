import { Context, ErrorHandler } from "hono";
import { HttpError } from "../utils/errors";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

export const errorHandler: ErrorHandler = async (err: Error, c: Context) => {
  let statusCode = 500;
  let status = "error";
  let message = err.message;
  let errors: any = [];

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const httpError = HttpError.fromZodError(err as ZodError);
    statusCode = httpError.statusCode;
    status = "fail";
    message = httpError.message;
    errors = Array.isArray(httpError.details)
      ? httpError.details
      : [httpError.details].filter(Boolean);
  }
  // Handle Prisma validation errors
  else if (err instanceof Prisma.PrismaClientValidationError) {
    status = "fail";
    message = "Validation error";
    statusCode = 400;
    errors = err.message.split("\n").map((error) => ({
      field: error.split("`")[1] || "unknown",
      message: error,
    }));
  }
  // Handle Prisma unique constraint errors
  else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    status = "fail";
    statusCode = 400;
    if (err.code === "P2002") {
      message = "Unique constraint violation";
      const field = err.meta?.target as string[];
      errors = [
        {
          field: field?.[0] || "unknown",
          message: `A record with this ${field?.[0] || "value"} already exists`,
        },
      ];
    } else {
      message = "Validation error";
      errors = err.message.split("\n").map((error) => ({
        field: error.split("`")[1] || "unknown",
        message: error,
      }));
    }
  }
  // Handle custom HTTP errors
  else if (err instanceof HttpError) {
    statusCode = err.statusCode;
    status = "fail";
    message = err.message;
    errors = err.details || [];
  }
  // Handle other errors
  else {
    console.error("Unhandled error:", err);
    message = "Internal server error";
  }

  return c.json(
    {
      status,
      message,
      errors,
    },
    statusCode as 400 | 401 | 403 | 404 | 500
  );
};

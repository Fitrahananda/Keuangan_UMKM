import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { Context, Next } from "hono";
import { HttpError } from "../utils/errors";

export const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  phoneNumber: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["admin", "user"]).optional().default("user"),
});

export const loginSchema = z.object({
  phoneNumber: z
    .string()
    .regex(
      /^\+62[0-9]{9,10}$/,
      "Phone number must start with +62 and be 11-12 digits long"
    ),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

export const validateRegister = zValidator(
  "json",
  registerSchema,
  (result, c) => {
    if (!result.success) {
      throw result.error;
    }
  }
);

export const validateLogin = zValidator("json", loginSchema, (result, c) => {
  if (!result.success) {
    throw result.error;
  }
});

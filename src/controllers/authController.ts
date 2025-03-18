import { Context } from "hono";
import { generateToken } from "../utils/jwt";
import * as bcrypt from "bcryptjs";
import { RegisterInput, LoginInput } from "../validations/authValidation";
import { HttpError } from "../utils/errors";
import { PrismaClient, User, UserRole } from "@prisma/client";

interface Response {
  status: number;
  message: string;
  objResponse: Object;
}

export const register = async (c: Context) => {
  const body = (await c.req.json()) as RegisterInput;
  const { username, phoneNumber, password, role } = body;
  const prisma = c.get("prisma") as PrismaClient;

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name: username,
      phoneNumber,
      password: hashedPassword,
      role: (role || "USER") as UserRole,
    },
    select: {
      id: true,
      name: true,
      phoneNumber: true,
      role: true,
    },
  });

  const token = generateToken({ id: user.id, role: user.role });

  const response: Response = {
    status: 201,
    message: "User registered successfully",
    objResponse: {
      token,
    },
  };

  return c.json(response, 201);
};

export const login = async (c: Context) => {
  const body = (await c.req.json()) as LoginInput;
  const { phoneNumber, password } = body;
  const prisma = c.get("prisma") as PrismaClient;

  // Find user by phone number
  const user = await prisma.user.findUnique({
    where: {
      phoneNumber,
    },
  });

  if (!user) {
    throw new HttpError("Invalid phone number or password", 401);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new HttpError("Invalid phone number or password", 401);
  }

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  const token = generateToken({ id: user.id, role: user.role });

  const response: Response = {
    status: 201,
    message: "User registered successfully",
    objResponse: {
      token,
    },
  };

  return c.json(response);
};

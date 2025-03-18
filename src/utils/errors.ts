import { ZodError } from "zod";

export class HttpError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 400,
    public details?:
      | Array<{ field: string; message: string }>
      | Record<string, unknown>
  ) {
    super(message);
  }

  static fromZodError(error: ZodError) {
    return new HttpError(
      "Validation error",
      400,
      error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }))
    );
  }
}

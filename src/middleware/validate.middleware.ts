import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { asyncHandler } from "../utils/asyncHandler.ts";
import { ApiError } from "../utils/ApiError.ts";

export const validate = (schema: z.ZodTypeAny) =>
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      console.error("Zod Validation Error:", result.error.format());

      const errorMessages = Object.values(result.error.flatten().fieldErrors).flat().filter(Boolean) as string[];
      throw new ApiError(400, "Validation failed", errorMessages);
    }

    next();
  });
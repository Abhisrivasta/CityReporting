import { Request, Response, NextFunction } from "express";
import z from "zod";
import { asyncHandler } from "../utils/asyncHandler.ts";
import { ApiError } from "../utils/ApiError.ts";

export const validate = (schema: z.ZodObject<any>) =>
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      throw new ApiError(400, "Validation failed");
    }


    next();
  });


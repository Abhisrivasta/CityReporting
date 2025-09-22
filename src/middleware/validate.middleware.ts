import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { ApiResponse } from "../utils/ApiResponse.ts";
import { ApiError } from "../utils/ApiError.ts";
import { asyncHandler } from "../utils/asyncHandler.ts";

export const validate = (schema: z.ZodTypeAny) =>
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const bodyToValidate = { ...req.body };

      if (bodyToValidate.location && typeof bodyToValidate.location === 'string') {
        try {
          bodyToValidate.location = JSON.parse(bodyToValidate.location);
        } catch (error) {
          throw new ApiError(400, "Invalid JSON format for location field");
        }
      }

      const result = schema.safeParse(bodyToValidate);

      if (!result.success) {
        console.error("Zod Validation Error:", result.error.format());

        const errorMessages = Object.values(result.error.flatten().fieldErrors)
          .flat()
          .filter(Boolean) as string[];

        throw new ApiError(400, "Validation failed", errorMessages);
      }

    
      req.body = result.data;
      
      next();
    } catch (error) {
      next(error); 
    }
  });
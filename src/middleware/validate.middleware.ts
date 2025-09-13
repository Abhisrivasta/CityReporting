import type { Request, Response, NextFunction } from "express";
import { z } from "zod";

export const validate = (schema: z.ZodObject<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    console.log("zod validating conrollers ")
    try {
      schema.parse(req.body);
      next();
    } catch (err) {
     console.log("Error in zod validation");
      return res.status(500).json({ error: "Internal server error" });
    }
  };

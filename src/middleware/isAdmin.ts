import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError.ts";

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role === "admin") {
    return next();
  }
  throw new ApiError(403, "Permission denied: Admin access required");
};

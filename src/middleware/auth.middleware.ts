import { ApiError } from "../utils/ApiError.ts";
import { asyncHandler } from "../utils/asyncHandler.ts";
import jwt, { JwtPayload } from "jsonwebtoken";
import { User } from "../models/user.model.ts";
import { Request, Response, NextFunction } from "express";

declare module "express-serve-static-core" {
  interface Request {
    user?: any;
  }
}

export const verifyJWT = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "").trim();

    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    let decodedToken: string | JwtPayload;
    try {
      decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string);
    } catch (err) {
      throw new ApiError(401, "Invalid or expired access token");
    }

    const user = await User.findById((decodedToken as JwtPayload)._id).select(
      "-password"
    );

    if (!user) {
      throw new ApiError(401, "User not found");
    }

    req.user = user;
    next();
  }
);

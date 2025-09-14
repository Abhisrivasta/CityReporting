import { Request, Response } from "express";
import { User } from "../models/user.model.ts";
import { ApiError } from "../utils/ApiError.ts";
import { ApiResponse } from "../utils/ApiResponse.ts";
import { asyncHandler } from "../utils/asyncHandler.ts";

export const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const { username, fullName, email, password, address, phoneNumber, avatar, role } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(400, "User with this email already exists");
  }

  const user = await User.create({
    username,
    fullName,
    email,
    password,
    address,
    phoneNumber,
    avatar,
    role,
    memberSince: new Date(),
  });

  return res
    .status(201)
    .json(new ApiResponse(201, { user }, "User registered successfully"));
});

export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) throw new ApiError(400, "Invalid email or password");

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) throw new ApiError(400, "Invalid email or password");

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  return res.json(
    new ApiResponse(200, { accessToken, refreshToken }, "Login successful")
  );
});

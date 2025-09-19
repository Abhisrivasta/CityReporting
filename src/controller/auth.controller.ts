import { Request, Response } from "express";
import { User } from "../models/user.model.ts";
import { ApiError } from "../utils/ApiError.ts";
import { ApiResponse } from "../utils/ApiResponse.ts";
import { asyncHandler } from "../utils/asyncHandler.ts";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createUserSchema, loginUserSchema, passwordSchema } from "../validator/user.validate.ts";

const setTokensAndSendResponse = (res: Response, user: any, accessToken: string, refreshToken: string) => {
    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict" as const,
    };

    res.cookie("accessToken", accessToken, {
        ...cookieOptions,
        expires: new Date(Date.now() + 15 * 60 * 1000),
    });

    res.cookie("refreshToken", refreshToken, {
        ...cookieOptions,
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            { user: user.toJSON() },
            "Authentication successful"
        )
    );
};

export const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const { confirmPassword, ...userData } = createUserSchema.parse(req.body);

  const existingUser = await User.findOne({
    $or: [{ email: userData.email }, { username: userData.username }],
  });
  if (existingUser) {
    throw new ApiError(400, "User with this email or username already exists");
  }

  const user = await User.create({
    ...userData,
    memberSince: new Date(),
  });

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshTokenHash = await bcrypt.hash(refreshToken, 10);
  await user.save({ validateBeforeSave: false });

  setTokensAndSendResponse(res, user, accessToken, refreshToken);
});


export const loginUser = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = loginUserSchema.parse(req.body);

    const user = await User.findOne({ email }).select("+password +refreshTokenHash");
    if (!user) throw new ApiError(400, "Invalid email or password");

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) throw new ApiError(400, "Invalid email or password");

    user.lastLogin = new Date();

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await user.save({ validateBeforeSave: false });

    setTokensAndSendResponse(res, user, accessToken, refreshToken);
});


export const logoutUser = asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.cookies?.refreshToken;

    if (refreshToken) {
        try {
            const decoded: any = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET as string);
            await User.findByIdAndUpdate(decoded._id, { $unset: { refreshTokenHash: 1 } });
        } catch (error) { }
    }

    res.clearCookie("accessToken", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict" });
    res.clearCookie("refreshToken", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict" });

    return res.status(200).json(new ApiResponse(200, {}, "Logout successful"));
});


export const getRefreshToken = asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) throw new ApiError(401, "Refresh token not found");

    try {
        const decoded: any = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET as string);

        const user = await User.findById(decoded._id).select("+refreshTokenHash");
        if (!user || !(await bcrypt.compare(refreshToken, user.refreshTokenHash as string))) {
            throw new ApiError(401, "Invalid refresh token");
        }

        const newAccessToken = user.generateAccessToken();
        const newRefreshToken = user.generateRefreshToken();

        user.refreshTokenHash = await bcrypt.hash(newRefreshToken, 10);
        await user.save({ validateBeforeSave: false });

        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict" as const,
        };

        res.cookie("accessToken", newAccessToken, {
            ...cookieOptions,
            expires: new Date(Date.now() + 15 * 60 * 1000),
        });

        res.cookie("refreshToken", newRefreshToken, {
            ...cookieOptions,
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });

        return res.status(200).json(new ApiResponse(200, {}, "New access token generated successfully"));
    } catch {
        throw new ApiError(401, "Invalid or expired refresh token");
    }
});

export const getUserProfile = asyncHandler(async (req: any, res: Response) => {
    const user = await User.findById(req.user._id);
    if (!user) throw new ApiError(404, "User not found");

    return res.status(200).json(new ApiResponse(200, { user: user.toJSON() }, "User profile fetched successfully"));
});


export const getUserProfileById = asyncHandler(async (req: any, res: Response) => {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) throw new ApiError(404, "User not found");

    return res.status(200).json(new ApiResponse(200, { user: user.toJSON() }, "User profile fetched successfully"));
});


export const changePassword = asyncHandler(async (req: any, res: Response) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new ApiError(400, "Current password and new password are required");
  }

  passwordSchema.parse(newPassword);

  const user = await User.findById(req.user?._id).select("+password +refreshTokenHash");
  if (!user) throw new ApiError(404, "User not found");

  const isCurrentValid = await user.isPasswordCorrect(currentPassword);
  if (!isCurrentValid) throw new ApiError(400, "Current password is incorrect");
  user.password = newPassword;

 
  user.refreshTokenHash = undefined;

  await user.save();

  return res.status(200).json(
    new ApiResponse(200, {}, "Password changed successfully. Please login again.")
  );
});
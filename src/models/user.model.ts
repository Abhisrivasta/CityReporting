import bcrypt from "bcryptjs";
import { Schema, Document, model } from "mongoose";
import jwt, { Secret, SignOptions } from "jsonwebtoken";

// User roles
export enum UserRole {
  Admin = "admin",
  User = "user",
}

// User interface
export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  fullName: string;
  address: string;
  phoneNumber: string;
  memberSince: Date;
  avatar?: string;
  role: UserRole;

  // methods
  isPasswordCorrect(password: string): Promise<boolean>;
  generateAccessToken(): string;
  generateRefreshToken(): string;
}

// User schema
const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    memberSince: {
      type: Date,
    },
    avatar: {
      type: String,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.User,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.isPasswordCorrect = async function (password: any) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function (): string {
  const payload = {
    _id: this._id.toString(),
    email: this.email,
    username: this.username,
    fullName: this.fullName,
  };

  const secret: Secret = process.env.ACCESS_TOKEN_SECRET as Secret;

  const options: SignOptions = {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY as jwt.SignOptions["expiresIn"],
  };

  return jwt.sign(payload, secret, options);
};

userSchema.methods.generateRefreshToken = function (): string {
  const payload = { _id: this._id.toString() };

  const secret: Secret = process.env.REFRESH_TOKEN_SECRET as Secret;

  const options: SignOptions = {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY as jwt.SignOptions["expiresIn"],
  };

  return jwt.sign(payload, secret, options);
};

export const User = model<IUser>("User", userSchema);

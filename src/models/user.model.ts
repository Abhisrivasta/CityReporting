import { Schema, Document, model } from "mongoose";

// User roles
export enum UserRole {
  Admin = "admin",
  User = "user",
}

// User interface
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  address: string;
  phoneNumber: string;
  memberSince: Date;
  avatar?: string;
  role: UserRole;
}

// User schema
const userSchema = new Schema<IUser>(
  {
    name: {
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

export const User = model<IUser>("User", userSchema);

import bcrypt from "bcryptjs";
import { Schema, Document, model, Types } from "mongoose";
import jwt, { Secret, SignOptions } from "jsonwebtoken";

// User roles
export enum UserRole {
  Admin = "admin",
  User = "user",
}

// User interface with all fields
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
  isActive: boolean;
  lastLogin?: Date;
  emailVerified: boolean;
  emailVerificationToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  refreshTokenHash?: string; 
  isPasswordCorrect(password: string): Promise<boolean>;
  generateAccessToken(): string;
  generateRefreshToken(): string;
  createPasswordResetToken(): string;
  toJSON(): object;
}

const userSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    fullName: { type: String, required: true, trim: true },
    password: { type: String, required: true, select: false },
    address: { type: String },
    phoneNumber: { type: String},
    memberSince: { type: Date, default: Date.now },
    avatar: { type: String },
    role: { type: String, enum: Object.values(UserRole), default: UserRole.User },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
    emailVerified: { type: Boolean, default: false },

    emailVerificationToken: { type: String },
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
    refreshTokenHash: { type: String, select: false } 
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.isPasswordCorrect = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function (): string {
  const payload = {
    _id: this._id.toString(),
    email: this.email,
    username: this.username,
    fullName: this.fullName,
    role: this.role,
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

userSchema.methods.createPasswordResetToken = function() {
    const resetToken = jwt.sign({ _id: this._id }, process.env.RESET_PASSWORD_SECRET as Secret, { expiresIn: '10m' });
    this.passwordResetToken = resetToken;
    this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); 
    return resetToken;
};

userSchema.methods.toJSON = function (): object {
  const userObject = this.toObject();

  delete userObject.password;
  delete userObject.refreshTokenHash;
  delete userObject.passwordResetToken;
  delete userObject.passwordResetExpires;
  delete userObject.emailVerificationToken;

  return userObject;
};

export const User = model<IUser>("User", userSchema);
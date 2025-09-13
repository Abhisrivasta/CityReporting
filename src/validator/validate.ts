import { z } from "zod";

// Password schema 
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .max(32, "Password must not exceed 32 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/\d/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

// Create User schema
export const createUserSchema = z
  .object({
    name: z
      .string()
      .min(3, "Name must be at least 3 characters long")
      .max(100, "Name must be under 100 characters"),

    email: z.string().email("Invalid email format"),

    password: passwordSchema,

    confirmPassword: z.string(),

    avatar: z.string().url("Avatar must be a valid URL").optional(),

    address: z
      .string()
      .min(5, "Address must be at least 5 characters long")
      .max(200, "Address must not exceed 200 characters"),

    phoneNumber: z
      .string()
      .regex(/^\+?[0-9]{10,15}$/, "Phone number must be valid"),

    memberSince: z.date().optional(),

    role: z.enum(["admin", "user"]).default("user"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Login User schema
export const loginUserSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

// Types
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type LoginUserInput = z.infer<typeof loginUserSchema>;

import { z } from "zod";

export const usernameSchema = z
  .string()
  .trim()
  .min(3, "Username must be at least 3 characters long")
  .max(20, "Username must not exceed 20 characters")
  .regex(
    /^[a-zA-Z][a-zA-Z0-9._]*$/,
    "Username must start with a letter and can only contain letters, numbers, underscores, and dots"
  )
  .regex(
    /^(?!.*[_.]{2})/,
    "Username cannot contain consecutive underscores or dots"
  )
  .regex(
    /^(?!.*[_.]$)/,
    "Username cannot end with an underscore or dot"
  );

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .max(32, "Password must not exceed 32 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/\d/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");


export const createUserSchema = z
  .object({
    username: usernameSchema,

    fullName: z
      .string()
      .trim()
      .min(3, "Full name must be at least 3 characters long")
      .max(100, "Full name must not exceed 100 characters"),

    email: z.string().trim().email("Invalid email format"),

    password: passwordSchema,

    confirmPassword: z.string(),

    avatar: z.string().url("Avatar must be a valid URL").optional(),

    address: z
      .string()
      .trim()
      .min(5, "Address must be at least 5 characters long")
      .max(200, "Address must not exceed 200 characters").optional(),

    phoneNumber: z
      .string()
      .trim()
      .regex(/^\+?[0-9]{10,15}$/, "Phone number must be valid").optional(),

    memberSince: z.date().optional(),

    role: z.enum(["admin", "user"]).default("user"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });


export const loginUserSchema = z.object({
  email: z.string().trim().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type LoginUserInput = z.infer<typeof loginUserSchema>;

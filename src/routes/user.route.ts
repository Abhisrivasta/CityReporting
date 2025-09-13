import { Router } from "express";
import { registerUser,loginUser } from "../controller/user.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { createUserSchema,loginUserSchema } from "../validator/validate.js";
import type { AnyZodObject } from "zod/v3";

const router = Router();
router.post("/register", validate(createUserSchema as unknown as AnyZodObject), registerUser);
router.post("/login", validate(loginUserSchema as unknown as AnyZodObject), loginUser);

export default router;
  
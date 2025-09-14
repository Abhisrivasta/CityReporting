import { Router } from "express";
import { loginUser, registerUser, } from "../controller/user.controller.ts";
import { validate } from "../middleware/validate.middleware.ts";
import { createUserSchema,loginUserSchema } from "../validator/validate.zod.ts";
import { verifyJWT } from "../middleware/auth.middleware.ts";

const router = Router();
router.post("/register",validate(createUserSchema),registerUser);

router.post("/login",validate(loginUserSchema),loginUser);



export default router;

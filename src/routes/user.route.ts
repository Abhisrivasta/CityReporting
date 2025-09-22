import { Router } from "express";
import { changePassword, getRefreshToken, getUserProfile, getUserProfileById, loginUser, logoutUser, registerUser, } from "../controller/auth.controller.ts";
import { createUserSchema,loginUserSchema } from "../validator/user.validate.ts";
import { verifyJWT } from "../middleware/auth.middleware.ts";
import { validate } from "../middleware/validate.middleware.ts";

const router = Router();


router.post("/register",validate(createUserSchema),registerUser);
router.post("/login",validate(loginUserSchema),loginUser);
router.post("/logout", verifyJWT , logoutUser);

router.get("/refresh-token", getRefreshToken);


router.get("/profile", verifyJWT, getUserProfile);        // self
router.get("/profile/:id", verifyJWT, getUserProfileById);  //get by id
router.post("/change-password", verifyJWT, changePassword);

export default router;

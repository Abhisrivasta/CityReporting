import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.ts";
import { markNotificationAsSeen, newNotification } from "../controller/Report.controller.ts";


const router = Router();

router.get("/", verifyJWT, newNotification );

router.post("/seen", verifyJWT, markNotificationAsSeen);

export default router;

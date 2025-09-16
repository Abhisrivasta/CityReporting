import { Router } from "express";
import { createReportHandler } from "../controller/Report.controller.ts";
import { validate } from "../middleware/validate.middleware.ts";
import { verifyJWT } from "../middleware/auth.middleware.ts";
import { createReportSchema } from "../validator/report.validate.ts";

const router = Router();
router.post(
  "/createReport",
  verifyJWT,
  validate(createReportSchema),
  createReportHandler
);

export default router;
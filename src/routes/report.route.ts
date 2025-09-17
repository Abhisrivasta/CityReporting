import { Router } from "express";
import { createReportHandler, getReportByIdHandler, getReportHandler } from "../controller/Report.controller.ts";
import { validate } from "../middleware/validate.middleware.ts";
import { verifyJWT } from "../middleware/auth.middleware.ts";
import { createReportSchema } from "../validator/report.validate.ts";

const router = Router();
router.post(
  "/:userid/createReport",
  verifyJWT,
  validate(createReportSchema),
  createReportHandler
);

router.get("/", verifyJWT, getReportHandler);

router.get("/:reportId", verifyJWT, getReportByIdHandler);

export default router;
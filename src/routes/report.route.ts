import { Router } from "express";
import {
  createReportHandler,
  getReportByIdHandler,
  getReportHandler,
} from "../controller/Report.controller.ts";
import { verifyJWT } from "../middleware/auth.middleware.ts";
import { createReportSchema } from "../validator/report.validate.ts";
import { validate } from "../middleware/validate.middleware..ts";
import { upload } from "../middleware/uploadMiddleware.ts";
const router = Router();

router.post(
  "/",
  verifyJWT,
  upload.array("images", 5), 
  validate(createReportSchema), 
  createReportHandler 
);

// get all reports
router.get("/", verifyJWT, getReportHandler);

// get report by id
router.get("/:reportId", verifyJWT, getReportByIdHandler);

export default router;
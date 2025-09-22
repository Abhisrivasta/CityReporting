import { Router } from "express";
import {
  createReportHandler,
  deleteReportByIdHandler,
  getReportByIdHandler,
  getReportHandler,
  updateReportByIdHandler,
  getReportAnalyticsHandler
} from "../controller/Report.controller.ts";

import { verifyJWT } from "../middleware/auth.middleware.ts";
import { isAdmin } from "../middleware/isAdmin.ts";
import { createReportSchema } from "../validator/report.validate.ts";
import { upload } from "../middleware/uploadMiddleware.ts";
import { validate } from "../middleware/validate.middleware.ts";

const router = Router();
router.post(
  "/",
  verifyJWT,
  upload.array("images", 5),
  validate(createReportSchema),
  createReportHandler
);

router.get(
  "/admin/analytics",
  verifyJWT,
  isAdmin,
  getReportAnalyticsHandler
);

router.get("/", verifyJWT, getReportHandler);
router.get("/:reportId", verifyJWT, getReportByIdHandler);

router.patch(
  "/:reportId",
  verifyJWT,
  upload.array("images", 5),
  validate(createReportSchema),
  updateReportByIdHandler
);

router.delete("/:reportId", verifyJWT, deleteReportByIdHandler);

export default router;

import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.ts";
import { Report, ReportPriority, ReportStatus } from "../models/report.model.ts";
import { ApiResponse } from "../utils/ApiResponse.ts";
import { ApiError } from "../utils/ApiError.ts";
import { uploadImagesToCloudinary } from "../utils/uploadMultiple.ts";


const categoryToDepartmentMap: { [key: string]: string } = {
  "pothole": "Public Works",
  "streetlight": "Public Works",
  "garbage": "Environmental Services",
  "water-leak": "Water & Sewer",
  "traffic-signal": "Transportation",
  "sidewalk": "Public Works",
  "graffiti": "Code Enforcement",
  "noise": "Police",
  "other": "City Management" 
};


// create Report
export const createReportHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      title,
      description,
      category,
      location,
      isAnonymous,
    } = req.body;

    // Use the reusable utility function to handle the upload logic.
    const imagesForDB = await uploadImagesToCloudinary(req.files as Express.Multer.File[]);

    const reportedBy = req.user._id;
    const department = categoryToDepartmentMap[category] || "City Management";
    const status = ReportStatus.Pending;
    const priority = ReportPriority.Low;

    const report = await Report.create({
      title,
      description,
      category,
      priority,
      status,
      location,
      images: imagesForDB, 
      reportedBy,
      isAnonymous,
      department,
    });


    if (!report) {
      throw new ApiError(500, "Report could not be created.");
    }

    return res.status(201).json(
      new ApiResponse(201, report, "Report created successfully")
    );
  }
);


// get allReport
export const getReportHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const reports = await Report.find({ reportedBy: req.user._id });

    // It is better to return an empty array than throw an error if no reports are found.
    if (!reports || reports.length === 0) {
      return res.status(200).json(
        new ApiResponse(200, [], "No reports found for this user")
      );
    }

    return res.status(200).json(
      new ApiResponse(200, reports, "Reports fetched successfully")
    );
  }
);


// get report by id
export const getReportByIdHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const { reportId } = req.params;

    const report = await Report.findById(reportId);
    if (!report) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Report not found"));
    }

    return res.status(200).json(
      new ApiResponse(200, report, "Report fetched successfully")
    );
  }
);
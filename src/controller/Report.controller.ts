import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.ts";
import {
  Report,
  ReportPriority,
  ReportStatus,
} from "../models/report.model.ts";
import { ApiResponse } from "../utils/ApiResponse.ts";
import { ApiError } from "../utils/ApiError.ts";
import { uploadImagesToCloudinary } from "../utils/uploadMultiple.ts";
import cloudinary from "../config/cloudinaryConfig.ts";

const categoryToDepartmentMap: { [key: string]: string } = {
  pothole: "Public Works",
  streetlight: "Public Works",
  garbage: "Environmental Services",
  "water-leak": "Water & Sewer",
  "traffic-signal": "Transportation",
  sidewalk: "Public Works",
  graffiti: "Code Enforcement",
  noise: "Police",
  other: "City Management",
};

// create Report
export const createReportHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const { title, description, category, location, isAnonymous } = req.body;

    // Use the reusable utility function to handle the upload logic.
    const imagesForDB = await uploadImagesToCloudinary(
      req.files as Express.Multer.File[]
    );

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

    return res
      .status(201)
      .json(new ApiResponse(201, report, "Report created successfully"));
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

    if (report.reportedBy.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res
        .status(403)
        .json(new ApiError(403, "Not authorized to view this report"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, report, "Report fetched successfully"));
  }
);

//update reports by id
export const updateReportByIdHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const { reportId } = req.params;

    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json(new ApiError(404, "Report not found"));
    }
    if (report.reportedBy.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res
        .status(403)
        .json(new ApiError(403, "Not authorized to update this report"));
    }
    let imagesForDB;
    if (req.files && (req.files as Express.Multer.File[]).length > 0) {
      if (report.images && Array.isArray(report.images)) {
        console.log("🗑️ Deleting old images from Cloudinary...");
        for (const img of report.images) {
          if (img.url) {
            await cloudinary.uploader.destroy(img.url);
          }
        }
      }

      imagesForDB = await uploadImagesToCloudinary(
        req.files as Express.Multer.File[]
      );
    }

    const {
      title,
      description,
      category,
      priority,
      status,
      location,
      isAnonymous,
    } = req.body;

    const department = categoryToDepartmentMap[category] || "City Management";

    const updatedReport = await Report.findByIdAndUpdate(
      reportId,
      {
        title,
        description,
        category,
        priority,
        status,
        location,
        ...(imagesForDB && { images: imagesForDB }),
        isAnonymous,
        department,
      },
      { new: true }
    );
    return res
      .status(200)
      .json(new ApiResponse(200, updatedReport, "Report updated successfully"));
  }
);

// delete report by id
export const deleteReportByIdHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const { reportId } = req.params;

    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json(new ApiError(404, "Report not found"));
    }

if (report.reportedBy.toString() !== req.user._id.toString() && req.user.role !== "admin") {
  return res.status(403).json(new ApiError(403, "Not authorized to delete this report"));
}

    if (report.images && Array.isArray(report.images)) {
      for (const img of report.images) {
        if (img.url) {
          await cloudinary.uploader.destroy(img.url);
        }
      }
    }

    await Report.findByIdAndDelete(reportId);

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Report deleted successfully"));
  }
);


// get analytics (admin only)
export const getReportAnalyticsHandler = asyncHandler(
  async (req: Request, res: Response) => {
    if (req.user.role !== "admin") {
      return res.status(403).json(new ApiError(403, "Not authorized"));
    }

    const totalReports = await Report.countDocuments();

    // Count by status
    const byStatus = await Report.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    // Count by category
    const byCategory = await Report.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);

    // Count by priority
    const byPriority = await Report.aggregate([
      { $group: { _id: "$priority", count: { $sum: 1 } } }
    ]);

    // Count by user 
    const byUser = await Report.aggregate([
      { $group: { _id: "$reportedBy", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 } 
    ]);

    return res.status(200).json(
      new ApiResponse(200, {
        totalReports,
        byStatus,
        byCategory,
        byPriority,
        byUser,
      }, "Analytics fetched successfully")
    );
  }
);


// get all reports 
export const getReportHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const { page = 1, limit = 10, status, category, priority } = req.query;

    const filters: any = {};

    if (req.user.role !== "admin") {
      filters.reportedBy = req.user._id;
    }

    if (status) filters.status = status;
    if (category) filters.category = category;
    if (priority) filters.priority = priority;

    const skip = (Number(page) - 1) * Number(limit);

    const reports = await Report.find(filters)
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 })
      .populate("reportedBy", "name email role"); 

    const total = await Report.countDocuments(filters);

    return res.status(200).json(
      new ApiResponse(200, {
        reports,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
        },
      }, "Reports fetched successfully")
    );
  }
);

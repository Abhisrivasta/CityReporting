import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.ts";
import { Report, ReportPriority, ReportStatus } from "../models/report.model.ts";
import { ApiResponse } from "../utils/ApiResponse.ts";
import { ApiError } from "../utils/ApiError.ts";

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


//create Report
export const createReportHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      title,
      description,
      category,
      location,  
      images,
      isAnonymous,
    } = req.body;

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
      images,
      reportedBy,
      department,
      isAnonymous,
    });


    return res.status(201).json(
      new ApiResponse(201, report, "Report created successfully")
    );
  }
);


//get allReport
export const getReportHandler = asyncHandler(
  async(req:Request,res:Response) =>{
    const reports = await Report.find({reportedBy:req.user._id});

    if(!reports){
      throw new ApiError(400,"User do not create report")
    }

    return res.status(200).json(
      new ApiResponse(200,reports,"Reports fetched successfully")
    )
  }
)



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


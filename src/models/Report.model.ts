import { Schema, Document, model } from "mongoose";

export enum ReportPriority {
  Low = "Low",
  Medium = "Medium",
  High = "High",
  Critical = "Critical",
}

export enum ReportStatus {
  Pending = "pending",
  InProgress = "in-progress",
  Resolved = "resolved",
  Rejected = "rejected",
}

export interface IReport extends Document {
  title: string;
  description: string;
  category:
    | "pothole"
    | "streetlight"
    | "garbage"
    | "water-leak"
    | "traffic-signal"
    | "sidewalk"
    | "graffiti"
    | "noise"
    | "other";
  priority: ReportPriority;
  status: ReportStatus;
  location: {
    address: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
    neighborhood?: string;
    ward?: string;
  };
  images: Array<{
    url: string;
    caption?: string;
    type?: "before" | "during" | "after";
    uploadedAt?: Date;
  }>;
  reportedBy: Schema.Types.ObjectId;
  assignedTo?: Schema.Types.ObjectId | null;
  department?:
    | "Public Works"
    | "Transportation"
    | "Parks & Recreation"
    | "Water & Sewer"
    | "Police"
    | "Fire"
    | "Environmental Services"
    | "Code Enforcement";
  estimatedResolutionDate?: Date;
  actualResolutionDate?: Date;
  resolutionNotes?: string;
  isAnonymous: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema = new Schema<IReport>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    category: {
      type: String,
      required: true,
      enum: [
        "pothole",
        "streetlight",
        "garbage",
        "water-leak",
        "traffic-signal",
        "sidewalk",
        "graffiti",
        "noise",
        "other",
      ],
    },
    priority: {
      type: String,
      enum: Object.values(ReportPriority),
      default: ReportPriority.Medium,
    },
    status: {
      type: String,
      enum: Object.values(ReportStatus),
      default: ReportStatus.Pending,
    },
    location: {
      address: {
        type: String,
        required: true,
      },
      coordinates: {
        latitude: {
          type: Number,
          required: true,
          min: -90,
          max: 90,
        },
        longitude: {
          type: Number,
          required: true,
          min: -180,
          max: 180,
        },
      },
      neighborhood: String,
      ward: String,
    },
    images: [
      {
        url: { type: String, required: true },
        caption: String,
        type: {
          type: String,
          enum: ["before", "during", "after"],
          default: "before",
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    reportedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User", default: null },
    department: {
      type: String,
      enum: [
        "Public Works",
        "Transportation",
        "Parks & Recreation",
        "Water & Sewer",
        "Police",
        "Fire",
        "Environmental Services",
        "Code Enforcement",
      ],
    },
    estimatedResolutionDate: Date,
    actualResolutionDate: Date,
    resolutionNotes: String,
    isAnonymous: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

ReportSchema.index({ "location.coordinates": "2dsphere" });

export const Report = model<IReport>("Report", ReportSchema);

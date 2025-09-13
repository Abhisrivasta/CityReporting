import { Schema, model } from "mongoose";

const reportSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    enum: ["Pothole", "Garbage", "Streetlight", "Water", "Others"], 
    required: true 
  },
  department: { type: String }, // auto-suggested or assigned
  status: { 
    type: String, 
    enum: ["Pending", "In Progress", "Resolved"], 
    default: "Pending" 
  },
  location: {
    lat: { type: Number },
    lng: { type: Number },
    address: { type: String }
  },
  media: [{ type: String }], // photo/video URLs
  citizen: { type: Schema.Types.ObjectId, ref: "User", required: true },
  assignedBy: { type: Schema.Types.ObjectId, ref: "User" }, // admin
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const Report = model("Report", reportSchema);

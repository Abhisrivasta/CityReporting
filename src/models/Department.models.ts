import { Schema, model } from "mongoose";

const departmentSchema = new Schema({
  name: { type: String, required: true, unique: true },
  description: String,
  email: String, // optional contact
  createdAt: { type: Date, default: Date.now }
});

export const Department = model("Department", departmentSchema);

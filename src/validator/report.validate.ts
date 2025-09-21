import { z } from "zod";

export const createReportSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title cannot exceed 200 characters"),

  description: z
    .string()
    .min(1, "Description is required")
    .max(2000, "Description cannot exceed 2000 characters"),

  category: z.enum([
    "pothole",
    "streetlight",
    "garbage",
    "water-leak",
    "traffic-signal",
    "sidewalk",
    "graffiti",
    "noise",
    "other",
  ]),

  location: z.object({
    address: z.string().min(1, "Address is required"),
    coordinates: z.object({
      latitude: z
        .number()
        .min(-90, "Latitude must be between -90 and 90")
        .max(90, "Latitude must be between -90 and 90"),
      longitude: z
        .number()
        .min(-180, "Longitude must be between -180 and 180")
        .max(180, "Longitude must be between -180 and 180"),
    }),
    neighborhood: z.string().optional(),
    ward: z.string().optional(),
  }),

  isAnonymous: z.boolean().optional().default(false),
});
import { Schema, Document, model } from "mongoose";

export interface INotification extends Document {
  message: string;
  reportedBy: Schema.Types.ObjectId;
  recipientRole: "admin" | "user";
  seen: boolean;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    message: {
      type: String,
      required: true,
    },
    reportedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    recipientRole: {
      type: String,
      enum: ["admin", "user"],
      required: true,
    },
    seen: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true } 
);

export const Notification = model<INotification>(
  "Notification",
  notificationSchema
);

// Models/PushToken.js
import mongoose from "mongoose";

const PushTokenSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "GreenRentUser", required: true, index: true },
    token: { type: String, required: true, unique: true },
    provider: { type: String, enum: ["expo", "fcm"], default: "expo" },
    platform: { type: String, enum: ["ios", "android", "web"], default: "ios" },
    lastSeenAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const PushTokenModel =
  mongoose.models.GreenRentPushToken || mongoose.model("GreenRentPushToken", PushTokenSchema);

export default PushTokenModel;
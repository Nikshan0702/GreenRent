
// import mongoose from "mongoose";

// const SentimentSchema = new mongoose.Schema(
//   {
//     provider: { type: String, enum: ["ParallelDots", "Aylien", "Custom", "None"], default: "None" },
//     label: { type: String, enum: ["positive", "neutral", "negative", "unknown"], default: "unknown" },
//     confidence: { type: Number, min: 0, max: 1, default: 0 },
//     score: { type: Number, min: -1, max: 1 }, // optional numeric score if your provider returns it
//   },
//   { _id: false }
// );

// const ReviewSchema = new mongoose.Schema(
//   {
//     propertyId: { type: mongoose.Schema.Types.ObjectId, ref: "GreenRentProperty", required: true },
//     userId: { type: mongoose.Schema.Types.ObjectId, ref: "GreenRentUser", required: true },
//     rating: { type: Number, min: 1, max: 5, required: true },
//     text: { type: String, trim: true, maxlength: 3000, required: true },
//     sentiment: SentimentSchema,
//     isEdited: { type: Boolean, default: false },
//     editedAt: { type: Date },
//   },
//   { timestamps: true }
// );

// ReviewSchema.index({ propertyId: 1, userId: 1 }, { unique: true });
// ReviewSchema.index({ propertyId: 1, createdAt: -1 });

// ReviewSchema.pre("save", function (next) {
//   if (!this.isNew && this.isModified("text")) {
//     this.isEdited = true;
//     this.editedAt = new Date();
//   }
//   next();
// });

// const Review = mongoose.models.Review || mongoose.model("Review", ReviewSchema);
// export default Review;


// models/Review.js
import mongoose from "mongoose";

const SentimentSchema = new mongoose.Schema(
  {
    provider: {
      type: String,
      enum: ["GoogleNL", "ParallelDots", "Aylien", "None"],
      default: "GoogleNL",
    },
    label: {
      type: String,
      enum: ["positive", "negative", "neutral"],
      default: "neutral",
    },
    confidence: { type: Number, default: 0 }, // (we use Google NL magnitude as confidence proxy)
    score: { type: Number, min: -1, max: 1, default: 0 }, // Google NL documentSentiment.score
  },
  { _id: false }
);

const ReviewSchema = new mongoose.Schema(
  {
    // NOTE: controller uses "propertyId"
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GreenRentProperty",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GreenRentUser",
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    text: {
      type: String,
      required: true,
      maxlength: 2000,
      trim: true,
    },

    // Sentiment block (now compatible with Google NL)
    sentiment: { type: SentimentSchema, default: () => ({}) },

    // Optional extras
    isEdited: { type: Boolean, default: false },
    editedAt: { type: Date },

    // Helpful votes etc. (optional)
    helpfulVotes: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

// A user may leave max 1 review per property (your controller upserts on this)
ReviewSchema.index({ propertyId: 1, userId: 1 }, { unique: true });

// Sort helper
ReviewSchema.index({ propertyId: 1, createdAt: -1 });

export default mongoose.models.Review || mongoose.model("Review", ReviewSchema);
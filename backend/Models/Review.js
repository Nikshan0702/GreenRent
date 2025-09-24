// models/Review.js
import mongoose from "mongoose";

const SentimentSchema = new mongoose.Schema({
  provider: { type: String, enum: ["ParallelDots", "Aylien", "Custom", "None"], default: "None" },
  label: { type: String, enum: ["positive", "neutral", "negative", "unknown"], default: "unknown" },
  score: { type: Number, min: 0, max: 1 },
  confidence: { type: Number, min: 0, max: 1 },
}, { _id: false });

const ReviewSchema = new mongoose.Schema(
  {
    propertyId: { type: mongoose.Schema.Types.ObjectId, ref: "GreenRentProperty", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "GreenRentUser", required: true },

    rating: { type: Number, min: 1, max: 5, required: true },
    text: { type: String, trim: true, maxlength: 3000, required: true },

    sentiment: SentimentSchema,

    isEdited: { type: Boolean, default: false },
    editedAt: { type: Date },
  },
  { timestamps: true }
);

// exactly one review per user per property
ReviewSchema.index({ propertyId: 1, userId: 1 }, { unique: true });
// list newest first for a property
ReviewSchema.index({ propertyId: 1, createdAt: -1 });

ReviewSchema.pre("save", function (next) {
  if (!this.isNew && this.isModified("text")) {
    this.isEdited = true;
    this.editedAt = new Date();
  }
  next();
});

// helper: recompute avgRating & reviewCount on the property
ReviewSchema.statics.recomputePropertyAggregates = async function (propertyId) {
  const agg = await this.aggregate([
    { $match: { propertyId: new mongoose.Types.ObjectId(propertyId) } },
    { $group: { _id: "$propertyId", reviewCount: { $sum: 1 }, avgRating: { $avg: "$rating" } } },
  ]);

  const { default: Property } = await import("./Property.js"); // GreenRentProperty model (ESM)
  const stat = agg[0];
  await Property.findByIdAndUpdate(
    propertyId,
    {
      $set: {
        reviewCount: stat ? stat.reviewCount : 0,
        avgRating: stat ? Math.round(stat.avgRating * 10) / 10 : 0,
      },
    },
    { new: false }
  );
};

const ReviewModel = mongoose.models.Review || mongoose.model("Review", ReviewSchema);
export default ReviewModel;
// controller/PropertyCommentsController.js
import express from "express";
import mongoose from "mongoose";
import Review from "../Models/Review.js";
import authenticateUser from "../middleware/authenticateUser.js";

const router = express.Router();

/** helper: recompute property aggregates (avgRating, reviewCount) */
async function recomputePropertyAggregates(propertyId) {
  const agg = await Review.aggregate([
    { $match: { propertyId: new mongoose.Types.ObjectId(propertyId) } },
    { $group: { _id: "$propertyId", reviewCount: { $sum: 1 }, avgRating: { $avg: "$rating" } } },
  ]);

  const { default: PropertyModel } = await import("../Models/Property.js"); // GreenRentProperty model (ESM)
  const stat = agg[0];
  await PropertyModel.findByIdAndUpdate(
    propertyId,
    {
      $set: {
        reviewCount: stat ? stat.reviewCount : 0,
        avgRating: stat ? Math.round(stat.avgRating * 10) / 10 : 0,
      },
    },
    { new: false }
  );
}

/** ---------- GET /PropertyOperations/:propertyId/comments (Public) ---------- */
router.get("/:propertyId/comments", async (req, res) => {
  try {
    const { propertyId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      return res.status(400).json({ success: false, message: "Invalid propertyId" });
    }

    const items = await Review.find({ propertyId })
      .sort({ createdAt: -1 })
      .populate({ path: "userId", select: "uname profilePicture" })
      .lean();

    return res.json({ success: true, data: items });
  } catch (e) {
    console.error("listComments error:", e);
    return res.status(500).json({ success: false, message: "Failed to load comments" });
  }
});

/** ---------- POST /PropertyOperations/:propertyId/comments (Auth) ---------- */
router.post("/:propertyId/comments", authenticateUser, async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { text, rating } = req.body;

    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      return res.status(400).json({ success: false, message: "Invalid propertyId" });
    }
    if (!text || rating === undefined) {
      return res.status(400).json({ success: false, message: "Text and rating are required" });
    }
    const r = Number(rating);
    if (Number.isNaN(r) || r < 1 || r > 5) {
      return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });
    }

    // Upsert: if user already reviewed this property, update it; else create new
    const doc = await Review.findOneAndUpdate(
      { propertyId, userId: req.user._id },
      { $set: { text, rating: r }, $setOnInsert: { createdAt: new Date() } },
      { upsert: true, new: true, runValidators: true }
    );

    await recomputePropertyAggregates(propertyId);

    return res.status(201).json({ success: true, data: doc });
  } catch (e) {
    console.error("addComment error:", e);
    if (e.code === 11000) {
      return res.status(409).json({ success: false, message: "You have already reviewed this property" });
    }
    return res.status(500).json({ success: false, message: "Failed to add comment" });
  }
});

/** ---------- PUT /PropertyOperations/:propertyId/comments/:id (Auth) ---------- */
router.put("/:propertyId/comments/:id", authenticateUser, async (req, res) => {
  try {
    const { propertyId, id } = req.params;
    const { text, rating } = req.body;

    if (!mongoose.Types.ObjectId.isValid(propertyId) || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid id" });
    }

    const update = {};
    if (typeof text === "string") update.text = text;
    if (rating !== undefined) {
      const r = Number(rating);
      if (Number.isNaN(r) || r < 1 || r > 5) {
        return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });
      }
      update.rating = r;
    }
    update.isEdited = true;
    update.editedAt = new Date();

    const doc = await Review.findOneAndUpdate(
      { _id: id, propertyId, userId: req.user._id }, // only the author can edit
      { $set: update },
      { new: true, runValidators: true }
    );

    if (!doc) return res.status(404).json({ success: false, message: "Comment not found" });

    await recomputePropertyAggregates(propertyId);
    return res.json({ success: true, data: doc });
  } catch (e) {
    console.error("editComment error:", e);
    return res.status(500).json({ success: false, message: "Failed to edit comment" });
  }
});

/** ---------- DELETE /PropertyOperations/:propertyId/comments/:id (Auth) ---------- */
router.delete("/:propertyId/comments/:id", authenticateUser, async (req, res) => {
  try {
    const { propertyId, id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(propertyId) || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid id" });
    }

    const doc = await Review.findOneAndDelete({ _id: id, propertyId, userId: req.user._id });
    if (!doc) return res.status(404).json({ success: false, message: "Comment not found" });

    await recomputePropertyAggregates(propertyId);
    return res.json({ success: true, data: { _id: id } });
  } catch (e) {
    console.error("deleteComment error:", e);
    return res.status(500).json({ success: false, message: "Failed to delete comment" });
  }
});

export default router;
// // controller/PropertyCommentsController.js
// import express from "express";
// import mongoose from "mongoose";
// import Review from "../Models/Review.js";
// import authenticateUser from "../middleware/authenticateUser.js";

// const router = express.Router();

// /** helper: recompute property aggregates (avgRating, reviewCount) */
// async function recomputePropertyAggregates(propertyId) {
//   const agg = await Review.aggregate([
//     { $match: { propertyId: new mongoose.Types.ObjectId(propertyId) } },
//     { $group: { _id: "$propertyId", reviewCount: { $sum: 1 }, avgRating: { $avg: "$rating" } } },
//   ]);

//   const { default: PropertyModel } = await import("../Models/Property.js"); // GreenRentProperty model (ESM)
//   const stat = agg[0];
//   await PropertyModel.findByIdAndUpdate(
//     propertyId,
//     {
//       $set: {
//         reviewCount: stat ? stat.reviewCount : 0,
//         avgRating: stat ? Math.round(stat.avgRating * 10) / 10 : 0,
//       },
//     },
//     { new: false }
//   );
// }

// /** ---------- GET /PropertyOperations/:propertyId/comments (Public) ---------- */
// router.get("/:propertyId/comments", async (req, res) => {
//   try {
//     const { propertyId } = req.params;
//     if (!mongoose.Types.ObjectId.isValid(propertyId)) {
//       return res.status(400).json({ success: false, message: "Invalid propertyId" });
//     }

//     const items = await Review.find({ propertyId })
//       .sort({ createdAt: -1 })
//       .populate({ path: "userId", select: "uname profilePicture" })
//       .lean();

//     return res.json({ success: true, data: items });
//   } catch (e) {
//     console.error("listComments error:", e);
//     return res.status(500).json({ success: false, message: "Failed to load comments" });
//   }
// });

// /** ---------- POST /PropertyOperations/:propertyId/comments (Auth) ---------- */
// router.post("/:propertyId/comments", authenticateUser, async (req, res) => {
//   try {
//     const { propertyId } = req.params;
//     const { text, rating } = req.body;

//     if (!mongoose.Types.ObjectId.isValid(propertyId)) {
//       return res.status(400).json({ success: false, message: "Invalid propertyId" });
//     }
//     if (!text || rating === undefined) {
//       return res.status(400).json({ success: false, message: "Text and rating are required" });
//     }
//     const r = Number(rating);
//     if (Number.isNaN(r) || r < 1 || r > 5) {
//       return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });
//     }

//     // Upsert: if user already reviewed this property, update it; else create new
//     const doc = await Review.findOneAndUpdate(
//       { propertyId, userId: req.user._id },
//       { $set: { text, rating: r }, $setOnInsert: { createdAt: new Date() } },
//       { upsert: true, new: true, runValidators: true }
//     );

//     await recomputePropertyAggregates(propertyId);

//     return res.status(201).json({ success: true, data: doc });
//   } catch (e) {
//     console.error("addComment error:", e);
//     if (e.code === 11000) {
//       return res.status(409).json({ success: false, message: "You have already reviewed this property" });
//     }
//     return res.status(500).json({ success: false, message: "Failed to add comment" });
//   }
// });

// /** ---------- PUT /PropertyOperations/:propertyId/comments/:id (Auth) ---------- */
// router.put("/:propertyId/comments/:id", authenticateUser, async (req, res) => {
//   try {
//     const { propertyId, id } = req.params;
//     const { text, rating } = req.body;

//     if (!mongoose.Types.ObjectId.isValid(propertyId) || !mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ success: false, message: "Invalid id" });
//     }

//     const update = {};
//     if (typeof text === "string") update.text = text;
//     if (rating !== undefined) {
//       const r = Number(rating);
//       if (Number.isNaN(r) || r < 1 || r > 5) {
//         return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });
//       }
//       update.rating = r;
//     }
//     update.isEdited = true;
//     update.editedAt = new Date();

//     const doc = await Review.findOneAndUpdate(
//       { _id: id, propertyId, userId: req.user._id }, // only the author can edit
//       { $set: update },
//       { new: true, runValidators: true }
//     );

//     if (!doc) return res.status(404).json({ success: false, message: "Comment not found" });

//     await recomputePropertyAggregates(propertyId);
//     return res.json({ success: true, data: doc });
//   } catch (e) {
//     console.error("editComment error:", e);
//     return res.status(500).json({ success: false, message: "Failed to edit comment" });
//   }
// });

// /** ---------- DELETE /PropertyOperations/:propertyId/comments/:id (Auth) ---------- */
// router.delete("/:propertyId/comments/:id", authenticateUser, async (req, res) => {
//   try {
//     const { propertyId, id } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(propertyId) || !mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ success: false, message: "Invalid id" });
//     }

//     const doc = await Review.findOneAndDelete({ _id: id, propertyId, userId: req.user._id });
//     if (!doc) return res.status(404).json({ success: false, message: "Comment not found" });

//     await recomputePropertyAggregates(propertyId);
//     return res.json({ success: true, data: { _id: id } });
//   } catch (e) {
//     console.error("deleteComment error:", e);
//     return res.status(500).json({ success: false, message: "Failed to delete comment" });
//   }
// });

// export default router;


// controller/ReviewOperations.js
import express from "express";
import mongoose from "mongoose";
import Review from "../Models/Review.js";
import authenticateUser from "../middleware/authenticateUser.js";

// Use global fetch (Node 18+) or polyfill if needed
// const doFetch = (...args) => (globalThis.fetch ? fetch(...args) : (await import("node-fetch")).default(...args));

async function analyzeSentiment(text) {
  try {
    const apiKey = process.env.PARALLELDOTS_KEY;
    if (!apiKey) return { provider: "None", label: "neutral", confidence: 0, score: 0 };

    const body = new URLSearchParams({ text, api_key: apiKey });
    const res = await doFetch("https://apis.paralleldots.com/v4/sentiment", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    const data = await res.json();

    // ParallelDots returns something like:
    // { sentiment: "positive"|"neutral"|"negative", confidence_score: 0.87, sentiment_score?: number }
    const label = ["positive", "neutral", "negative"].includes(data?.sentiment) ? data.sentiment : "neutral";
    const confidence = typeof data?.confidence_score === "number" ? data.confidence_score : 0;
    const score = typeof data?.sentiment_score === "number" ? data.sentiment_score : undefined;

    return { provider: "ParallelDots", label, confidence, score };
  } catch (e) {
    console.error("Sentiment error:", e);
    return { provider: "None", label: "neutral", confidence: 0, score: 0 };
  }
}

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

const router = express.Router();

/** ---------- GET /ReviewOperations/:propertyId/comments (Public) ---------- */
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

/** ---------- POST /ReviewOperations/:propertyId/comments (Auth) ---------- */
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

    const s = await analyzeSentiment(String(text));

    const doc = await Review.findOneAndUpdate(
      { propertyId, userId: req.user._id },
      {
        $set: {
          text,
          rating: r,
          "sentiment.provider": s.provider,
          "sentiment.label": s.label,
          "sentiment.confidence": s.confidence,
          ...(s.score !== undefined ? { "sentiment.score": s.score } : {}),
        },
        $setOnInsert: { createdAt: new Date() },
      },
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

/** ---------- PUT /ReviewOperations/:propertyId/comments/:id (Auth) ---------- */
router.put("/:propertyId/comments/:id", authenticateUser, async (req, res) => {
  try {
    const { propertyId, id } = req.params;
    const { text, rating } = req.body;

    if (!mongoose.Types.ObjectId.isValid(propertyId) || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid id" });
    }

    const update = {};
    if (typeof text === "string" && text.trim()) {
      update.text = text.trim();
      const s = await analyzeSentiment(update.text);
      update["sentiment.provider"] = s.provider;
      update["sentiment.label"] = s.label;
      update["sentiment.confidence"] = s.confidence;
      if (s.score !== undefined) update["sentiment.score"] = s.score;
    }
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
      { _id: id, propertyId, userId: req.user._id },
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

/** ---------- DELETE /ReviewOperations/:propertyId/comments/:id (Auth) ---------- */
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
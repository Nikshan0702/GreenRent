// controller/PropertySuggest.js
import express from "express";
import mongoose from "mongoose";
import Review from "../Models/Review.js";
import authenticateUser from "../middleware/authenticateUser.js";
const { ObjectId } = mongoose.Types;

// Lazy import to avoid circular deps on cold start
async function getPropertyModel() {
  const { default: PropertyModel } = await import("../Models/Property.js");
  return PropertyModel;
}

/**
 * Suggest properties based on aggregated review sentiment + ratings.
 * Query params (all optional):
 *  - minSentiment: number (default 0.2)  // avg of sentiment.score ∈ [-1,1]
 *  - minRating:   number (default 0)     // avg rating (1..5)
 *  - type:        string                 // propertyType filter
 *  - maxPrice:    number                 // rentPrice <= maxPrice
 *  - q:           string                 // search in title/description/address
 *  - page:        number (default 1)
 *  - limit:       number (default 16)
 */
const router = express.Router();

router.get("/suggest", async (req, res) => {
  try {
    const page  = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || "16", 10), 1), 50);
    const skip  = (page - 1) * limit;

    const minSentiment = typeof req.query.minSentiment !== "undefined"
      ? Number(req.query.minSentiment) : 0.2;
    const minRating = typeof req.query.minRating !== "undefined"
      ? Number(req.query.minRating) : 0;

    const type     = (req.query.type || "").trim();
    const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : undefined;
    const q        = (req.query.q || "").trim();

    // Aggregate reviews -> sentimentAvg, reviewCount, avgRating per property
    const matchBase = {}; // (could filter reviews timeframe here if needed)
    const grouped = await Review.aggregate([
      { $match: matchBase },
      {
        $group: {
          _id: "$propertyId",
          reviewCount: { $sum: 1 },
          avgRating: { $avg: "$rating" },
          sentimentAvg: { $avg: "$sentiment.score" }, // may be null if missing
          lastReviewAt: { $max: "$updatedAt" },
        }
      },
      // Apply sentiment / rating thresholds
      {
        $match: {
          $and: [
            // keep null-safe comparisons (treat null as -Infinity)
            { $expr: { $gte: [ { $ifNull: ["$sentimentAvg", -999] }, minSentiment ] } },
            { $expr: { $gte: [ { $ifNull: ["$avgRating",   0] }, minRating ] } },
          ]
        }
      },
      // Join property docs
      {
        $lookup: {
          from: "greenrentproperties", // collection name (lowercase plural of model)
          localField: "_id",
          foreignField: "_id",
          as: "property"
        }
      },
      { $unwind: "$property" },
      // Property-side filters: status/type/price/q
      {
        $match: {
          "property.status": "active",
          ...(type ? { "property.propertyType": type } : {}),
          ...(Number.isFinite(maxPrice) ? { "property.rentPrice": { $lte: maxPrice } } : {}),
          ...(q ? {
            $or: [
              { "property.title":       { $regex: q, $options: "i" } },
              { "property.description": { $regex: q, $options: "i" } },
              { "property.address":     { $regex: q, $options: "i" } },
            ]
          } : {})
        }
      },
      // Sort: by sentimentAvg desc, then avgRating desc, then newest property
      {
        $sort: {
          sentimentAvg: -1,
          avgRating: -1,
          "property.createdAt": -1,
        }
      },
      {
        $facet: {
          items: [
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                _id: 0,
                property: 1,
                reviewCount: 1,
                avgRating: { $round: ["$avgRating", 1] },
                sentimentAvg: { $round: ["$sentimentAvg", 3] },
                lastReviewAt: 1,
              }
            }
          ],
          total: [{ $count: "count" }]
        }
      }
    ]);

    const facet = grouped[0] || { items: [], total: [] };
    const items = (facet.items || []).map(x => ({
      ...x.property,
      reviewCount: x.reviewCount,
      avgRating: x.avgRating,
      sentimentAvg: x.sentimentAvg,
      lastReviewAt: x.lastReviewAt,
    }));
    const total = facet.total[0]?.count || 0;

    // If no reviews matched (e.g., fresh system), optionally fallback to active properties
    if (!total) {
      const PropertyModel = await getPropertyModel();
      const fallbackFilter = {
        status: "active",
        ...(type ? { propertyType: type } : {}),
        ...(Number.isFinite(maxPrice) ? { rentPrice: { $lte: maxPrice } } : {}),
        ...(q ? {
          $or: [
            { title:       { $regex: q, $options: "i" } },
            { description: { $regex: q, $options: "i" } },
            { address:     { $regex: q, $options: "i" } },
          ]
        } : {}),
      };
      const [fallback, cnt] = await Promise.all([
        PropertyModel.find(fallbackFilter)
          .sort({ createdAt: -1 })
          .skip(skip).limit(limit).lean(),
        PropertyModel.countDocuments(fallbackFilter),
      ]);
      return res.json({
        success: true,
        data: fallback.map(p => ({ ...p, avgRating: p.avgRating ?? 0, reviewCount: p.reviewCount ?? 0 })),
        page, limit, total: cnt, pages: Math.ceil(cnt / limit),
      });
    }

    return res.json({
      success: true,
      data: items,
      page, limit, total, pages: Math.ceil(total / limit),
    });

  } catch (err) {
    console.error("suggest error:", err);
    return res.status(500).json({ success: false, message: "Failed to suggest properties" });
  }
});

export default router;
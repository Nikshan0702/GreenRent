import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import PropertyModel from "../Models/Property.js";
import UserModel from "../Models/User.js";
import authenticateUser from "../middleware/authenticateUser.js";
const router = express.Router();


router.get("/locationsuggestions", async (req, res) => {
  try {
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);
    const maxDistance = Number(req.query.maxDistance || 5000); // meters
    const limit = Math.min(Number(req.query.limit || 50), 100);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return res.status(400).json({ success: false, message: "lat and lng are required numbers" });
    }

    const nearPoint = { type: "Point", coordinates: [lng, lat] };

    const results = await PropertyModel.aggregate([
      {
        $geoNear: {
          near: nearPoint,
          distanceField: "distanceMeters",
          spherical: true,
          maxDistance,
          query: { status: "active" },
          key: "location",
        },
      },
      {
        $project: {
          title: 1,
          address: 1,
          rentPrice: 1,
          photos: 1,      // support either photos[] or images[]
          images: 1,
          location: 1,
          ecoBadge: 1,
          propertyType: 1,
          createdAt: 1,
          distanceMeters: 1,
        },
      },
      { $sort: { distanceMeters: 1 } },
      { $limit: limit },
    ]);

    const data = results.map((p) => {
      const firstUrl =
        (Array.isArray(p.photos) && p.photos[0]?.url) ||
        (Array.isArray(p.images) && p.images[0]?.url) ||
        null;

      return {
        _id: p._id,
        title: p.title,
        address: p.address,
        rentPrice: p.rentPrice,
        location: p.location,
        ecoBadge: p.ecoBadge,
        propertyType: p.propertyType,
        imageUrl: firstUrl,
        distanceMeters: Math.round(p.distanceMeters),
        createdAt: p.createdAt,
      };
    });

    return res.json({ success: true, data });
  } catch (err) {
    console.error("Nearby suggestions error:", err);
    return res.status(500).json({
      success: false,
      message: err?.message || "Failed to load nearby apartments",
    });
  }
});

/** Keep this AFTER /locationsuggestions. No inline RegExp; validate inside. */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid id" });
    }

    const property = await PropertyModel.findById(id);
    if (!property) {
      return res.status(404).json({ success: false, message: "Property not found" });
    }

    return res.json({ success: true, data: property });
  } catch (e) {
    console.error("Property fetch error:", e);
    return res.status(500).json({ success: false, message: "Failed to load property" });
  }
});


/** ---------- GET /PropertyOperations/suggest (MUST be mounted before :id) ---------- */
router.get("/suggest", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 16,
      q = "",
      minSentiment = 0.2, // default threshold
      maxPrice,
      type,
      minRating,
    } = req.query;

    const filter = { status: "active" };

    if (type) filter.propertyType = type;
    if (maxPrice) filter.rentPrice = { ...(filter.rentPrice || {}), $lte: Number(maxPrice) };
    if (minRating) filter.avgRating = { $gte: Number(minRating) };

    if (q) {
      filter.$or = [
        { title:        { $regex: q, $options: "i" } },
        { address:      { $regex: q, $options: "i" } },
        { locationName: { $regex: q, $options: "i" } },
      ];
    }

    // Positive community sentiment
    const sentimentThreshold = Number(minSentiment) || 0.2;
    filter.sentimentAvg = { $gte: sentimentThreshold }; // ensure you maintain this on Property docs

    const skip = (Number(page) - 1) * Number(limit);

    const [items, total] = await Promise.all([
      PropertyModel.find(filter)
        .sort({ sentimentAvg: -1, avgRating: -1, createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      PropertyModel.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      data: items,
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    console.error("Suggest list error:", err);
    return res.status(500).json({ success: false, message: "Error retrieving suggestions" });
  }
});

/** Optional: guard route if you also put :id here (but usually it lives in another router) */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid id" });
    }

    const item = await PropertyModel.findById(id)
      .populate("ownerId", "uname email number")
      .lean();

    if (!item) return res.status(404).json({ success: false, message: "Not found" });

    const owner = item.ownerId
      ? { name: item.ownerId.uname, email: item.ownerId.email, phone: item.ownerId.number }
      : {};

    return res.json({ success: true, data: { ...item, owner } });
  } catch (e) {
    console.error("Fetch by id failed:", e);
    return res.status(500).json({ success: false, message: "Fetch failed" });
  }
});



export default router;


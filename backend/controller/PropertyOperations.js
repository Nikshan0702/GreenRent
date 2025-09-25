// import express from "express";
// import multer from "multer";
// import path from "path";
// import fs from "fs";
// import mongoose from "mongoose";
// import PropertyModel from "../Models/Property.js";
// import UserModel from "../Models/User.js";

// const router = express.Router();


// const authenticateUser = async (req, res, next) => {
//   try {
//     const authHeader = req.headers.authorization;
//     if (!authHeader?.startsWith('Bearer ')) {
//       return res.status(401).json({ success: false, message: 'Authorization token required' });
//     }

//     const token = authHeader.split(' ')[1];
//     const decoded = jwt.verify(token, JWT_SECRET_KEY);

//     const user = await UserModel.findById(decoded.userId);
//     if (!user) {
//       return res.status(401).json({ success: false, message: 'User not found' });
//     }

//     req.user = user;
//     next();
//   } catch (err) {
//     console.error('Authentication error:', err);
//     const message =
//       err.name === 'TokenExpiredError' ? 'Token expired' :
//       err.name === 'JsonWebTokenError' ? 'Invalid token' : 'Invalid token';
//     res.status(401).json({ success: false, message });
//   }
// };

// // ensure upload dir
// const uploadDir = "uploads/properties/";
// if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, uploadDir),
//   filename: (req, file, cb) => {
//     const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(null, file.fieldname + "-" + unique + path.extname(file.originalname));
//   },
// });

// const fileFilter = (req, file, cb) => {
//   if (file.mimetype.startsWith("image/")) cb(null, true);
//   else cb(new Error("Only image files are allowed"), false);
// };

// const upload = multer({
//   storage,
//   fileFilter,
//   limits: { fileSize: 10 * 1024 * 1024 },
// });

// // images only (no certificate)
// const uploadMiddleware = upload.fields([{ name: "images", maxCount: 12 }]);

// router.post("/AddProp", uploadMiddleware, async (req, res) => {
//   try {
//     const { title, description, address, lat, lng, rentPrice, propertyType, ownerId } = req.body;

//     // validate basics
//     if (!title || !description || !address || !lat || !lng || !rentPrice || !propertyType || !ownerId) {
//       return res.status(400).json({ success: false, message: "All required fields must be provided" });
//     }

//     if (!mongoose.Types.ObjectId.isValid(ownerId)) {
//       return res.status(400).json({ success: false, message: "Invalid ownerId format" });
//     }

//     const latitude = parseFloat(lat);
//     const longitude = parseFloat(lng);
//     if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
//       return res.status(400).json({ success: false, message: "Invalid coordinates format" });
//     }

//     const price = parseFloat(rentPrice);
//     if (Number.isNaN(price) || price < 0) {
//       return res.status(400).json({ success: false, message: "Invalid rent price" });
//     }

//     const validPropertyTypes = ["Apartment", "House", "Studio", "Villa", "Townhouse"];
//     if (!validPropertyTypes.includes(propertyType)) {
//       return res.status(400).json({ success: false, message: "Invalid property type" });
//     }

//     const owner = await UserModel.findById(ownerId);
//     if (!owner) return res.status(404).json({ success: false, message: "Owner not found" });

//     // images
//     const images = (req.files?.images || []).map(f => ({
//       url: f.path,
//       filename: f.filename,
//       uploadedAt: new Date(),
//     }));
//     if (!images.length) {
//       return res.status(400).json({ success: false, message: "At least one property image is required" });
//     }

//     // eco fields are OPTIONAL now — accept if present, ignore if not
//     let ecoFeaturesArray = [];
//     const validEcoFeatures = ["solarPanels", "recycling", "energyRating", "insulation", "greyWater"];
//     if (req.body?.ecoFeatures) {
//       try {
//         ecoFeaturesArray = typeof req.body.ecoFeatures === "string"
//           ? JSON.parse(req.body.ecoFeatures)
//           : req.body.ecoFeatures;
//       } catch {
//         return res.status(400).json({ success: false, message: "Invalid eco features format" });
//       }
//       if (ecoFeaturesArray.some(f => !validEcoFeatures.includes(f))) {
//         return res.status(400).json({ success: false, message: "Invalid eco features" });
//       }
//     }
//     const ecoRating = req.body?.ecoRating || undefined; // optional

//     const property = await PropertyModel.create({
//       title: title.trim(),
//       description: description.trim(),
//       address: address.trim(),
//       location: { type: "Point", coordinates: [longitude, latitude] }, // [lng, lat]
//       rentPrice: price,
//       propertyType,
//       ownerId,
//       // Optional eco
//       ecoFeatures: ecoFeaturesArray.length ? ecoFeaturesArray : undefined,
//       ecoRating, // may be undefined
//       images,
//       // certificate: not used in this route now
//       status: "active",
//       contactInfo: { phone: owner.number || null, email: owner.email },
//     });

//     await property.populate("ownerId", "uname email number");
//     return res.status(201).json({
//       success: true,
//       message: "Property added successfully",
//       data: { property: property.toJSON() },
//     });
//   } catch (err) {
//     console.error("Property addition error:", err);

//     // Cleanup on failure
//     if (req.files) {
//       Object.values(req.files).flat().forEach(f => {
//         try { fs.existsSync(f.path) && fs.unlinkSync(f.path); } catch {}
//       });
//     }

//     if (err?.name === "ValidationError") {
//       return res.status(400).json({ success: false, message: Object.values(err.errors).map(e => e.message).join(", ") });
//     }
//     if (err?.code === 11000) {
//       return res.status(409).json({ success: false, message: "Property already exists" });
//     }
//     return res.status(500).json({ success: false, message: "Property addition failed" });
//   }
// });

// router.get("/owner/:ownerId", authenticateUser, async (req, res) => {
//   try {
//     const { ownerId } = req.params;
//     if (!mongoose.Types.ObjectId.isValid(ownerId)) {
//       return res.status(400).json({ success: false, message: "Invalid ownerId" });
//     }

//     // Only allow if admin OR requesting own items
//     if (!req.user.isAdmin && String(req.user._id) !== String(ownerId)) {
//       return res.status(403).json({ success: false, message: "Unauthorized" });
//     }

//     const { page = 1, limit = 20, status } = req.query;

//     const filter = { ownerId };
//     if (status) filter.status = status;

//     const skip = (Number(page) - 1) * Number(limit);

//     const [items, total] = await Promise.all([
//       PropertyModel.find(filter)
//         .sort({ createdAt: -1 })
//         .skip(skip)
//         .limit(Number(limit))
//         .lean(),
//       PropertyModel.countDocuments(filter),
//     ]);

//     res.json({
//       success: true,
//       data: items,
//       page: Number(page),
//       limit: Number(limit),
//       total,
//       pages: Math.ceil(total / Number(limit)),
//     });
//   } catch (err) {
//     console.error("Get owner properties error:", err);
//     res.status(500).json({ success: false, message: "Error retrieving owner properties" });
//   }
// });

// router.get("/list", async (req, res) => {
//   try {
//     const {
//       page = 1,
//       limit = 20,
//       status = "active",
//       type,
//       minPrice,
//       maxPrice,
//       q,
//     } = req.query;

//     const filter = {};
//     if (status) filter.status = status;
//     if (type) filter.propertyType = type;

//     if (minPrice || maxPrice) {
//       filter.rentPrice = {};
//       if (minPrice) filter.rentPrice.$gte = Number(minPrice);
//       if (maxPrice) filter.rentPrice.$lte = Number(maxPrice);
//     }

//     if (q) {
//       filter.$or = [
//         { title: { $regex: q, $options: "i" } },
//         { description: { $regex: q, $options: "i" } },
//         { address: { $regex: q, $options: "i" } },
//       ];
//     }

//     const skip = (Number(page) - 1) * Number(limit);

//     const [items, total] = await Promise.all([
//       PropertyModel.find(filter)
//         .populate("ownerId", "uname email number")
//         .sort({ createdAt: -1 })
//         .skip(skip)
//         .limit(Number(limit))
//         .lean(),
//       PropertyModel.countDocuments(filter),
//     ]);

//     res.json({
//       success: true,
//       data: items,
//       page: Number(page),
//       limit: Number(limit),
//       total,
//       pages: Math.ceil(total / Number(limit)),
//     });
//   } catch (err) {
//     console.error("Public list properties error:", err);
//     res.status(500).json({ success: false, message: "Error retrieving properties" });
//   }
// });


// // in backend/controller/PropertyOperations.js
// router.get('/:id', async (req, res) => {
//   try {
//     const item = await PropertyModel.findById(req.params.id)
//       .populate('ownerId', 'uname email number')
//       .lean();
//     if (!item) return res.status(404).json({ success: false, message: 'Not found' });

//     // normalize owner for app
//     const owner = item.ownerId ? {
//       name: item.ownerId.uname,
//       email: item.ownerId.email,
//       phone: item.ownerId.number,
//     } : {};

//     res.json({ success: true, data: { ...item, owner } });
//   } catch (e) {
//     res.status(500).json({ success: false, message: 'Fetch failed' });
//   }
// });
// export default router;



// backend/controller/PropertyOperations.js
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
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || "dev-secret";

// --- Auth middleware ---
// const authenticateUser = async (req, res, next) => {
//   try {
//     const authHeader = req.headers.authorization;
//     if (!authHeader?.startsWith('Bearer ')) {
//       return res.status(401).json({ success: false, message: 'Authorization token required' });
//     }
//     const token = authHeader.split(' ')[1];
//     const decoded = jwt.verify(token, JWT_SECRET_KEY);

//     const user = await UserModel.findById(decoded.userId);
//     if (!user) {
//       return res.status(401).json({ success: false, message: 'User not found' });
//     }
//     req.user = user;
//     next();
//   } catch (err) {
//     console.error('Authentication error:', err);
//     const message =
//       err.name === 'TokenExpiredError' ? 'Token expired' :
//       err.name === 'JsonWebTokenError' ? 'Invalid token' : 'Invalid token';
//     res.status(401).json({ success: false, message });
//   }
// };

// --- Multer setup (images only) ---
const uploadDir = "uploads/properties/";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + unique + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new Error("Only image files are allowed"), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

const uploadMiddleware = upload.fields([{ name: "images", maxCount: 12 }]);

// --- Add property ---
router.post("/AddProp", uploadMiddleware, async (req, res) => {
  try {
    const { title, description, address, lat, lng, rentPrice, propertyType, ownerId } = req.body;

    // validate basics
    if (!title || !description || !address || !lat || !lng || !rentPrice || !propertyType || !ownerId) {
      return res.status(400).json({ success: false, message: "All required fields must be provided" });
    }

    if (!mongoose.Types.ObjectId.isValid(ownerId)) {
      return res.status(400).json({ success: false, message: "Invalid ownerId format" });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      return res.status(400).json({ success: false, message: "Invalid coordinates format" });
    }

    const price = parseFloat(rentPrice);
    if (Number.isNaN(price) || price < 0) {
      return res.status(400).json({ success: false, message: "Invalid rent price" });
    }

    const validPropertyTypes = ["Apartment", "House", "Studio", "Villa", "Townhouse"];
    if (!validPropertyTypes.includes(propertyType)) {
      return res.status(400).json({ success: false, message: "Invalid property type" });
    }

    const owner = await UserModel.findById(ownerId);
    if (!owner) return res.status(404).json({ success: false, message: "Owner not found" });

    // images
    const images = (req.files?.images || []).map(f => ({
      url: f.path.replace(/\\/g, '/'),
      filename: f.filename,
      uploadedAt: new Date(),
    }));
    if (!images.length) {
      return res.status(400).json({ success: false, message: "At least one property image is required" });
    }

    // eco fields are OPTIONAL
    let ecoFeaturesArray = [];
    const validEcoFeatures = ["solarPanels", "recycling", "energyRating", "insulation", "greyWater"];
    if (req.body?.ecoFeatures) {
      try {
        ecoFeaturesArray = typeof req.body.ecoFeatures === "string"
          ? JSON.parse(req.body.ecoFeatures)
          : req.body.ecoFeatures;
      } catch {
        return res.status(400).json({ success: false, message: "Invalid eco features format" });
      }
      if (ecoFeaturesArray.some(f => !validEcoFeatures.includes(f))) {
        return res.status(400).json({ success: false, message: "Invalid eco features" });
      }
    }
    const ecoRating = req.body?.ecoRating || undefined;

    const property = await PropertyModel.create({
      title: title.trim(),
      description: description.trim(),
      address: address.trim(),
      location: { type: "Point", coordinates: [longitude, latitude] }, // [lng, lat]
      rentPrice: price,
      propertyType,
      ownerId,
      ecoFeatures: ecoFeaturesArray.length ? ecoFeaturesArray : undefined,
      ecoRating, // may be undefined
      images,
      status: "active",
      contactInfo: { phone: owner.number || null, email: owner.email },
    });

    await property.populate("ownerId", "uname email number");
    return res.status(201).json({
      success: true,
      message: "Property added successfully",
      data: { property: property.toJSON() },
    });
  } catch (err) {
    console.error("Property addition error:", err);

    // Cleanup on failure
    if (req.files) {
      Object.values(req.files).flat().forEach(f => {
        try { fs.existsSync(f.path) && fs.unlinkSync(f.path); } catch {}
      });
    }

    if (err?.name === "ValidationError") {
      return res.status(400).json({ success: false, message: Object.values(err.errors).map(e => e.message).join(", ") });
    }
    if (err?.code === 11000) {
      return res.status(409).json({ success: false, message: "Property already exists" });
    }
    return res.status(500).json({ success: false, message: "Property addition failed" });
  }
});

// --- Get properties for owner (auth) ---
router.get("/owner/:ownerId", authenticateUser, async (req, res) => {
  try {
    const { ownerId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(ownerId)) {
      return res.status(400).json({ success: false, message: "Invalid ownerId" });
    }

    // Only allow if admin OR requesting own items
    if (!req.user.isAdmin && String(req.user._id) !== String(ownerId)) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const { page = 1, limit = 20, status } = req.query;

    const filter = { ownerId };
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const [items, total] = await Promise.all([
      PropertyModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      PropertyModel.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: items,
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    console.error("Get owner properties error:", err);
    res.status(500).json({ success: false, message: "Error retrieving owner properties" });
  }
});

// --- Public list ---
router.get("/list", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status = "active",
      type,
      minPrice,
      maxPrice,
      q,
    } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (type) filter.propertyType = type;

    if (minPrice || maxPrice) {
      filter.rentPrice = {};
      if (minPrice) filter.rentPrice.$gte = Number(minPrice);
      if (maxPrice) filter.rentPrice.$lte = Number(maxPrice);
    }

    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { address: { $regex: q, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [items, total] = await Promise.all([
      PropertyModel.find(filter)
        .populate("ownerId", "uname email number")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      PropertyModel.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: items,
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    console.error("Public list properties error:", err);
    res.status(500).json({ success: false, message: "Error retrieving properties" });
  }
});

// --- Get by id ---
router.get('/:id', async (req, res) => {
  try {
    const item = await PropertyModel.findById(req.params.id)
      .populate('ownerId', 'uname email number')
      .lean();
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });

    // normalize owner for app
    const owner = item.ownerId ? {
      name: item.ownerId.uname,
      email: item.ownerId.email,
      phone: item.ownerId.number,
    } : {};

    res.json({ success: true, data: { ...item, owner } });
  } catch (e) {
    console.error('Fetch by id failed:', e);
    res.status(500).json({ success: false, message: 'Fetch failed' });
  }
});

router.get("/suggestions", async (req, res) => {
  try {
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);
    const maxDistance = Number(req.query.maxDistance || 5000); // in meters
    const limit = Math.min(Number(req.query.limit || 50), 100);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return res.status(400).json({
        success: false,
        message: "lat and lng are required numbers",
      });
    }

    const geo = { type: "Point", coordinates: [lng, lat] };

    const results = await PropertyModel.aggregate([
      {
        $geoNear: {
          near: geo,
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

    const data = results.map((p) => ({
      _id: p._id,
      title: p.title,
      address: p.address,
      rentPrice: p.rentPrice,
      location: p.location,
      ecoBadge: p.ecoBadge,
      propertyType: p.propertyType,
      imageUrl: p?.images?.[0]?.url || null,
      distanceMeters: Math.round(p.distanceMeters),
      createdAt: p.createdAt,
    }));

    return res.json({ success: true, data });
  } catch (err) {
    console.error("Nearby suggestions error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to load nearby apartments" });
  }
});

/**
 * Get property by ID
 * IMPORTANT: keep this AFTER /suggestions
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid property ID" });
    }

    const item = await PropertyModel.findById(id)
      .populate("ownerId", "uname email number")
      .lean();

    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Property not found" });
    }

    const owner = item.ownerId
      ? {
          name: item.ownerId.uname,
          email: item.ownerId.email,
          phone: item.ownerId.number,
        }
      : {};

    res.json({ success: true, data: { ...item, owner } });
  } catch (e) {
    console.error("Fetch by id failed:", e);
    res.status(500).json({ success: false, message: "Fetch failed" });
  }
});

export default router;
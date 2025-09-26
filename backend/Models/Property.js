
// import mongoose from "mongoose";

// function computeEcoBadgeFromFeatures(ecoFeatures = []) {
//   if (!Array.isArray(ecoFeatures)) return 'Unverified';
//   const count = ecoFeatures.length;
//   if (ecoFeatures.includes('solarPanels') && ecoFeatures.includes('energyRating') && count >= 4) {
//     return 'Platinum';
//   }
//   if (count >= 3) return 'Gold';
//   if (count >= 2) return 'Silver';
//   if (count >= 1) return 'Bronze';
//   return 'Unverified';
// }

// const EcoCertificateSchema = new mongoose.Schema({
//   filePath: String,
//   ocrText: String,
//   issuer: String,
//   certId: String,
//   issueDate: String,
//   validUntil: String,
//   ratingRaw: String,
//   parsedAt: { type: Date, default: Date.now },
//   confidence: Number,
// }, { _id: false });

// const PropertySchema = new mongoose.Schema(
//   {
//     title: { type: String, required: true, trim: true, maxlength: 100 },
//     description: { type: String, required: true, trim: true, maxlength: 1000 },
//     address: { type: String, required: true, trim: true },
//     location: {
//       type: { type: String, enum: ["Point"], default: "Point" },
//       coordinates: { type: [Number], required: true }
//     },
//     rentPrice: { type: Number, required: true, min: 0 },
//     propertyType: { type: String, required: true, enum: ["Apartment", "House", "Studio", "Villa", "Townhouse"] },
//     ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "GreenRentUser", required: true },

//     ecoFeatures: [{ type: String, enum: ["solarPanels", "recycling", "energyRating", "insulation", "greyWater"] }],
//     ecoRating: { type: String, enum: ["A+", "A", "B", "C"], required: false },

//     ecoBadge: {
//       type: String,
//       enum: ["Platinum", "Gold", "Silver", "Bronze", "Unverified"],
//       default: "Unverified",
//     },
//     ecoCertificate: { type: EcoCertificateSchema, required: false },

//     images: [{
//       url: { type: String, required: true },
//       filename: { type: String, required: true },
//       uploadedAt: { type: Date, default: Date.now }
//     }],

//     certificate: {
//       url: String,
//       filename: String,
//       originalName: String,
//       uploadedAt: { type: Date, default: Date.now }
//     },

//     status: { type: String, enum: ["active", "inactive", "pending", "rented"], default: "active" },
//     isFeatured: { type: Boolean, default: false },
//     views: { type: Number, default: 0 },
//     contactInfo: { phone: String, email: String },
//     availability: { type: Date, default: Date.now },
//     leaseTerms: {
//       minLease: { type: Number, default: 12 },
//       securityDeposit: Number,
//       utilitiesIncluded: { type: Boolean, default: false }
//     }
//   },
//   { timestamps: true }
// );

// PropertySchema.index({ location: "2dsphere" });

// PropertySchema.statics.computeEcoBadgeFromFeatures = computeEcoBadgeFromFeatures;

// PropertySchema.pre('save', function (next) {
//   if (this.isModified('ecoFeatures')) {
//     this.ecoBadge = computeEcoBadgeFromFeatures(this.ecoFeatures);
//   }
//   next();
// });

// PropertySchema.pre('findOneAndUpdate', function (next) {
//   const update = this.getUpdate() || {};
//   const set = update.$set || update;
//   if (set && Object.prototype.hasOwnProperty.call(set, 'ecoFeatures')) {
//     const nextFeatures = set.ecoFeatures;
//     const badge = computeEcoBadgeFromFeatures(nextFeatures);
//     if (!update.$set) update.$set = {};
//     update.$set.ecoBadge = badge;
//     this.setUpdate(update);
//   }
//   next();
// });

// const PropertyModel =
//   mongoose.models.GreenRentProperty || mongoose.model("GreenRentProperty", PropertySchema);

// export default PropertyModel;
// export { computeEcoBadgeFromFeatures };

import mongoose from "mongoose";

/** ───────────────────────────────────────────────────────────────
 *  Feature score & badge helpers
 *  - ecoScore: simple count of ecoFeatures (0–5)
 *  - ecoBadge: comes from certificate if present; otherwise map score
 *  ─────────────────────────────────────────────────────────────── */
export function computeEcoScore(ecoFeatures = []) {
  return Array.isArray(ecoFeatures) ? ecoFeatures.length : 0;
}

const BADGE_ORDER = ["Unverified", "Bronze", "Silver", "Gold", "Platinum"];

export function computeEcoBadgeFromScore(score = 0) {
  if (score >= 4) return "Gold";
  if (score >= 2) return "Silver";
  if (score >= 1) return "Bronze";
  return "Unverified";
}

/** Combine eco features + certificate badge
 *  - If certificate badge exists & is not Unverified -> use it
 *  - otherwise fallback to badge from ecoScore
 */
export function computeCompositeBadge(ecoFeatures = [], certBadge = "Unverified") {
  if (certBadge && certBadge !== "Unverified") return certBadge;
  const score = computeEcoScore(ecoFeatures);
  return computeEcoBadgeFromScore(score);
}

/** Legacy “from features only” badge if you still need it elsewhere */
export function computeEcoBadgeFromFeatures(ecoFeatures = []) {
  const score = computeEcoScore(ecoFeatures);
  return computeEcoBadgeFromScore(score);
}

const EcoCertificateSchema = new mongoose.Schema(
  {
    filePath: String,
    ocrText: String,
    issuer: String,
    certId: String,
    issueDate: String,   // YYYY-MM-DD
    validUntil: String,  // YYYY-MM-DD
    ratingRaw: String,
    badge: {
      type: String,
      enum: ["Platinum", "Gold", "Silver", "Bronze", "Unverified"],
      default: "Unverified",
    },
    parsedAt: { type: Date, default: Date.now },
    confidence: Number,
  },
  { _id: false }
);

const PropertySchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, "Title is required"], trim: true, maxlength: [100, "Title cannot exceed 100 characters"] },
    description: { type: String, required: [true, "Description is required"], trim: true, maxlength: [1000, "Description cannot exceed 1000 characters"] },
    address: { type: String, required: [true, "Address is required"], trim: true },

    // GeoJSON
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: [true, "Coordinates are required"] } // [lng, lat]
    },

    rentPrice: { type: Number, required: [true, "Rent price is required"], min: [0, "Rent price cannot be negative"] },
    propertyType: { type: String, required: [true, "Property type is required"], enum: ["Apartment", "House", "Studio", "Villa", "Townhouse"] },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "GreenRentUser", required: [true, "Owner ID is required"] },

    // Eco (manual flags set by owner)
    ecoFeatures: [{ type: String, enum: ["solarPanels", "recycling", "energyRating", "insulation", "greyWater"] }],
    ecoScore: { type: Number, default: 0 }, // derived from ecoFeatures

    // OCR-based verification (from uploaded cert)
    ecoCertificate: { type: EcoCertificateSchema, required: false },

    // Display badge (composite)
    ecoBadge: {
      type: String,
      enum: ["Platinum", "Gold", "Silver", "Bronze", "Unverified"],
      default: "Unverified",
    },

    images: [{
      url: { type: String, required: true },
      filename: { type: String, required: true },
      uploadedAt: { type: Date, default: Date.now }
    }],

    certificate: { // legacy manual
      url: String,
      filename: String,
      originalName: String,
      uploadedAt: { type: Date, default: Date.now }
    },

    status: { type: String, enum: ["active", "inactive", "pending", "rented"], default: "active" },
    isFeatured: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
    contactInfo: { phone: String, email: String },
    availability: { type: Date, default: Date.now },
    leaseTerms: {
      minLease: { type: Number, default: 12 },
      securityDeposit: Number,
      utilitiesIncluded: { type: Boolean, default: false }
    }
  },
  { timestamps: true }
);

PropertySchema.index({ location: "2dsphere" });

/** Methods & statics */
PropertySchema.methods.incrementViews = function () {
  this.views += 1;
  return this.save();
};

PropertySchema.statics.findNearby = function (coordinates, maxDistance = 10000) {
  return this.find({
    location: {
      $near: {
        $geometry: { type: "Point", coordinates },
        $maxDistance: maxDistance
      }
    },
    status: "active"
  });
};

PropertySchema.statics.computeEcoScore = computeEcoScore;
PropertySchema.statics.computeEcoBadgeFromFeatures = computeEcoBadgeFromFeatures;
PropertySchema.statics.computeCompositeBadge = computeCompositeBadge;

/** Keep ecoScore & ecoBadge in sync when features or cert change */
PropertySchema.pre("save", function (next) {
  if (this.isModified("ecoFeatures") || this.isModified("ecoCertificate")) {
    this.ecoScore = computeEcoScore(this.ecoFeatures);
    const certBadge = this.ecoCertificate?.badge || "Unverified";
    this.ecoBadge = computeCompositeBadge(this.ecoFeatures, certBadge);
  }
  next();
});

PropertySchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate() || {};
  const set = update.$set || update;

  let nextFeatures = undefined;
  let nextCertBadge = undefined;

  if (set && Object.prototype.hasOwnProperty.call(set, "ecoFeatures")) {
    nextFeatures = set.ecoFeatures;
    const nextScore = computeEcoScore(nextFeatures);
    if (!update.$set) update.$set = {};
    update.$set.ecoScore = nextScore;
  }

  if (set && Object.prototype.hasOwnProperty.call(set, "ecoCertificate")) {
    nextCertBadge = set.ecoCertificate?.badge || "Unverified";
  }

  if (nextFeatures !== undefined || nextCertBadge !== undefined) {
    // For composite badge we need both – get current values if not set
    const current = this.getQuery(); // only id/filters here
    // We can't read doc here safely; compute from what we know:
    const finalFeatures = nextFeatures !== undefined ? nextFeatures : undefined;
    const finalCertBadge =
      nextCertBadge !== undefined ? nextCertBadge : (set?.ecoCertificate?.badge || "Unverified");

    // If features not provided in this update, do a conservative compute:
    const composite = computeCompositeBadge(finalFeatures || [], finalCertBadge);
    if (!update.$set) update.$set = {};
    update.$set.ecoBadge = composite;
  }

  this.setUpdate(update);
  next();
});

/** Clean JSON */
PropertySchema.methods.toJSON = function () {
  const property = this.toObject();
  delete property.__v;
  return property;
};

const PropertyModel =
  mongoose.models.GreenRentProperty || mongoose.model("GreenRentProperty", PropertySchema);

export default PropertyModel;
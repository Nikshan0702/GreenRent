import mongoose from "mongoose";

/** ───────────────────────────────────────────────────────────────
 *  Badge computation from selected ecoFeatures
 *  Adjust the rules as you like.
 *  Exposed on the model as: PropertyModel.computeEcoBadgeFromFeatures
 *  ─────────────────────────────────────────────────────────────── */
function computeEcoBadgeFromFeatures(ecoFeatures = []) {
  if (!Array.isArray(ecoFeatures)) return 'Unverified';

  const count = ecoFeatures.length;

  // Example rule: higher badge if solar + energyRating present and rich set
  if (ecoFeatures.includes('solarPanels') && ecoFeatures.includes('energyRating') && count >= 4) {
    return 'Platinum';
  }
  if (count >= 3) return 'Gold';
  if (count >= 2) return 'Silver';
  if (count >= 1) return 'Bronze';
  return 'Unverified';
}

const EcoCertificateSchema = new mongoose.Schema({
  filePath: String,
  ocrText: String,
  issuer: String,
  certId: String,
  issueDate: String,   // parsed YYYY-MM-DD
  validUntil: String,  // parsed YYYY-MM-DD
  ratingRaw: String,
  parsedAt: { type: Date, default: Date.now },
  confidence: Number,
}, { _id: false });

const PropertySchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, "Title is required"], trim: true, maxlength: [100, "Title cannot exceed 100 characters"] },
    description: { type: String, required: [true, "Description is required"], trim: true, maxlength: [1000, "Description cannot exceed 1000 characters"] },
    address: { type: String, required: [true, "Address is required"], trim: true },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: [true, "Coordinates are required"] } // [lng, lat]
    },
    rentPrice: { type: Number, required: [true, "Rent price is required"], min: [0, "Rent price cannot be negative"] },
    propertyType: { type: String, required: [true, "Property type is required"], enum: ["Apartment", "House", "Studio", "Villa", "Townhouse"] },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "GreenRentUser", required: [true, "Owner ID is required"] },

    // Eco (manual flags set by owner)
    ecoFeatures: [{ type: String, enum: ["solarPanels", "recycling", "energyRating", "insulation", "greyWater"] }],
    ecoRating: { type: String, enum: ["A+", "A", "B", "C"], required: false },

    // OCR-based verification (from uploaded cert)
    ecoBadge: {
      type: String,
      enum: ["Platinum", "Gold", "Silver", "Bronze", "Unverified"],
      default: "Unverified",
    },
    ecoCertificate: { type: EcoCertificateSchema, required: false },

    images: [{
      url: { type: String, required: true },
      filename: { type: String, required: true },
      uploadedAt: { type: Date, default: Date.now }
    }],

    // legacy manual certificate upload (kept if you still use it elsewhere)
    certificate: {
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

/** Virtuals & methods */
PropertySchema.virtual("formattedAddress").get(function () {
  return this.address;
});

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

/** Expose the helper on the model for reuse in routes/tests */
PropertySchema.statics.computeEcoBadgeFromFeatures = computeEcoBadgeFromFeatures;

/** Ensure ecoBadge stays in sync with ecoFeatures on .save() */
PropertySchema.pre('save', function (next) {
  if (this.isModified('ecoFeatures')) {
    this.ecoBadge = computeEcoBadgeFromFeatures(this.ecoFeatures);
  }
  next();
});

/** Also handle query updates like findOneAndUpdate / findByIdAndUpdate */
PropertySchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate() || {};
  // Normalize $set form
  const set = update.$set || update;

  if (set && Object.prototype.hasOwnProperty.call(set, 'ecoFeatures')) {
    const nextFeatures = set.ecoFeatures;
    const badge = computeEcoBadgeFromFeatures(nextFeatures);
    // Ensure badge is updated in the same atomic update
    if (!update.$set) update.$set = {};
    update.$set.ecoBadge = badge;
    this.setUpdate(update);
  }

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
export { computeEcoBadgeFromFeatures }; // optional named export if you want to import it elsewhere

import mongoose from "mongoose";

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

    // ---- eco fields now OPTIONAL ----
    ecoFeatures: [{ type: String, enum: ["solarPanels", "recycling", "energyRating", "insulation", "greyWater"] }],
    ecoRating: { type: String, enum: ["A+", "A", "B", "C"], required: false },

    images: [{
      url: { type: String, required: true },
      filename: { type: String, required: true },
      uploadedAt: { type: Date, default: Date.now }
    }],

    // certificate kept but optional (not used by current AddProperty)
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

PropertySchema.methods.toJSON = function () {
  const property = this.toObject();
  delete property.__v;
  return property;
};

export default mongoose.models.GreenRentProperty
  || mongoose.model("GreenRentProperty", PropertySchema);
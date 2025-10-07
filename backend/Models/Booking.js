// // Models/Booking.js
// import mongoose from "mongoose";

// const BookingSchema = new mongoose.Schema(
//   {
//     type: { type: String, enum: ["contactRequest"], required: true, default: "contactRequest" },
//     propertyId: { type: mongoose.Schema.Types.ObjectId, ref: "GreenRentProperty", required: true },
//     landlordId: { type: mongoose.Schema.Types.ObjectId, ref: "GreenRentUser" },
//     name:  { type: String, required: true, trim: true, maxlength: 120 },
//     email: { type: String, trim: true, maxlength: 200 },
//     phone: { type: String, trim: true, maxlength: 50 },
//     preferredDate: { type: String, trim: true, maxlength: 200 },
//     message:       { type: String, trim: true, maxlength: 1000 },
//     status: { type: String, enum: ["new", "contacted", "closed"], default: "new" },
//   },
//   { timestamps: true }
// );

// const BookingModel =
//   mongoose.models.GreenRentBooking || mongoose.model("GreenRentBooking", BookingSchema);

// export default BookingModel;



// Models/Booking.js
// Models/Booking.js
// import mongoose from "mongoose";

// const BookingSchema = new mongoose.Schema(
//   {
//     type:        { type: String, enum: ["contactRequest", "visitBooking"], required: true, default: "contactRequest" },
//     propertyId:  { type: mongoose.Schema.Types.ObjectId, ref: "GreenRentProperty", required: true },
//     landlordId:  { type: mongoose.Schema.Types.ObjectId, ref: "GreenRentUser" },
//     name:        { type: String, required: true, trim: true, maxlength: 120 },
//     email:       { type: String, trim: true, maxlength: 200 },
//     phone:       { type: String, trim: true, maxlength: 50 },
//     // store date if you post ISO or omit if free-text
//     preferredDate: { type: Date },
//     message:     { type: String, trim: true, maxlength: 1000 },
//     status:      { type: String, enum: ["new", "contacted", "closed"], default: "new" },
//   },
//   { timestamps: true }
// );

// const BookingModel =
//   mongoose.models.GreenRentBooking || mongoose.model("GreenRentBooking", BookingSchema);

// export default BookingModel;



// Models/Booking.js
import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    from: { type: String, enum: ["landlord", "user"], required: true },
    body: { type: String, required: true, trim: true, maxlength: 2000 },
    at:   { type: Date, default: Date.now },
  },
  { _id: false }
);

const BookingSchema = new mongoose.Schema(
  {
    type:         { type: String, enum: ["contactRequest", "visitBooking"], required: true, default: "contactRequest" },
    propertyId:   { type: mongoose.Schema.Types.ObjectId, ref: "GreenRentProperty", required: true },
    landlordId:   { type: mongoose.Schema.Types.ObjectId, ref: "GreenRentUser" },
    name:         { type: String, required: true, trim: true, maxlength: 120 },
    email:        { type: String, trim: true, maxlength: 200 }, // requester email
    phone:        { type: String, trim: true, maxlength: 50 },
    preferredDate:{ type: Date },                                // store ISO dates
    message:      { type: String, trim: true, maxlength: 1000 },
    status:       { type: String, enum: ["new", "contacted", "closed"], default: "new" },
    messages:     { type: [MessageSchema], default: [] },        // lightweight thread
  },
  { timestamps: true }
);

// Helpful indexes
BookingSchema.index({ landlordId: 1, createdAt: -1 });
BookingSchema.index({ email: 1, createdAt: -1 });
BookingSchema.index({ propertyId: 1, createdAt: -1 });
BookingSchema.index({ status: 1, createdAt: -1 });

const BookingModel =
  mongoose.models.GreenRentBooking || mongoose.model("GreenRentBooking", BookingSchema);

export default BookingModel;
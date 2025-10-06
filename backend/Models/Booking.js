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
import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema(
  {
    type:        { type: String, enum: ["contactRequest", "visitBooking"], required: true, default: "contactRequest" },
    propertyId:  { type: mongoose.Schema.Types.ObjectId, ref: "GreenRentProperty", required: true },
    landlordId:  { type: mongoose.Schema.Types.ObjectId, ref: "GreenRentUser" },
    name:        { type: String, required: true, trim: true, maxlength: 120 },
    email:       { type: String, trim: true, maxlength: 200 },
    phone:       { type: String, trim: true, maxlength: 50 },
    // If you want free text, change to { type: String, trim: true, maxlength: 200 }
    preferredDate: { type: Date },
    message:     { type: String, trim: true, maxlength: 1000 },
    status:      { type: String, enum: ["new", "contacted", "closed"], default: "new" },
  },
  { timestamps: true }
);

const BookingModel =
  mongoose.models.GreenRentBooking || mongoose.model("GreenRentBooking", BookingSchema);

export default BookingModel;
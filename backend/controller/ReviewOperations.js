// // controller/ReviewOperations.js
// import express from "express";
// import mongoose from "mongoose";
// import Review from "../Models/Review.js";
// import authenticateUser from "../middleware/authenticateUser.js";


// async function analyzeSentiment(text) {
//   try {
//     const apiKey = process.env.PARALLELDOTS_KEY;
//     if (!apiKey) return { provider: "None", label: "neutral", confidence: 0, score: 0 };

//     const body = new URLSearchParams({ text, api_key: apiKey });
//     const res = await doFetch("https://apis.paralleldots.com/v4/sentiment", {
//       method: "POST",
//       headers: { "Content-Type": "application/x-www-form-urlencoded" },
//       body,
//     });
//     const data = await res.json();

//     // ParallelDots returns something like:
//     // { sentiment: "positive"|"neutral"|"negative", confidence_score: 0.87, sentiment_score?: number }
//     const label = ["positive", "neutral", "negative"].includes(data?.sentiment) ? data.sentiment : "neutral";
//     const confidence = typeof data?.confidence_score === "number" ? data.confidence_score : 0;
//     const score = typeof data?.sentiment_score === "number" ? data.sentiment_score : undefined;

//     return { provider: "ParallelDots", label, confidence, score };
//   } catch (e) {
//     console.error("Sentiment error:", e);
//     return { provider: "None", label: "neutral", confidence: 0, score: 0 };
//   }
// }

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

// const router = express.Router();

// /** ---------- GET /ReviewOperations/:propertyId/comments (Public) ---------- */
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

// /** ---------- POST /ReviewOperations/:propertyId/comments (Auth) ---------- */
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

//     const s = await analyzeSentiment(String(text));

//     const doc = await Review.findOneAndUpdate(
//       { propertyId, userId: req.user._id },
//       {
//         $set: {
//           text,
//           rating: r,
//           "sentiment.provider": s.provider,
//           "sentiment.label": s.label,
//           "sentiment.confidence": s.confidence,
//           ...(s.score !== undefined ? { "sentiment.score": s.score } : {}),
//         },
//         $setOnInsert: { createdAt: new Date() },
//       },
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

// /** ---------- PUT /ReviewOperations/:propertyId/comments/:id (Auth) ---------- */
// router.put("/:propertyId/comments/:id", authenticateUser, async (req, res) => {
//   try {
//     const { propertyId, id } = req.params;
//     const { text, rating } = req.body;

//     if (!mongoose.Types.ObjectId.isValid(propertyId) || !mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ success: false, message: "Invalid id" });
//     }

//     const update = {};
//     if (typeof text === "string" && text.trim()) {
//       update.text = text.trim();
//       const s = await analyzeSentiment(update.text);
//       update["sentiment.provider"] = s.provider;
//       update["sentiment.label"] = s.label;
//       update["sentiment.confidence"] = s.confidence;
//       if (s.score !== undefined) update["sentiment.score"] = s.score;
//     }
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
//       { _id: id, propertyId, userId: req.user._id },
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

// /** ---------- DELETE /ReviewOperations/:propertyId/comments/:id (Auth) ---------- */
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



//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// controller/ReviewOperations.js
// import express from "express";
// import mongoose from "mongoose";
// import Review from "../Models/Review.js";
// import authenticateUser from "../middleware/authenticateUser.js";
// import { LanguageServiceClient } from "@google-cloud/language";

// import PropertyModel from "../Models/Property.js";
// import BookingModel from '../Models/Booking.js';
// import { transporter as transport, sendBookingMail } from '../utils/emailService.js'; // ensure names match
// // import { notifyUserPush } from '../utils/push.js'; // if you have it

// import dotenv from 'dotenv';

// dotenv.config();

// const MAIL_FROM = process.env.MAIL_FROM || `"GreenRent" <${process.env.EMAIL_USER}>`;
// const router = express.Router();

// // --- tiny helpers ---
// const isEmail = (v) => !!v && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
// const isPhone = (v) => !!v && String(v).replace(/\D/g, '').length >= 7; // tune for LK if needed
// const parseISODate = (v) => {
//   const d = new Date(v);
//   return isNaN(d.getTime()) ? null : d;
// };
// const TYPES = new Set(['contactRequest', 'visitBooking']);

// // OPTIONAL: very light anti-spam (same name+email+property within 60s)
// async function recentlySubmitted({ propertyId, email, name }) {
//   if (!email) return false;
//   const since = new Date(Date.now() - 60 * 1000);
//   const found = await BookingModel.findOne({
//     propertyId,
//     email,
//     name,
//     createdAt: { $gte: since },
//   }).lean();
//   return !!found;
// }

// router.post('/bookings', async (req, res) => {
//   try {
//     const {
//       type = 'contactRequest',
//       propertyId,
//       name,
//       email,
//       phone,
//       preferredDate,
//       message,
//     } = req.body || {};

//     // --- basic validation ---
//     if (!mongoose.Types.ObjectId.isValid(propertyId)) {
//       return res.status(400).json({ success: false, code: 'INVALID_PROPERTY_ID', message: 'Invalid propertyId' });
//     }
//     if (!name || !String(name).trim()) {
//       return res.status(400).json({ success: false, code: 'NAME_REQUIRED', message: 'Name is required' });
//     }
//     if (email && !isEmail(email)) {
//       return res.status(400).json({ success: false, code: 'INVALID_EMAIL', message: 'Invalid email' });
//     }
//     if (phone && !isPhone(phone)) {
//       return res.status(400).json({ success: false, code: 'INVALID_PHONE', message: 'Invalid phone number' });
//     }
//     if (!TYPES.has(type)) {
//       return res.status(400).json({ success: false, code: 'INVALID_TYPE', message: 'Invalid booking type' });
//     }

//     const property = await PropertyModel
//       .findById(propertyId)
//       .populate('ownerId', 'uname email number')
//       .lean();

//     if (!property) {
//       return res.status(404).json({ success: false, code: 'PROPERTY_NOT_FOUND', message: 'Property not found' });
//     }

//     const landlordId = property.ownerId?._id;
//     const landlordEmail =
//       property.ownerId?.email ||
//       property.contactInfo?.email ||
//       null;

//     // parse preferred date to Date (if present)
//     const preferredDateObj = preferredDate ? parseISODate(preferredDate) : null;
//     if (preferredDate && !preferredDateObj) {
//       return res.status(400).json({ success: false, code: 'INVALID_DATE', message: 'preferredDate must be a valid ISO date' });
//     }

//     // OPTIONAL: dedupe quick repeats
//     if (await recentlySubmitted({ propertyId, email, name })) {
//       return res.status(429).json({ success: false, code: 'DUPLICATE_RECENT', message: 'Similar request submitted recently. Please wait a moment.' });
//     }

//     // --- create booking ---
//     const booking = await BookingModel.create({
//       type,
//       propertyId,
//       landlordId,
//       name: String(name).trim(),
//       email: email?.trim() || undefined,
//       phone: phone?.trim() || undefined,
//       preferredDate: preferredDateObj || undefined,
//       message: message?.trim() || undefined,
//     });

//     // --- notifications (fire-and-forget) ---
//     // landlord email (text + reply-to)
//     if (transport && landlordEmail) {
//       const subject = `${type === 'visitBooking' ? 'Visit booking' : 'Contact request'}: ${property.title}`;
//       const textLines = [
//         `Property: ${property.title}`,
//         `Address: ${property.address || '-'}`,
//         '',
//         `Name: ${booking.name}`,
//         `Email: ${booking.email || '-'}`,
//         `Phone: ${booking.phone || '-'}`,
//         `Preferred date: ${booking.preferredDate ? new Date(booking.preferredDate).toString() : '-'}`,
//         '',
//         'Message:',
//         `${booking.message || '-'}`,
//         '',
//         '— GreenRent',
//       ];
//       transport
//         .sendMail({
//           from: MAIL_FROM,
//           to: landlordEmail,
//           subject,
//           text: textLines.join('\n'),
//           replyTo: booking.email || undefined, // allow direct reply
//         })
//         .catch((err) => console.error('Booking email error (landlord):', err));
//     }

//     // user confirmation email (html + text)
//     if (transport && booking.email) {
//       const subject = `We received your ${type === 'visitBooking' ? 'visit booking' : 'contact'} for ${property.title}`;
//       const plain = [
//         `Hi ${booking.name},`,
//         ``,
//         `Thanks for your interest in ${property.title}.`,
//         type === 'visitBooking'
//           ? `Your visit request has been sent to the landlord.`
//           : `The landlord/manager has been notified and will contact you shortly.`,
//         booking.preferredDate ? `Preferred date: ${new Date(booking.preferredDate).toString()}` : '',
//         ``,
//         '— GreenRent',
//       ].join('\n');

//       const html = `
//         <div style="font-family:Arial,sans-serif;padding:20px;background:#f6fef8;border-radius:12px;">
//           <h2 style="color:#3cc172;margin:0 0 8px;">🌿 GreenRent</h2>
//           <p style="margin:0 0 12px;">Hi ${booking.name},</p>
//           <p style="margin:0 0 8px;">Thanks for your interest in <strong>${property.title}</strong>.</p>
//           <p style="margin:0 0 8px;">
//             ${type === 'visitBooking'
//               ? 'Your <strong>visit request</strong> has been sent to the landlord.'
//               : 'The landlord/manager has been notified and will contact you shortly.'}
//           </p>
//           ${booking.preferredDate ? `<p style="margin:0 0 8px;"><strong>Preferred date:</strong> ${new Date(booking.preferredDate).toLocaleString()}</p>` : ''}
//           <p style="margin:16px 0 0;">— <strong>GreenRent</strong></p>
//         </div>
//       `;

//       transport
//         .sendMail({
//           from: MAIL_FROM,
//           to: booking.email,
//           subject,
//           text: plain,
//           html,
//         })
//         .catch((err) => console.error('Booking email error (requester):', err));
//     }

//     // push to landlord (don’t block)
//     if (landlordId) {
//       notifyUserPush?.(
//         landlordId,
//         type === 'visitBooking' ? 'New visit booking' : 'New contact request',
//         `${booking.name} ${type === 'visitBooking' ? 'requested a visit' : 'sent a contact request'} for "${property.title}"`,
//         { propertyId: String(property._id), bookingId: String(booking._id) }
//       ).catch((e) => console.error('Push notify error:', e));
//     }

//     return res.status(201).json({
//       success: true,
//       data: { bookingId: booking._id },
//     });
//   } catch (err) {
//     console.error('Create booking error:', err);
//     return res.status(500).json({ success: false, code: 'INTERNAL_ERROR', message: 'Failed to submit request' });
//   }
// });



// import express from "express";
// import mongoose from "mongoose";
// import Review from "../Models/Review.js";
// import BookingModel from '../Models/Booking.js';
// import PropertyModel from '../Models/Property.js'; // ADD THIS IMPORT
// import authenticateUser from "../middleware/authenticateUser.js";
// import { LanguageServiceClient } from "@google-cloud/language";
// import { transporter } from '../utils/emailService.js';
// import dotenv from 'dotenv';

// dotenv.config();

// const MAIL_FROM = process.env.MAIL_FROM || `"GreenRent" <${process.env.EMAIL_USER}>`;
// const router = express.Router();

// // --- tiny helpers ---
// const isEmail = (v) => !!v && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
// const isPhone = (v) => !!v && String(v).replace(/\D/g, '').length >= 7;
// const parseISODate = (v) => {
//   const d = new Date(v);
//   return isNaN(d.getTime()) ? null : d;
// };
// const TYPES = new Set(['contactRequest', 'visitBooking']);

// // OPTIONAL: very light anti-spam
// async function recentlySubmitted({ propertyId, email, name }) {
//   if (!email) return false;
//   const since = new Date(Date.now() - 60 * 1000);
//   const found = await BookingModel.findOne({
//     propertyId,
//     email,
//     name,
//     createdAt: { $gte: since },
//   }).lean();
//   return !!found;
// }

// // FIXED BOOKINGS ROUTE
// router.post('/bookings', async (req, res) => {
//   try {
//     const {
//       type = 'contactRequest',
//       propertyId,
//       name,
//       email,
//       phone,
//       preferredDate,
//       message,
//     } = req.body || {};

//     // --- basic validation ---
//     if (!mongoose.Types.ObjectId.isValid(propertyId)) {
//       return res.status(400).json({ success: false, code: 'INVALID_PROPERTY_ID', message: 'Invalid propertyId' });
//     }
//     if (!name || !String(name).trim()) {
//       return res.status(400).json({ success: false, code: 'NAME_REQUIRED', message: 'Name is required' });
//     }
//     if (email && !isEmail(email)) {
//       return res.status(400).json({ success: false, code: 'INVALID_EMAIL', message: 'Invalid email' });
//     }
//     if (phone && !isPhone(phone)) {
//       return res.status(400).json({ success: false, code: 'INVALID_PHONE', message: 'Invalid phone number' });
//     }
//     if (!TYPES.has(type)) {
//       return res.status(400).json({ success: false, code: 'INVALID_TYPE', message: 'Invalid booking type' });
//     }

//     // FIX: Use imported PropertyModel directly
//     const property = await PropertyModel
//       .findById(propertyId)
//       .populate('ownerId', 'uname email number')
//       .lean();

//     if (!property) {
//       return res.status(404).json({ success: false, code: 'PROPERTY_NOT_FOUND', message: 'Property not found' });
//     }

//     const landlordId = property.ownerId?._id;
//     const landlordEmail = property.ownerId?.email || property.contactInfo?.email || null;

//     // parse preferred date to Date (if present)
//     const preferredDateObj = preferredDate ? parseISODate(preferredDate) : null;
//     if (preferredDate && !preferredDateObj) {
//       return res.status(400).json({ success: false, code: 'INVALID_DATE', message: 'preferredDate must be a valid ISO date' });
//     }

//     // OPTIONAL: dedupe quick repeats
//     if (await recentlySubmitted({ propertyId, email, name })) {
//       return res.status(429).json({ success: false, code: 'DUPLICATE_RECENT', message: 'Similar request submitted recently. Please wait a moment.' });
//     }

//     // --- create booking ---
//     const booking = await BookingModel.create({
//       type,
//       propertyId,
//       landlordId,
//       name: String(name).trim(),
//       email: email?.trim() || undefined,
//       phone: phone?.trim() || undefined,
//       preferredDate: preferredDateObj || undefined,
//       message: message?.trim() || undefined,
//     });

//     // --- notifications (fire-and-forget) ---
//     // landlord email
//     if (transporter && landlordEmail) {
//       const subject = `${type === 'visitBooking' ? 'Visit booking' : 'Contact request'}: ${property.title}`;
//       const textLines = [
//         `Property: ${property.title}`,
//         `Address: ${property.address || '-'}`,
//         '',
//         `Name: ${booking.name}`,
//         `Email: ${booking.email || '-'}`,
//         `Phone: ${booking.phone || '-'}`,
//         `Preferred date: ${booking.preferredDate ? new Date(booking.preferredDate).toString() : '-'}`,
//         '',
//         'Message:',
//         `${booking.message || '-'}`,
//         '',
//         '— GreenRent',
//       ];
      
//       transporter.sendMail({
//         from: MAIL_FROM,
//         to: landlordEmail,
//         subject,
//         text: textLines.join('\n'),
//         replyTo: booking.email || undefined,
//       }).catch((err) => console.error('Booking email error (landlord):', err));
//     }

//     // user confirmation email
//     if (transporter && booking.email) {
//       const subject = `We received your ${type === 'visitBooking' ? 'visit booking' : 'contact'} for ${property.title}`;
//       const plain = [
//         `Hi ${booking.name},`,
//         ``,
//         `Thanks for your interest in ${property.title}.`,
//         type === 'visitBooking'
//           ? `Your visit request has been sent to the landlord.`
//           : `The landlord/manager has been notified and will contact you shortly.`,
//         booking.preferredDate ? `Preferred date: ${new Date(booking.preferredDate).toString()}` : '',
//         ``,
//         '— GreenRent',
//       ].join('\n');

//       transporter.sendMail({
//         from: MAIL_FROM,
//         to: booking.email,
//         subject,
//         text: plain,
//       }).catch((err) => console.error('Booking email error (requester):', err));
//     }

//     return res.status(201).json({
//       success: true,
//       data: { bookingId: booking._id },
//     });
//   } catch (err) {
//     console.error('Create booking error:', err);
//     return res.status(500).json({ 
//       success: false, 
//       code: 'INTERNAL_ERROR', 
//       message: 'Failed to submit request' 
//     });
//   }
// });

// const gnlClient = new LanguageServiceClient();




// const { ObjectId } = mongoose.Types;

// // Lazy import to avoid circular deps on cold start
// async function getPropertyModel() {
//   const { default: PropertyModel } = await import("../Models/Property.js");
//   return PropertyModel;
// }


// /**
//  * Use Google Cloud Natural Language to analyze sentiment.
//  * Maps to your schema: { provider, label, confidence, score }
//  * - score: -1..+1 (negative..positive)
//  * - confidence: we use "magnitude" as a confidence proxy (>= 0)
//  */
// async function analyzeSentiment(text) {
//   try {
//     const content = String(text || "").trim();
//     if (!content) {
//       return { provider: "GoogleNL", label: "neutral", confidence: 0, score: 0 };
//     }

//     const document = { type: "PLAIN_TEXT", content };
//     const [result] = await gnlClient.analyzeSentiment({
//       document,
//       encodingType: "UTF8",
//     });

//     const s = result?.documentSentiment || {};
//     const score = typeof s.score === "number" ? s.score : 0;          // -1..+1
//     const magnitude = typeof s.magnitude === "number" ? s.magnitude : 0; // >=0

//     // Simple threshold mapping; tweak to taste
//     const label = score > 0.25 ? "positive" : score < -0.25 ? "negative" : "neutral";

//     return { provider: "GoogleNL", label, confidence: magnitude, score };
//   } catch (e) {
//     console.error("GoogleNL sentiment error:", e);
//     // fail-open so review creation/edit isn’t blocked
//     return { provider: "GoogleNL", label: "neutral", confidence: 0, score: 0 };
//   }
// }

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



// /** ---------- GET /ReviewOperations/:propertyId/comments (Public) ---------- */
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

// /** ---------- POST /ReviewOperations/:propertyId/comments (Auth) ---------- */
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

//     // Analyze sentiment with Google NL
//     const s = await analyzeSentiment(String(text));

//     const doc = await Review.findOneAndUpdate(
//       { propertyId, userId: req.user._id },
//       {
//         $set: {
//           text,
//           rating: r,
//           "sentiment.provider": s.provider,
//           "sentiment.label": s.label,
//           "sentiment.confidence": s.confidence,
//           ...(typeof s.score === "number" ? { "sentiment.score": s.score } : {}),
//         },
//         $setOnInsert: { createdAt: new Date() },
//       },
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

// /** ---------- PUT /ReviewOperations/:propertyId/comments/:id (Auth) ---------- */
// router.put("/:propertyId/comments/:id", authenticateUser, async (req, res) => {
//   try {
//     const { propertyId, id } = req.params;
//     const { text, rating } = req.body;

//     if (!mongoose.Types.ObjectId.isValid(propertyId) || !mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ success: false, message: "Invalid id" });
//     }

//     const update = {};
//     if (typeof text === "string" && text.trim()) {
//       update.text = text.trim();
//       const s = await analyzeSentiment(update.text);
//       update["sentiment.provider"] = s.provider;
//       update["sentiment.label"] = s.label;
//       update["sentiment.confidence"] = s.confidence;
//       if (typeof s.score === "number") update["sentiment.score"] = s.score;
//     }
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
//       { _id: id, propertyId, userId: req.user._id },
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

// /** ---------- DELETE /ReviewOperations/:propertyId/comments/:id (Auth) ---------- */
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

// router.get("/suggest", async (req, res) => {
//   try {
//     const page       = Math.max(parseInt(req.query.page  ?? "1", 10), 1);
//     const limit      = Math.min(Math.max(parseInt(req.query.limit ?? "16", 10), 1), 50);
//     const skip       = (page - 1) * limit;

//     // numeric score threshold (-1..+1), default 0.2
//     const minSentiment = (req.query.minSentiment !== undefined)
//       ? Number(req.query.minSentiment)
//       : 0.2;

//     // minimum avg star rating (1..5)
//     const minRating    = (req.query.minRating !== undefined)
//       ? Number(req.query.minRating)
//       : 0;

//     // optional review-count threshold (client used to do this; now we can support on server)
//     const minReviews   = (req.query.minReviews !== undefined)
//       ? Math.max(0, Number(req.query.minReviews))
//       : 0;

//     const type         = (req.query.type || "").trim();
//     const maxPrice     = (req.query.maxPrice !== undefined && req.query.maxPrice !== "")
//       ? Number(req.query.maxPrice)
//       : undefined;
//     const q            = (req.query.q || "").trim();

//     // sentimentLabel can be string or array of strings
//     let labels = req.query.sentimentLabel;
//     if (labels && !Array.isArray(labels)) labels = [labels];
//     const validLabels = ["positive", "neutral", "negative"];
//     const labelFilter = Array.isArray(labels)
//       ? labels.filter(l => validLabels.includes(String(l).toLowerCase()))
//       : [];

//     // --- Build pipeline ---
//     const pipeline = [];

//     // (A) Optional: filter reviews by sentiment label BEFORE grouping
//     if (labelFilter.length > 0) {
//       pipeline.push({
//         $match: { "sentiment.label": { $in: labelFilter } }
//       });
//     }

//     // (B) Group reviews per property
//     pipeline.push(
//       {
//         $group: {
//           _id: "$propertyId",
//           reviewCount:  { $sum: 1 },
//           avgRating:    { $avg: "$rating" },
//           sentimentAvg: { $avg: "$sentiment.score" }, // average Google NL score across reviews
//           // Optional: you can also compute label proportions if you want:
//           // posCount: { $sum: { $cond: [{ $eq: ["$sentiment.label", "positive"] }, 1, 0] } },
//           lastReviewAt: { $max: "$updatedAt" },
//         }
//       },
//       // (C) Apply numeric thresholds on the aggregates (null-safe)
//       {
//         $match: {
//           $and: [
//             { $expr: { $gte: [ { $ifNull: ["$sentimentAvg", -999] }, minSentiment ] } },
//             { $expr: { $gte: [ { $ifNull: ["$avgRating",   0] },    minRating    ] } },
//             { $expr: { $gte: [ { $ifNull: ["$reviewCount",  0] },    minReviews   ] } },
//           ]
//         }
//       },
//       // (D) Join property docs
//       {
//         $lookup: {
//           from: "greenrentproperties", // <-- ensure this matches your actual collection name!
//           localField: "_id",
//           foreignField: "_id",
//           as: "property",
//         }
//       },
//       { $unwind: "$property" },
//       // (E) Property-side filters
//       {
//         $match: {
//           "property.status": "active",
//           ...(type ? { "property.propertyType": type } : {}),
//           ...(Number.isFinite(maxPrice) ? { "property.rentPrice": { $lte: maxPrice } } : {}),
//           ...(q ? {
//             $or: [
//               { "property.title":       { $regex: q, $options: "i" } },
//               { "property.description": { $regex: q, $options: "i" } },
//               { "property.address":     { $regex: q, $options: "i" } },
//               { "property.locationName":{ $regex: q, $options: "i" } },
//             ]
//           } : {}),
//         }
//       },
//       // (F) Sort by community signals
//       {
//         $sort: { sentimentAvg: -1, avgRating: -1, "property.createdAt": -1 }
//       },
//       // (G) Facet for pagination
//       {
//         $facet: {
//           items: [
//             { $skip: skip },
//             { $limit: limit },
//             {
//               $project: {
//                 _id: 0,
//                 property: 1,
//                 reviewCount: 1,
//                 avgRating:   { $round: ["$avgRating", 1] },
//                 sentimentAvg:{ $round: ["$sentimentAvg", 3] },
//                 lastReviewAt: 1,
//               }
//             }
//           ],
//           total: [{ $count: "count" }]
//         }
//       }
//     );

//     const result = await Review.aggregate(pipeline);
//     const facet  = result[0] || { items: [], total: [] };

//     const items = (facet.items || []).map(x => ({
//       ...x.property,
//       reviewCount:  x.reviewCount,
//       avgRating:    x.avgRating,
//       sentimentAvg: x.sentimentAvg,
//       lastReviewAt: x.lastReviewAt,
//     }));

//     const total = facet.total[0]?.count || 0;

//     // Optional: fallback (when no reviews match)
//     if (!total) {
//       // return empty list or fallback to active properties; keeping empty is clearer for a “reviews-based” page
//       return res.json({
//         success: true,
//         data: [],
//         page, limit, total: 0, pages: 0,
//       });
//     }

//     return res.json({
//       success: true,
//       data: items,
//       page, limit, total, pages: Math.ceil(total / limit),
//     });
//   } catch (err) {
//     console.error("suggest error:", err);
//     return res.status(500).json({ success: false, message: "Failed to suggest properties" });
//   }
// });

// export default router;



// routes/ReviewOperations.js
import express from "express";
import mongoose from "mongoose";
import Review from "../Models/Review.js";
import authenticateUser from "../middleware/authenticateUser.js";
import { LanguageServiceClient } from "@google-cloud/language";

import PropertyModel from "../Models/Property.js";
import BookingModel from "../Models/Booking.js";
import { transporter as transport } from "../utils/emailService.js";
// Optional push — only use if you actually export it from ../utils/push.js
// import { notifyUserPush } from "../utils/push.js";

import dotenv from "dotenv";
dotenv.config();

const MAIL_FROM = process.env.MAIL_FROM || (process.env.EMAIL_USER ? `"GreenRent" <${process.env.EMAIL_USER}>` : '"GreenRent" <no-reply@greenrent.local>');
const router = express.Router();

// ----- tiny helpers -----
const isEmail = (v) => !!v && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const isPhone = (v) => !!v && String(v).replace(/\D/g, '').length >= 7;
const parseISODate = (v) => {
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
};
const TYPES = new Set(["contactRequest", "visitBooking"]);

// very light anti-spam (same name+email+property within 60s)
async function recentlySubmitted({ propertyId, email, name }) {
  if (!email) return false;
  const since = new Date(Date.now() - 60 * 1000);
  const found = await BookingModel.findOne({
    propertyId,
    email,
    name,
    createdAt: { $gte: since },
  }).lean();
  return !!found;
}

// ----- BOOKINGS -----
router.post("/bookings", async (req, res) => {
  try {
    const {
      type = "contactRequest",
      propertyId,
      name,
      email,
      phone,
      preferredDate,
      message,
    } = req.body || {};

    // basic validation
    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      return res.status(400).json({ success: false, code: "INVALID_PROPERTY_ID", message: "Invalid propertyId" });
    }
    if (!name || !String(name).trim()) {
      return res.status(400).json({ success: false, code: "NAME_REQUIRED", message: "Name is required" });
    }
    if (email && !isEmail(email)) {
      return res.status(400).json({ success: false, code: "INVALID_EMAIL", message: "Invalid email" });
    }
    if (phone && !isPhone(phone)) {
      return res.status(400).json({ success: false, code: "INVALID_PHONE", message: "Invalid phone number" });
    }
    if (!TYPES.has(type)) {
      return res.status(400).json({ success: false, code: "INVALID_TYPE", message: "Invalid booking type" });
    }

    const property = await PropertyModel
      .findById(propertyId)
      .populate("ownerId", "uname email number")
      .lean();

    if (!property) {
      return res.status(404).json({ success: false, code: "PROPERTY_NOT_FOUND", message: "Property not found" });
    }

    const landlordId   = property.ownerId?._id;
    const landlordEmail = property.ownerId?.email || property.contactInfo?.email || null;

    // preferred date: accept ISO date or free-text
    const preferredDateObj = preferredDate ? parseISODate(preferredDate) : null;

    // dedupe quick repeats
    if (await recentlySubmitted({ propertyId, email, name })) {
      return res.status(429).json({ success: false, code: "DUPLICATE_RECENT", message: "Similar request submitted recently. Please wait a moment." });
    }

    // create booking (store Date if valid; else omit)
    const booking = await BookingModel.create({
      type,
      propertyId,
      landlordId,
      name: String(name).trim(),
      email: email?.trim() || undefined,
      phone: phone?.trim() || undefined,
      ...(preferredDateObj ? { preferredDate: preferredDateObj } : {}),
      message: message?.trim() || undefined,
    });

    // email landlord
    if (transport && landlordEmail) {
      const subject = `${type === "visitBooking" ? "Visit booking" : "Contact request"}: ${property.title}`;
      const textLines = [
        `Property: ${property.title}`,
        `Address: ${property.address || "-"}`,
        "",
        `Name: ${booking.name}`,
        `Email: ${booking.email || "-"}`,
        `Phone: ${booking.phone || "-"}`,
        `Preferred date: ${booking.preferredDate ? new Date(booking.preferredDate).toString() : "-"}`,
        "",
        "Message:",
        `${booking.message || "-"}`,
        "",
        "— GreenRent",
      ];
      transport.sendMail({
        from: MAIL_FROM,
        to: landlordEmail,
        subject,
        text: textLines.join("\n"),
        replyTo: booking.email || undefined,
      }).catch((err) => console.error("Booking email error (landlord):", err));
    }

    // email requester
    if (transport && booking.email) {
      const subject = `We received your ${type === "visitBooking" ? "visit booking" : "contact"} for ${property.title}`;
      const plain = [
        `Hi ${booking.name},`,
        ``,
        `Thanks for your interest in ${property.title}.`,
        type === "visitBooking"
          ? `Your visit request has been sent to the landlord.`
          : `The landlord/manager has been notified and will contact you shortly.`,
        booking.preferredDate ? `Preferred date: ${new Date(booking.preferredDate).toString()}` : "",
        ``,
        "— GreenRent",
      ].join("\n");

      const html = `
        <div style="font-family:Arial,sans-serif;padding:20px;background:#f6fef8;border-radius:12px;">
          <h2 style="color:#3cc172;margin:0 0 8px;">🌿 GreenRent</h2>
          <p style="margin:0 0 12px;">Hi ${booking.name},</p>
          <p style="margin:0 0 8px;">Thanks for your interest in <strong>${property.title}</strong>.</p>
          <p style="margin:0 0 8px;">
            ${type === "visitBooking"
              ? "Your <strong>visit request</strong> has been sent to the landlord."
              : "The landlord/manager has been notified and will contact you shortly."}
          </p>
          ${booking.preferredDate ? `<p style="margin:0 0 8px;"><strong>Preferred date:</strong> ${new Date(booking.preferredDate).toLocaleString()}</p>` : ""}
          <p style="margin:16px 0 0;">— <strong>GreenRent</strong></p>
        </div>
      `;

      transport.sendMail({
        from: MAIL_FROM,
        to: booking.email,
        subject,
        text: plain,
        html,
      }).catch((err) => console.error("Booking email error (requester):", err));
    }

    // Optional push (guard against undefined)
    // if (landlordId && typeof notifyUserPush === 'function') {
    //   notifyUserPush(
    //     landlordId,
    //     type === "visitBooking" ? "New visit booking" : "New contact request",
    //     `${booking.name} ${type === "visitBooking" ? "requested a visit" : "sent a contact request"} for "${property.title}"`,
    //     { propertyId: String(property._id), bookingId: String(booking._id) }
    //   ).catch((e) => console.error("Push notify error:", e));
    // }

    return res.status(201).json({ success: true, data: { bookingId: booking._id } });
  } catch (err) {
    console.error("Create booking error:", err);
    return res.status(500).json({ success: false, code: "INTERNAL_ERROR", message: "Failed to submit request" });
  }
});

// ---------- Reviews (unchanged logic; kept concise) ----------
const gnlClient = new LanguageServiceClient();

async function analyzeSentiment(text) {
  try {
    const content = String(text || "").trim();
    if (!content) return { provider: "GoogleNL", label: "neutral", confidence: 0, score: 0 };

    const document = { type: "PLAIN_TEXT", content };
    const [result] = await gnlClient.analyzeSentiment({ document, encodingType: "UTF8" });

    const s = result?.documentSentiment || {};
    const score = typeof s.score === "number" ? s.score : 0;
    const magnitude = typeof s.magnitude === "number" ? s.magnitude : 0;
    const label = score > 0.25 ? "positive" : score < -0.25 ? "negative" : "neutral";
    return { provider: "GoogleNL", label, confidence: magnitude, score };
  } catch (e) {
    console.error("GoogleNL sentiment error:", e);
    return { provider: "GoogleNL", label: "neutral", confidence: 0, score: 0 };
  }
}

async function recomputePropertyAggregates(propertyId) {
  const agg = await Review.aggregate([
    { $match: { propertyId: new mongoose.Types.ObjectId(propertyId) } },
    { $group: { _id: "$propertyId", reviewCount: { $sum: 1 }, avgRating: { $avg: "$rating" } } },
  ]);
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

// GET comments
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

// POST comment
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
          ...(typeof s.score === "number" ? { "sentiment.score": s.score } : {}),
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

// PUT comment
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
      if (typeof s.score === "number") update["sentiment.score"] = s.score;
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

// DELETE comment
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

// --------- suggestion endpoint (unchanged behavior) ---------
router.get("/suggest", async (req, res) => {
  try {
    const page       = Math.max(parseInt(req.query.page  ?? "1", 10), 1);
    const limit      = Math.min(Math.max(parseInt(req.query.limit ?? "16", 10), 1), 50);
    const skip       = (page - 1) * limit;

    const minSentiment = (req.query.minSentiment !== undefined) ? Number(req.query.minSentiment) : 0.2;
    const minRating    = (req.query.minRating !== undefined)    ? Number(req.query.minRating)    : 0;
    const minReviews   = (req.query.minReviews !== undefined)   ? Math.max(0, Number(req.query.minReviews)) : 0;

    const type         = (req.query.type || "").trim();
    const maxPrice     = (req.query.maxPrice !== undefined && req.query.maxPrice !== "") ? Number(req.query.maxPrice) : undefined;
    const q            = (req.query.q || "").trim();

    let labels = req.query.sentimentLabel;
    if (labels && !Array.isArray(labels)) labels = [labels];
    const validLabels = ["positive", "neutral", "negative"];
    const labelFilter = Array.isArray(labels) ? labels.filter(l => validLabels.includes(String(l).toLowerCase())) : [];

    const pipeline = [];

    if (labelFilter.length > 0) {
      pipeline.push({ $match: { "sentiment.label": { $in: labelFilter } } });
    }

    pipeline.push(
      { $group: {
          _id: "$propertyId",
          reviewCount:  { $sum: 1 },
          avgRating:    { $avg: "$rating" },
          sentimentAvg: { $avg: "$sentiment.score" },
          lastReviewAt: { $max: "$updatedAt" },
      }},
      { $match: {
          $and: [
            { $expr: { $gte: [ { $ifNull: ["$sentimentAvg", -999] }, minSentiment ] } },
            { $expr: { $gte: [ { $ifNull: ["$avgRating",   0] },    minRating    ] } },
            { $expr: { $gte: [ { $ifNull: ["$reviewCount",  0] },    minReviews   ] } },
          ]
      }},
      { $lookup: {
          from: "greenrentproperties", // make sure this matches your collection name
          localField: "_id",
          foreignField: "_id",
          as: "property",
      }},
      { $unwind: "$property" },
      { $match: {
          "property.status": "active",
          ...(type ? { "property.propertyType": type } : {}),
          ...(Number.isFinite(maxPrice) ? { "property.rentPrice": { $lte: maxPrice } } : {}),
          ...(q ? {
            $or: [
              { "property.title":        { $regex: q, $options: "i" } },
              { "property.description":  { $regex: q, $options: "i" } },
              { "property.address":      { $regex: q, $options: "i" } },
              { "property.locationName": { $regex: q, $options: "i" } },
            ]
          } : {}),
      }},
      { $sort: { sentimentAvg: -1, avgRating: -1, "property.createdAt": -1 } },
      { $facet: {
          items: [
            { $skip: skip },
            { $limit: limit },
            { $project: {
              _id: 0,
              property: 1,
              reviewCount: 1,
              avgRating:   { $round: ["$avgRating", 1] },
              sentimentAvg:{ $round: ["$sentimentAvg", 3] },
              lastReviewAt: 1,
            }}
          ],
          total: [{ $count: "count" }]
      }}
    );

    const result = await Review.aggregate(pipeline);
    const facet  = result[0] || { items: [], total: [] };

    const items = (facet.items || []).map(x => ({
      ...x.property,
      reviewCount:  x.reviewCount,
      avgRating:    x.avgRating,
      sentimentAvg: x.sentimentAvg,
      lastReviewAt: x.lastReviewAt,
    }));

    const total = facet.total[0]?.count || 0;

    if (!total) {
      return res.json({ success: true, data: [], page, limit, total: 0, pages: 0 });
    }

    return res.json({ success: true, data: items, page, limit, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error("suggest error:", err);
    return res.status(500).json({ success: false, message: "Failed to suggest properties" });
  }
});

export default router;
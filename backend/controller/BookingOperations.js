// // controller/BookingOperations.js
// import express from "express";
// import mongoose from "mongoose";
// import nodemailer from "nodemailer";
// import fetch from "node-fetch"; // Node >=18 already has fetch, but this keeps portability

// import BookingModel from "../Models/Booking.js";
// import PropertyModel from "../Models/Property.js";
// import PushTokenModel from "../Models/PushToken.js";
// import authenticateUser from "../middleware/authenticateUser.js";

// const router = express.Router();

// /* ========= Email transport (optional via .env) =========
//    SMTP_HOST, SMTP_PORT, SMTP_SECURE=true/false, SMTP_USER, SMTP_PASS, MAIL_FROM
// */
// function makeTransport() {
//   const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS } = process.env;
//   if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) return null;
//   return nodemailer.createTransport({
//     host: SMTP_HOST,
//     port: Number(SMTP_PORT),
//     secure: String(SMTP_SECURE || "false") === "true",
//     auth: { user: SMTP_USER, pass: SMTP_PASS },
//   });
// }
// const transport = makeTransport();
// const MAIL_FROM = process.env.MAIL_FROM || process.env.SMTP_USER || "no-reply@greenrent.local";

// /* ========= Push helpers (Expo example) ========= */
// const EXPO_URL = "https://exp.host/--/api/v2/push/send";

// async function sendExpoPush(token, msg) {
//   const payload = {
//     to: token,
//     sound: "default",
//     title: msg.title,
//     body: msg.body,
//     data: msg.data || {},
//     priority: "high",
//   };
//   try {
//     const resp = await fetch(EXPO_URL, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(payload),
//     });
//     if (!resp.ok) {
//       const t = await resp.text().catch(() => "");
//       console.error("Expo push failed:", t);
//     }
//   } catch (e) {
//     console.error("Expo push error:", e);
//   }
// }

// async function notifyUserPush(userId, title, body, data = {}) {
//   try {
//     const tokens = await PushTokenModel.find({ userId }).lean();
//     await Promise.all(
//       tokens.map(async (t) => {
//         if (t.provider === "expo") {
//           await sendExpoPush(t.token, { title, body, data });
//         }
//         // extend here for FCM if you add it
//       })
//     );
//   } catch (e) {
//     console.error("notifyUserPush error:", e);
//   }
// }

// /* ========= POST /bookings =========
//    body: { type, propertyId, name, email?, phone?, preferredDate?, message? }
// */
// router.post("/bookings", async (req, res) => {
//   try {
//     const { type = "contactRequest", propertyId, name, email, phone, preferredDate, message } = req.body || {};

//     if (!mongoose.Types.ObjectId.isValid(propertyId)) {
//       return res.status(400).json({ success: false, message: "Invalid propertyId" });
//     }
//     if (!name || !String(name).trim()) {
//       return res.status(400).json({ success: false, message: "Name is required" });
//     }

//     const property = await PropertyModel.findById(propertyId).populate("ownerId", "uname email number").lean();
//     if (!property) return res.status(404).json({ success: false, message: "Property not found" });

//     const landlordId = property.ownerId?._id || undefined;
//     const landlordEmail = property.ownerId?.email || property.contactInfo?.email || null;

//     const booking = await BookingModel.create({
//       type,
//       propertyId,
//       landlordId,
//       name: String(name).trim(),
//       email: email?.trim() || undefined,
//       phone: phone?.trim() || undefined,
//       preferredDate: preferredDate?.trim() || undefined,
//       message: message?.trim() || undefined,
//     });

//     // Optional emails
//     if (transport && landlordEmail) {
//       const subject = `Contact request: ${property.title}`;
//       const lines = [
//         `Property: ${property.title}`,
//         `Address: ${property.address}`,
//         ``,
//         `Name: ${booking.name}`,
//         `Email: ${booking.email || "-"}`,
//         `Phone: ${booking.phone || "-"}`,
//         `Preferred date: ${booking.preferredDate || "-"}`,
//         ``,
//         `Message:`,
//         `${booking.message || "-"}`,
//         ``,
//         `— GreenRent`,
//       ];
//       transport.sendMail({
//         from: MAIL_FROM,
//         to: landlordEmail,
//         subject,
//         text: lines.join("\n"),
//       }).catch(err => console.error("Booking email error (landlord):", err));
//     }

//     if (transport && booking.email) {
//       transport.sendMail({
//         from: MAIL_FROM,
//         to: booking.email,
//         subject: `We received your request for ${property.title}`,
//         text: `Hi ${booking.name},\n\nThanks for your interest in ${property.title}.\nThe landlord/manager has been notified and will contact you shortly.\n\n— GreenRent`,
//       }).catch(err => console.error("Booking email error (requester):", err));
//     }

//     // Optional push to landlord
//     if (landlordId) {
//       await notifyUserPush(
//         landlordId,
//         "New contact request",
//         `${booking.name} requested to contact about "${property.title}"`,
//         { propertyId: String(property._id), bookingId: String(booking._id) }
//       );
//     }

//     return res.status(201).json({ success: true, data: { bookingId: booking._id } });
//   } catch (err) {
//     console.error("Create booking error:", err);
//     return res.status(500).json({ success: false, message: "Failed to submit request" });
//   }
// });

// /* ========= GET /bookings (Inbox) =========
//    - Admin: sees all
//    - Landlord: sees only their bookings
//    - Query: page, limit, status, propertyId, q
// */
// router.get("/bookings", authenticateUser, async (req, res) => {
//   try {
//     const { page = 1, limit = 20, status, propertyId, q } = req.query;

//     const skip = (Number(page) - 1) * Number(limit);
//     const filter = {};

//     if (req.user?.isAdmin) {
//       // admin sees all
//     } else {
//       // landlord sees only their own bookings
//       filter.landlordId = req.user._id;
//     }

//     if (status) filter.status = status;
//     if (propertyId && mongoose.Types.ObjectId.isValid(propertyId)) {
//       filter.propertyId = propertyId;
//     }
//     if (q) {
//       const regex = new RegExp(String(q).trim(), "i");
//       filter.$or = [
//         { name: { $regex: regex } },
//         { email: { $regex: regex } },
//         { phone: { $regex: regex } },
//         { message: { $regex: regex } },
//       ];
//     }

//     const [items, total] = await Promise.all([
//       BookingModel.find(filter)
//         .sort({ createdAt: -1 })
//         .skip(skip)
//         .limit(Number(limit))
//         .populate("propertyId", "title address")
//         .lean(),
//       BookingModel.countDocuments(filter),
//     ]);

//     return res.json({
//       success: true,
//       data: items,
//       page: Number(page),
//       limit: Number(limit),
//       total,
//       pages: Math.ceil(total / Number(limit)),
//     });
//   } catch (err) {
//     console.error("List bookings error:", err);
//     return res.status(500).json({ success: false, message: "Failed to load bookings" });
//   }
// });

// /* ========= POST /push/register (optional) =========
//    Save the current user's push token
//    body: { token, provider?, platform? }
// */
// router.post("/push/register", authenticateUser, async (req, res) => {
//   try {
//     const { token, provider = "expo", platform = "ios" } = req.body || {};
//     if (!token) return res.status(400).json({ success: false, message: "token required" });

//     const doc = await PushTokenModel.findOneAndUpdate(
//       { token },
//       { $set: { userId: req.user._id, provider, platform, lastSeenAt: new Date() } },
//       { upsert: true, new: true }
//     );

//     return res.json({ success: true, data: { id: doc._id } });
//   } catch (err) {
//     console.error("push/register error:", err);
//     return res.status(500).json({ success: false, message: "Failed to register token" });
//   }
// });

// export default router;



// import mongoose from 'mongoose';
// import express from 'express';
// import PropertyModel from '../models/PropertyModel.js';
// import BookingModel from '../models/BookingModel.js';
// import { transporter as transport, sendBookingMail } from '../utils/emailService.js'; // ensure names match
// import { notifyUserPush } from '../utils/push.js'; // if you have it
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

// export default router;
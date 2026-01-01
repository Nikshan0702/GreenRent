import express from "express";
import mongoose from "mongoose";
import Review from "../Models/Review.js";
import authenticateUser from "../middleware/authenticateUser.js";
import { LanguageServiceClient } from "@google-cloud/language";

import PropertyModel from "../Models/Property.js";
import BookingModel from "../Models/Booking.js";
//import { sendMailSafe } from "../utils/emailService.js";
// import { notifyUserPush } from "../utils/push.js"; // optional

import dotenv from "dotenv";
dotenv.config();

const MAIL_FROM = process.env.MAIL_FROM || (process.env.EMAIL_USER ? `"GreenRent" <${process.env.EMAIL_USER}>` : '"GreenRent" <no-reply@greenrent.local>');
const router = express.Router();

// Helpers
// const isEmail = (v) => !!v && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
// const isPhone = (v) => !!v && String(v).replace(/\D/g, '').length >= 7;
// const parseISODate = (v) => { const d = new Date(v); return Number.isNaN(d.getTime()) ? null : d; };
// const TYPES = new Set(["contactRequest", "visitBooking"]);

// async function recentlySubmitted({ propertyId, email, name }) {
//   if (!email) return false;
//   const since = new Date(Date.now() - 60 * 1000);
//   const found = await BookingModel.findOne({ propertyId, email, name, createdAt: { $gte: since } }).lean();
//   return !!found;
// }


const isEmail = (v) => !!v && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const isPhone = (v) => !!v && String(v).replace(/\D/g, "").length >= 7;
const parseISODate = (v) => { const d = new Date(v); return Number.isNaN(d.getTime()) ? null : d; };
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

function buildEmailContent({ type, booking, property }) {
  const isVisit = type === "visitBooking";
  const prettyDate = booking.preferredDate ? new Date(booking.preferredDate).toLocaleString() : "-";
  const title = property.title || "your property";

  const landlordSubject = `${isVisit ? "Visit booking" : "Contact request"}: ${title}`;
  const landlordText = [
    `Property: ${property.title}`,
    `Address: ${property.address || "-"}`,
    "",
    `Name: ${booking.name}`,
    `Email: ${booking.email || "-"}`,
    `Phone: ${booking.phone || "-"}`,
    `Preferred date: ${prettyDate}`,
    "",
    "Message:",
    `${booking.message || "-"}`,
    "",
    "— GreenRent",
  ].join("\n");
  const landlordHtml = `
    <div style="font:14px/1.4 -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Arial;">
      <h2 style="margin:0 0 8px;">${isVisit ? "Visit booking" : "Contact request"}</h2>
      <p style="margin:0 0 6px;"><strong>Property:</strong> ${property.title}</p>
      <p style="margin:0 0 6px;"><strong>Address:</strong> ${property.address || "-"}</p>
      <hr style="border:none;border-top:1px solid #eee;margin:10px 0;">
      <p style="margin:0 0 6px;"><strong>Name:</strong> ${booking.name}</p>
      <p style="margin:0 0 6px;"><strong>Email:</strong> ${booking.email || "-"}</p>
      <p style="margin:0 0 6px;"><strong>Phone:</strong> ${booking.phone || "-"}</p>
      <p style="margin:0 0 6px;"><strong>Preferred date:</strong> ${prettyDate}</p>
      <p style="margin:10px 0 0;"><strong>Message</strong><br>${(booking.message || "-").replace(/\n/g, "<br>")}</p>
      <p style="margin:16px 0 0;color:#6b7280;">— GreenRent</p>
    </div>
  `;

  const requesterSubject = `We received your ${isVisit ? "visit booking" : "contact request"} for ${title}`;
  const requesterText = [
    `Hi ${booking.name},`,
    ``,
    `Thanks for your interest in ${property.title}.`,
    isVisit
      ? `Your visit request has been sent to the landlord.`
      : `The landlord/manager has been notified and will contact you shortly.`,
    booking.preferredDate ? `Preferred date: ${prettyDate}` : "",
    ``,
    `What happens next?`,
    `- The landlord will review your request.`,
    `- They may contact you at ${booking.email || booking.phone || "the details you provided"}.`,
    "",
    "— GreenRent",
  ].join("\n");
  const requesterHtml = `
    <div style="font:14px/1.4 -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Arial;background:#f6fef8;padding:16px;border-radius:12px;">
      <h2 style="margin:0 0 8px;color:#22c55e;">🌿 GreenRent</h2>
      <p style="margin:0 0 8px;">Hi ${booking.name},</p>
      <p style="margin:0 0 8px;">Thanks for your interest in <strong>${property.title}</strong>.</p>
      <p style="margin:0 0 8px;">
        ${isVisit
          ? "Your <strong>visit request</strong> has been sent to the landlord."
          : "The landlord/manager has been notified and will contact you shortly."}
      </p>
      ${booking.preferredDate ? `<p style="margin:0 0 8px;"><strong>Preferred date:</strong> ${prettyDate}</p>` : ""}
      <p style="margin:12px 0 0;"><strong>What happens next?</strong><br>
        • The landlord will review your request.<br>
        • They may contact you at ${booking.email || booking.phone || "the details you provided"}.
      </p>
      <p style="margin:16px 0 0;">— <strong>GreenRent</strong></p>
    </div>
  `;

  return {
    landlord: { subject: landlordSubject, text: landlordText, html: landlordHtml },
    requester:{ subject: requesterSubject, text: requesterText, html: requesterHtml },
  };
}

async function sendBookingEmails({ type, booking, property }) {
  const landlordEmail = property.ownerId?.email || property.contactInfo?.email || null;
  const requesterEmail = booking.email || null;
  const { landlord, requester } = buildEmailContent({ type, booking, property });

  let landlordAccepted = false;
  let requesterAccepted = false;

  if (landlordEmail) {
    try {
      const info = await sendMailSafe({
        to: landlordEmail,
        subject: landlord.subject,
        text: landlord.text,
        html: landlord.html,
        replyTo: requesterEmail || undefined,
      });
      landlordAccepted = (info.accepted || []).includes(landlordEmail);
    } catch (e) {
      console.error("Booking email error (landlord):", e);
    }
  }

  if (requesterEmail) {
    try {
      const info = await sendMailSafe({
        to: requesterEmail,
        subject: requester.subject,
        text: requester.text,
        html: requester.html,
      });
      requesterAccepted = (info.accepted || []).includes(requesterEmail);
    } catch (e) {
      console.error("Booking email error (requester):", e);
    }
  }

  return { landlordAccepted, requesterAccepted };
}


















// ----- BOOKINGS -----
// router.post("/bookings", async (req, res) => {
//   try {
//     const {
//       type = "contactRequest",
//       propertyId,
//       name,
//       email,
//       phone,
//       preferredDate,
//       message,
//     } = req.body || {};

//     // validation
//     if (!mongoose.Types.ObjectId.isValid(propertyId)) return res.status(400).json({ success: false, code: "INVALID_PROPERTY_ID", message: "Invalid propertyId" });
//     if (!name || !String(name).trim()) return res.status(400).json({ success: false, code: "NAME_REQUIRED", message: "Name is required" });
//     if (email && !isEmail(email)) return res.status(400).json({ success: false, code: "INVALID_EMAIL", message: "Invalid email" });
//     if (phone && !isPhone(phone)) return res.status(400).json({ success: false, code: "INVALID_PHONE", message: "Invalid phone number" });
//     if (!TYPES.has(type)) return res.status(400).json({ success: false, code: "INVALID_TYPE", message: "Invalid booking type" });

//     const property = await PropertyModel.findById(propertyId).populate("ownerId", "uname email number").lean();
//     if (!property) return res.status(404).json({ success: false, code: "PROPERTY_NOT_FOUND", message: "Property not found" });

//     const landlordId    = property.ownerId?._id;
//     const landlordEmail = property.ownerId?.email || property.contactInfo?.email || null;

//     const preferredDateObj = preferredDate ? parseISODate(preferredDate) : null;

//     if (await recentlySubmitted({ propertyId, email, name })) {
//       return res.status(429).json({ success: false, code: "DUPLICATE_RECENT", message: "Similar request submitted recently. Please wait a moment." });
//     }

//     const booking = await BookingModel.create({
//       type,
//       propertyId,
//       landlordId,
//       name: String(name).trim(),
//       email: email?.trim() || undefined,
//       phone: phone?.trim() || undefined,
//       ...(preferredDateObj ? { preferredDate: preferredDateObj } : {}),
//       message: message?.trim() || undefined,
//     });

//     // email landlord
//     let landlordAccepted = false;
//     if (landlordEmail) {
//       const subject = `${type === "visitBooking" ? "Visit booking" : "Contact request"}: ${property.title}`;
//       const textLines = [
//         `Property: ${property.title}`,
//         `Address: ${property.address || "-"}`,
//         "",
//         `Name: ${booking.name}`,
//         `Email: ${booking.email || "-"}`,
//         `Phone: ${booking.phone || "-"}`,
//         `Preferred date: ${booking.preferredDate ? new Date(booking.preferredDate).toString() : "-"}`,
//         "",
//         "Message:",
//         `${booking.message || "-"}`,
//         "",
//         "— GreenRent",
//       ];
//       try {
//         const info = await sendMailSafe({
//           to: landlordEmail,
//           subject,
//           text: textLines.join("\n"),
//           replyTo: booking.email || undefined,
//         });
//         landlordAccepted = (info.accepted || []).includes(landlordEmail);
//       } catch (err) {
//         console.error("Booking email error (landlord):", err);
//       }
//     }

//     // email requester
//     let requesterAccepted = false;
//     if (booking.email) {
//       const subject = `We received your ${type === "visitBooking" ? "visit booking" : "contact"} for ${property.title}`;
//       const plain = [
//         `Hi ${booking.name},`,
//         ``,
//         `Thanks for your interest in ${property.title}.`,
//         type === "visitBooking"
//           ? `Your visit request has been sent to the landlord.`
//           : `The landlord/manager has been notified and will contact you shortly.`,
//         booking.preferredDate ? `Preferred date: ${new Date(booking.preferredDate).toString()}` : "",
//         ``,
//         "— GreenRent",
//       ].join("\n");

//       const html = `
//         <div style="font-family:Arial,sans-serif;padding:20px;background:#f6fef8;border-radius:12px;">
//           <h2 style="color:#3cc172;margin:0 0 8px;">🌿 GreenRent</h2>
//           <p style="margin:0 0 12px;">Hi ${booking.name},</p>
//           <p style="margin:0 0 8px;">Thanks for your interest in <strong>${property.title}</strong>.</p>
//           <p style="margin:0 0 8px;">
//             ${type === "visitBooking"
//               ? "Your <strong>visit request</strong> has been sent to the landlord."
//               : "The landlord/manager has been notified and will contact you shortly."}
//           </p>
//           ${booking.preferredDate ? `<p style="margin:0 0 8px;"><strong>Preferred date:</strong> ${new Date(booking.preferredDate).toLocaleString()}</p>` : ""}
//           <p style="margin:16px 0 0;">— <strong>GreenRent</strong></p>
//         </div>
//       `;

//       try {
//         const info = await sendMailSafe({
//           to: booking.email,
//           subject,
//           text: plain,
//           html,
//         });
//         requesterAccepted = (info.accepted || []).includes(booking.email);
//       } catch (err) {
//         console.error("Booking email error (requester):", err);
//       }
//     }

//     // Optional push
//     // if (landlordId && typeof notifyUserPush === 'function') {
//     //   notifyUserPush(
//     //     landlordId,
//     //     type === "visitBooking" ? "New visit booking" : "New contact request",
//     //     `${booking.name} ${type === "visitBooking" ? "requested a visit" : "sent a contact request"} for "${property.title}"`,
//     //     { propertyId: String(property._id), bookingId: String(booking._id) }
//     //   ).catch((e) => console.error("Push notify error:", e));
//     // }

//     return res.status(201).json({
//       success: true,
//       data: { bookingId: booking._id },
//       mail: { landlordAccepted, requesterAccepted },
//     });
//   } catch (err) {
//     console.error("Create booking error:", err);
//     return res.status(500).json({ success: false, code: "INTERNAL_ERROR", message: "Failed to submit request" });
//   }
// });



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

    // dedupe quick repeats
    if (await recentlySubmitted({ propertyId, email, name })) {
      return res.status(429).json({ success: false, code: "DUPLICATE_RECENT", message: "Similar request submitted recently. Please wait a moment." });
    }

    const preferredDateObj = preferredDate ? parseISODate(preferredDate) : null;

    const booking = await BookingModel.create({
      type,
      propertyId,
      landlordId: property.ownerId?._id,
      name: String(name).trim(),
      email: email?.trim() || undefined,
      phone: phone?.trim() || undefined,
      ...(preferredDateObj ? { preferredDate: preferredDateObj } : {}),
      message: message?.trim() || undefined,
      status: "new",
    });

    const mail = await sendBookingEmails({ type, booking, property });

    return res.status(201).json({
      success: true,
      data: { bookingId: booking._id },
      mail, // { landlordAccepted, requesterAccepted }
    });
  } catch (err) {
    console.error("Create booking error:", err);
    return res.status(500).json({ success: false, code: "INTERNAL_ERROR", message: "Failed to submit request" });
  }
});

// ---------- LIST bookings ----------
router.get("/bookings", async (req, res) => {
  try {
    const {
      role,               // 'requester' | 'landlord'
      email,              // for requester
      landlordId,         // for landlord
      status,             // 'new' | 'contacted' | 'closed'
      type,               // 'contactRequest' | 'visitBooking'
      q,                  // free text
      page = "1",
      limit = "20",
    } = req.query;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const perPage = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const skip    = (pageNum - 1) * perPage;

    const where = {};
    if (role === "requester") {
      if (!email) return res.status(400).json({ success: false, message: "email is required for requester role" });
      where.email = email.trim().toLowerCase();
    } else if (role === "landlord") {
      if (!landlordId || !mongoose.Types.ObjectId.isValid(landlordId)) {
        return res.status(400).json({ success: false, message: "landlordId is required for landlord role" });
      }
      where.landlordId = new mongoose.Types.ObjectId(landlordId);
    } else {
      return res.status(400).json({ success: false, message: "role must be requester or landlord" });
    }

    if (status) where.status = status;
    if (type) where.type = type;

    const or = [];
    if (q && q.trim()) {
      const rx = new RegExp(q.trim(), "i");
      or.push({ name: rx }, { message: rx });
    }

    const pipeline = [
      { $match: where },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "greenrentproperties",
          localField: "propertyId",
          foreignField: "_id",
          as: "property",
        }
      },
      { $unwind: "$property" },
    ];

    if (or.length) {
      pipeline.push({
        $match: {
          $or: [
            ...or,
            { "property.title": { $regex: q, $options: "i" } },
            { "property.address": { $regex: q, $options: "i" } },
          ]
        }
      });
    }

    pipeline.push(
      {
        $facet: {
          items: [
            { $skip: skip },
            { $limit: perPage },
            {
              $project: {
                _id: 1, type: 1, propertyId: 1, landlordId: 1,
                name: 1, email: 1, phone: 1, preferredDate: 1, message: 1,
                status: 1, createdAt: 1, updatedAt: 1,
                property: {
                  _id: "$property._id",
                  title: "$property.title",
                  address: "$property.address",
                  photos: "$property.photos",
                  rentPrice: "$property.rentPrice",
                }
              }
            },
          ],
          total: [{ $count: "count" }],
        }
      }
    );

    const [result] = await BookingModel.aggregate(pipeline);
    const items = result?.items || [];
    const total = result?.total?.[0]?.count || 0;

    return res.json({
      success: true,
      data: items,
      page: pageNum,
      limit: perPage,
      total,
      pages: Math.ceil(total / perPage),
    });
  } catch (e) {
    console.error("list bookings error:", e);
    return res.status(500).json({ success: false, message: "Failed to load bookings" });
  }
});


// Your existing GET route (keep this)
// router.get("/bookings", async (req, res) => {
//   try {
//     const {
//       role,               // 'requester' | 'landlord'
//       email,              // for requester view
//       landlordId,         // for landlord view
//       status,             // 'new' | 'contacted' | 'closed'
//       type,               // 'contactRequest' | 'visitBooking'
//       q,                  // matches name, message, property title/address
//       page = "1",
//       limit = "20",
//     } = req.query;

//     const pageNum  = Math.max(parseInt(page, 10) || 1, 1);
//     const perPage  = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
//     const skip     = (pageNum - 1) * perPage;

//     // base filter
//     const where = {};
//     if (role === "requester") {
//       if (!email) return res.status(400).json({ success: false, message: "email is required for requester role" });
//       where.email = email.trim().toLowerCase();
//     } else if (role === "landlord") {
//       if (!landlordId || !mongoose.Types.ObjectId.isValid(landlordId)) {
//         return res.status(400).json({ success: false, message: "landlordId is required for landlord role" });
//       }
//       where.landlordId = new mongoose.Types.ObjectId(landlordId);
//     } else {
//       return res.status(400).json({ success: false, message: "role must be requester or landlord" });
//     }

//     if (status) where.status = status;
//     if (type) where.type = type;

//     // optional free-text: name/message and property fields
//     const or = [];
//     if (q && q.trim()) {
//       const rx = new RegExp(q.trim(), "i");
//       or.push({ name: rx }, { message: rx });
//     }

//     const pipeline = [
//       { $match: where },
//       { $sort: { createdAt: -1 } },
//       { $lookup: {
//           from: "greenrentproperties",
//           localField: "propertyId",
//           foreignField: "_id",
//           as: "property",
//         }
//       },
//       { $unwind: "$property" },
//     ];

//     if (or.length) {
//       pipeline.push({ $match: { $or: [
//         ...or,
//         { "property.title": { $regex: q, $options: "i" } },
//         { "property.address": { $regex: q, $options: "i" } },
//       ]}});
//     }

//     pipeline.push(
//       { $facet: {
//           items: [
//             { $skip: skip },
//             { $limit: perPage },
//             { $project: {
//                 _id: 1, type: 1, propertyId: 1, landlordId: 1,
//                 name: 1, email: 1, phone: 1, preferredDate: 1, message: 1,
//                 status: 1, createdAt: 1, updatedAt: 1,
//                 property: {
//                   _id: "$property._id",
//                   title: "$property.title",
//                   address: "$property.address",
//                   photos: "$property.photos",
//                   rentPrice: "$property.rentPrice",
//                 }
//             }},
//           ],
//           total: [{ $count: "count" }],
//       }}
//     );

//     const [result] = await BookingModel.aggregate(pipeline);
//     const items = result?.items || [];
//     const total = result?.total?.[0]?.count || 0;

//     return res.json({
//       success: true,
//       data: items,
//       page: pageNum,
//       limit: perPage,
//       total,
//       pages: Math.ceil(total / perPage),
//     });
//   } catch (e) {
//     console.error("list bookings error:", e);
//     return res.status(500).json({ success: false, message: "Failed to load bookings" });
//   }
// });


// ---------- REPLY to a booking (landlord -> requester) ----------
// POST /ReviewOperations/bookings/:id/reply  { message: string }
router.post('/bookings/:id/reply', /*authenticateUser,*/ async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid booking id' });
    }
    if (!message || !String(message).trim()) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    // Load booking with property (for subject/body context)
    const booking = await BookingModel.findById(id)
      .populate({ path: 'propertyId', select: 'title address ownerId' })
      .lean();

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    // Guard: need requester email to send
    if (!booking.email) {
      return res.status(400).json({ success: false, message: 'Booking has no requester email to reply to' });
    }

    // (Optional) If you have auth, ensure the caller is the landlord:
    // if (String(req.user._id) !== String(booking.landlordId)) return res.status(403).json({ success:false, message:'Forbidden' });

    const property = booking.propertyId || {};
    const subject = `Re: ${booking.type === 'visitBooking' ? 'Visit booking' : 'Contact request'} – ${property.title || 'your property'}`;

    const plain = [
      `Hi ${booking.name || 'there'},`,
      ``,
      message,
      ``,
      `— Landlord via GreenRent`,
    ].join('\n');

    const html = `
      <div style="font:14px/1.5 -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Arial;">
        <p>Hi ${booking.name || 'there'},</p>
        <p>${String(message).trim().replace(/\n/g, '<br>')}</p>
        <p style="color:#6b7280;margin-top:12px;">— Landlord via <strong>GreenRent</strong></p>
        <hr style="border:none;border-top:1px solid #eee;margin:16px 0;">
        <p style="color:#6b7280;margin:0;">Property: <strong>${property.title || '-'}</strong></p>
        <p style="color:#6b7280;margin:0;">Address: ${property.address || '-'}</p>
      </div>
    `;

    // Send email to requester
    let requesterAccepted = false;
    try {
      const info = await sendMailSafe({
        to: booking.email,
        subject,
        text: plain,
        html,
      });
      requesterAccepted = (info.accepted || []).includes(booking.email);
    } catch (e) {
      console.error('reply email error:', e);
    }

    // Persist message in thread (optional but nice)
    await BookingModel.updateOne(
      { _id: id },
      { $push: { messages: { from: 'landlord', body: String(message).trim(), at: new Date() } },
        $set: { status: 'contacted', updatedAt: new Date() } }
    );

    return res.json({ success: true, data: { requesterAccepted } });
  } catch (e) {
    console.error('reply route error:', e);
    return res.status(500).json({ success: false, message: 'Failed to send reply' });
  }
});

// ---------- FETCH message thread (optional) ----------
// GET /ReviewOperations/bookings/:id/messages
router.get('/bookings/:id/messages', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid booking id' });
    }
    const doc = await BookingModel.findById(id, { messages: 1, _id: 0 }).lean();
    if (!doc) return res.status(404).json({ success: false, message: 'Booking not found' });
    return res.json({ success: true, data: doc.messages || [] });
  } catch (e) {
    console.error('thread fetch error:', e);
    return res.status(500).json({ success: false, message: 'Failed to load messages' });
  }
});





// -------- Reviews (same behavior, kept concise)
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
          from: "greenrentproperties",
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
// import express from 'express';

// import multer from 'multer';
// import fs from 'fs';
// import PropertyModel from '../Models/Property.js';
// import authenticateUser from '../middleware/authenticateUser.js';// <- shared auth middleware
// import { getVisionClient } from '../lib/vision.js';

// const router = express.Router();

// // uploads dir for certificates
// const uploadDir = 'uploads/certificates';
// if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// const fileFilter = (_req, file, cb) => {
//   const ok = file.mimetype?.startsWith('image/') || file.mimetype === 'application/pdf';
//   cb(ok ? null : new Error('Only images or PDFs are allowed'), ok);
// };

// const upload = multer({
//   dest: uploadDir,
//   fileFilter,
//   limits: { fileSize: 10 * 1024 * 1024 },
// });

// // Parse OCR text → fields/badge
// function parseCertificateText(fullText = '') {
//   const text = String(fullText).replace(/\r/g, '');

//   const rating =
//     (text.match(/\b(Platinum|Gold|Silver|Bronze)\b/i)?.[1] ?? '') ||
//     (text.match(/Energy\s*Rating[:\s]*([A-G]\+?)/i)?.[1] ?? '');

//   const issuer = text.match(/Issuer[:\s]*([A-Za-z0-9,&.\-\s]{3,})/i)?.[1]?.trim() || '';
//   const certId = text.match(/(Cert(?:ificate)?\s*ID|Ref(?:erence)?)[\s:]*([A-Z0-9\-]+)/i)?.[2] || '';
//   const validUntil = text.match(/(Valid\s*Until|Expiry\s*Date)[\s:]*([0-9]{4}[-/][0-9]{2}[-/][0-9]{2})/i)?.[2] || '';
//   const issueDate = text.match(/(Issued\s*On|Issue\s*Date)[\s:]*([0-9]{4}[-/][0-9]{2}[-/][0-9]{2})/i)?.[2] || '';

//   const badge = (() => {
//     if (/platinum/i.test(rating) || /A\+/.test(rating)) return 'Platinum';
//     if (/gold/i.test(rating) || /^A$/i.test(rating)) return 'Gold';
//     if (/silver/i.test(rating) || /^B$/i.test(rating)) return 'Silver';
//     if (/bronze/i.test(rating) || /^C$/i.test(rating)) return 'Bronze';
//     return 'Unverified';
//   })();

//   const confidence = badge === 'Unverified' ? 0.4 : 0.85;

//   return { badge, fields: { rating, issuer, certId, issueDate, validUntil }, confidence };
// }

// // POST /CertificateOperations/ocr/:propertyId
// router.post('/ocr/:propertyId', authenticateUser, upload.single('certificate'), async (req, res) => {
//   const logPrefix = '[Certificate OCR]';
//   try {
//     const { propertyId } = req.params;

//     if (!req.file?.path) {
//       return res.status(400).json({ success: false, message: 'Certificate file is required' });
//     }

//     const prop = await PropertyModel.findById(propertyId);
//     if (!prop) return res.status(404).json({ success: false, message: 'Property not found' });

//     // Only owner or admin
//     const isOwner = String(prop.ownerId) === String(req.user._id);
//     if (!req.user.isAdmin && !isOwner) {
//       return res.status(403).json({ success: false, message: 'Unauthorized' });
//     }

//     // Get client lazily; this will throw a clear error if key missing
//     const vision = getVisionClient();

//     // OCR
//     const [result] = await vision.textDetection(req.file.path);
//     const detections = result?.textAnnotations || [];
//     const fullText = detections[0]?.description || '';
//     if (!fullText) {
//       return res.status(422).json({ success: false, message: 'No text detected in the certificate' });
//     }

//     const parsed = parseCertificateText(fullText);

//     // Save to property
//     prop.ecoCertificate = {
//       filePath: req.file.path,
//       ocrText: fullText,
//       issuer: parsed.fields.issuer,
//       certId: parsed.fields.certId,
//       issueDate: parsed.fields.issueDate,
//       validUntil: parsed.fields.validUntil,
//       ratingRaw: parsed.fields.rating,
//       parsedAt: new Date(),
//       confidence: parsed.confidence,
//     };
//     prop.ecoBadge = parsed.badge;
//     await prop.save();

//     return res.json({
//       success: true,
//       data: {
//         propertyId: prop._id,
//         ecoBadge: prop.ecoBadge,
//         certificate: prop.ecoCertificate,
//       },
//     });
//   } catch (err) {
//     console.error(`${logPrefix} error:`, err?.message || err);
//     return res.status(500).json({ success: false, message: 'OCR failed' });
//   }
// });

// export default router;



// import express from 'express';
// import multer from 'multer';
// import fs from 'fs';
// import PropertyModel from '../Models/Property.js';
// import authenticateUser from '../middleware/authenticateUser.js';
// import { getVisionClient } from '../lib/vision.js';

// const router = express.Router();

// // uploads dir for certificates
// const uploadDir = 'uploads/certificates';
// if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// const fileFilter = (_req, file, cb) => {
//   const ok = file.mimetype?.startsWith('image/') || file.mimetype === 'application/pdf';
//   cb(ok ? null : new Error('Only images or PDFs are allowed'), ok);
// };

// const upload = multer({
//   dest: uploadDir,
//   fileFilter,
//   limits: { fileSize: 10 * 1024 * 1024 },
// });

// // Parse OCR text → fields/badge
// function parseCertificateText(fullText = '') {
//   const text = String(fullText).replace(/\r/g, '');

//   const rating =
//     (text.match(/\b(Platinum|Gold|Silver|Bronze)\b/i)?.[1] ?? '') ||
//     (text.match(/Energy\s*Rating[:\s]*([A-G]\+?)/i)?.[1] ?? '');

//   const issuer = text.match(/Issuer[:\s]*([A-Za-z0-9,&.\-\s]{3,})/i)?.[1]?.trim() || '';
//   const certId = text.match(/(Cert(?:ificate)?\s*ID|Ref(?:erence)?)[\s:]*([A-Z0-9\-]+)/i)?.[2] || '';
//   const validUntil = text.match(/(Valid\s*Until|Expiry\s*Date)[\s:]*([0-9]{4}[-/][0-9]{2}[-/][0-9]{2})/i)?.[2] || '';
//   const issueDate = text.match(/(Issued\s*On|Issue\s*Date)[\s:]*([0-9]{4}[-/][0-9]{2}[-/][0-9]{2})/i)?.[2] || '';

//   const badge = (() => {
//     if (/platinum/i.test(rating) || /A\+/.test(rating)) return 'Platinum';
//     if (/gold/i.test(rating) || /^A$/i.test(rating)) return 'Gold';
//     if (/silver/i.test(rating) || /^B$/i.test(rating)) return 'Silver';
//     if (/bronze/i.test(rating) || /^C$/i.test(rating)) return 'Bronze';
//     return 'Unverified';
//   })();

//   const confidence = badge === 'Unverified' ? 0.4 : 0.85;

//   return { badge, fields: { rating, issuer, certId, issueDate, validUntil }, confidence };
// }

// // POST /CertificateOperations/ocr/:propertyId
// router.post('/ocr/:propertyId', authenticateUser, upload.single('certificate'), async (req, res) => {
//   const logPrefix = '[Certificate OCR]';
//   try {
//     const { propertyId } = req.params;

//     if (!req.file?.path) {
//       return res.status(400).json({ success: false, message: 'Certificate file is required' });
//     }

//     const prop = await PropertyModel.findById(propertyId);
//     if (!prop) return res.status(404).json({ success: false, message: 'Property not found' });

//     const isOwner = String(prop.ownerId) === String(req.user._id);
//     if (!req.user.isAdmin && !isOwner) {
//       return res.status(403).json({ success: false, message: 'Unauthorized' });
//     }

//     const vision = getVisionClient();

//     const [result] = await vision.textDetection(req.file.path);
//     const detections = result?.textAnnotations || [];
//     const fullText = detections[0]?.description || '';
//     if (!fullText) {
//       return res.status(422).json({ success: false, message: 'No text detected in the certificate' });
//     }

//     const parsed = parseCertificateText(fullText);

//     prop.ecoCertificate = {
//       filePath: req.file.path,
//       ocrText: fullText,
//       issuer: parsed.fields.issuer,
//       certId: parsed.fields.certId,
//       issueDate: parsed.fields.issueDate,
//       validUntil: parsed.fields.validUntil,
//       ratingRaw: parsed.fields.rating,
//       parsedAt: new Date(),
//       confidence: parsed.confidence,
//     };
//     prop.ecoBadge = parsed.badge;
//     await prop.save();

//     return res.json({
//       success: true,
//       data: {
//         propertyId: prop._id,
//         ecoBadge: prop.ecoBadge,
//         certificate: prop.ecoCertificate,
//       },
//     });
//   } catch (err) {
//     console.error(`${logPrefix} error:`, err?.message || err);
//     return res.status(500).json({ success: false, message: 'OCR failed' });
//   }
// });

// export default router;








// backend/controller/CertificateOperations.js
import express from 'express';
import multer from 'multer';
import fs from 'fs';
import PropertyModel from '../Models/Property.js';
import authenticateUser from '../middleware/authenticateUser.js'; // if named export: { authenticateUser }
import { getVisionClient } from '../lib/vision.js';

const router = express.Router();

// ───────────────────────── uploads dir ─────────────────────────
const uploadDir = 'uploads/certificates';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const fileFilter = (_req, file, cb) => {
  const ok =
    (file.mimetype && file.mimetype.startsWith('image/')) ||
    file.mimetype === 'application/pdf';
  cb(ok ? null : new Error('Only images or PDFs are allowed'), ok);
};

const upload = multer({
  dest: uploadDir,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// ───────────────────────── parsing ─────────────────────────
const TRUSTED_ISSUERS = [
  /IFC\s*EDGE/i,
  /EDGE\s+Buildings/i,
  /USGBC|GBCI/i,
  /Green\s*Building\s*Council\s*of\s*Sri\s*Lanka|GBCSL/i,
  /BRE|BREEAM/i,
  /Energy\s*Performance\s*Certificate|EPC/i,
];

/**
 * Parses OCR text into issuer/scheme/rating/dates/id and maps to ecoBadge.
 * Supports: EDGE, GreenSL, LEED, BREEAM, EPC + generic fallback.
 */
function parseCertificateText(fullText = '') {
  const text = String(fullText).replace(/\r/g, ' ').replace(/\s+/g, ' ');

  const found = (re) => {
    const m = text.match(re);
    return m ? (m[1] ?? m[0]) : '';
  };
  const has = (re) => re.test(text);

  // issuer & ids
  const issuer =
    found(/(IFC\s*EDGE|EDGE\s+Buildings|USGBC|GBCI|Green\s*Building\s*Council\s*of\s*Sri\s*Lanka|GBCSL|BRE\s*Global|BREEAM|Energy\s*Performance\s*Certificate|EPC)/i) ||
    found(/Issuer[:\s]*([A-Za-z0-9,&.\-\s]{3,})/i) ||
    '';

  const certId =
    found(/(?:Cert(?:ificate)?\s*(?:No|ID|Number|Ref(?:erence)?)[:\s]*([A-Z0-9\-\/\.]+))/i) ||
    found(/\b(EDGE-[A-Z0-9\-]+|LEED-[A-Z0-9\-]+|BREEAM-[A-Z0-9\-]+)\b/i) ||
    found(/\bEPC\s*Ref[:\s]*([A-Z0-9\-]+)\b/i) ||
    '';

  const issueDateRaw = found(/(?:Issued\s*On|Issue\s*Date)[:\s]*([0-9]{4}[-\/][0-9]{2}[-\/][0-9]{2})/i);
  const validUntilRaw = found(/(?:Valid\s*Until|Expiry\s*Date)[:\s]*([0-9]{4}[-\/][0-9]{2}[-\/][0-9]{2})/i);

  // detect scheme + rating
  let scheme = '';
  let ratingRaw = '';

  if (has(/\bEDGE\b/i)) {
    scheme = 'EDGE';
    if (has(/Zero\s*Carbon/i)) ratingRaw = 'EDGE Zero Carbon';
    else if (has(/Advanced/i)) ratingRaw = 'EDGE Advanced';
    else ratingRaw = 'EDGE Certified';
  } else if (has(/\bGreen\s*SL\b|\bGreenSL\b|\bGBCSL\b/i)) {
    scheme = 'GreenSL';
    ratingRaw = found(/\b(Platinum|Gold|Silver|Bronze)\b/i) || 'Unspecified';
  } else if (has(/\bLEED\b/i) || has(/\bUSGBC\b|\bGBCI\b/i)) {
    scheme = 'LEED';
    ratingRaw = found(/\b(Platinum|Gold|Silver|Certified)\b/i) || 'Certified';
  } else if (has(/\bBREEAM\b/i)) {
    scheme = 'BREEAM';
    ratingRaw = found(/\b(Outstanding|Excellent|Very\s*Good|Good|Pass)\b/i) || 'Pass';
  } else if (has(/\bEnergy\s*Performance\s*Certificate\b|\bEPC\b/i)) {
    scheme = 'EPC';
    ratingRaw = found(/\b(A\+|A|B|C|D|E|F|G)\b/i) || 'Unspecified';
  } else {
    // generic fallback
    ratingRaw =
      found(/\b(Platinum|Gold|Silver|Bronze)\b/i) ||
      found(/Energy\s*Rating[:\s]*([A-G]\+?)/i) ||
      '';
  }

  // map scheme+rating → ecoBadge
  let badge = 'Unverified';
  if (scheme === 'EDGE') {
    if (/Zero\s*Carbon/i.test(ratingRaw)) badge = 'Platinum';
    else if (/Advanced/i.test(ratingRaw)) badge = 'Gold';
    else if (/Certified/i.test(ratingRaw)) badge = 'Silver';
  } else if (scheme === 'GreenSL' || scheme === 'LEED') {
    if (/Platinum/i.test(ratingRaw)) badge = 'Platinum';
    else if (/Gold/i.test(ratingRaw)) badge = 'Gold';
    else if (/Silver/i.test(ratingRaw)) badge = 'Silver';
    else if (/Certified|Bronze/i.test(ratingRaw)) badge = 'Bronze';
  } else if (scheme === 'BREEAM') {
    if (/Outstanding/i.test(ratingRaw)) badge = 'Platinum';
    else if (/Excellent/i.test(ratingRaw)) badge = 'Gold';
    else if (/Very\s*Good/i.test(ratingRaw)) badge = 'Silver';
    else if (/Good|Pass/i.test(ratingRaw)) badge = 'Bronze';
  } else if (scheme === 'EPC') {
    if (/A\+/i.test(ratingRaw)) badge = 'Platinum';
    else if (/^A$/i.test(ratingRaw)) badge = 'Gold';
    else if (/^B$/i.test(ratingRaw)) badge = 'Silver';
    else if (/^C$/i.test(ratingRaw)) badge = 'Bronze';
  } else {
    if (/Platinum|A\+/i.test(ratingRaw)) badge = 'Platinum';
    else if (/Gold|^A$/i.test(ratingRaw)) badge = 'Gold';
    else if (/Silver|^B$/i.test(ratingRaw)) badge = 'Silver';
    else if (/Bronze|^C$/i.test(ratingRaw)) badge = 'Bronze';
  }

  // confidence heuristic
  let confidence = badge === 'Unverified' ? 0.4 : (scheme ? 0.9 : 0.85);

  // issuer trust gate (defense in depth)
  const issuerTrusted = TRUSTED_ISSUERS.some((re) => re.test(issuer));
  if (!issuerTrusted && badge !== 'Unverified') {
    badge = 'Unverified';
    confidence = 0.5;
  }

  return {
    badge,
    fields: {
      scheme,
      rating: ratingRaw,
      issuer: issuer?.trim(),
      certId,
      issueDate: issueDateRaw || '',
      validUntil: validUntilRaw || '',
    },
    confidence,
  };
}

// ───────────────────────── route ─────────────────────────

/**
 * POST /CertificateOperations/ocr/:propertyId
 * Body: multipart/form-data with field "certificate" (image/pdf)
 * Auth: bearer (authenticateUser)
 */
router.post(
  '/ocr/:propertyId',
  authenticateUser,
  upload.single('certificate'),
  async (req, res) => {
    const logPrefix = '[Certificate OCR]';
    const cleanup = () => {
      if (req.file?.path && fs.existsSync(req.file.path)) {
        try { fs.unlinkSync(req.file.path); } catch {}
      }
    };

    try {
      const { propertyId } = req.params;

      if (!req.file?.path) {
        return res.status(400).json({ success: false, message: 'Certificate file is required' });
      }

      const prop = await PropertyModel.findById(propertyId);
      if (!prop) {
        cleanup();
        return res.status(404).json({ success: false, message: 'Property not found' });
      }

      const isOwner = String(prop.ownerId) === String(req.user._id);
      if (!req.user.isAdmin && !isOwner) {
        cleanup();
        return res.status(403).json({ success: false, message: 'Unauthorized' });
      }

      // Lazy client init with explicit error
      let vision;
      try {
        vision = getVisionClient(); // must throw if key/client not configured
      } catch (e) {
        cleanup();
        return res.status(500).json({
          success: false,
          message: 'Vision client not configured. Check service account key / environment.',
        });
      }

      // OCR
      const [result] = await vision.textDetection(req.file.path);
      const detections = result?.textAnnotations || [];
      const fullText = detections[0]?.description || '';

      if (!fullText) {
        cleanup();
        return res.status(422).json({ success: false, message: 'No text detected in the certificate' });
      }

      const parsed = parseCertificateText(fullText);

      // Persist
      prop.ecoCertificate = {
        filePath: req.file.path,
        ocrText: fullText,
        issuer: parsed.fields.issuer,
        certId: parsed.fields.certId,
        issueDate: parsed.fields.issueDate,
        validUntil: parsed.fields.validUntil,
        ratingRaw: parsed.fields.rating,
        parsedAt: new Date(),
        confidence: parsed.confidence,
      };
      prop.ecoBadge = parsed.badge;

      await prop.save();

      // We keep the uploaded file on success to allow audit. If you want to move it elsewhere, do so here.

      return res.json({
        success: true,
        data: {
          propertyId: prop._id,
          ecoBadge: prop.ecoBadge,
          certificate: prop.ecoCertificate,
        },
      });
    } catch (err) {
      console.error('[Certificate OCR] error:', err?.message || err);
      // best-effort cleanup on hard failure
      try {
        if (req.file?.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      } catch {}
      return res.status(500).json({ success: false, message: 'OCR failed' });
    }
  }
);

export default router;
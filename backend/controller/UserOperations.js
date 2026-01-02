import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import UserModel from '../Models/User.js';
import Property from '../Models/Property.js';
import authenticateUser from '../middleware/authenticateUser.js';

const router = express.Router();

const {
  JWT_SECRET_KEY = 'dev-secret',
  JWT_EXPIRES_IN = '7d',
  GOOGLE_CLIENT_ID: ENV_GOOGLE_CLIENT_ID,
} = process.env;

const EFFECTIVE_GOOGLE_CLIENT_ID =
  ENV_GOOGLE_CLIENT_ID || '679694876927-f0h7oive0boe8o7hfj71ir4dioeatfbq.apps.googleusercontent.com';

const signAppJwt = (user) =>
  jwt.sign({ userId: String(user._id), email: user.email }, JWT_SECRET_KEY, { expiresIn: JWT_EXPIRES_IN });

const googleClient = new OAuth2Client(EFFECTIVE_GOOGLE_CLIENT_ID);

// --- CORS (optional; safe to keep) ---
router.use((req, res, next) => {
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:19006',
    'exp://192.168.1.100:19000',
  ];
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
  res.header('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') return res.status(200).end();
  next();
});

// --- Logging ---
router.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// --- Auth middleware (uses the SAME secret) ---
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

// --- Register ---
router.post("/register", async (req, res) => {
  console.log('Registration request received:', { body: req.body, headers: req.headers });

  if (!req.is('application/json')) {
    return res.status(415).json({ success: false, message: 'Content-Type must be application/json' });
  }

  const { uname, email, password, address, number } = req.body || {};

  if (!uname || !email || !password) {
    return res.status(400).json({ success: false, message: 'Name, email and password are required' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, message: 'Invalid email format' });
  }

  try {
    const existingUser = await UserModel.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new UserModel({
      uname,
      email: email.toLowerCase(),
      password: hashedPassword,
      address: address ?? null,
      number: typeof number === 'string' ? number : (number ? String(number) : null),
      isGoogleAuth: false
    });

    await user.save();

    const token = signAppJwt(user);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: { user: user.toJSON(), token }
    });
  } catch (err) {
    console.error('Registration error:', err);

    if (err?.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: Object.values(err.errors).map(e => e.message).join(', ')
      });
    }
    if (err?.code === 11000) {
      return res.status(409).json({ success: false, message: 'Email already exists' });
    }
    return res.status(500).json({ success: false, message: 'Registration failed' });
  }
});

// --- Login ---
// router.post('/login', async (req, res) => {
//   try {
//     const { email, password } = req.body || {};
//     if (!email || !password) {
//       return res.status(400).json({ success: false, message: 'Email and password are required' });
//     }

//     const user = await UserModel.findOne({ email: email.toLowerCase() });
//     if (!user) return res.status(401).json({ success: false, message: 'Invalid email or password' });

//     if (user.isGoogleAuth) {
//       return res.status(401).json({ success: false, message: 'Please use Google Sign-In for this account' });
//     }

//     const ok = await bcrypt.compare(password, user.password);
//     if (!ok) return res.status(401).json({ success: false, message: 'Invalid email or password' });

//     const token = signAppJwt(user);
//     res.status(200).json({ success: true, message: 'Login successful', data: { user: user.toJSON(), token } });
//   } catch (error) {
//     console.error('Login error:', error);
//     res.status(500).json({ success: false, message: 'Login failed. Please try again.' });
//   }
// });


router.post('/login', async (req, res) => {
  try {
    const { email = '', password = '' } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    // normalize email
    const emailNorm = String(email).trim().toLowerCase();

    // find user (case-insensitive)
    const user = await UserModel.findOne({ email: new RegExp(`^${emailNorm}$`, 'i') }).lean();
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Determine password hash field (support a few common names)
    const hash =
      user.passwordHash ||
      user.password ||            // NOTE: if this is a bcrypt hash, compare will work; if plain text, we handle fallback below.
      user.passHash ||
      '';

    let passwordOK = false;

    // First try bcrypt (expected)
    if (hash) {
      try {
        passwordOK = await bcrypt.compare(password, hash);
      } catch {
        passwordOK = false;
      }
    }

    // TEMP fallback: if your DB still has plain text password stored in `password`,
    // allow equality (remove this once all users are migrated to bcrypt).
    if (!passwordOK && typeof user.password === 'string' && user.password.length > 0) {
      if (user.password === password) {
        passwordOK = true;
      }
    }

    if (!passwordOK) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // sign JWT
    const secret = process.env.JWT_SECRET_KEY;
    if (!secret) {
      console.error('[Auth] Missing JWT_SECRET_KEY');
      return res.status(500).json({ success: false, message: 'Server misconfigured' });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.isAdmin ? 'admin' : 'user',
      },
      secret,
      { algorithm: 'HS256', expiresIn: '7d' }
    );

    // shape user object for client
    const safeUser = {
      _id: user._id,
      email: user.email,
      uname: user.uname,
      isAdmin: !!user.isAdmin,
    };

    return res.json({ success: true, data: { token, user: safeUser } });
  } catch (err) {
    console.error('[Auth/login] error:', err);
    return res.status(500).json({ success: false, message: 'Login failed' });
  }
});



// --- Google Auth ---
router.post('/google-auth', async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ success: false, message: 'Missing idToken' });

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: EFFECTIVE_GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture, email_verified } = payload;

    if (!email) return res.status(400).json({ success: false, message: 'Google did not provide an email' });

    let user = await UserModel.findOne({ email: email.toLowerCase() });

    if (!user) {
      user = new UserModel({
        googleId,
        email: email.toLowerCase(),
        uname: name || 'User',
        profilePicture: picture || null,
        isGoogleAuth: true,
        emailVerified: !!email_verified,
        password: null,
      });
      await user.save();
    }

    const token = signAppJwt(user);

    res.json({
      success: true,
      message: 'Google authentication successful',
      data: { token, user: user.toJSON() }
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(401).json({ success: false, message: 'Invalid Google token' });
  }
});

// --- Profile (auth) ---
router.get('/getUser', authenticateUser, async (req, res) => {
  try {
    const { password, __v, createdAt, updatedAt, ...userData } = req.user.toObject();
    res.json({ success: true, data: userData });
  } catch (err) {
    console.error('Profile error:', err);
    res.status(500).json({ success: false, message: 'Error fetching profile' });
  }
});

// --- Update (auth) ---
router.put('/update/:id', authenticateUser, async (req, res) => {
  try {
    if (req.params.id !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Unauthorized: Can only update your own profile' });
    }

    const { uname, address, number } = req.body;
    const updates = {};
    if (uname) updates.uname = uname;
    if (address) updates.address = address;
    if (number) updates.number = number;

    const updatedUser = await UserModel.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    }).select('-password -__v');

    if (!updatedUser) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, message: 'Profile updated successfully', data: updatedUser });
  } catch (err) {
    console.error('Update error:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: Object.values(err.errors).map(v => v.message).join(', ')
      });
    }
    res.status(500).json({ success: false, message: 'Error updating profile' });
  }
});

// --- Admin: get all (auth) ---
router.get('/getAllUsers', authenticateUser, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ success: false, message: 'Unauthorized: Admin access required' });
    }
    const users = await UserModel.find().select('-password -__v');
    res.json({ success: true, data: users });
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ success: false, message: 'Error retrieving users' });
  }
});

// --- Admin/User: delete (auth) ---
router.delete('/deleteUser/:id', authenticateUser, async (req, res) => {
  try {
    if (!req.user.isAdmin && req.params.id !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Unauthorized: Cannot delete this user' });
    }
    const deletedUser = await UserModel.findByIdAndDelete(req.params.id);
    if (!deletedUser) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ success: false, message: 'Error deleting user' });
  }
});


// use the imported authenticateUser
router.get('/wishlist', authenticateUser, async (req, res) => {
  const user = await UserModel.findById(req.user.id).select('wishlist').populate('wishlist');
  res.json({ success: true, data: user?.wishlist || [] });
});

router.post('/wishlist/:pid', authenticateUser, async (req, res) => {
  const { pid } = req.params;
  await Property.exists({ _id: pid });
  const user = await UserModel.findById(req.user.id).select('wishlist');
  if (!user.wishlist.includes(pid)) user.wishlist.push(pid);
  await user.save();
  res.json({ success: true, ids: user.wishlist });
});

router.delete('/wishlist/:pid', authenticateUser, async (req, res) => {
  const { pid } = req.params;
  const user = await UserModel.findById(req.user.id).select('wishlist');
  user.wishlist = user.wishlist.filter(id => String(id) !== String(pid));
  await user.save();
  res.json({ success: true, ids: user.wishlist });
});

router.get('/compare', authenticateUser, async (req, res) => {
  const user = await UserModel.findById(req.user.id).select('compare').populate('compare');
  res.json({ success: true, data: user?.compare || [] });
});

router.post('/compare/:pid', authenticateUser, async (req, res) => {
  const { pid } = req.params;
  await Property.exists({ _id: pid });
  const user = await UserModel.findById(req.user.id).select('compare');
  if (!user.compare.includes(pid)) {
    if (user.compare.length >= 4) return res.status(400).json({ success: false, message: 'Compare limit is 4' });
    user.compare.push(pid);
  }
  await user.save();
  res.json({ success: true, ids: user.compare });
});

router.delete('/compare/:pid', authenticateUser, async (req, res) => {
  const { pid } = req.params;
  const user = await UserModel.findById(req.user.id).select('compare');
  user.compare = user.compare.filter(id => String(id) !== String(pid));
  await user.save();
  res.json({ success: true, ids: user.compare });
});
export default router;
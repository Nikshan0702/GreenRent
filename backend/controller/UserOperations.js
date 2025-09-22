// import express from "express";
// import UserModel from "../Models/User.js";
// import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken";
// import { OAuth2Client } from 'google-auth-library';


// const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "679694876927-8rg0fvbr400i0iubd91vqsul4d1jae0u.apps.googleusercontent.com";
// const client = new OAuth2Client(CLIENT_ID);


// const router = express.Router();
// const JWT_SECRET = process.env.JWT_SECRET || 'jiggujigurailkilambuthupaar';
// const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';



// // Google Token Verification Function
// async function verifyGoogleToken(idToken) {
//     // Handle mock tokens for development
//     if (idToken === 'mock_id_token' || idToken === 'mock_access_token') {
//         console.log('Development: Using mock Google token');
//         return {
//             success: true,
//             payload: {
//                 sub: 'mock_google_id_123',
//                 email: 'mockuser@example.com',
//                 name: 'Mock Google User',
//                 picture: 'https://via.placeholder.com/150',
//                 email_verified: true
//             }
//         };
//     }

//     try {
//         const ticket = await client.verifyIdToken({
//             idToken,
//             audience: CLIENT_ID,
//         });
        
//         const payload = ticket.getPayload();
//         return {
//             success: true,
//             payload
//         };
//     } catch (error) {
//         console.error('Google token verification failed:', error);
//         return {
//             success: false,
//             error: 'Invalid Google token'
//         };
//     }
// }


// router.post("/google-auth", async (req, res) => {
//     try {
//         console.log('Google auth request received:', {
//             body: req.body,
//             timestamp: new Date().toISOString()
//         });

//         const { idToken, accessToken } = req.body;

//         if (!idToken && !accessToken) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Google token is required'
//             });
//         }

//         // Verify Google token
//         const verification = await verifyGoogleToken(idToken || accessToken);
        
//         if (!verification.success) {
//             return res.status(401).json({
//                 success: false,
//                 message: verification.error || 'Invalid Google token'
//             });
//         }

//         const { email, name, picture, sub: googleId } = verification.payload;

//         // Check if user already exists
//         const existingUser = await UserModel.findOne({
//             $or: [
//                 { email: email.toLowerCase() },
//                 { googleId: googleId }
//             ]
//         });

//         if (existingUser) {
//             // Update user if they signed up with email previously
//             if (!existingUser.googleId) {
//                 existingUser.googleId = googleId;
//                 existingUser.isGoogleAuth = true;
//                 existingUser.profilePicture = picture || existingUser.profilePicture;
//                 await existingUser.save();
//             }

//             console.log('Google login successful for:', email);
            
//             return res.status(200).json({
//                 success: true,
//                 message: "Login successful",
//                 data: existingUser
//             });
//         }

//         // Create new user with Google authentication
//         const newUser = new UserModel({
//             uname: name,
//             email: email.toLowerCase(),
//             googleId: googleId,
//             isGoogleAuth: true,
//             profilePicture: picture,
//             emailVerified: true
//             // No password for Google users
//         });

//         await newUser.save();
//         console.log('Google registration successful for:', email);

//         res.status(201).json({
//             success: true,
//             message: "Registration successful",
//             data: newUser
//         });

//     } catch (error) {
//         console.error('Google auth error:', error);
        
//         if (error.code === 11000) {
//             return res.status(409).json({
//                 success: false,
//                 message: 'User already exists with this email'
//             });
//         }

//         res.status(500).json({
//             success: false,
//             message: 'Google authentication failed. Please try again.'
//         });
//     }
// });


// router.post("/register", async (req, res) => {
//     // Log the request for debugging
  
  
  
  
    
//     console.log('Registration request received:', {
//       body: req.body,
//       headers: req.headers
//     });
  
//     // Validate content type
//     if (!req.is('application/json')) {
//       return res.status(415).json({
//         success: false,
//         message: 'Content-Type must be application/json'
//       });
//     }
  
//     const { uname, email, password, address, number } = req.body;
  
//     // Validate required fields
//     if (!uname || !email || !password) {
//       return res.status(400).json({
//         success: false,
//         message: 'Name, email and password are required'
//       });
//     }
  
//     // Validate email format
//     if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid email format'
//       });
//     }
  
//     try {
//       // Check if user exists
//       const existingUser = await UserModel.findOne({ email });
//       if (existingUser) {
//         return res.status(409).json({
//           success: false,
//           message: 'Email already exists'
//         });
//       }
  
//       // Hash password
//       const salt = await bcrypt.genSalt(10);
//       const hashedPassword = await bcrypt.hash(password, salt);
  
//       // Create user
//       const user = new UserModel({
//         uname,
//         email,
//         password: hashedPassword,
//         address: address || undefined, // Better to store undefined than empty string
//         number: number || undefined
//       });
  
//       await user.save();
  
//       // Respond without sensitive data
//       const userResponse = user.toObject();
//       delete userResponse.password;
//       delete userResponse.__v; // Remove version key
  
//       res.status(201).json({
//         success: true,
//         message: "User registered successfully",
//         data: userResponse
//       });
  
//     } catch (err) {
//       console.error('Registration error:', err);
      
//       let status = 500;
//       let message = 'Registration failed';
      
//       if (err.name === 'ValidationError') {
//         status = 400;
//         message = Object.values(err.errors).map(e => e.message).join(', ');
//       } else if (err.code === 11000) {
//         status = 409;
//         message = 'Email already exists';
//       }
      
//       res.status(status).json({
//         success: false,
//         message
//       });
//     }
//   });








// import express from "express";
// import UserModel from "../Models/User.js";
// import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken";
// import { OAuth2Client } from 'google-auth-library';

// const router = express.Router();

// // Initialize Google OAuth client
// const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "679694876927-8rg0fvbr400i0iubd91vqsul4d1jae0u.apps.googleusercontent.com";
// const client = new OAuth2Client(CLIENT_ID);

// const JWT_SECRET = process.env.JWT_SECRET_KEY || 'jiggujigurailkilambuthupaar';
// const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// // Generate JWT token
// const generateToken = (user) => {
//   return jwt.sign(
//     { 
//       userId: user._id, 
//       email: user.email 
//     },
//     JWT_SECRET,
//     { expiresIn: JWT_EXPIRES_IN }
//   );
// };

// // Google Token Verification Function
// async function verifyGoogleToken(idToken) {
//     try {
//         const ticket = await client.verifyIdToken({
//             idToken,
//             audience: CLIENT_ID,
//         });
        
//         const payload = ticket.getPayload();
//         return {
//             success: true,
//             payload
//         };
//     } catch (error) {
//         console.error('Google token verification failed:', error);
//         return {
//             success: false,
//             error: 'Invalid Google token'
//         };
//     }
// }

// router.post("/google-auth", async (req, res) => {
//     try {
//         console.log('Google auth request received:', {
//             body: req.body,
//             timestamp: new Date().toISOString()
//         });

//         const { idToken } = req.body;

//         if (!idToken) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Google ID token is required'
//             });
//         }

//         // Verify Google token
//         const verification = await verifyGoogleToken(idToken);
        
//         if (!verification.success) {
//             return res.status(401).json({
//                 success: false,
//                 message: verification.error || 'Invalid Google token'
//             });
//         }

//         const { email, name, picture, sub: googleId } = verification.payload;

//         // Check if user already exists
//         const existingUser = await UserModel.findOne({
//             $or: [
//                 { email: email.toLowerCase() },
//                 { googleId: googleId }
//             ]
//         });

//         let user;

//         if (existingUser) {
//             // Update user if they signed up with email previously
//             if (!existingUser.googleId) {
//                 existingUser.googleId = googleId;
//                 existingUser.isGoogleAuth = true;
//                 existingUser.profilePicture = picture || existingUser.profilePicture;
//                 await existingUser.save();
//             }
            
//             user = existingUser;
//             console.log('Google login successful for:', email);
//         } else {
//             // Create new user with Google authentication
//             user = new UserModel({
//                 uname: name,
//                 email: email.toLowerCase(),
//                 googleId: googleId,
//                 isGoogleAuth: true,
//                 profilePicture: picture,
//                 emailVerified: true
//             });

//             await user.save();
//             console.log('Google registration successful for:', email);
//         }

//         // Generate JWT token
//         const token = generateToken(user);

//         // Return user data with token
//         const userResponse = user.toObject();
//         delete userResponse.password;
//         delete userResponse.__v;

//         res.status(existingUser ? 200 : 201).json({
//             success: true,
//             message: existingUser ? "Login successful" : "Registration successful",
//             data: {
//                 user: userResponse,
//                 token
//             }
//         });

//     } catch (error) {
//         console.error('Google auth error:', error);
        
//         if (error.code === 11000) {
//             return res.status(409).json({
//                 success: false,
//                 message: 'User already exists with this email'
//             });
//         }

//         res.status(500).json({
//             success: false,
//             message: 'Google authentication failed. Please try again.'
//         });
//     }
// });





// router.use((req, res, next) => {
//     const allowedOrigins = [
//         'http://localhost:5173',
//         'http://localhost:19006',
//         'exp://192.168.1.100:19000' // Add your Expo client URL
//     ];
//     const origin = req.headers.origin;
    
//     if (allowedOrigins.includes(origin)) {
//         res.header('Access-Control-Allow-Origin', origin);
//     }
    
//     res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
//     res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
//     res.header('Access-Control-Allow-Credentials', 'true');
    
//     if (req.method === 'OPTIONS') {
//         return res.status(200).end();
//     }
    
//     next();
// });

// const authenticateUser = async (req, res, next) => {
//     try {
//         const authHeader = req.headers.authorization;
        
//         if (!authHeader?.startsWith('Bearer ')) {
//             return res.status(401).json({ 
//                 success: false,
//                 message: 'Authorization token required' 
//             });
//         }
    
//         const token = authHeader.split(' ')[1];
//         const decoded = jwt.verify(token, JWT_SECRET);
        
//         // Verify user still exists
//         const user = await UserModel.findById(decoded.userId);
//         if (!user) {
//             return res.status(401).json({
//                 success: false,
//                 message: 'User not found'
//             });
//         }
        
//         req.user = user; // Attach full user object
//         next();
//     } catch (err) {
//         console.error('Authentication error:', err);
        
//         let message = 'Invalid token';
//         if (err.name === 'TokenExpiredError') {
//             message = 'Token expired';
//         } else if (err.name === 'JsonWebTokenError') {
//             message = 'Invalid token';
//         }
        
//         return res.status(401).json({
//             success: false,
//             message
//         });
//     }
// };

// router.use((req, res, next) => {
//   // Log all incoming requests
//   console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
//   next();
// });




// // Login Endpoint - Improved
// // router.post("/login", async (req, res) => {
// //     const { email, password } = req.body;

// //     try {
// //         // Validate input
// //         if (!email || !password) {
// //             return res.status(400).json({
// //                 success: false,
// //                 message: "Email and password are required"
// //             });
// //         }

// //         const user = await UserModel.findOne({ email });
// //         if (!user) {
// //             return res.status(401).json({
// //                 success: false,
// //                 message: "Invalid credentials"
// //             });
// //         }

// //         const isMatch = await bcrypt.compare(password, user.password);
// //         if (!isMatch) {
// //             return res.status(401).json({
// //                 success: false,
// //                 message: "Invalid credentials"
// //             });
// //         }

// //         const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        
// //         res.json({
// //             success: true,
// //             message: "Login successful",
// //             token,
// //             user: {
// //                 _id: user._id,
// //                 uname: user.uname,
// //                 email: user.email,
// //                 address: user.address,
// //                 number: user.number
// //             }
// //         });
// //     } catch (err) {
// //         console.error('Login error:', err);
// //         res.status(500).json({
// //             success: false,
// //             message: "Server error during login"
// //         });
// //     }
// // });


// // Login Endpoint
// router.post("/login", async (req, res) => {
//     try {
//         const { email, password } = req.body;

//         if (!email || !password) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Email and password are required'
//             });
//         }

//         const user = await UserModel.findOne({ email: email.toLowerCase() });
        
//         if (!user) {
//             return res.status(401).json({
//                 success: false,
//                 message: 'Invalid email or password'
//             });
//         }

//         // Check if user is Google auth user trying to use password
//         if (user.isGoogleAuth) {
//             return res.status(401).json({
//                 success: false,
//                 message: 'Please use Google Sign-In for this account'
//             });
//         }

//         // Verify password
//         const isPasswordValid = await bcrypt.compare(password, user.password);
        
//         if (!isPasswordValid) {
//             return res.status(401).json({
//                 success: false,
//                 message: 'Invalid email or password'
//             });
//         }

//         res.status(200).json({
//             success: true,
//             message: "Login successful",
//             data: user
//         });

//     } catch (error) {
//         console.error('Login error:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Login failed. Please try again.'
//         });
//     }
// });


// // Get User Profile - Improved
// router.get("/getUser", authenticateUser, async (req, res) => {
//     try {
//         // User is already attached to req by authenticateUser middleware
//         const { password, __v, createdAt, updatedAt, ...userData } = req.user.toObject();
        
//         res.json({
//             success: true,
//             data: userData
//         });
//     } catch (err) {
//         console.error('Profile error:', err);
//         res.status(500).json({
//             success: false,
//             message: "Error fetching profile"
//         });
//     }
// });

// // Update User Profile - Fixed
// router.put("/update/:id", authenticateUser, async (req, res) => {
//     try {
//         if (req.params.id !== req.user._id.toString()) {
//             return res.status(403).json({
//                 success: false,
//                 message: "Unauthorized: Can only update your own profile"
//             });
//         }

//         const { uname, address, number } = req.body;
//         const updates = {};

//         if (uname) updates.uname = uname;
//         if (address) updates.address = address;
//         if (number) updates.number = number;

//         const updatedUser = await UserModel.findByIdAndUpdate(
//             req.user._id,
//             updates,
//             { new: true, runValidators: true }
//         ).select('-password -__v');

//         if (!updatedUser) {
//             return res.status(404).json({
//                 success: false,
//                 message: "User not found"
//             });
//         }

//         res.json({
//             success: true,
//             message: "Profile updated successfully",
//             data: updatedUser
//         });
//     } catch (err) {
//         console.error('Update error:', err);
        
//         let status = 500;
//         let message = "Error updating profile";
        
//         if (err.name === 'ValidationError') {
//             status = 400;
//             message = Object.values(err.errors).map(val => val.message).join(', ');
//         }
        
//         res.status(status).json({
//             success: false,
//             message
//         });
//     }
// });

// // Get All Users - Protected
// router.get("/getAllUsers", authenticateUser, async (req, res) => {
//     try {
//         // Only allow admins to get all users
//         if (!req.user.isAdmin) {
//             return res.status(403).json({
//                 success: false,
//                 message: "Unauthorized: Admin access required"
//             });
//         }

//         const users = await UserModel.find().select('-password -__v');
//         res.json({
//             success: true,
//             data: users
//         });
//     } catch (err) {
//         console.error('Get users error:', err);
//         res.status(500).json({
//             success: false,
//             message: "Error retrieving users"
//         });
//     }
// });

// // Delete User - Protected
// router.delete("/deleteUser/:id", authenticateUser, async (req, res) => {
//     try {
//         // Only allow admins or users deleting their own account
//         if (!req.user.isAdmin && req.params.id !== req.user._id.toString()) {
//             return res.status(403).json({
//                 success: false,
//                 message: "Unauthorized: Cannot delete this user"
//             });
//         }

//         const deletedUser = await UserModel.findByIdAndDelete(req.params.id);
//         if (!deletedUser) {
//             return res.status(404).json({
//                 success: false,
//                 message: "User not found"
//             });
//         }

//         res.json({
//             success: true,
//             message: "User deleted successfully"
//         });
//     } catch (err) {
//         console.error('Delete error:', err);
//         res.status(500).json({
//             success: false,
//             message: "Error deleting user"
//         });
//     }
// });

// export default router;






import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import UserModel from '../Models/User.js';
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

export default router;

import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    uname: { 
        type: String, 
        required: function() { return !this.isGoogleAuth; } 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true,
        lowercase: true,
        trim: true
    },
    address: { 
        type: String, 
        default: null 
    },
    number: { 
        type: String, 
        default: null 
    },
    password: { 
        type: String, 
        required: function() { return !this.isGoogleAuth; } 
    },
    googleId: { 
        type: String, 
        unique: true, 
        sparse: true 
    },
    isGoogleAuth: { 
        type: Boolean, 
        default: false 
    },
    profilePicture: { 
        type: String, 
        default: null 
    },
    emailVerified: { 
        type: Boolean, 
        default: false 
    },
    // Saved properties (for wishlist and compare)
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "GreenRentProperty", default: [] }],
    compare: [{ type: mongoose.Schema.Types.ObjectId, ref: "GreenRentProperty", default: [] }]
}, { 
    timestamps: true 
});

// Remove password from JSON output
UserSchema.methods.toJSON = function() {
    const user = this.toObject();
    delete user.password;
    delete user.__v;
    return user;
};

const UserModel = mongoose.model("GreenRentUser", UserSchema);
export default UserModel;
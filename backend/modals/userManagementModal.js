// const mongoose = require("mongoose");
// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");
// const crypto = require("crypto");
// const UserSchema = new mongoose.Schema(
//   {
//     firstName: {
//       type: String,
//     },
//     lastName: {
//       type: String,
//     },
//     // image: {
//     //   type: String
//     // },
//     // Profile image details
//     profileImage: {
//       imageUrl: { type: String}, // URL of the image
//       imageMimeType: { type: String}, // MIME type (e.g., image/jpeg)
//       imageName: { type: String}, // Original file name
//       // fieldName: { type: String, required: true } // Field name for identification
//     },
//     // Profile image details
//     // profileImage: {
//     //   imageUrl: { type: String}, // URL of the image
//     //   imageMimeType: { type: String}, // MIME type (e.g., image/jpeg)
//     //   imageName: { type: String}, // Original file name
//       // fieldName: { type: String, required: true } // Field name for identification
//     // },
//     password: {
//       type: String,
//       required: true,
//     },
//     email: {
//       type: String,
//       required: true,
//       unique: true,
//     },
//     // phone: {
//     //     type: String,
//     //     required: true,
//     //     unique: true
//     // },
//     bio: {
//       type: String,
//     },
//     websiteLink: {
//       type: String,
//     },

//     isProfileCompleted: { type: Boolean, default: false }, 
  

//     userRole: {
//       type: String,
//       enum: ["admin", "user"], // Allowed values
//       default: "user", // Default value
//     },
//     isEmailVerified: {
//       type: Boolean,
//       default: false, // Initially set to false
//     },
//     // Email verification
//     emailVerificationCode: String, // Stores the verification code
//     emailVerificationExpire: Date, // Expiration time for the token
//     // Reset password
//     resetPasswordToken: String, // Token to be used for password reset
//     resetPasswordExpire: Date, // Expiration time for the token

//     isActive: { type: Boolean, default: false },
//     lastSeen: { type: Date },
//   },
//   {
//     timestamps: true, // Enables createdAt and updatedAt fields automatically
//   }
// );

// // Hash password before saving
// UserSchema.pre("save", async function (next) {
//   if (this.isModified("password")) {
//     const salt = await bcrypt.genSalt(10);
//     this.password = await bcrypt.hash(this.password, salt);
//   }

//   // Check if profile is completed
//   if (
//     this.firstName &&
//     this.lastName &&
//     this.email &&
//     this.password &&
//     this.isModified("firstName", "lastName", "email", "password")
//   ) {
//     this.isProfileCompleted = true;
//   } else {
//     this.isProfileCompleted = false;
//   }

//   next();
// });

// // //update isProfileCompleted to true when the required fields are filled
// // UserSchema.pre("findOneAndUpdate", async function (next) {
// //   const update = this.getUpdate();

// //   // Check if necessary fields are being updated
// //   if (update.firstName && update.lastName && update.email && update.password) {
// //     update.isProfileCompleted = true;
// //   } else {
// //     update.isProfileCompleted = false;
// //   }

// //   this.setUpdate(update);
// //   next();
// // });





// UserSchema.methods.createJWT = function () {
//   return jwt.sign(
//     { userId: this._id, name: this.firstName, role: this.userRole },
//     process.env.JWT_SECRET,
//     {
//       expiresIn: process.env.JWT_LIFETIME,
//     }
//   );
// };

// UserSchema.methods.comparePassword = async function (canditatePassword) {
//   const isMatch = await bcrypt.compare(canditatePassword, this.password);
//   return isMatch;
// };

// // Generate and hash password reset token
// UserSchema.methods.getResetPasswordToken = function () {
//   const resetToken = crypto.randomBytes(20).toString("hex");

//   // Hash token and set to resetPasswordToken field
//   this.resetPasswordToken = crypto
//     .createHash("sha256")
//     .update(resetToken)
//     .digest("hex");

//   // Set expire time (e.g., 10 minutes)
//   this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

//   return resetToken;
// };

// UserSchema.methods.generateEmailVerificationCode = function () {
//   const verificationCode = Math.floor(
//     100000 + Math.random() * 900000
//   ).toString(); // Generate a 6-digit code
//   this.emailVerificationCode = crypto
//     .createHash("sha256")
//     .update(verificationCode)
//     .digest("hex"); // Hash the code
//   this.emailVerificationExpire = Date.now() + 2 * 60 * 1000; // Code valid for 10 minutes
//   return verificationCode; // Return unhashed code for sending via email
// };

// module.exports = mongoose.model("User", UserSchema);


const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const UserSchema = new mongoose.Schema(
  {
    firstName: { type: String },
    lastName: { type: String },
    profileImage: {
      imageUrl: { type: String }, // URL of the image
      imageMimeType: { type: String },
      imageName: { type: String },
    },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    bio: { type: String },
    websiteLink: { type: String },
    isProfileCompleted: { type: Boolean, default: false },
    userRole: { type: String, enum: ["admin", "user"], default: "user" },
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationCode: String,
    emailVerificationExpire: Date,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    isActive: { type: Boolean, default: false },
    lastSeen: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, transform: function (doc, ret) { 
      // Modify the output object
      ret.profileImage = ret.profileImage?.imageUrl || null; 
      delete ret.password; // Exclude password for safety
      return ret; 
    }},
    toObject: { virtuals: true }, // Apply to object conversions
  }
);

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

// JWT creation
UserSchema.methods.createJWT = function () {
  return jwt.sign(
    { userId: this._id, name: this.firstName, role: this.userRole },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_LIFETIME }
  );
};

// Compare password
UserSchema.methods.comparePassword = async function (canditatePassword) {
  return await bcrypt.compare(canditatePassword, this.password);
};

// Generate reset password token
UserSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");
  this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

// Generate email verification code
UserSchema.methods.generateEmailVerificationCode = function () {
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
  this.emailVerificationCode = crypto.createHash("sha256").update(verificationCode).digest("hex");
  this.emailVerificationExpire = Date.now() + 2 * 60 * 1000;
  return verificationCode;
};

module.exports = mongoose.model("User", UserSchema);

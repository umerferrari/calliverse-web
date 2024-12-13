const User = require("../modals/userManagementModal");
const deleteFile = require("../utils/deleteFile-Helper"); // File deletion helper
const CustomError = require("../utils/customError"); // Import CustomError

const sendEmail = require("../utils/sendEmail");

/**
 * Creates a new user and sends an email verification code.
 * @param {Object} userData - The data for creating the user.
 * @returns {Object} - The newly created user object.
 */
const createUser = async (userData) => {
  try {
    const { email, password } = userData;

    // Check if the email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new CustomError("Email already registered.", 400);
    }

    // Create a new user
    const user = new User({ email, password });

    // Generate email verification code
    const verificationCode = user.generateEmailVerificationCode();

    // Save the user to the database
    await user.save();

    // Prepare email content
    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; font-size: 16px; color: #333; }
            .header { background-color: #f8f8f8; padding: 20px 5px; text-align: center; }
            .content { padding: 20px 5px; }
            .footer { background-color: #f8f8f8; padding: 20px 5px; text-align: center; font-size: 14px; }
            .code { font-size: 24px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Email Verification</h1>
          </div>
          <div class="content">
            <p>Here is your new email verification code:</p>
            <p class="code">${verificationCode}</p>
            <p>This code will expire in 10 minutes.</p>
          </div>
          <div class="footer">
            <p>Ecofocus Team</p>
          </div>
        </body>
      </html>
    `;

    // Send verification email
    await sendEmail({
      to: user.email,
      subject: "Email Verification",
      html: htmlContent,
    });

    return user;
  } catch (error) {
    throw new CustomError(error.message, error.statusCode || 500);
  }
};

/**
 * Updates the user's profile fields and profile image.
 * @param {String} userId - The ID of the user to update.
 * @param {Object} updateData - An object containing the fields to update.
 * @param {Object} profileImageFile - The uploaded profile image file (optional).
 * @returns {Object} - The updated user document.
 */
const updateUser = async (userId, updateData, profileImageFile = null) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new CustomError("User not found.", 404);
    }

    // Handle profile image update if a new image is provided
    if (profileImageFile) {
      if (user.profileImage && user.profileImage.imageUrl) {
        deleteFile(user.profileImage.imageUrl); // Delete existing profile image
      }
      // Construct the correct image URL
      const baseUrl = process.env.BASE_URL;
      const relativePath = profileImageFile.path.replace(process.cwd(), ""); // Remove the root path
      updateData.profileImage = {
        imageUrl: `${baseUrl}${relativePath}`, // Example: http://localhost:3003/uploads/profile-images/filename.jpg
        imageMimeType: profileImageFile.mimetype,
        imageName: profileImageFile.originalname,
      };
    }

    // Update the user document
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        ...updateData,
      },
      { new: true }
    );
    //change isProfileCOmpleted to true if required fields are filled
    if (
      updatedUser.firstName &&
      updatedUser.lastName &&
      updatedUser.email &&
      updatedUser.password
    ) {
      updatedUser.isProfileCompleted = true;
    } else {
      updatedUser.isProfileCompleted = true;

    }
    const modifiedUpdatedUser = {
      _id: updatedUser?._id,
      profileImage: updatedUser?.profileImage || "",
      firstName: updatedUser?.firstName,
      lastName: updatedUser?.lastName,
      email: updatedUser?.email,
      bio: updatedUser?.bio || "",
      websiteLink: updatedUser?.websiteLink || "",
      isProfileCompleted: updatedUser?.isProfileCompleted,
    };
    return modifiedUpdatedUser;
  } catch (error) {
    throw new CustomError(error.message, error.statusCode || 500);
  }
};

const login = async (email, password) => {
  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      throw new CustomError("User not found", 404);
    }

    // Check if the password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new CustomError("Invalid password", 401); // 401 Unauthorized for incorrect credentials
    }

    // Check if the user's email is verified
    if (!user.isEmailVerified) {
      // Generate a new email verification code
      const verificationCode = user.generateEmailVerificationCode();
      await user.save();

      // Prepare verification email content
      const htmlContent = `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; font-size: 16px; color: #333; }
              .header { background-color: #f8f8f8; padding: 20px 5px; text-align: center; }
              .content { padding: 20px 5px; }
              .footer { background-color: #f8f8f8; padding: 20px 5px; text-align: center; font-size: 14px; }
              .code { font-size: 24px; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Email Verification</h1>
            </div>
            <div class="content">
              <p>Here is your new email verification code:</p>
              <p class="code">${verificationCode}</p>
              <p>This code will expire in 10 minutes.</p>
            </div>
            <div class="footer">
              <p>Ecofocus Team</p>
            </div>
          </body>
        </html>
      `;

      // Send verification email
      await sendEmail({
        to: user.email,
        subject: "Email Verification",
        html: htmlContent,
      });

      throw new CustomError(
        "Email not verified. Verification code sent to your email.",
        400 // 400 Bad Request for incomplete verification
      );
    }

    // Generate JWT token
    const token = user.createJWT();

    // Return user data and token
    return {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      profileImage: user?.profileImage,
      email: user?.email,
      isProfileCompleted: user?.isProfileCompleted,
      isEmailVerified: user.isEmailVerified,
      userId: user._id,
      bio: user?.bio || "",
      websiteLink: user?.websiteLink || "",
      token,
    };
  } catch (error) {
    throw new CustomError(error.message, error.statusCode || 500);
  }
};

module.exports = { login, updateUser, createUser };

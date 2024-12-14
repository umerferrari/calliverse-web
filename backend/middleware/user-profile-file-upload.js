const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Configure multer storage options for profile images
const profileImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folderPath = path.join(process.cwd(), 'uploads', 'profile-images'); // Folder for profile images

    // Ensure the folder exists
    fs.mkdirSync(folderPath, { recursive: true });

    cb(null, folderPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// Define the file filter for profile image uploads
const profileImageFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif']; // Only allow images
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true); // Accept file
  } else {
    cb(new Error('Invalid file type. Only images are allowed for profile images.'));
  }
};

// Create the multer upload middleware for profile images
const uploadProfileImage = multer({
  storage: profileImageStorage,
  fileFilter: profileImageFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // Max file size (5MB)
});

module.exports = uploadProfileImage;

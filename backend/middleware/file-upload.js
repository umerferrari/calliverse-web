const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Configure multer storage options
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Create different folders for each file type (image, video, document, audio)
    let folderPath = '';
    
    if (file.mimetype.startsWith('image/')) {
      folderPath = path.join(__dirname, 'uploads', 'images');
    } else if (file.mimetype.startsWith('video/')) {
      folderPath = path.join(__dirname, 'uploads', 'videos');
    } else if (file.mimetype.startsWith('audio/')) {
      folderPath = path.join(__dirname, 'uploads', 'audio');
    } else {
      folderPath = path.join(__dirname, 'uploads', 'documents');
    }

    cb(null, folderPath);
  },
  filename: (req, file, cb) => {
    // Generate a unique file name using UUID and append the file extension
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// Define the file filter for specific file types (images, audio, video, and documents)
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg', 'image/png', 'image/gif', // Image formats
    'audio/mpeg', 'audio/wav', // Audio formats
    'video/mp4', 'video/webm', 'video/avi', // Video formats
    'application/pdf', 'application/msword', 'application/vnd.ms-excel' // Document formats (PDF, Word, Excel)
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true); // Accept file
  } else {
    cb(new Error('Invalid file type. Only images, videos, audio, and documents are allowed.'));
  }
};

// Create the multer upload middleware with the storage options and file filter
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 } // Max file size (50MB)
});

module.exports = upload;

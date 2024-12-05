const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Configure multer storage options
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folderPath;
    if (file.mimetype.startsWith('image/')) {
      folderPath = path.join(process.cwd(), 'uploads', 'images'); // Use process.cwd() for root directory
    } else if (file.mimetype.startsWith('video/')) {
      folderPath = path.join(process.cwd(), 'uploads', 'videos');
    } else {
      folderPath = path.join(process.cwd(), 'uploads', 'others');
    }

    // Ensure the folder exists
    fs.mkdirSync(folderPath, { recursive: true });

    cb(null, folderPath);
  },
  filename: (req, file, cb) => {
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
    'application/pdf', // PDF format
    'application/msword', // Word (.doc)
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // Word (.docx)
    'application/vnd.ms-excel', // Excel (.xls)
    'application/zip', // Zip files
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

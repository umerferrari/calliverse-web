const multer = require('multer');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

// Configure S3 client (Cloudflare R2)
const s3 = new S3Client({
  region: 'auto',
  endpoint: 'https://<your-account-id>.r2.cloudflarestorage.com', // Replace with your endpoint
  credentials: {
    accessKeyId: '<YOUR_ACCESS_KEY>',
    secretAccessKey: '<YOUR_SECRET_KEY>',
  },
});

// Multer memory storage
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg', 'image/png', 'image/gif',
    'audio/mpeg', 'audio/wav',
    'video/mp4', 'video/webm', 'video/avi',
    'application/pdf', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/zip',
  ];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type.'));
  }
};

// Multer instance
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // Max file size 50MB
});

// Upload to R2 helper
const uploadToR2 = async (file, folder) => {
  const fileKey = `${folder}/${uuidv4()}${path.extname(file.originalname)}`;
  const command = new PutObjectCommand({
    Bucket: '<YOUR_BUCKET_NAME>',
    Key: fileKey,
    Body: file.buffer,
    ContentType: file.mimetype,
  });

  await s3.send(command);

  return {
    fileUrl: `https://<your-account-id>.r2.cloudflarestorage.com/${fileKey}`,
    fileName: file.originalname,
    fileSize: file.size,
    fileType: file.mimetype.startsWith('image/') ? 'image' :
              file.mimetype.startsWith('audio/') ? 'audio' :
              file.mimetype.startsWith('video/') ? 'video' : 'document',
  };
};



// Unified middleware to handle multiple fields
const handleFileUpload = (fields, folder) => {
    return async (req, res, next) => {
      const uploadHandler = upload.fields(fields);
  
      uploadHandler(req, res, async (err) => {
        if (err) {
          return res.status(400).json({ success: false, message: err.message });
        }
  
        try {
          req.uploadedFiles = {};
  
          // Process each field and upload to R2
          for (const fieldName of Object.keys(req.files)) {
            req.uploadedFiles[fieldName] = await Promise.all(
              req.files[fieldName].map((file) => uploadToR2(file, folder))
            );
          }
  
          next();
        } catch (error) {
          next(error);
        }
      });
    };
  };
  
  

module.exports = {
  uploadToR2,
  handleFileUpload
};

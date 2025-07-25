// middleware/upload.js
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('./cloudinary'); // Correct path for config

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'student-assignments', // Folder in Cloudinary
    allowed_formats: ['pdf', 'doc', 'docx', 'txt', 'zip', 'rar'],
    resource_type: 'raw' // Use 'raw' for non-image files
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

module.exports = upload;

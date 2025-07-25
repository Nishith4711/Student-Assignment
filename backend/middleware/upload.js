// backend/middleware/upload.js
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary'); // Ensure this exists

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'student-assignments',
    allowed_formats: ['pdf', 'doc', 'docx', 'txt', 'zip', 'rar'],
    resource_type: 'raw'
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 MB
  }
});

module.exports = upload;


const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2; // Ensure Cloudinary is properly set up

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Create Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'posts', // Folder name where you want to store the images on Cloudinary
    allowed_formats: ['jpg', 'png', 'jpeg', 'gif', 'svg'] // Allowed file formats
  }
});

// Initialize multer with Cloudinary storage
const upload = multer({ storage: storage });

module.exports = upload;

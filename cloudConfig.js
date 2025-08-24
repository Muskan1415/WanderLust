const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});

// Configure Multer Storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'wanderlust_DEV',   // ✅ change folder name as you want
        allowed_formats: ['jpg', 'png', 'jpeg'], // ✅ restrict file types
       // public_id: (req, file) => file.originalname.split('.')[0] + '-' + Date.now()
    },
});

module.exports = {
    cloudinary,
    storage
};

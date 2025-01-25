import multer from "multer";
// import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from 'cloudinary';
const { v2: cloudinaryV2 } = cloudinary;


// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});




// Set up CloudinaryStorage with transformations for resizing
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "user_hackathon",  // Folder in Cloudinary
    allowed_formats: ["jpg", "jpeg", "png"],  // Supported formats
    transformation: [
      // { width: 1024, height: 1024, crop: "fill", quality: 80 } // Apply resize and quality settings
      { "width": 1024, "height": 1024, "crop": "scale", "quality": 80 }
      // , { effect: "sepia" }, 

    ],
  },
});

export const upload = multer({ storage: storage });

// Route handler for file upload
export const uploadToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(file.path, { folder: "user_profiles" }, (error, result) => {
      if (error) {
        reject(new Error("Error uploading to Cloudinary"));
      } else {
        resolve(result);
      }
    });
  });
};

// src/utils/digitalOceanStorage.js
const aws = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");
const path = require("path");

// Configure AWS SDK for Digital Ocean Spaces
const spacesEndpoint = new aws.Endpoint("nyc3.digitaloceanspaces.com");
const s3 = new aws.S3({
  endpoint: spacesEndpoint,
  accessKeyId: process.env.DIGITAL_OCEAN_ACCESS_KEY,
  secretAccessKey: process.env.DIGITAL_OCEAN_SECRET_KEY,
  region: "nyc3",
  // Force path style for compatibility with Digital Ocean Spaces
  s3ForcePathStyle: true,
});

// Configure multer for file uploads
const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  storage: multerS3({
    s3: s3,
    bucket: "sew-smart",
    acl: "public-read", // Make uploaded files publicly readable
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => {
      // Generate unique filename with timestamp and original extension
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, `uploads/${uniqueSuffix}${ext}`);
    },
  }),
  fileFilter: (req, file, cb) => {
    // Allow only image files
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase(),
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error("Only image files (jpeg, jpg, png, gif) are allowed!"));
  },
});

// Helper function to delete a file from Spaces
const deleteFile = async (fileUrl) => {
  try {
    // Extract key from the full URL
    const key = fileUrl.split("nyc3.digitaloceanspaces.com/")[1];

    await s3
      .deleteObject({
        Bucket: "sew-smart",
        Key: key,
      })
      .promise();

    return true;
  } catch (error) {
    console.error("Error deleting file from Spaces:", error);
    return false;
  }
};

module.exports = { upload, deleteFile };

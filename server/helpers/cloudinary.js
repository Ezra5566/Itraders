const cloudinary = require("cloudinary").v2;
const multer = require("multer");

// Cloudinary config
cloudinary.config({
  cloud_name: "dzxrxtphf",
  api_key: "173856312271283",
  api_secret: "w6EJhysPMeU1nWrCVwDODPcvRJ0",
});

// Multer config
const storage = new multer.memoryStorage();
const upload = multer({ storage });

// Async uploader utility
async function imageUploadUtil(file) {
  const result = await cloudinary.uploader.upload(file, {
    resource_type: "auto",
  });
  return result;
}

// Export
module.exports = {
  upload,
  imageUploadUtil,
};

const cloudinary = require("cloudinary").v2;
const multer = require("multer");

cloudinary.config({
  cloud_name: "dzxrxtphf",
  api_key: "173856312271283",
  api_secret: "w6EJhysPMeU1nWrCVwDODPcvRJ0",
});

const storage = new multer.memoryStorage();

async function imageUploadUtil(file) {
  const result = await cloudinary.uploader.upload(file, {
    resource_type: "auto",
  });

  return result;
}

const upload = multer({ storage });

module.exports = { upload, imageUploadUtil };



// write the call code

 const result = await cloudinary.uploader.upload(file, {
   resource_type: "auto",
 });

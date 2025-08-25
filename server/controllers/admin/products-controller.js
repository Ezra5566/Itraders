const { imageUploadUtil } = require("../../helpers/cloudinary");
const Product = require("../../models/Product");

const handleImageUpload = async (req, res) => {
  try {
    console.log('handleImageUpload called');
    console.log('File received:', req.file);
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file received",
        details: "req.file is undefined"
      });
    }

    if (!req.file.buffer) {
      return res.status(400).json({
        success: false,
        message: "Invalid file format",
        details: "req.file.buffer is undefined"
      });Q
    }

    console.log('File buffer size:', req.file.buffer.length);
    console.log('File mimetype:', req.file.mimetype);

    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const url = "data:" + req.file.mimetype + ";base64," + b64;

    console.log('Uploading to Cloudinary...');
    const result = await imageUploadUtil(url);
    console.log('Cloudinary response:', result);

    res.json({
      success: true,
      result,
      debug: {
        fileReceived: true,
        bufferPresent: true,
        mimeType: req.file.mimetype,
        bufferLength: req.file.buffer.length
      }
    });
  } catch (error) {
    console.error('Error in handleImageUpload:', error);
    res.json({
      success: false,
      message: "Error uploading image",
      error: error.message,
      stack: error.stack
    });
  }
};

//add a new product
const addProduct = async (req, res) => {
  try {
    console.log('addProduct called');
    console.log('File received:', req.file);
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file received",
        details: "req.file is undefined"
      });
    }

    if (!req.file.buffer) {
      return res.status(400).json({
        success: false,
        message: "Invalid file format",
        details: "req.file.buffer is undefined"
      });
    }

    console.log('File buffer size:', req.file.buffer.length);
    console.log('File mimetype:', req.file.mimetype);

    // Convert file to base64
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const url = "data:" + req.file.mimetype + ";base64," + b64;

    console.log('Uploading to Cloudinary...');
    const result = await imageUploadUtil(url);
    console.log('Cloudinary response:', result);

    // Extract product details from request
    const {
      title,
      description,
      category,
      brand,
      price,
      salePrice,
      totalStock,
      averageReview,
    } = req.body;

    // Create new product with proper image properties
    const newProduct = new Product({
      mainImage: result.secure_url,
      images: [result.secure_url], // Store in both mainImage and images array
      title,
      description,
      category,
      brand,
      price,
      salePrice,
      totalStock,
      averageReview,
    });

    console.log('Saving product...', newProduct);
    await newProduct.save();
    console.log('Product saved:', newProduct);

    res.status(201).json({
      success: true,
      data: newProduct,
      debug: {
        fileReceived: true,
        bufferPresent: true,
        mimeType: req.file.mimetype,
        bufferLength: req.file.buffer.length,
        cloudinaryUrl: result.secure_url
      }
    });
  } catch (err) {
    console.error('Error in addProduct:', err);
    res.status(500).json({
      success: false,
      message: "Error occurred while creating product",
      error: err.message,
      stack: err.stack
    });
  }
};

//fetch all products

const fetchAllProducts = async (req, res) => {
  try {
    const listOfProducts = await Product.find({});
    res.status(200).json({
      success: true,
      data: listOfProducts,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error occured",
    });
  }
};

//edit a product
const editProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      image,
      title,
      description,
      category,
      brand,
      price,
      salePrice,
      totalStock,
      averageReview,
    } = req.body;

    let findProduct = await Product.findById(id);
    if (!findProduct)
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });

    findProduct.title = title || findProduct.title;
    findProduct.description = description || findProduct.description;
    findProduct.category = category || findProduct.category;
    findProduct.brand = brand || findProduct.brand;
    findProduct.price = price === "" ? 0 : price || findProduct.price;
    findProduct.salePrice =
      salePrice === "" ? 0 : salePrice || findProduct.salePrice;
    findProduct.totalStock = totalStock || findProduct.totalStock;
    findProduct.image = image || findProduct.image;
    findProduct.averageReview = averageReview || findProduct.averageReview;

    await findProduct.save();
    res.status(200).json({
      success: true,
      data: findProduct,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error occured",
    });
  }
};

//delete a product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);

    if (!product)
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });

    res.status(200).json({
      success: true,
      message: "Product delete successfully",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error occured",
    });
  }
};

module.exports = {
  handleImageUpload,
  addProduct,
  fetchAllProducts,
  editProduct,
  deleteProduct,
};

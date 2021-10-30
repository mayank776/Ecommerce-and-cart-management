const { productModel } = require("../models");

const { systemConfig } = require("../configs");

const { validator, aws } = require("../utils");

const registerProducts = async (req, res) => {
  try {
    const requestBody = req.body;
    // QUESTION -- HOW TO SEND REQUEST BODY SEPARATELY
    const files = req.files;

    // VALID REQUEST BODY

    if (!validator.isValid(requestBody)) {
      return res
        .status(400)
        .send({ status: "FAILURE", msg: "enter a request body" });
    }

    // VALID FILES
    if (!validator.isValid(files)) {
      return res
        .status(400)
        .send({ status: "FAILURE", msg: "please insert the file-data" });
    }

    if (!validator.validFile(files[0])) {
      return res
        .status(400)
        .send({ status: "FAILURE", msg: "please insert an image in files" });
    }

    let {
      title,
      description,
      price,
      currencyId,
      currencyFormat,
      isFreeShipping,
      style,
      availableSizes,
      installments,
    } = requestBody;

    if (!validator.isValid(title)) {
      return res.status(400).send({ status: "FAILURE", msg: "enter a title" });
    }

    let isTitleAlreadyUsed = await productModel.findOne({ title });

    if (isTitleAlreadyUsed) {
      return res
        .status(400)
        .send({ Status: false, msg: `${title} Already exists` });
    }

    if (!validator.isValid(description)) {
      return res
        .status(400)
        .send({ status: "FAILURE", msg: "enter a description" });
    }

    if (!validator.isValid(price)) {
      return res.status(400).send({ status: "FAILURE", msg: "enter a price" });
    }

    if (!validator.isValid(currencyId)) {
      return res
        .status(400)
        .send({ status: "FAILURE", msg: "enter a currencyId" });
    }

    if (!validator.isValid(currencyFormat)) {
      return res
        .status(400)
        .send({ status: "FAILURE", msg: "enter a currencyFormat" });
    }

    if (!validator.isValid(isFreeShipping)) {
      return res
        .status(400)
        .send({ status: "FAILURE", msg: "enter a isFreeShipping" });
    }

    if (!validator.isValid(style)) {
      return res.status(400).send({ status: "FAILURE", msg: "enter style" });
    }
    if (installments.length == 0) {
      installments = 0;
    }

    if (!validator.isValid(availableSizes)) {
      return res
        .status(400)
        .send({ status: "FAILURE", msg: "enter a availableSizes" });
    }

    if (!validator.isValidSize(availableSizes)) {
      res.status(400).send({
        status: false,
        msg: `${systemConfig.sizeEnumArray.join(",")} is required`,
      });
      return;
    }

    let productImage = await aws.uploadFile(files[0]);

    if (!productImage) {
      res
        .status(400)
        .send({ status: false, msg: "error in uloading the files" });
      return;
    }

    const newProduct = {
      title,
      description,
      price,
      currencyId,
      currencyFormat,
      isFreeShipping,
      productImage,
      style,
      availableSizes,
      installments,
    };

    const createProduct = await productModel.create(newProduct);

    res.status(201).send({ status: "SUCCESS", data: createProduct });
  } catch (error) {
    res.status(500).send({ status: "FAILURE", msg: error.message });
  }
};
// ha

const getProducts = async (req, res) => {
  try {
    const filterQuery = { isDeleted: false, deletedAt: null };
    const queryParams = req.query;

    if (validator.isValidRequestBody(queryParams)) {
      const { name, size, priceSort, priceGreaterThan, priceLessThan } =
        queryParams;

      if (validator.isValid(name)) {
        filterQuery["name"] = { $regex: `.*${name.trim()}.*` };
      }

      if (validator.isValid(priceSort)) {
        if (priceSort == "ascending") priceSort = 1;
        if (priceSort == "decending") priceSort = -1;
        //sort.price = priceSort;
        var sort = { price: priceSort };
      }

      if (validator.isValid(size)) {
        let sizeArr = size
          .trim()
          .split(",")
          .map((sizeArr) => sizeArr.trim());
        filterQuery["size"] = { $all: sizeArr };
      }

      if (validator.isValid(priceGreaterThan)) {
        filterQuery["price"] = { $gte: priceGreaterThan };
      }

      if (validator.isValid(priceLessThan)) {
        filterQuery["price"] = { $lte: priceLessThan };
      }
    }

    const product = await productModel.find(filterQuery).sort(sort);
    if (product.length == 0) {
      return res
        .status(400)
        .send({ status: "FAILURE", msg: "no product found" });
    }

    res.status(201).send({ status: "SUCCESS", data: product });
  } catch (error) {
    res.status(500).send({ status: "FAILURE", msg: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const productId = req.params.productId;

    if (!validator.isValid(productId)) {
      res
        .status(400)
        .send({ status: "FAILURE", message: `productId is required` });
      return;
    }

    if (!validator.isValidObjectId(productId)) {
      res.status(400).send({
        status: "FAILURE",
        message: `${productId} is not a valid user id`,
      });
      return;
    }

    const product = await productModel.findOne({
      _id: productId,
      isDeleted: false,
      deletedAt: null,
    });

    if (!product) {
      res.status(404).send({ status: "FAILURE", message: "Product not found" });
    }

    res.status(200).send({ status: "SUCCESS", data: product });
  } catch (error) {
    res.status(500).send({ status: "FAILURE", msg: error.message });
  }
};

const updateProductById = async (req, res) => {
  try {
    let requestBody = req.body;
    let productId = req.params.productId;
    let files = req.files;

    if (!validator.isValidObjectId(productId)) {
      return res
        .status(404)
        .send({ status: false, msg: "productId not found" });
    }
    let product = await productModel.findOne({ productId, isDeleted: false });

    if (!product) {
      return res
        .status(404)
        .send({ status: false, msg: "product not registered" });
    }

    let {
      title,
      description,
      price,
      currencyId,
      currencyFormat,
      isFreeShipping,
      style,
      availableSizes,
      installments,
    } = requestBody;

    let updatedproductData = {};
    if (validator.isValid(style)) {
      if (!Object.prototype.hasOwnProperty.call(updatedproductData, "$set"))
        updatedproductData["$set"] = {};

      updatedproductData["$set"]["style"] = style;
    }

    // description
    if (validator.isValid(price)) {
      if (!Object.prototype.hasOwnProperty.call(updatedproductData, "$set"))
        updatedproductData["$set"] = {};

      updatedproductData["$set"]["price"] = price;
    }

    if (validator.isValid(title)) {
      if (!Object.prototype.hasOwnProperty.call(updatedproductData, "$set"))
        updatedproductData["$set"] = {};

      updatedproductData["$set"]["title"] = title;
    }
    // description
    if (validator.isValid(description)) {
      if (!Object.prototype.hasOwnProperty.call(updatedproductData, "$set"))
        updatedproductData["$set"] = {};

      updatedproductData["$set"]["description"] = description;
    }

    if (validator.isValid(currencyFormat)) {
      if (!Object.prototype.hasOwnProperty.call(updatedproductData, "$set"))
        updatedproductData["$set"] = {};

      updatedproductData["$set"]["currencyFormat"] = currencyFormat;
    }

    if (validator.isValid(currencyId)) {
      if (!Object.prototype.hasOwnProperty.call(updatedproductData, "$set"))
        updatedproductData["$set"] = {};

      updatedproductData["$set"]["currencyId"] = currencyId;
    }
    if (validator.isValid(isFreeShipping)) {
      if (!Object.prototype.hasOwnProperty.call(updatedproductData, "$set"))
        updatedproductData["$set"] = {};

      updatedproductData["$set"]["isFreeShipping"] = isFreeShipping;
    }

    if (validator.isValid(availableSizes)) {
      if (!Object.prototype.hasOwnProperty.call(updatedproductData, "$set"))
        updatedproductData["$set"] = {};

      updatedproductData["$set"]["availableSizes"] = availableSizes;
    }

    if (validator.isValid(installments)) {
      if (!Object.prototype.hasOwnProperty.call(updatedproductData, "$set"))
        updatedproductData["$set"] = {};

      updatedproductData["$set"]["installments"] = installments;
    }

    let productImage = await aws.uploadFile(files[0]);

    if (!productImage) {
      res
        .status(400)
        .send({ status: false, msg: "error in uploading the files" });
      return;
    }
    if (validator.isValid(productImage)) {
      if (!Object.prototype.hasOwnProperty.call(updatedproductData, "$set"))
        updatedproductData["$set"] = {};

      updatedproductData["$set"]["productImage"] = productImage;
    }

    let upadateduser = await productModel.findOneAndUpdate(
      { _id: productId },
      updatedproductData,
      { new: true }
    );

    res
      .status(200)
      .send({
        status: true,
        message: "Product updated successfully",
        data: upadateduser,
      });
  } catch (error) {
    res.status(500).send({ status: "FAILURE", msg: error.message });
  }
};

const deleteProductById = async (req, res) => {
  try {
    let productId = req.params.productId;

    if (!validator.isValidObjectId(productId)) {
      return res
        .status(404)
        .send({ status: false, msg: "productId not found" });
    }
    let deletedAt = new Date();
    let product = await productModel.findOneAndUpdate(
      { _id: productId, isDeleted: false },
      { $set: { isDeleted: true, deletedAt: deletedAt } },
      { new: true }
    );
    if (!product) {
      return res.status(404).send({ status: false, msg: "product not found" });
    }
    res
      .status(200)
      .send({ status: true, message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).send({ status: "FAILURE", msg: error.message });
  }
};

module.exports = {
  registerProducts,
  getProducts,
  getProductById,
  updateProductById,
  deleteProductById,
};

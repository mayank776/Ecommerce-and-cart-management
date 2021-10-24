const { validator, aws } = require("../utils");
const { productModel } = require("../models")

let productCreate = async function (req, res) {
    try {
        if (!req.body.data) {
            return res.status(400).send({ status: false, msg: "please enter product details" })
        }

        const requestBody = JSON.parse(req.body.data);
        const files = req.files;

        // productImage
        if (!validator.isValidFiles(files)) {
            res.status(400).send({ status: false, message: "file must be sent" });
        }

        if (!validator.isValidImage(files[0])) {
            return res.status(400).send({ status: false, message: "invalid image format" })
        }

        let productImage = await aws.uploadFile(files[0]);

        if (!validator.isValidRequestBody(requestBody)) {
            res.status(400).send({
                status: false,
                message: "Invalid request parameters. Please provide product details",
            });
            return;
        }

        let { title, description, price, currencyId, isFreeShipping, style, availableSizes, installments, isDeleted } = requestBody

        //title
        if (!validator.isValid(title)) {
            return res.status(400).send({ status: false, message: "title is required" })
        }

        let isTitleAlreadyUsed = await productModel.findOne({ title });

        if (isTitleAlreadyUsed) {
            res
                .status(400)
                .send({ status: false, msg: `this ${title} is already present` });
            return;
        }

        //description 
        if (!validator.isValid(description)) {
            return res.status(400).send({ status: false, message: "title is required" })
        }

        //price
        if (!validator.isValid(price)) {
            return res.status(400).send({ status: false, message: "price is required" })
        }

        if (!validator.isValidPrice(price)) {
            return res.status(400).send({ status: false, message: "invalid price" })
        }

        //currencyID
        if (!validator.isValid(currencyId)) {
            return res.status(400).send({ status: false, message: "currencyId is required" })
        }

        if (!validator.isValidCurrencyId(currencyId)) {
            return res.status(400).send({ status: false, message: "currency Id must be INR" })
        }

        //shipping
        if (isFreeShipping && !validator.isValidFreeShipping(isFreeShipping)) {
            return res.status(400).send({ status: false, message: "isFreeShipping should be true or false" })
        }

        //style
        if (style && !validator.isValid(style)) {
            return res.status(400).send({ status: false, message: "style shouldn't be empty" })
        }

        //installments ("" is null and valid)
        if (installments) {
            if (!validator.isValidNumber(parseInt(installments))) {
                return res.status(400).send({ status: false, message: "installment should be number" })
            }
        }

        //availablesSizes
        if (!validator.isValid(availableSizes)) {
            res.status(400).send({ status: false, message: 'availableSizes is Required' })
            return
        };

        if (!validator.isValidArray(availableSizes)) {
            res.status(400).send({ status: false, message: 'Should have atleast one size available' })
            return
        };

        if (!validator.isValidSize(availableSizes)) {
            res.status(400).send({ status: false, message: 'Should have atleast one size available' })
            return
        };

        // deletedAt
        if (isDeleted == true)
            var deletedAt = new Date()

        // creating model
        let newProduct = {
            title,
            description,
            price,
            currencyId,
            currencyFormat: "₹",
            isFreeShipping,
            productImage,
            style,
            availableSizes,
            installments,
            isDeleted,
            deletedAt
        }
        let createdProduct = await productModel.create(newProduct)
        res.status(201).send({ status: false, message: "success", data: createdProduct })

    }
    catch (error) {
        res.status(500).send({ status: false, error: error.message })
    }
}


const listProducts = async function (req, res) {
    try {
        const filterQuery = { isDeleted: false };
        const queryParams = req.query;
        const sort = {};
        if (validator.isValidRequestBody(queryParams)) {
            const { size, productName, priceGreaterThan, priceLessThan, sortOrder } =
                queryParams;
            if (validator.isValid(productName)) {
                filterQuery["title"] = productName.trim();
            }
            if (validator.isValid(size)) {
                const sizeArr = size
                    .trim()
                    .split(",")
                    .map((size1) => size1.trim());
                filterQuery["availableSizes"] = { $all: sizeArr };
            }
            if (validator.isValid(priceGreaterThan)) {
                filterQuery["price"] = { $gte: priceGreaterThan };
            }
            if (validator.isValid(priceLessThan)) {
                filterQuery["price"] = { $lte: priceLessThan };
            }
            if (validator.isValid(sortOrder)) {
                if (sortOrder === "ascending") {
                    sortValue = 1;
                }
                if (sortOrder === "descending") {
                    sortValue = -1;
                }
                sort.price = sortValue;
            }
        }
        const products = await productModel.find(filterQuery).sort(sort);
        if (Array.isArray(products) && products.length === 0) {
            res.status(404).send({ status: false, message: "No products found" });
            return;
        }
        res
            .status(200)
            .send({ status: true, message: "Products list", data: products });
    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
};

const getProductById = async function (req, res) {
    try {
        const productId = req.params.productId
        if (!validator.isValidObjectId(productId)) {
            res.status(400).send({ status: false, message: `${productId} is not a valid product id` })
            return
        }
        const product = await productModel.findOne({ _id: productId }, { __v: 0 })
        if (!product) {
            res.status(404).send({ status: false, message: "Product not found" })
        }
        res.status(200).send({ status: true, data: product })
    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
}

const updateProduct = async function (req, res) {
    try {
        const requestBody = JSON.parse(req.body.data)
        const files = req.files;

        const productId = req.params.productId

        // Validation stats
        if (!validator.isValidObjectId(productId)) {
            res.status(400).send({ status: false, message: `${productId} is not a valid product id` })
            return
        }

        const product = await productModel.findOne({ _id: productId, isDeleted: false })

        if (!product) {
            res.status(404).send({ status: false, message: `product not found` })
            return
        }

        if (!validator.isValidRequestBody(requestBody) && !validator.isValidFiles(files)) {
            res.status(200).send({ status: true, message: 'Nothing to update' })
            return
        }

        const updatedProductData = {}
        // productImage
        if (validator.isValidImage(files[0])) {
            if (!Object.prototype.hasOwnProperty.call(updatedProductData, "$set"))
                updatedProductData["$set"] = {};
            updatedProductData["$set"]["files"] = await aws.uploadFile(files[0]);
        }
        else
            return res.satatus(400).send({ status: false, message: "invalid image format" })

        // Extract params

        let { title, description, price, currencyId, isFreeShipping, style, availableSizes, installments, isDeleted } = requestBody

        if (validator.isValid(title)) {
            if (!Object.prototype.hasOwnProperty.call(updatedProductData, '$set')) updatedProductData['$set'] = {}
            updatedProductData['$set']['title'] = title
        }

        const isTitleAlreadyUsed = await productModel.findOne({ title });

        if (isTitleAlreadyUsed) {
            res.status(400).send({ status: false, message: `${title} Title is already used` })
            return
        }

        //description
        if (validator.isValid(description)) {
            if (!Object.prototype.hasOwnProperty.call(updatedProductData, '$set')) updatedProductData['$set'] = {}
            updatedProductData['$set']['description'] = description
        }

        //price
        if (validator.isValid(price)) {
            if (!validator.isValidPrice(price))
                return res.status(400).send({ status: false, message: `price should be number` })
            if (!Object.prototype.hasOwnProperty.call(updatedProductData, '$set')) updatedProductData['$set'] = {}
            updatedProductData['$set']['price'] = price
        }

        //currencyId
        if (validator.isValid(currencyId)) {
            if (!validator.isValidCurrencyId(currencyId))
                return res.status(400).send({ status: false, message: `currencyId must be INR` })

            if (!Object.prototype.hasOwnProperty.call(updatedProductData, '$set')) updatedProductData['$set'] = {}
            updatedProductData['$set']['currencyId'] = currencyId
        }

        //isFreeShipping4
        if (validator.isValid(isFreeShipping)) {
            if (!validator.isValidFreeShipping(isFreeShipping))
                return res.status(400).send({ status: false, message: `isFreeShipping must be either true or false` })

            if (!Object.prototype.hasOwnProperty.call(updatedProductData, '$set')) updatedProductData['$set'] = {}
            updatedProductData['$set']['isFreeShipping'] = isFreeShipping
        }

        //styles
        if (validator.isValid(style)) {
            if (!Object.prototype.hasOwnProperty.call(updatedProductData, '$set')) updatedProductData['$set'] = {}
            updatedProductData['$set']['style'] = style
        }

        //availableSizes
        if (validator.isValid(availableSizes)) {
            if (!validator.isValidArray(availableSizes)) {
                return res.status(400).send({ status: false, message: 'should have atleast one available size' })
            }
            else {
                if (!validator.isValidSize(availableSizes))
                    return res.status(400).send({ status: false, message: 'improper size' })
                if (!Object.prototype.hasOwnProperty.call(updatedProductData, '$set')) updatedProductData['$set'] = {}

                for (let i = 0; i < availableSizes.length; i++) {
                    let alreadyAvailableSizes = product.availableSizes
                    if (!alreadyAvailableSizes.includes(availableSizes[i]))
                        alreadyAvailableSizes.push(availableSizes[i])
                    updatedProductData['$set']['availableSizes'] = alreadyAvailableSizes
                }
            }
        }
        //installments
        if (validator.isValid(installments)) {
            if (!validator.isValidInstallment(installments))
                return res.status(400).send({ status: false, message: `invalid insallment` })
            if (!Object.prototype.hasOwnProperty.call(updatedProductData, '$set')) updatedProductData['$set'] = {}
            updatedProductData['$set']['installments'] = installments
        }

        // isDeleted
        if (validator.isValid(isDeleted)) {
            if (!validator.isValidFreeShipping(isDeleted))
                return res.status(400).send({ status: false, message: "isDelted must be true or false" })
            if (!Object.prototype.hasOwnProperty.call(updatedProductData, '$set')) updatedProductData['$set'] = {}
            updatedProductData['$set']['isDeleted'] = isDeleted
        }

        //deletedAt (remove deletedAt from product)
        if (isDeleted === true)
            updatedProductData['$set']['deletedAt'] = new Date()

        const updatedproduct = await productModel.findOneAndUpdate({ _id: productId }, updatedProductData, { new: true })

        res.status(200).send({ status: true, message: 'product updated successfully', data: updatedproduct });

    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
}

module.exports = {
    productCreate,
    listProducts,
    getProductById,
    updateProduct
};

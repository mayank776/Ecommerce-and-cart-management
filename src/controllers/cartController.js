const { userModel, productModel, cartModel } = require("../models");

const { validator, jwt } = require("../utils");

const addToCart = async (req, res) => {
  try {
    const userIdFromParams = req.params.userId;

    if (!validator.isValid(userIdFromParams)) {
      return res
        .status(400)
        .send({ status: "FAILURE", msg: "enter the userId" });
    }
    if (!validator.isValidObjectId(userIdFromParams)) {
      return res
        .status(400)
        .send({ status: "FAILURE", msg: "enter a valid userId" });
    }

    const user = await userModel.findOne({ _id: userIdFromParams });

    if (!user) {
      return res.status(404).send({ status: "FAILURE", msg: "user not found" });
    }

    const cartAlreadyPresent = await cartModel.findOne({
      userId: userIdFromParams,
    });

    const requestBody = req.body;

    if (!validator.isValidRequestBody(requestBody)) {
      return res.status(400).send({ status: "FAILURE", msg: "enter a body" });
    }

    const { userId, items } = requestBody;

    if (!validator.isValid(userId)) {
      return res
        .status(400)
        .send({ status: "FAILURE", msg: "enter the userId" });
    }

    if (!validator.isValidObjectId(userId)) {
      return res
        .status(400)
        .send({ status: "FAILURE", msg: "enter a valid userId" });
    }

    if (userIdFromParams !== userId) {
      return res.status(400).send({
        status: "FAILURE",
        msg: "user in params doesn't match with user in body",
      });
    }

    if (!validator.isValid(items.productId)) {
      return res
        .status(400)
        .send({ status: "FAILURE", msg: "enter the productId" });
    }

    if (!validator.isValidObjectId(items.productId)) {
      return res
        .status(400)
        .send({ status: "FAILURE", msg: "enter a valid productId" });
    }

    if (!validator.isValid(items.quantity) && items.quantity < 1) {
      return res
        .status(400)
        .send({ status: "FAILURE", msg: "enter a qunatity more than 1 " });
    }

    const product = await productModel.findOne({ _id: items.productId });

    if (!product) {
      return res
        .status(404)
        .send({ status: "FAILURE", msg: "product not found" });
    }

    let totalItems = items.length;
    let totalPrice = product.price * totalItems;

    if (cartAlreadyPresent) {
      totalItems += 1;
      totalPrice += cartAlreadyPresent.totalPrice;

      // if product is already added then only quantity will increase
      const cart = await cartModel.findOneAndUpdate(
        { userId: userIdFromParams },
        {
          $push: { items: items },
          $set: { totalPrice: totalPrice, totalItems: totalItems },
        },
        { new: true }
      );
      return res.status(201).send({ status: "SUCCESS", data: cart });
    }

    newCart = {
      userId,
      items,
      totalPrice,
      totalItems,
    };

    createCart = await cartModel.create(newCart);

    res.status(201).send({ status: "SUCCESS", data: createCart });
  } catch (error) {
    res.status(500).send({ status: "FAILURE", msg: error.message });
  }
};

const removeFromCart = async (req, res) => {
  try {
  } catch (error) {
    res.status(500).send({ status: "FAILURE", msg: error.message });
  }
};

const getFromCart = async (req, res) => {
  try {
    const userIdFromParams = req.params.userId;
    const userIdFromToken = req.userId;

    if (!validator.isValid(userIdFromParams)) {
      return res
        .status(400)
        .send({ status: "FAILURE", msg: "enter the userId" });
    }
    if (!validator.isValidObjectId(userIdFromParams)) {
      return res
        .status(400)
        .send({ status: "FAILURE", msg: "enter a valid userId" });
    }

    if (!validator.isValidObjectId(userIdFromToken)) {
      return res
        .status(400)
        .send({ status: "FAILURE", msg: "token user id not valid" });
    }

    if (userIdFromParams !== userIdFromToken) {
      return res
        .status(400)
        .send({ status: "FAILURE", msg: "user not authorised" });
    }

    const user = await userModel.findOne({ _id: userIdFromParams });

    if (!user) {
      return res.status(404).send({ status: "FAILURE", msg: "user not found" });
    }

    const cart = await cartModel.findOne({
      userId: userIdFromParams,
    });

    if (!cart) {
      return res
        .status(404)
        .send({ status: "FAILURE", msg: "cart not found!! add some products" });
    }

    res.status(200).send({ status: "SUCCESS", data: cart });
  } catch (error) {
    res.status(500).send({ status: "FAILURE", msg: error.message });
  }
};

const deleteCart = async (req, res) => {
  try {
    const userIdFromParams = req.params.userId;
    const userIdFromToken = req.userId;

    if (!validator.isValid(userIdFromParams)) {
      return res
        .status(400)
        .send({ status: "FAILURE", msg: "enter the userId" });
    }
    if (!validator.isValidObjectId(userIdFromParams)) {
      return res
        .status(400)
        .send({ status: "FAILURE", msg: "enter a valid userId" });
    }

    if (!validator.isValidObjectId(userIdFromToken)) {
      return res
        .status(400)
        .send({ status: "FAILURE", msg: "token user id not valid" });
    }

    if (userIdFromParams !== userIdFromToken) {
      return res
        .status(400)
        .send({ status: "FAILURE", msg: "user not authorised" });
    }

    const user = await userModel.findOne({ _id: userIdFromParams });

    if (!user) {
      return res.status(404).send({ status: "FAILURE", msg: "user not found" });
    }

    const deletedCart = await cartModel.findOneAndUpdate(
      {
        userId: userIdFromParams,
      },
      { $set: { items: null, totalItems: 0, totalPrice: 0 } },
      { new: true }
    );

    if (!deletedCart) {
      return res
        .status(404)
        .send({ status: "FAILURE", msg: "cart not found!! add some products" });
    }

    res.status(200).send({ status: "SUCCESS", data: deletedCart });
  } catch (error) {
    res.status(500).send({ status: "FAILURE", msg: error.message });
  }
};

module.exports = {
  addToCart,
  removeFromCart,
  getFromCart,
  deleteCart,
};

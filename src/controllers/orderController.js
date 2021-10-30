const { userModel, productModel, cartModel, orderModel } = require("../models");

const { systemConfig } = require("../configs");

const { validator } = require("../utils");

const createOrder = async (req, res) => {
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

    const requestBody = req.body;
    const { userId, cancellable, status } = requestBody;

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

    if (!validator.isValid(cancellable)) {
      return res
        .status(400)
        .send({ status: "FAILURE", msg: "enter false if not cancellable" });
    }

    if (!validator.isValid(status)) {
      return res
        .status(400)
        .send({ status: "FAILURE", msg: "enter the status" });
    }

    if (!validator.isValidStatus(status)) {
      return res.status(400).send({
        status: "FAILURE",
        msg: `enter one of ${systemConfig.OrderStatusEnumArray} status`,
      });
    }

    let totalQuantity = 0;
    const cartItems = cart.items;
    cartItems.forEach((item) => (totalQuantity += item.quantity));

    const newOrder = {
      userId,
      items: cart.items,
      totalPrice: cart.totalPrice,
      totalItems: cart.totalItems,
      totalQuantity: totalQuantity,
      cancellable,
      status,
    };

    const createOrder = await orderModel.create(newOrder);

    res.status(201).send({ status: "SUCCESS", data: createOrder });
  } catch (error) {
    res.status(500).send({ status: "FAILURE", msg: error.message });
  }
};

const updateOrder = async (req, res) => {
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
  } catch (error) {
    res.status(500).send({ status: "FAILURE", msg: error.message });
  }
};

module.exports = {
  createOrder,
  updateOrder,
};

const express = require("express");

const router = express.Router();

const {
  userController,
  productController,
  cartController,
  orderController,
} = require("../controllers");

const { userAuth } = require("../middlewares");

// USER API'S

router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);
router.get("/user/:userId/profile", userAuth, userController.getProfileById);
router.put("/user/:userId/profile", userAuth, userController.updateProfileById);

// PRODUCT API'S

router.post("/products", productController.registerProducts);
router.get("/products", productController.getProducts);
router.get("/products/:productId", productController.getProductById);
router.put("/products/:productId", productController.updateProductById);
router.delete("/products/:productId", productController.deleteProductById);

// CART API'S

router.post("/users/:userId/cart", userAuth, cartController.addToCart);
router.put("/users/:userId/cart", userAuth, cartController.removeFromCart);
router.get("/users/:userId/cart", userAuth, cartController.getFromCart);
router.delete("/users/:userId/cart", userAuth, cartController.deleteCart);

// ORDER API'S

router.post("/users/:userId/orders", userAuth, orderController.createOrder);
router.put("/users/:userId/orders", userAuth, orderController.updateOrder);

module.exports = router;

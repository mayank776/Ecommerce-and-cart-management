const express = require('express');

const router = express.Router();

const { userController,productController } = require('../controllers');
const { userAuth } = require('../middlewares')

// Author routes
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);

router.get('/user/:userId/profile',userAuth,userController.getProfileById)
router.put('/user/:userId/profile',userAuth,userController.updateProfileById)

// Product routes
router.post('/products',productController.productCreate);
router.get('/products', productController.listProducts);
router.get('/products/:productId', productController.getProductById);
router.put('/products/:productId',  productController.updateProduct);


module.exports = router;
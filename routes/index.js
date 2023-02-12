require("dotenv").config();
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const guestMiddleware = require("../middleware/guestMiddleware");
const flasherMiddleware = require("../middleware/flasherMiddleware");
const userLogin = require("../app/controllers/userLogin");
const userRegister = require("../app/controllers/userRegister");
const userOTP = require("../app/controllers/userOTP");
const addProduct = require("../app/controllers/addProduct");
const api = require("../app/controllers/api");
const Category = require("../app/models/Category");
const Product = require("../app/models/Product");



//shop Page
router.get("/", addProduct.viewHome);
//shop Page
router.get("/shop", addProduct.viewshop);
//filter Brand
router.get("/shop/:bid",api.filterBrand)
//Post Search result
router.post("/search", api.searchTool );
//User Register
router.get("/register",guestMiddleware,flasherMiddleware,userRegister.registerForm );
//Post Reg Form
router.post("/register", guestMiddleware, userRegister.register);
//OTP Page
router.get("/OTP",guestMiddleware, flasherMiddleware,userRegister.fillOTP );
//Post OTP Page
router.post("/OTP",flasherMiddleware, userOTP.verifyOTP);
//Resend OTP
router.get("/resendOTP",flasherMiddleware, userOTP.resendOTP);
//Login Page
router.get("/login" ,guestMiddleware,flasherMiddleware,userLogin.loginPage);
//Post Login Authentication
router.post("/login", userLogin.login);
//Profile Details
router.get("/profile", authMiddleware, flasherMiddleware, api.viewProfile );
//Update Profile Data
router.post('/api/updateuserdata',api.updateuserdata)
//Product Detail Page
router.get('/productDetail/:id', authMiddleware,addProduct.findProduct)
//View Wishlist
router.get('/wishlist',authMiddleware,api.listWishList)
//Add to Wishlist
router.post('/wishList/add',authMiddleware, api.addWishList)
//remove from Wishlist
router.post('/wishList/remove',authMiddleware, api.removeWishList)
//View Cart
router.get('/cart',authMiddleware,api.viewCart)
// Add to cart DB
router.post('/tocart', api.addToCart)
//Add to cart Local
router.post('/tolocal', api.addToLoc)
//Cart Checkout
router.get('/cart/checkout/:id',authMiddleware, api.viewCheckout)
//Generate orderid while Checkout
router.post('/checkout/generateid',api.checkoutGenerateId)
//Update Checkout Address
router.post('/checkout/update/address',api.updateUserAddress)
//checkout Add Coupons
router.post('/api/checkout/setCoupon',api.setCoupon)
//Checkout Update Address
router.post('/api/updateAddress/', api.updateAddress)
// Checkout Get Address Data
router.post('/api/getAddressData', api.getAddressData)
//Get Address List
router.post('/api/getAddressList', api.getAddressList)
//Get Checkout Data
router.post('/api/checkout/getdata',api.checkOutGetData)
//Post approval for COD
router.post('/api/checkout/CODapprove',api.codApprove)
//Post Approval for PayPal
router.post('/api/checkout/Online',api.onlineApprove)
//Payment Failed/Declined Redirection
router.get('/paymentFailed',authMiddleware,userLogin.paymentFailed)
//view orders for User
router.get('/order',authMiddleware,api.viewOrders)
//Particular Order Detail
router.get('/order/:id',authMiddleware,api.orderStatus)
//Post Order Cancellation
router.post('/api/orderCancel',api.cancelOrders)
//User Logout
router.get("/logout", authMiddleware,userLogin.logout );

module.exports = router;

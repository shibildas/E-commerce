const express = require('express');
const router = express.Router();
const adminAuthMiddleware= require('../middleware/adminAuthMiddleware')
const flasherMiddleware = require("../middleware/flasherMiddleware");
const returnMiddleware =require('../middleware/returnMiddleware')
const addProduct = require('../app/controllers/addProduct')
const adminLogin = require('../app/controllers/adminLogin');
const adminHelper = require('../app/controllers/adminHelper');
const api = require('../app/controllers/api');
const multer = require("multer");
const path = require('path');
const uploadHelper = require('../app/controllers/uploadHelper');
const uploads = multer({
    dest: path.join(__dirname,'../public/uploads/banner/')
    // you might also want to set some limits: https://github.com/expressjs/multer#limits
  })

//All Admin Route
router.get("/",returnMiddleware,adminHelper.loginPage);
//post login
router.post('/',adminLogin.adminLogin)
//Admin Dashboard
router.get('/adminP',adminAuthMiddleware ,adminHelper.adminDash)
//View Products List
router.get('/productList',adminAuthMiddleware,flasherMiddleware, addProduct.viewProduct);
//Soft Delete a Product
router.post('/deleteProduct/:id',adminAuthMiddleware,addProduct.deleteProduct);
//Update Product Data
router.post('/updateProduct/:id',adminAuthMiddleware, uploadHelper.updateProduct);
//Add New Products
router.get('/addProducts' ,adminAuthMiddleware,flasherMiddleware,addProduct.viewCategory);
//View users
router.get('/viewUsers',adminAuthMiddleware,flasherMiddleware,adminHelper.viewUser)
//Edit User Data
router.post('/editUser/:id',adminAuthMiddleware,adminHelper.editUser)
//Unblock / Block a User
router.post('/UnBlockUser/:id',adminAuthMiddleware,adminHelper.UnBlockUser)
//Add new Product with Images
router.post('/addProducts',adminAuthMiddleware,uploadHelper.productImage);
//View Category
router.get('/viewBrands',adminAuthMiddleware,flasherMiddleware,addProduct.viewBrand)
//List / Unlist Category 
router.post('/viewBrands/:id',adminAuthMiddleware,addProduct.listBrand)
//Brand Addition Form with Unique Entry
router.get('/addBrands',adminAuthMiddleware,flasherMiddleware,adminHelper.addbrandForm)
//Post Brand Addition
router.post('/addBrands',adminAuthMiddleware,flasherMiddleware,uploadHelper.BrandImage)
//view Coupons
router.get('/coupons',adminAuthMiddleware, adminHelper.coupons )
//Add Coupons
router.post('/coupon/update', adminHelper.updateCoupon )
//getCoupon induvidually
router.get('/coupon/get/:id', adminHelper.getCoupon )
//Delete Coupons
router.get('/coupon/delete/:id', adminHelper.deleteCoupon )
//To view orders
router.get('/orders', adminAuthMiddleware, adminHelper.vieworders )
//View particular Order
router.get("/order/:oid",adminAuthMiddleware , adminHelper.viewOrderId )
//COD Approval
router.post('/order/codpaid',adminHelper.codPaid)
//Ajax Order status Updation
router.post('/order/updateSTS',adminHelper.orderStatus)
//View Banners
router.get('/settings/banner',adminAuthMiddleware , adminHelper.viewBanner)
//Get particular banner
router.get("/banner/get/:bid",api.getBanner)
//Delete a Banner
router.post("/banner/delete",api.deleteBanner)
//Add Banner And Image
router.post("/settings/banner/update",uploads.single("banrImg") ,api.updateBanner)
//View invoice induvidually
router.get("/invoice/:oid",adminAuthMiddleware ,adminHelper.viewInvoice)
//sales Report Search
router.get("/searchReport",api.searchReport)
//Sales Report as Per Date Input
router.post("/report/sales",api.salesReport)
//change order status Range helper
router.get("/getTextBubble",adminHelper.getRange)
//Calender
router.get('/calendar',adminAuthMiddleware ,adminHelper.calender)
//Admin Logout
router.get("/logout", adminAuthMiddleware,adminLogin.adminLogout );

module.exports = router


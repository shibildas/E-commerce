const User = require("../models/User");
const bcrypt = require("bcrypt");
const path = require("path");
const coupons = require("../models/coupons");
const orders = require("../models/orders");
const banners = require("../models/banners");
const Product = require("../models/Product")

var apiResponse = {
  status: 404,
  message: "API not found",
  success: false,
  args: {},
};
const textOptions = ["Ordered", "Shipped", "Out for Delivery", "Delivered"];

module.exports = {
  viewUser: async (req, res, next) => {
    try {
      let currUsers = await User.find();
      res.render("admin/usersList", {
        currUsers,
        layout: "../views/layouts/admin",
      });
    } catch (error) {
      next(error);
    }
  },
  editUser: async (req, res, next) => {
    try {
      const id = req.params.id;

      let salt = 10;
      let pass = await bcrypt.hash(req.body.password, salt);
      let dataToUpdate = {
        name: req.body.name,
        email: req.body.email,
        password: pass,
        cPassword: pass,
        mobile: req.body.mobile,
      };
      let updated = await User.findOneAndUpdate(
        { _id: id },
        { $set: dataToUpdate }
      );
      req.session.flashData = {
        message: {
          type: "success",
          body: "User Updated",
        },
      };
      res.redirect("/admin/viewUsers");
    } catch (error) {
      req.session.flashData = {
        message: {
          type: "error",
          body: "Failed to Update",
        },
      };
      next(error);
    }
  },
  UnBlockUser: async (req, res, next) => {
    try {
      const id = req.params.id;
      const cus = await User.findOne({ _id: id });
      if (cus.isVerified) {
        let updated = await User.findOneAndUpdate(
          { _id: id },
          { $set: { isVerified: false } }
        );
        req.session.flashData = {
          message: {
            type: "error",
            body: "User Blocked",
          },
        };
      } else {
        let updated = await User.findOneAndUpdate(
          { _id: id },
          { $set: { isVerified: true } }
        );
        req.session.flashData = {
          message: {
            type: "success",
            body: "User Unblocked",
          },
        };
      }
      res.redirect("/admin/viewUsers");
    } catch (error) {
      req.session.flashData = {
        message: {
          type: "error",
          body: "Failed Task",
        },
      };
    }
  },
  loginPage: (req, res) => {
    res.render("admin/index", { layout: "../views/layouts/layout" });
  },
  adminDash: async (req, res) => {
    const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const endOfMonth = new Date();
  endOfMonth.setMonth(endOfMonth.getMonth() + 1);
  endOfMonth.setDate(0);
  endOfMonth.setHours(23, 59, 59, 999);
  const successOrders = await orders
    .find({ order_status: "completed" })
    .populate("userid")
    .sort({ ordered_date: -1 })
    .limit(15);
    
    Product.aggregate([
      {
          $lookup: {
              from: "categories",
              localField: "brand",
              foreignField: "_id",
              as: "brand_data"
          }
      },
      {
          $unwind: "$brand_data"
      },
      {
          $group: {
              _id: "$brand_data.brand",
              count: { $sum: 1 }
          }
      },
      {
          $project: {
              _id: 0,
              brand: "$_id",
              count: "$count"
          }
      }
  ], (err, productResults) => {
      if (err) throw err;
      // console.log(productResults);
    orders.aggregate([
      {
        $match: {
          $expr: {
            $and: [
              { $gte: ["$ordered_date", startOfMonth ] },
              { $lt: [ "$ordered_date", endOfMonth ] },
              {
                $eq: [
                  "$delivery_status.ordered.state",
                  true
                ]
              },
              {
                $eq: [
                  "$delivery_status.cancelled.state",
                  false
                ]
              }
            ]
          }
        }
      },
      {
        $group: {
          _id: {
             $dateToString: { format: "%Y-%m-%d", date: "$ordered_date" } 
            },
          count: {
            $sum: 1
          }
        }
      },
      {
        $sort: {
          "_id": 1
        }
      }
    ], (err, result) => {
      if (err) {
        console.log(err);
      } else {
        
        // console.log(result);
        orders.count({ "delivery_status.ordered.state": true }, (err, totalOrders) => {
          orders.count({ "delivery_status.cancelled.state": true }, (err, cancelledOrders) => {
            orders.count({ "delivery_status.delivered.state": true, "payment.payment_status": "completed" }, (err, deliveredAndPaidOrders) => {
              orders.count({ "payment.payment_method": "online_Paypal" }, (err, onlinePayment) => {
                orders.count({ "payment.payment_order_id": "COD_noOID" }, (err, COD) => {
                  orders.count({ "payment.payment_order_id": "WAlt_noOID" }, (err, wallet) => {
                    User.count({}, (err, totalUsers) => {
                      let bounce = ((cancelledOrders / totalOrders) * 100).toFixed(2);
                      let pendingDelivery = (totalOrders - cancelledOrders - deliveredAndPaidOrders)
                      res.render("admin/adminP", {
                        totalOrders,
                        cancelledOrders,
                        deliveredAndPaidOrders,
                        onlinePayment,
                        COD,
                        wallet,
                        bounce,
                        totalUsers,
                        weeklySales: result,
                        pendingDelivery,
                        successOrders,
                        productData: productResults,
                        layout: "../views/layouts/admin"
                      });
                    });
                  });
                });
              });
            });
          });
        });
      }
    })
  });
    

    // res.render('admin/adminP',{layout:'../views/layouts/admin',ord,canceld,paid,online,wallet,COD,usercount})
  },
  addbrandForm: (req, res) => {
    res.render("admin/addBrands", { layout: "../views/layouts/admin" });
  },
  coupons: async (req, res) => {
    let couplist = await coupons.find({}).populate("last_updated_user");
    // console.log(couplist);
    res.render("admin/coupons", {
      layout: "../views/layouts/admin",
      page: "coupons",
      pageName: "Coupons ",
      // user: res.locals.user,
      pages: ["coupons"],
      couplist,
    });
  },

  updateCoupon: (req, res, next) => {
    let apiRes = JSON.parse(JSON.stringify(apiResponse));
    apiRes.success = false;
    apiRes.status = 200;
    apiRes.message = "Invalid request!!!";
    if (
      req.body.action &&
      req.body.id &&
      req.body.name &&
      req.body.code &&
      req.body.discount &&
      req.body.min_order &&
      req.body.expire
    ) {
      req.body.expire += ":00.000+00:00";
      if (req.body.pType != "inr" && req.body.pType != "percnt") {
        req.body.pType = "inr";
      }
      // console.log(req.body);
      if (req.body.action == "create") {
        new coupons({
          name: req.body.name,
          code: req.body.code,
          min_bill: req.body.min_order,
          discount: req.body.discount,
          expire: req.body.expire,
          last_updated_user: res.locals.user._id,
          pType: req.body.pType,
        })
          .save()
          .then(() => {
            apiRes.message = "Saved successfully!";
            apiRes.success = true;
          })
          .catch((err) => {
            apiRes.message = "Data already exist or something went wrong!";
            console.log(err);
          })
          .then(() => {
            res.status(apiRes.status).json(apiRes);
          });
      } else if (req.body.action == "update") {
        coupons
          .updateOne(
            { _id: req.body.id },
            {
              $set: {
                name: req.body.name,
                code: req.body.code,
                min_bill: req.body.min_order,
                discount: req.body.discount,
                expire: req.body.expire,
                last_updated_user: res.locals.user._id,
                pType: req.body.pType,
              },
            }
          )
          .then(() => {
            apiRes.message = "Saved successfully!";
            apiRes.success = true;
          })
          .catch((err) => {
            apiRes.message = "Something went wrong!";
            console.log(err);
          })
          .then(() => {
            res.status(apiRes.status).json(apiRes);
          });
      }
    } else {
      res.status(apiRes.status).json(apiRes);
    }
  },
  getCoupon: (req, res, next) => {
    let apiRes = JSON.parse(JSON.stringify(apiResponse));
    apiRes.success = false;
    apiRes.status = 200;
    apiRes.message = "Invalid request!!!";
    coupons
      .findOne({ _id: req.params.id })
      .then((data) => {
        if (data) {
          apiRes.success = true;
          apiRes.message = "Found matching data!";
          apiRes.data = data;
        } else {
          apiRes.message = "Invalid code provided!";
        }
      })
      .catch((err) => {
        apiRes.message = "Data doesn't exist or something went wrong!";
        console.log(err);
      })
      .then(() => {
        res.status(apiRes.status).json(apiRes);
      });
  },
  deleteCoupon: (req, res) => {
    let apiRes = JSON.parse(JSON.stringify(apiResponse));
    apiRes.success = false;
    apiRes.status = 200;
    // console.log(req.params);

    coupons
      .deleteOne({ _id: req.params.id })
      .then((data) => {
        // console.log(data);
        apiRes.message = "Coupon has been deleted.";
        apiRes.success = true;
      })
      .catch((err) => {
        console.log(err);
        apiRes.message =
          "We couldn't complete your proccess, try again later...";
      })
      .then(() => {
        res.status(apiRes.status).json(apiRes);
      });
  },

  vieworders: async (req, res) => {
    try {
      
      let successOrders = await orders
      .find({ order_status: "completed" })
      .populate("userid")
      .sort({ ordered_date: -1 });
      res.render("admin/orders", {
        layout: "../views/layouts/admin",
        page: "orders",
        pageName: "orders ",
        user: res.locals.user,
        pages: ["orders"],
        successOrders,
      });
    } catch (error) {
     next(error); 
    }
  },


  viewOrderId: async (req, res, next) => {
    try {
      let orderData = await orders
        .findOne({ order_status: "completed", _id: req.params.oid })
        .populate("products.product_id")
        .populate("userid");
      res.render("admin/order-view", {
        page: "orders",
        pageName: "Order ",
        // userData: res.locals.userData,
        pages: ["orders", "View"],
        orderData,
        layout: "../views/layouts/admin",
      });
    } catch (error) {
      next(error);
    }
  },
  orderStatus: (req, res) => {
    let apiRes = JSON.parse(JSON.stringify(apiResponse));
    apiRes.success = false;
    apiRes.status = 200;
    apiRes.message = "Something went wrong!";
    let readyToUpdate = false;
    let dataToUpdate = {};
    let dataI = 0;
    async function doAction(i, dataToUpdate) {
      switch (i) {
        case 2:
          return await orders.updateOne(
            { _id: req.body.id },
            { $set: { "delivery_status.shipped": dataToUpdate.shipped } }
          );

          break;
        case 3:
          return await orders.updateOne(
            { _id: req.body.id },
            {
              $set: {
                "delivery_status.out_for_delivery":
                  dataToUpdate.out_for_delivery,
              },
            }
          );

          break;
        case 4:
          return await orders.updateOne(
            { _id: req.body.id },
            { $set: { "delivery_status.delivered": dataToUpdate.delivered } }
          );

          break;

        default:
          break;
      }
    }
    if (req.body.id && req.body.sts) {
      if (req.body.sts > 0 && req.body.sts <= 4) {
        orders
          .findOne({ _id: req.body.id })
          .then((data) => {
            if (data) {
              switch (Number(req.body.sts)) {
                case 2:
                  if (data.delivery_status.ordered.state) {
                    dataI = 2;
                    readyToUpdate = true;
                    dataToUpdate.shipped = {};
                    dataToUpdate.shipped.state = true;
                    dataToUpdate.shipped.date = Date.now();
                  }
                  break;
                case 3:
                  if (data.delivery_status.shipped.state) {
                    dataI = 3;
                    readyToUpdate = true;
                    dataToUpdate.out_for_delivery = {};
                    dataToUpdate.out_for_delivery.state = true;
                    dataToUpdate.out_for_delivery.date = Date.now();
                  }
                  break;
                case 4:
                  if (data.delivery_status.out_for_delivery.state) {
                    dataI = 4;
                    readyToUpdate = true;
                    dataToUpdate.delivered = {};
                    dataToUpdate.delivered.state = true;
                    dataToUpdate.delivered.date = Date.now();
                  }
                  break;

                default:
                  // res.status(apiRes.status).json(apiRes)
                  break;
              }
            }
          })
          .then(() => {
            if (readyToUpdate) {
              doAction(dataI, dataToUpdate)
                .then(() => {
                  apiRes.message = "Updated status!";
                  apiRes.success = true;
                })
                .catch((err) => {
                  console.log(err);
                })
                .then(() => {
                  res.status(apiRes.status).json(apiRes);
                });
            } else {
              res.status(apiRes.status).json(apiRes);
            }
          });
      } else {
        res.status(apiRes.status).json(apiRes);
      }
    } else {
      res.status(apiRes.status).json(apiRes);
    }
  },
  codPaid: (req, res) => {
    let apiRes = JSON.parse(JSON.stringify(apiResponse));
    apiRes.success = false;
    apiRes.status = 200;
    apiRes.message = "Something went wrong!";
    if (req.body.id) {
      orders
        .updateOne(
          { _id: req.body.id, "payment.payment_method": "cash_on_delivery" },
          { $set: { "payment.payment_status": "completed" } }
        )
        .then(() => {
          apiRes.success = true;
          apiRes.message = "Saved the order as paid!";
        })
        .catch((err) => {
          console.log(err);
        })
        .then(() => {
          res.status(apiRes.status).json(apiRes);
        });
    } else {
      res.status(apiRes.status).json(apiRes);
    }
  },
  viewBanner: async (req, res, next) => {
    let bannerList = await banners.find({});
    res.render("admin/banner", {
      page: "banner",
      pageName: "Banner Management",
      pages: ["settings", "banner_management"],
      bannerList,
      layout: "../views/layouts/admin",
    });
  },
  viewInvoice: async (req, res, next) => {
    try {
      let orderData = await orders
        .findOne({ order_status: "completed", _id: req.params.oid })
        .populate("products.product_id")
        .populate("userid");
      res.render("admin/invoice", {
        page: "orders",
        pageName: "Invoice ",
        userData: res.locals.user,
        pages: ["orders", "Invoice  "],
        orderData,
        layout: "../views/layouts/admin",
      });
    } catch (error) {
      next(error);
    }
  },
  getRange: function (req, res) {
    const value = req.query.value;
    res.send(textOptions[value - 1]);
  },
};

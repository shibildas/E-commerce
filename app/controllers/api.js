const User = require("../models/User");
const orders = require("../models/orders");
const Product = require("../models/Product");
const { default: mongoose } = require('mongoose');
const Category = require("../models/Category");
const coupons = require("../models/coupons");
const banners = require("../models/banners");
const main = require('../helpers/main');
const path  = require('path');


var apiResponse = {
    status: 404,
    message: "API not found",
    success : false,
    args: [],
    data:{}
}

module.exports={
updateAddress:async function(req, res) {
    let readyToUpdate = false;
    let readyToDelete = false;
    let dataToCreate = {}//address:{$:{}}
    let dataToUpdate = {}
    let apiRes = JSON.parse(JSON.stringify(apiResponse));

    apiRes.status = 200;
    apiRes.message = 'No data recieved!';
    apiRes.success = false;
    if(req.body.action == 'create' || req.body.action == 'update' ){
        if(req.body.name && req.body.house && req.body.post && req.body.city && req.body.district && req.body.state && req.body.pin && req.body.action){
            if(req.body.name.length >=4){
                if(req.body.house.length >=4){
                    if(req.body.post.length >=3 ){
                        if(req.body.city.length >= 3){
                            if(req.body.district.length >= 3){
                                if(req.body.state.length >= 3){
                                    if(req.body.pin.length == 6){
                                            readyToUpdate = true;
                                            dataToUpdate={                                       
                                                'address.$.name': req.body.name,
                                                'address.$.house' : req.body.house,
                                                'address.$.city' : req.body.city,
                                                'address.$.post' : req.body.post,
                                                'address.$.district' : req.body.district,
                                                'address.$.state' : req.body.state,
                                                'address.$.pin' : req.body.pin
                                            }
                                            dataToCreate.name = req.body.name
                                            dataToCreate.house = req.body.house
                                            dataToCreate.city = req.body.city
                                            dataToCreate.post = req.body.post
                                            dataToCreate.district = req.body.district
                                            dataToCreate.state = req.body.state
                                            dataToCreate.pin = req.body.pin

                                        
                                    }else{
                                        apiRes.message = 'Invalid pin, tell us your right pin code!';
                                    }
                                }else{
                                    apiRes.message = 'Invalid state, tell us your right state!';
                                }
                            }else{
                                apiRes.message = 'Invalid district, tell us your right district!';
                            }
                        }else{
                            apiRes.message = 'Invalid city, tell us your right city!';
                        }
                    }else{
                        apiRes.message = 'Invalid Post, tell us your right post!';
                    }
                }else{
                    apiRes.message = 'Invalid house, tell us your right house name!';
                }
            }else{
                apiRes.message = 'Invalid name, tell us your right name!';
            }
        }else{
            apiRes.message = 'Some datas are missing!';
        }
    }else if (req.body.action == 'delete'){
        readyToDelete = true;
    }else{
        apiRes.message = 'Invalid action, try again later...!';
    }
    
    
    
    
    if(readyToUpdate){
        if(req.body.action =='create'){
            User.updateOne({_id:res.locals.user._id},{$push:{address:dataToCreate}})
            .then(()=>{
                apiRes.success = true;
                apiRes.message = 'Address added successfully!';
            }).catch((err)=>{
                console.log(err);
                apiRes.message = "Internal error detucted, try again later..."
            }).then(()=>{
                res.status(apiRes.status).json(apiRes)

            })
        }else if(req.body.action =='update'){
            if(req.body.id){
                User.updateOne({_id:res.locals.user._id, 'address._id':req.body.id},{$set:dataToUpdate})
                .then(()=>{
                    apiRes.success = true;
                    apiRes.message = 'Address updated successfully!';
                }).catch((err)=>{
                    console.log(err);
                    apiRes.message = "Internal error detucted, try again later..."
                }).then(()=>{
                    res.status(apiRes.status).json(apiRes)
                    
                })
            }else{
                apiRes.message = "No id available!"
            }
        }

    }else if(readyToDelete){
        if(req.body.id){
            User.updateOne({_id:res.locals.user._id},{$pull:{address:{_id:req.body.id}}})
            .then((data)=>{
                // console.log(data);
                apiRes.success = true;
                apiRes.message = 'Address Deleted successfully!';
            }).catch((err)=>{
                console.log(err);
                apiRes.message = "Internal error detucted, try again later..."
            }).then(()=>{
                res.status(apiRes.status).json(apiRes)
                
            })
        }else{
            apiRes.message = "No id available!"

        }


    }else{
        res.status(apiRes.status).json(apiRes)
    }
},
getAddressData:async (req,res)=>{
    let dataToShow = {}
    let apiRes = JSON.parse(JSON.stringify(apiResponse));
    apiRes.status = 200;
    apiRes.message = 'No data recieved!';
    apiRes.success = false;

    if(req.body.addressid){
        dataToShow = res.locals.user.address[req.body.addressid];
        apiRes.data.address = dataToShow;
        apiRes.message = 'Data fetch success!';
        apiRes.success = true;
    }else{
        apiRes.message = 'Internal error detucted!';
        apiRes.success = false;
    }
    res.status(apiRes.status).json(apiRes);
},
getAddressList: async(req,res)=>{
    let dataToShow = []
    let apiRes = JSON.parse(JSON.stringify(apiResponse));
    apiRes.status = 200;
    apiRes.message = 'No data recieved!';
    apiRes.success = false;

        dataToShow = res.locals.user.address;
        apiRes.data.addressList = dataToShow;
        apiRes.message = 'Data fetch success!';
        apiRes.success = true;
    
    res.status(apiRes.status).json(apiRes);
},


checkOutGetData:(req,res)=>{
    let apiRes = JSON.parse(JSON.stringify(apiResponse));
    apiRes.message = 'Invalid query!';
    apiRes.status = 200;
    apiRes.success = false
    if(req.body.id){
        orders.findOne({_id:req.body.id, userid:res.locals.user._id, order_status:'pending'}).then((order)=>{
            if(order){
                User.findOne({_id: res.locals.user._id}).then((user)=> {
                    apiRes.data = { order, user }
                    // console.log(apiRes.data);
                    apiRes.message = 'Successfully verified user and served data!';
                    apiRes.success = true
                    res.status(apiRes.status).json(apiRes)
                }).catch((err) => {
                    console.log(err);
                });
            }else{
                apiRes.message = 'Verification error!';
                res.status(apiRes.status).json(apiRes)
            }
        }).catch((err)=>{
            console.log(err);
            res.status(apiRes.status).json(apiRes)
        })
    }else{
        res.status(apiRes.status).json(apiRes)
    }
},
codApprove:async(req,res)=>{
    
    let apiRes = JSON.parse(JSON.stringify(apiResponse));
    apiRes.message = 'Invalid payment or something went wrong!';
    apiRes.status = 200;
    apiRes.success = false
    var wal= (0 - parseInt(req.body.walletUsed))
    var paid = parseInt(req.body.paid)
    // console.log(paid);
    // console.log(wal);
    if(req.body.id){
        

            let orderData = await orders.findOne({_id:req.body.id, userid:res.locals.user._id, order_status:'pending'})
        


        if(orderData){
            if(paid==0){
             orders.updateOne({_id:req.body.id},{$set:{order_status:'completed', 'payment.payment_id': 'Walt_'+req.body.id,'payment.payment_order_id':'WAlt_noOID','payment.payment_method':'Wallet_Paid', 'walletAdded':wal,'payment.payment_status':'completed','delivery_status.ordered.state':true,'delivery_status.ordered.date': Date.now()}})
             .then(async ()=>{
                 await User.updateOne({_id:res.locals.user._id},{$inc:{ wallet: wal},$set:{cart:[]}})
                apiRes.message = 'Order placed Successfully!';
                apiRes.success = true;
            }).catch((err)=>{
                apiRes.message = 'Internal error detucted, try again later!';
                console.log(err);
            }).finally(()=>{
                res.status(apiRes.status).json(apiRes) 
            })
            }else{
            orders.updateOne({_id:req.body.id},{$set:{order_status:'completed', 'payment.payment_id': 'COD_'+req.body.id,'payment.payment_order_id':'COD_noOID','payment.payment_method':'cash_on_delivery', 'walletAdded':wal, 'delivery_status.ordered.state':true,'delivery_status.ordered.date': Date.now()}})
            .then(async ()=>{
                await User.updateOne({_id:res.locals.user._id},{$inc:{ wallet: wal },$set:{cart:[]}})
                apiRes.message = 'Order placed Successfully!';
                apiRes.success = true;
            }).catch((err)=>{
                apiRes.message = 'Internal error detucted, try again later!';
                console.log(err);
            }).finally(()=>{
                res.status(apiRes.status).json(apiRes) 
            })
        }
        }else{
            apiRes.message = 'Something went wrong!';
            res.status(apiRes.status).json(apiRes) 
        }
        
    }else{
        apiRes.message = 'Something went wrong!';
        res.status(apiRes.status).json(apiRes) 
    }
},
onlineApprove:async(req,res)=>{
    
    let apiRes = JSON.parse(JSON.stringify(apiResponse));
    apiRes.message = 'Invalid payment or something went wrong!';
    apiRes.status = 200;
    apiRes.success = false
    var wal= (0 - parseInt(req.body.walletUsed))
    if(req.body.id){

        let orderData = await orders.findOne({_id:req.body.id, userid:res.locals.user._id, order_status:'pending'})
        if(orderData){
            orders.updateOne({_id:req.body.id},{$set:{order_status:'completed', 'payment.payment_id': req.body.transId,'payment.payment_order_id':'ONLINE_noOID'+req.body.transId,'payment.payment_method':'online_Paypal','payment.payment_status' : 'completed', 'walletAdded':wal,'delivery_status.ordered.state':true,'delivery_status.ordered.date': Date.now()}})
            .then(async ()=>{
                apiRes.message = 'Order placed Successfully!';
                apiRes.success = true;
                await User.updateOne({_id:res.locals.user._id},{$inc:{ wallet: wal },$set:{cart:[]}})
            }).catch((err)=>{
                apiRes.message = 'Internal error detucted, try again later!';
                console.log(err);
            }).finally(()=>{
                res.status(apiRes.status).json(apiRes) 
            })
        }else{
            apiRes.message = 'Something went wrong!';
            res.status(apiRes.status).json(apiRes) 
        }
        
    }else{
        apiRes.message = 'Something went wrong!';
        res.status(apiRes.status).json(apiRes) 
    }
},
checkoutGenerateId: async (req,res,next)=>{
    // console.log("generateid");
    let apiRes = JSON.parse(JSON.stringify(apiResponse));
    apiRes.message = 'No result found!';
    apiRes.status = 200;
    apiRes.success = false
    let cartProducts = [];
    let toatalBill = 0;
    try {
        let cartData = await User.findById(res.locals.user._id)
        let cartIdArr = cartData.cart.map((val)=>{
            return val.product_id
        })
        if(cartIdArr.length >0){
  
            
            if(cartData){
                let productlist = await Product.aggregate([{$match:{_id:{$in:cartIdArr}}},{$lookup:{from:"categories",localField:"brand",foreignField:"_id", as:'prodBrand'}},{$unwind:"$prodBrand"}])
                // console.log(productlist);
                if(productlist){
                    cartProducts=productlist.map((val,i)=>{
  
                        let thisQnty = cartData.cart.reduce((qnty, val2)=>{
                            if(val2.product_id.toString()==val._id.toString()){
                                qnty = val2.quantity
                            }
                            return qnty;
                        },0)


                        let dataTOreturn = {
                            product_id:val._id,
                            brand:val.prodBrand.brand,
                            size:val.size,
                            qnty: thisQnty,
                            price:val.price
                        }
                        toatalBill += thisQnty*val.price;
                        return dataTOreturn;
                    });
                    let dataToDB = {
                        userid:res.locals.user._id,
                        address:res.locals.user.address[res.locals.user.address.length-1],
                        bill_amount:toatalBill,
                        products:cartProducts,
                        coupen:{discount:0}
                    }
                    // console.log(res.locals.user.address[res.locals.user.address.length-1]);
                    let newOrder = new orders(dataToDB)
                    newOrder.save().then((data)=>{
                        apiRes.success=true;
                        apiRes.message = 'Found Products!'
                        apiRes.data = {
                            id:data._id
                        };
                    }).catch((err)=>{
                        console.log(err);
                        apiRes.message = 'Add Address to Profile Before Checkout'
                    }).then(()=>{
                        res.status(apiRes.status).json(apiRes)
                    })
                    
                    
                }else{
                    apiRes.message = 'No data found!'
                    res.status(apiRes.status).json(apiRes)
  
                }
            }else{
                apiRes.message = 'No data found!'
                res.status(apiRes.status).json(apiRes)
  
            }
            
        }else{
            apiRes.message = 'Cart is empty!'
            res.status(apiRes.status).json(apiRes)
  
        }
        
    } catch (error) {
        console.log(error);
        apiRes.message = 'Internal Error!'
        res.status(apiRes.status).json(apiRes)
    }
},
updateUserAddress:(req,res)=>{
    let apiRes = JSON.parse(JSON.stringify(apiResponse));
    let readyToUpdate = false;
    apiRes.message = 'Invalid query!';
    apiRes.status = 200;
    apiRes.success = false
    let addressToCheckout = {}
    if(req.body.selectedAddress && req.body.id){
        apiRes.message = 'No result found!';
        res.locals.user.address.forEach((val,i)=>{
            if(val._id.toString()===req.body.selectedAddress.toString().substring(5)){
                addressToCheckout = val;
                // console.log(addressToCheckout);
                readyToUpdate = true;
            }
        })
        if(readyToUpdate){
            orders.updateOne({_id:req.body.id,userid:res.locals.user._id, order_status:'pending'},{$set:{address:{
                name: addressToCheckout.name,
                house: addressToCheckout.house,
                post: addressToCheckout.post,
                city: addressToCheckout.city,
                district: addressToCheckout.district,
                state: addressToCheckout.state,
                pin: addressToCheckout.pin,
            }}}).then(()=>{
                apiRes.message = 'Updated Address!';
                apiRes.success= true
            }).catch((err)=>{
                console.log(err);
                apiRes.message = 'Internal Error detected!';
            }).then(()=>{
                res.status(apiRes.status).json(apiRes)
            })
        }

    }else{
        res.status(apiRes.status).json(apiRes)
    }
},
addWishList:async(req,res)=>{
    let apiRes = JSON.parse(JSON.stringify(apiResponse));
    apiRes.message = 'Something went wrong!';
    apiRes.status = 200;
    apiRes.success = false

    if(req.body.toWish){
      const update = req.body.toWish
    User.updateOne({ _id:res.locals.user._id },{$addToSet:{wishlist:update}})
      .then(()=>{
        apiRes.message = 'Saved the product to your wishlist!';
        apiRes.success = true 
        
    })

      .catch(()=>{
        apiRes.message = 'Something went wrong!';
      }).finally(()=>{
        res.status(apiRes.status).json(apiRes)
      })
      
}else{
  apiRes.message = 'Something went wrong!';
  res.status(apiRes.status).json(apiRes)

}
  
},
removeWishList:async(req,res)=>{

let apiRes = JSON.parse(JSON.stringify(apiResponse));
apiRes.message = 'Something went wrong!';
apiRes.status = 200;
apiRes.success = false
if(req.body.wishid){
    User.updateOne({_id:res.locals.user._id},{$pull:{wishlist:req.body.wishid}}).then(()=>{
        apiRes.message = 'Removed the product from wishlist!';
        apiRes.success = true 
        apiRes.data.wishlen = res.locals.user.wishlist.length-1
    }).catch(()=>{
        apiRes.message = 'Something went wrong!';
    }).finally(()=>{
        res.status(apiRes.status).json(apiRes) 
    })
}else{
    apiRes.message = 'Something went wrong!';
    res.status(apiRes.status).json(apiRes)
  }
},
listWishList:async(req,res)=>{

await User.aggregate([
{ $match: { _id: res.locals.user._id , wishlist: { $exists: true }} },
{ $lookup: {
from: 'products',
localField: 'wishlist',
foreignField: '_id',
as: 'wishlist'
}},
{ $unwind: '$wishlist' },
{ $lookup: {
from: 'categories',
localField: 'wishlist.brand',
foreignField: '_id',
as: 'wishlist.brand'
}},
{ $unwind: '$wishlist.brand' },
{ $group: {
_id: '$_id',
wishlist: { $push: '$wishlist' }
}}
]).exec()
.then(user => {
    if(user.length!=0){

        return wishlistData =(user[0].wishlist)
    }else{
        return wishlistData = [] 
    }
})
.catch(error => {
  console.log(error)
  return wishlistData = []
})

res.render('user/wishlist', {pageName: 'Wishlist | Dashboard',dashPage:'wishlist', login:res.locals.login, user:res.locals.user,wishlistData,layout:'../views/layouts/layout'})
},
addToLoc: async (req,res,next)=>{

let apiRes = JSON.parse(JSON.stringify(apiResponse));
apiRes.message = 'No result found!';
apiRes.status = 200;
apiRes.success = false
try {
  apiRes.message = 'Data fetch success!';
  apiRes.success = true
  if(res.locals.user){
      apiRes.data = res.locals.user.cart
  }else{
      apiRes.data = []
  }
  // console.log(apiRes.data);
} catch (error) {
  apiRes.message = 'Error while trying to accessing the cart!'
}finally{
  res.status(apiRes.status).json(apiRes)
}
},
addToCart:async(req,res)=>{
let apiRes = JSON.parse(JSON.stringify(apiResponse));
apiRes.message = 'No result found!';
apiRes.status = 200;
apiRes.success = false
let cartData = JSON.parse(req.body.cart);
let cartIdArr = cartData.map((val)=>{
  return mongoose.Types.ObjectId(val.id);
})
// console.log(cartIdArr);
try {
    if(req.body.cart){
        let productlist = await Product.aggregate([{$match:{_id:{$in:cartIdArr}}},{$lookup:{from:"categories",localField:"brand",foreignField:"_id", as:'prodBrand'}},{$unwind:"$prodBrand"}])
        
        if(productlist){
            let dataToUpload = []
            apiRes.data=productlist.map((val,i)=>{
              
              let thisQnty = cartData.reduce((qnty, val2)=>{
                  // console.log(val,val2);
                    if(val2.id.toString() == val._id.toString()){
                        qnty = val2.qnty;
                    }
                    
                    return qnty;
                },0)
             
                dataToUpload.push({
                    product_id:val._id,
                    quantity: thisQnty,
                })
                let dataTOreturn = {
                    id: val._id,
                    size: val.size,
                    brand: val.prodBrand.brand,
                    price: val.price,
                    qnty: thisQnty,
                    total:thisQnty*val.price,
                    limit:val.stock
                }
                // console.log(dataTOreturn);
                if(val.image[0]){ //set img only if it's exist
                    dataTOreturn.image=val.image[0]
                }
                return dataTOreturn;
            });
            apiRes.success=true;
            apiRes.message = 'Found Products!'
            if(res.locals.user){
                User.updateOne({_id:res.locals.user._id},{$set:{cart:dataToUpload}}).then((data)=>{
                    apiRes.message = 'Cart updated!'
                   
                    // console.log(data);
                }).catch((err)=>{
                    apiRes.message = 'Internal server error! but updated to client area cart!'
                    console.log(err);
                })
            }
        }else{
            apiRes.message = 'No data found!'
        }
    }else{
        apiRes.message = 'No data found!'
    }
    
} catch (error) {
    console.log(error);
    apiRes.message = 'Internal Error!'
}finally{
    res.status(apiRes.status).json(apiRes)
    
}

},
viewCart:async(req,res,next)=>{
try {
  
  
  let cartData = await User.findById(res.locals.user._id)
  let cartIdArr = cartData.cart.map((val)=>{
      return val.product_id
  })
  
  // let productlist = await Product.aggregate([{$match:{"_id":{$in:cartIdArr}}}])
  let productlist = await Product.aggregate([{$match:{"_id":{$in:cartIdArr}}},
  {
    $lookup: {
        from: 'categories',
        localField: 'brand',
        foreignField: '_id',
        as: 'brand'
    }
},
{ $unwind: '$brand' },
])
  
  // console.log(productlist);

  let prodData = productlist.map((val,i)=>{
      let thisQnty = cartData.cart.reduce((qnty, val2)=>{
          if(val2.product_id.toString()==val._id.toString()){
              qnty = val2.quantity;
          }
          return qnty;
      },0)
      let dataTOreturn = {
          id: val._id,
          brand:val.brand.brand,
          description:val.description,
          price:val.price,
          size:val.size,
          qnty: thisQnty,
          total:thisQnty*val.price,
          limit:val.stock
      }
      if(val.image[0]){ //set img only if it's exist
          dataTOreturn.image=val.image[0]
      }
      return dataTOreturn;
  })
  res.render('user/cart', {pageName: 'Cart',prodData,layout:'../views/layouts/layout'})
} catch (err) {
  console.log(err);
  
  next(err)
}
},
viewProfile:(req, res) => {


res.render("user/profile",{layout:'../views/layouts/layout'});
},
viewCheckout:async (req,res,next)=>{
// console.log("checkoutview");
let today = new Date();
today = today.getDate().toString()+today.getMonth().toString()+today.getFullYear().toString()
let userCheckout
let user = res.locals.user._id
let userCoupons
try {
    // userCoupons = await coupons.find({used_users:{$ne: user }},{expire:{$gte:new Date()}})
   userCheckout = await orders.findOne({_id:req.params.id, userid:res.locals.user._id,order_status:'pending'})
  userCoupons =  await coupons.find({ used_users: { $ne: user }, expire: { $gte: new Date() }});
  
} catch (error) {
    console.log(error);
}finally{
    // console.log(userCheckout);
    // console.log(userCoupons);
  if(userCheckout){
      res.render('user/checkout', {userCoupons,userCheckout,pageName: 'Checkout', layout:'../views/layouts/layout'})
  }else{
      next()
  }
}

},
orderStatus:async (req,res,next)=>{
try {
  let orderData = await orders.findOne({userid:res.locals.user._id, _id:req.params.id, order_status:'completed'}).populate('products.product_id')

  if(orderData){
      res.render('user/orderview', {pageName: 'Order | Dashboard',dashPage:'orders', login:res.locals.login, userData:res.locals.user, orderData,layout:'../views/layouts/layout'})
  }else{
      next(render("pages/404"))
  }
} catch (error) {
  next(error)
}
},
viewOrders:async (req,res)=>{
let ordersList = await orders.find({userid:res.locals.user._id, order_status:'completed'}).sort({ordered_date:-1})
res.render('user/order', {pageName: 'Orders ',  userData:res.locals.user, ordersList ,layout:'../views/layouts/layout'})
},



cancelOrders: async (req, res) => {
    let apiRes = JSON.parse(JSON.stringify(apiResponse));
    apiRes.message = "Invalid payment or something went wrong!";
    apiRes.status = 200;
    apiRes.success = false;
    // console.log(req.body);
    if (req.body.id) {
      let orderData = await orders.findOne({
        _id: req.body.id,
        userid: res.locals.user._id,
        order_status: "completed",
      });
      if (orderData) {
        if (orderData.payment.payment_status === "completed") {
          let couponAmount = 0;
          
          if (orderData.coupen) {
            if (orderData.coupen.ptype === "inr") {
              couponAmount = orderData.coupen.discount;
            } else if (orderData.coupen.ptype === "percnt") {
              couponAmount = (orderData.bill_amount * orderData.coupen.discount) / 100;
            }
          }
          // update the user's wallet balance
          await User.updateOne(
            { _id: res.locals.user._id },
            { $inc: { wallet: orderData.bill_amount - couponAmount } }
          );
        }else if(orderData.payment.payment_status === "pending"){
            if(orderData.walletAdded){

                let walbal = (0-orderData.walletAdded)
                // update the user's wallet balance
                await User.updateOne(
                    { _id: res.locals.user._id },
                    { $inc: { wallet: walbal } }
                    );
                }

        }
        orders
          .updateOne(
            { _id: req.body.id },
            {
              $set: {
                "delivery_status.cancelled.state": true,
                "delivery_status.cancelled.date": Date.now(),
              },
            }
          )
          .then(async () => {
            apiRes.message = "Order cancelled Successfully!";
            apiRes.success = true;
            await User.updateOne({ _id: res.locals.user._id }, { $set: { cart: [] } });
          })
          .catch((err) => {
            apiRes.message = "Internal error detucted, try again later!";
            console.log(err);
          })
          .finally(() => {
            res.status(apiRes.status).json(apiRes);
          });
        } else {
          apiRes.message = "Seems it's an invalid order!";
          res.status(apiRes.status).json(apiRes);
        }
      } else {
        apiRes.message = "Invalid argument passed!";
        res.status(apiRes.status).json(apiRes);
      }
  },
  
  
updateuserdata:async (req,res)=>{
    let readyToUpdate = false;
    let readyToDelete = false;
    let dataToUpdate = {}
    let apiRes = JSON.parse(JSON.stringify(apiResponse));
    apiRes.status = 200;
    apiRes.message = 'No data recieved!';

    if(req.body.mobile){
        if(req.body.mobile.length == 10  ){
            readyToUpdate = true;
            dataToUpdate.mobile = req.body.mobile;
        }
        else{
            apiRes.message = 'Invalid phone number, only accepts indian number';
        }
    }
    if(res.locals.user.isVerified){ // ONLY IF USER IS VERIFIED 

        
        if(req.body.name){
            if(req.body.name.length >= 4 ){
                readyToUpdate = true;
                dataToUpdate.name = req.body.name.toString();
            }
            else{
                apiRes.message = 'Username is too small and not available!';
            }
        }
    }

    if(readyToUpdate){
        User.updateOne({_id:res.locals.user._id},{$set:dataToUpdate}).then(()=>{
            apiRes.message='User account updated successfully!'
            apiRes.success = true;
    
            }).catch((err)=>{
                console.log(err);
                if(err.code==11000){
                    if(err.keyPattern.mobile){
                        apiRes.message='Mobile # '+ err.keyValue.phone + " already exists!"
                    apiRes.code = 11004
                    }else if(err.keyPattern.name){
                        apiRes.message='username '+ err.keyValue.name + " already exists!"
                    apiRes.code = 11005
                    }else{
                        apiRes.message='Server error Detucted'
                        apiRes.code = 11006
                    }
                }else{
                    apiRes.status = 500;
                    apiRes.code = 11007
                    apiRes.message='Error updating data'
                }
            }).then(()=>{
                
                res.status(apiRes.status).json(apiRes)
            })
    }else{
        res.status(apiRes.status).json(apiRes)
    }

},
setCoupon:(req,res)=>{
    let apiRes = JSON.parse(JSON.stringify(apiResponse));
    apiRes.message = 'Seems you have claimed the coupon already or it\'s an invalid coupon!';
    apiRes.status = 200;
    apiRes.success = false
    if(req.body.id && req.body.ccode){
        coupons.findOne({code:req.body.ccode, used_users:{$nin:[res.locals.user._id]}}).then((data)=>{
            // console.log(data);
            if(data){
                if(data.expire>=new Date()){ //CHECKING EXPIRED OR NOT
                    orders.findOne({_id:req.body.id, userid:res.locals.user._id, order_status:'pending'}).then((orderData)=>{
                        if((orderData.bill_amount>data.min_bill)&&(data.pType==="inr")){ //CHECKING BILL AMOUNT
                            orders.updateOne({_id:req.body.id, userid:res.locals.user._id, order_status:'pending'},{$set:{coupen:{
                                code:data.code,
                                name:data.name,
                                discount:data.discount,
                                ptype:data.pType,
                            }}}).then(async ()=>{
                                await coupons.updateOne({_id:data._id},{$addToSet:{used_users:res.locals.user._id}})
                                apiRes.data = data
                                apiRes.message = 'Applied discount to your bill!';
                                apiRes.success = true
                            }).catch((err)=>{
                                console.log(err);
                                apiRes.message = 'Error while applying coupon!';
                            }).then(()=>{
                                 res.status(apiRes.status).json(apiRes)
                            })
                        }else if ((orderData.bill_amount<data.min_bill)&&(data.pType!=="inr")){ //CHECKING BILL AMOUNT
                            orders.updateOne({_id:req.body.id, userid:res.locals.user._id, order_status:'pending'},{$set:{coupen:{
                                code:data.code,
                                name:data.name,
                                discount:data.discount,
                                ptype:data.pType,
                            }}}).then(async ()=>{
                                await coupons.updateOne({_id:data._id},{$addToSet:{used_users:res.locals.user._id}})
                                apiRes.data = data
                                apiRes.message = 'Applied discount to your bill!';
                                apiRes.success = true
                            }).catch((err)=>{
                                console.log(err);
                                apiRes.message = 'Error while applying coupon!';
                            }).then(()=>{
                                 res.status(apiRes.status).json(apiRes)
                            })

                        }else{
                            apiRes.message = 'You are not eligible to use this coupon!';
                            res.status(apiRes.status).json(apiRes)
                        }
                    }).catch((err)=>{
                        console.log(err);
                        apiRes.message = 'Seems you are not authorised to add coupon to this order!';
                         res.status(apiRes.status).json(apiRes)
                    })
                }else{
                    apiRes.message = 'Coupon Expired, Try another one!';
                    res.status(apiRes.status).json(apiRes)
                }

            }else{
                apiRes.message = 'Invalid coupon or you have already used this coupon once!';
                 res.status(apiRes.status).json(apiRes)
            }
        }).catch((err)=>{
            console.log(err);
            res.status(apiRes.status).json(apiRes)
        })
    }else{
        if(req.body.id){

            orders.findOneAndUpdate({_id:req.body.id, userid:res.locals.user._id,  order_status:'pending'},{$set:{coupen:{
                code:'nocode',
                name:'noname',
                discount:0,
                ptype:'nodata',
            }}},{returnDocument: 'before'}).then(async(data)=>{
                await coupons.updateOne({code:data.coupen.code},{$pull:{used_users:res.locals.user._id}})
                apiRes.message = 'Coupon removed!';
                apiRes.success = true
            }).catch((err)=>{
                apiRes.message = 'Error detucted while removing coupon from your order!';
                console.log(err);                
            }).then(()=>{
                apiRes.message = 'Invalid coupon or something went wrong!';
                res.status(apiRes.status).json(apiRes)
            })
        }else{
            res.status(apiRes.status).json(apiRes)
        }

    }
},
getBanner: (req,res)=>{
    let apiRes = JSON.parse(JSON.stringify(apiResponse));
    apiRes.status=200
    apiRes.message= 'No data available!'
    apiRes.success = false;
    // console.log("BID: "+ req.params.bid);
    banners.findOne({ _id : req.params.bid }).then((data)=>{
        console.log(data);
        if(data){
            apiRes.data = data;
            apiRes.success =true;
            apiRes.message = 'data fetch successfull!'
        }else{
            apiRes.success =false;
            apiRes.message = 'data not found!!'
        }
    })
    .catch((err)=>{
        console.log(err);
        apiRes.message = '400 bad Request!'
    })
    .then(()=>{
        res.status(apiRes.status).json(apiRes)
    })
},
deleteBanner:async (req,res)=>{
    // console.log("rest: "+ req.body);
    let apiRes = JSON.parse(JSON.stringify(apiResponse));
    apiRes.success = false;
    apiRes.status=200
        // console.log(req.body);

        banners.findOne({_id:req.body.dltid}).then((data)=>{
            if(data && data.image){
                main.deleteFile(path.join(__dirname,'../../public/uploads/banner/')+data.image)
            }
        })
        banners.deleteOne({_id:req.body.dltid}).then((data)=>{
            // console.log(data);
            apiRes.message = 'Your banner has been deleted.';
            apiRes.success = true;
            
        }).catch((err)=>{
            console.log(err);
            apiRes.message = 'We couldn\'t complete your proccess, try again later...';
        }).then(()=>{
            res.status(apiRes.status).json(apiRes)
        })
    
},
updateBanner:(req,res,next)=>{


    function doCatAction(){
        if(req.body.action=='create'){
            return new banners(dataToUpload).save()
        }else if(req.body.action=='update'){
            if(req.body.id){
                if(req.file){
                    banners.findOne({_id:req.body.id}).then((data)=>{
                        if(data.image){
                            main.deleteFile(path.join(__dirname,'../../public/uploads/banner/')+data.image)
                        }
                    })
                }
                return banners.updateOne({_id:req.body.id},dataToUpload)
            }else{
                return new Error('required fields are not defined!')
            }
        }else{
            return new Error('required fields are not defined!')
        }
    }
    let apiRes = JSON.parse(JSON.stringify(apiResponse));
    apiRes.status=200
    apiRes.message= 'No data available!'
    apiRes.success = false;
    let dataToUpload ={}
    dataToUpload.last_updated_user = res.locals.user.name 
    console.log(req.body)
    if(req.body.bh1 && req.body.bh2 && req.body.para && req.body.tc && req.body.bc  && req.body.id && req.body.action){ ///&& req.body.action
        dataToUpload.bh1 = req.body.bh1;
        dataToUpload.bh2 = req.body.bh2;
        dataToUpload.para = req.body.para;
        dataToUpload.tc = req.body.tc;
        dataToUpload.bc = req.body.bc;
        console.log(req.file);
        if(req.file){

            main.uploadimage(req,'banner','bnr-',false).then((data)=>{ // false = crop
                apiRes.message= data.message;
                apiRes.success = true;
                dataToUpload.image = data.imageName
    
            }).catch((err)=>{
                console.log(err);
                apiRes.message= err.toString()
    
            }).then(()=>{
                if(apiRes.success==true){

                    doCatAction().then(()=>{
                        apiRes.success = true;
                        apiRes.message = 'Successfully updated the banner!'

                    }).catch((err)=>{
                        console.log(err);
                        apiRes.success = false;
                        apiRes.message = 'We couldn\'t update your data, try again!'
                    }).then(()=>{
                        res.status(200).json(apiRes)
                    })
                }else{
                    res.status(200).json(apiRes)
                }
            })
        }else{
            doCatAction().then(()=>{
                apiRes.success = true;
                apiRes.message = 'Successfully updated the banner!'

            }).catch((err)=>{
                console.log(err);
                apiRes.success = false;
                apiRes.message = 'We couldn\'t update your data, try again! .'
            }).then(()=>{
                res.status(200).json(apiRes)
            })
            
        }
    }else{
        apiRes.message= 'Some required fields are missing!'

        res.status(200).json(apiRes)
    }
    
},
searchReport:async (req, res, next) => {
    res.render("admin/reportQuery", {
      page: "report",
      pageName: "Report",
      userData: res.locals.user,
      pages: ["report"],layout:'../views/layouts/admin'
    });
  },
salesReport:async (req, res, next) => {
    try {
    let salesData = await orders.aggregate([
        {
          $match: {
            order_status: "completed",
            userid: { $ne: [] },
            $and: [
              { ordered_date: { $gt: new Date(req.body.fromDate) } },
              { ordered_date: { $lt: new Date(req.body.toDate) } },
              { "payment.payment_status": "completed" },
              { "delivery_status.delivered.state": true }
            ],
          },
        },
        {
          $lookup: {
            foreignField: "_id",
            localField: "userid",
            from: "users",
            as: "userid",
          },
        },
        { $sort: { ordered_date: -1 } },
      ]);
      console.log(salesData);
      res.render("admin/salesReport", {
        salesData,
        layout:'../views/layouts/admin'
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
  searchTool:async function(req, res) {
    try {
        let apiRes = {};
        const searResult = [];
        if (req.body.value) {
          let usersearch = new RegExp("^" + req.body.value + ".*", "i");
        let productsearch = await Product.aggregate([
            {
              $match: {
                $or: [
                  { size: usersearch },
                  { description: usersearch },
                  { price: usersearch },
                  { rim: usersearch }
                ],
              },
            },
            {
              $lookup: {
                from: "categories",
                localField: "brand",
                foreignField: "_id",
                as: "brand_info"
              }
            },
            {
              $unwind: "$brand_info"
            },
            {
              $match: {
                "brand_info.brand": usersearch
              },
              
            }
          ]);
          let cateSearch = await Product.aggregate([
            {
                $match: {
                  $or: [
                    { size: usersearch },
                    { description: usersearch },
                    { price: usersearch },
                    { rim: usersearch }
                  ],
                },
              },

          ])


          cateSearch.forEach((field) => {
            searResult.push({
              titile: field.size,
              type: "cate",
              id: field._id,
              cate: field.rim,
            });
          });
          productsearch.forEach((field) => {
            searResult.push({
              titile: field.size,
              type: "product",
              id: field._id,
              cate: field.brand_info.brand,
            });
          });
  
          apiRes.search = searResult;
          res.json(apiRes);
        } else {
          res.json("noresult");
        }
      } catch (error) {
        console.log(error);
        next(error);
      }
    },
    filterBrand:async (req,res)=>{
        let brandId = req.params.bid
        let products = await Product.find({brand:brandId}).populate("brand")
        let category = await Category.find();
        res.render("user/shop", {
            layout: "../views/layouts/layout",
            products,
          });


    }



}
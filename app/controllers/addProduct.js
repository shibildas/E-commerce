const Category = require("../models/Category");
const Product = require("../models/Product");
const fs = require('fs');
const path = require("path");
const sharp = require("sharp");
const { mongooseErrorFormatter } = require("../../config/validationFormatter");
const banners = require("../models/banners")

module.exports = {
  viewProduct: async (req, res, next) => {
    try {
      let category = await Category.find();
      let products = await Product.find().populate("brand");
      res.render("admin/productList", { products, category,layout:'../views/layouts/admin' });
    } catch (error) {
      next(error);
    }
  },
  viewCategory: async (req, res) => {
    try {
      let category = await Category.find();
      res.render("admin/addProducts", { category ,layout:'../views/layouts/admin'});
    } catch (error) {
      next(error);
    }
  },

  addProduct: async (req, res, next) => {
    try {
      // console.log(req.body);
      const filenames = req.files.map((file) => file.filename);
      let product = await Product({
        brand: req.body.brand,
        description: req.body.description,
        price: req.body.price,
        size: req.body.size,
        rim: req.body.rim,
        stock: req.body.stock,
        image: filenames,
      });
      product.save().then(() => {
        
        res.redirect("productList");
        req.session.flashData = { message: {
          type: "success",
          body: "A New Product is Added!!",
        }
      }
      });
    } catch (error) {
      req.session.flashData = { message: {
        type: "error",
        body: "Failed to add product",
      }
    }
      next(error);
    }
  },

  addBrand: async (req, res, next) => {
    try {
      const filenames = await req.files.map((file) => file.filename);
      let brand = Category({
        brand: req.body.brand,
        images: filenames,
      });
      await brand.save();
      req.session.flashData = {
        message: {
          type: "success",
          body: "Brand Added to Database",
        },
      };
      res.redirect("/admin/addBrands");
    } catch (e) {
      console.log(e);
      return res.status(400).render("admin/addBrands", {
        layout: '../views/layouts/admin',
        message: {
          type: "error",
          body: "Brand Already Exists, Use that",
        },
        errors: mongooseErrorFormatter(e),
        formData: req.body,
      });
    }
},
  viewBrand: async(req,res,next)=>{
    try {
      let brand = await Category.find();
      return res.render("admin/listBrands", { brand, layout:'../views/layouts/admin' });

      
    } catch (error) {
      next(error)
      
    }
  },

  listBrand: async(req,res,next) => {
  try {
    const id = req.params.id;
    const brand = await Category.findOne({ _id:id })
    if(brand.listed){
      let updated = await Category.findOneAndUpdate({ _id: id },{$set:{listed:false}})
      req.session.flashData = { message: {
        type: "error",
        body: "Brand Unlisted",
    }
    }
    }else{
      let updated = await Category.findOneAndUpdate({ _id: id },{$set:{listed:true}})
      req.session.flashData = { message: {
        type: "success",
        body: "Brand Listed",
      }
      }
    }
    return res.redirect("/admin/viewBrands")
    
  
  } catch (error) {
    req.session.flashData ={message: {
      type: "error",
      body: "Attempt Failed",
    }}
    return res.redirect("/admin/viewBrands",)
  
  }
  },

  
  viewHome: async (req, res) => {
    // console.log(req.session);
    let bannerList = await banners.find()
    let products = await Product.find().populate("brand").limit(20);
    let category = await Category.find();
    res.render("user/index", {
      layout: "../views/layouts/layout",
      category,
      products,
      bannerList,
    });
  },
  viewshop:async (req, res) => {
    // console.log(req.session);
    let products = await Product.find().populate("brand");
    let category = await Category.find();
    res.render("user/shop", {
      layout: "../views/layouts/layout",
      category,
      products,
    });
  },

  updateProduct: async (req, res, next) => {
    try {
      const id = req.params.id;
      const filenames = req.files.map((file) => file.filename);
      let dataToUpdate = {
        brand: req.body.brand._id,
        description: req.body.description,
        price: req.body.price,
        stock: req.body.stock,
        status: req.body.status,
      }
      if (req.files.length > 0) {
        Product.updateOne(
          { _id: id },
          { $push: { image: { $each: filenames } } }
        ).then((data) => console.log(data));
      }
      let category = await Category.find()
      let products = await Product.findOneAndUpdate({ _id:id },{$set: dataToUpdate})
      req.session.flashData = { message: {
        type: "success",
        body: "Product Updated!!",
      }
    }

      res.redirect('/admin/productList')
    } catch (error) {
      req.session.flashData = { message: {
        type: "error",
        body: "Failed Updation",
      }
    }
      next(error)
    }
  },
  deleteProduct: async(req,res,next) => {
  try {
      const id = req.params.id;
      const products = await Product.findOne({ _id:id })
      if(products.status){
        let updated = await Product.findOneAndUpdate({ _id: id },{$set:{status:false}})
        req.session.flashData = { message: {
        type: "error",
        body: "Deleted",
      }
    }
      }else{
        let updated = await Product.findOneAndUpdate({ _id: id },{$set:{status:true}})
        req.session.flashData = { message: {
          type: "success",
          body: "Recycled",
        }
      }
    }
      
      return res.redirect("/admin/productList")
    
  } catch (error) {
      req.session.flashData ={brand,message: {
        type: "error",
        body: "Attempt Failed",
      }}
      return res.redirect("/admin/productList",)
    
  }
},
cropImage: async(path, topath,cb)=>{
  sharp(path).resize({
    width:300,
    height:300
  }).toFile(topath,function(err){
    if(err){
      cb(err)
    }else{
      cb()
    }
  })
},
uploadimage: async function(req,toDir,prefix,crop){
  return new Promise( async(resolve,reject)=>{
      
      let dataToReturn = {message:'No data is available!', error:'No error'}
      const tempPath = req.file.path;
      const newFileName = prefix+this.randomGen(15)+path.extname(req.file.originalname).toLowerCase();
      const targetPath = path.join(__dirname, "../public/uploads/"+toDir+"/"+newFileName);
      const ext = path.extname(req.file.originalname).toLowerCase();
      // console.log('temp path :'+tempPath);
      if (ext === '.png' || ext === '.jpg' || ext === '.jpeg' || ext === '.gif') {
          
          if(crop){
              this.cropImage(tempPath,targetPath,(err)=>{
                  if (err) {
                      dataToReturn.error = err;
                      reject(new Error('Internal server error detucted!'));
                      console.log(err);
                  }
              })
          }else{
              fs.renameSync(tempPath, targetPath, err => {
                  if (err) {
                      dataToReturn.error = err;
                      reject(new Error('Internal server error detucted!'));
                      console.log(err);
                  } 
              });
          }
          dataToReturn.message = 'File uploaded successfully!'
          dataToReturn.imageName = newFileName;
          resolve(dataToReturn)
      } else {
          fs.unlinkSync(tempPath, err => {
              if (err) {
                  console.log(err);
                  reject( new Error('Internal server error detucted!'));
              }
          });
          reject(new Error('Invalid file format, only images are supported!'));
      }
  })
},
deleteFile: (path)=>{
        
  fs.unlinkSync(path, err => {
      if (err) {
          console.log(err);
      }
      req.session.flashData = { message: {
        type: "success",
        body: "file Deleted",
      }
    }
  });
},
findProduct:async (req, res , next)=>{
  try {
    const id = req.params.id
  const product = await Product.findOne({ _id:id }).populate('brand')
  res.render('user/detail',{product, layout:'../views/layouts/layout'})
  } catch (error) {
    error.status = 404;
    next(error)
    
  }  
}
};

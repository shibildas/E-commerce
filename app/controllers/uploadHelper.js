const {uploadOptions,uploadLogo} = require("../helpers/multer");
const addProduct = require("./addProduct");

module.exports = {

    productImage:(req, res, next) => {
        uploadOptions(req, res, (error) => {
          if (error) {
            req.session.flashData = {
              message: {
                type: "error",
                body: "Invalid image type. Only png, jpeg and jpg formats are supported",
              },
            }
            return res.redirect("/admin/addProducts")
          }
          addProduct.addProduct(req, res, next);
        });
      },
      BrandImage:(req, res, next) => {
        uploadLogo(req, res, (error) => {
          if (error) {
            req.session.flashData = {
              message: {
                type: "error",
                body: "Invalid image type. Only png, jpeg and jpg formats are supported",
              },
            }
            return res.redirect("/admin/addBrands")
          }
          addProduct.addBrand(req, res, next);
        });
      },
      updateProduct:(req, res, next) => {
        uploadOptions(req, res, (error) => {
          if (error) {
            req.session.flashData = {
              message: {
                type: "error",
                body: "Invalid image type. Only png, jpeg and jpg formats are supported",
              },
            }
            return res.redirect("/admin/addProducts")
          }
          addProduct.updateProduct(req, res, next);
        });
      }

}

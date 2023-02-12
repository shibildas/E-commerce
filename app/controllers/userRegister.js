const { addUser } = require("./userControl");
const {registerSchema} = require("./validation/authValidation");
const {joiErrorFormatter,mongooseErrorFormatter,
} = require("../../config/validationFormatter");

module.exports={


register:async (req, res, next) => {
    try {
      const validationResult = registerSchema.validate(req.body, {
        abortEarly: false,
      });
      if (validationResult.error) {
        req.session.flashData = {
          message: {
            type: "error",
            body: "Validation Error",
          },
  
          errors: joiErrorFormatter(validationResult.error),
          formData: req.body,
        // return res.send(joiErrorFormatter( validationResult.error))
        
      }
      return res.redirect("/register");
      }
  
      const user = await addUser(req.body);
      req.session.flashData = {
        message: {
          type: "success",
          body: "Verify Email",
        },
        errors: {},
        formData: req.body,
      };
      req.session.userid = user._id.toString();
      return res.redirect("/OTP");
    } catch (e) {
      
      return res.status(400).render("register", {
        message: {
          type: "error",
          body: "Email Already Exists, Login!!!",
        },
      
        errors: mongooseErrorFormatter(e),
        formData: req.body,

      // return res.send(mongooseErrorFormatter(e))
      });
  
      // return res.status(400).render('register', {message: 'Something Went Wrong!!!'})
    }
    
  },
registerForm:async (req, res, next) => {
    res.render("user/register",{layout:'../views/layouts/layout'});
  },
fillOTP:async (req, res, next) => {
    if (req.session.userid) {
      res.render("user/OTP",{layout:'../views/layouts/layout'});
    } else {
      res.redirect("/register");
    }
  }
}
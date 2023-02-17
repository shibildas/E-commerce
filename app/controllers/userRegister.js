const { addUser } = require("./userControl");
const {registerSchema} = require("./validation/authValidation");
const {joiErrorFormatter,mongooseErrorFormatter} = require("../../config/validationFormatter");
const sendEmail = require("../helpers/eMailer");
const User = require("../models/User");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt')
const keysecret = process.env.SECRET

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
      return res.render("user/OTP",{formData: req.body});
    } catch (e) {
      return res.status(400).render("user/register", {
        message: {
          type: "error",
          body: "Email Already Exists, Login!!! or Something went Wrong",
        },
      
        errors: mongooseErrorFormatter(e),
        formData: req.body,

    
      });
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
  },

  resetPassword: async (req, res) => {
    const { email } = req.body;
  
    if (!email) {
      return res.status(400).render("user/reset", {
        message: {
          type: "error",
          body: "Email is Empty",
        },
      
        formData: req.body,

      // return res.send(mongooseErrorFormatter(e))
      });
    }
  
    try {
      const userD = await User.findOne({ email });
      if (!userD) {
        return res.status(400).render("user/reset", {
          message: {
            type: "error",
            body: "User not found",
          },
        
          formData: req.body,
  
        // return res.send(mongooseErrorFormatter(e))
        })
      }
  
      const token = jwt.sign({ _id: userD._id }, keysecret, {
        expiresIn: "300s",
      });
      await User.findByIdAndUpdate(
        { _id: userD._id },
        { verifytoken: token },
        { new: true }
      );
  
      const subject = "Dr.Tyre Email for Password Reset";
      const text = `This link is valid for 5 minutes: https://www.drtyre.co/forgotpassword/${userD._id}/${token}`;
      try {
        // code to send email
        await sendEmail(email,subject,text)
        return res.status(400).render("user/login", {
          message: {
            type: "success",
            body: "Password reset link sent successfully!!. you have 5 mins to complete",
          },
        
          formData: req.body,
  
        // return res.send(mongooseErrorFormatter(e))
        })
      } catch (err) {
        console.error("Error:", err);
        return res.status(400).render("user/reset", {
          message: {
            type: "error",
            body: "Email not Sent",
          },
        
          formData: req.body,
  
        // return res.send(mongooseErrorFormatter(e))
        });
      }
    } catch (err) {
      console.error("Error:", err);
      return res.status(400).render("user/reset", {
        message: {
          type: "error",
          body: "Some Error occured",
        },
      
        formData: req.body,

      // return res.send(mongooseErrorFormatter(e))
      })
    }
  },
  getResetLink:async(req,res)=>{
    console.log("inside");
    const {id,token} = req.params;

    try {
        const validuser = await User.findOne({_id:id,verifytoken:token});
        
        const verifyToken = jwt.verify(token,keysecret);

        if(validuser && verifyToken._id){
            return res.render("user/password",{id,token})
        }else{
           return res.status(401).render("user/reset", {
              message: {
                type: "error",
                body: "User Does not exist",
              },
            
              formData: req.body,
      
            // return res.send(mongooseErrorFormatter(e))
            })
        }

    } catch (error) {
     return res.status(401).render("user/reset", {
        message: {
          type: "error",
          body: "Some error occured",
        },
        errors: mongooseErrorFormatter(error),
        formData: req.body,

      })
    }
},
updatePassword:async(req,res)=>{
  const {id,token} = req.params;
  
  const password = req.body.password;

  try {
      const validuser = await User.findOne({_id:id,verifytoken:token});
      
      const verifyToken = jwt.verify(token,keysecret);
      const newPassword = await bcrypt.hash(password,10);
      console.log(validuser,verifyToken);

      if(validuser && verifyToken._id){


        // validuser.set({ password: password });
        // await validuser.save();
        User.findOneAndUpdate(
          { _id: id },
          { password: newPassword ,isVerified:true},
          { new: true },
          (err, user) => {
            if (err) {
              // handle error
              return res.status(401).render("user/reset", {
                message: {
                  type: "error",
                  body: "User Does not exist",
                },
              
                formData: req.body,
        
              // return res.send(mongooseErrorFormatter(e))
              })
            } else {
              // handle success
              return res.status(200).render("user/login", {
                message: {
                  type: "success",
                  body: "Password updated successfully!!",
                },
              
                formData: req.body,
        
              // return res.send(mongooseErrorFormatter(e))
              })
            }
          }
        );

      }else{
        return res.status(401).render("user/reset", {
          message: {
            type: "error",
            body: "User Does not exist",
          },
        
          formData: req.body,
  
        // return res.send(mongooseErrorFormatter(e))
        })
      }
  } catch (error) {
    console.log(error)
    return res.status(401).render("user/reset", {
      message: {
        type: "error",
        body: "Some error occured",
      },
      errors: mongooseErrorFormatter(error),
      formData: req.body,

    })
  }
},
getReset:(req,res)=>{
  res.render("user/reset")
}
  
}
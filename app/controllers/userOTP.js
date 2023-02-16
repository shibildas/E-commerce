const bcrypt = require("bcrypt");
const User = require("../models/User");
const UserOTPVerification = require("../models/UserOTPVerification");


module.exports={


verifyOTP:async (req, res) => {
    try {
      let otp = req.body.otp;
      if (!otp) {
        throw Error("Empty OTP details are not allowed");
      } else {
        const UserOTPVerificationRecords = await UserOTPVerification.find({
          userId: req.session.userid,
        });
        if (UserOTPVerificationRecords.length <= 0) {
          throw Error("Invalid ");
        } else {
          const { expiresAt } = UserOTPVerificationRecords[0];
          const hashedOTP = UserOTPVerificationRecords[0].otp;
  
          if (expiresAt < Date.now()) {
            await UserOTPVerification.deleteMany({ userId });
            throw new Error("Code has Expired. Retry!");
          } else {
            const validOTP = await bcrypt.compare(otp, hashedOTP);
  
            if (!validOTP) {
              res.status(400).render("user/OTP", {
                message: {
                  type: "error",
                  body: "Invalid Entry!!!",
                },
              
                formData: req.body,
        
             
              })
            } else {
              await User.updateOne(
                { _id: req.session.userid },
                { isVerified: true }
              );
              await UserOTPVerification.deleteMany({
                userId: req.session.userid,
              });
              req.session.destroy();
              res.redirect("/login");
            }
          }
        }
      }
    } catch (error) {
      console.log(error);
      res.status(400).render("user/OTP", {
        message: {
          type: "error",
          body: "Invalid Entry!!!",
        },
        formData: req.body,

      })
    }
  },
resendOTP: async(req,res,next)=>{
    try {
      let{userId, email} = req.body
      if(!userId || email){
        throw error("Empty details are not allowed")

      }else{
        await UserOTPVerification.deleteMany({userId})
        send.sendOTPVerificationEmail({_id: userId,email},res)
      }
      
    } catch (error) {
      next(error);
    }
  }
}
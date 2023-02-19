const bcrypt = require("bcrypt");
const User = require("../models/User");
const UserOTPVerification = require("../models/UserOTPVerification");
const sendEmail = require('../helpers/eMailer')


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
              res.status(200).render("user/login",{message: {
                type: 'success',
                body: 'Registration Successfull, You can Login Now'
              }});
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
resendOTP:async (req, res) => {
  
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      throw new Error('User not found');
    }

    // Generate a new OTP and update the OTP verification record
    const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
    const saltRounds = 10;
    const hashedOTP = await bcrypt.hash(otp, saltRounds);
    const expiresAt = Date.now() + 3600000;
    await UserOTPVerification.updateOne({ userId: user._id }, { otp: hashedOTP, expiresAt });

    // Send the email with the new OTP
    const mailid = user.email;
    const subject = 'Verify your Email';
    const text = `<p>Enter <b> ${otp}</b> to verify your Account</p>`;
    await sendEmail(mailid, subject, text);

    // Set a flash message to indicate that the OTP has been resent
    req.session.flashData = {
      message: {
        type: 'success',
        body: 'OTP has been resent'
      }
    };

    res.redirect('/OTP');
  } catch (error) {
    console.error(error);
    req.session.flashData = {
      message: {
        type: 'error',
        body: 'An error occurred while resending the OTP'
      }
    };
    res.redirect('/OTP');
  }
} 
}
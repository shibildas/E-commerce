const User = require("../models/User");
const UserOTPVerification = require("../models/UserOTPVerification");
const bcrypt = require("bcrypt");
const sendEmail = require("../helpers/eMailer");


const addUser = async (userInput) => {
const user = new User(userInput);
  await user.save().then((result) => {
  const  sendOTPVerificationEmail = async ({ _id, email }) => {
      try {
        const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
        const mailid= result.email
        const subject= "Verify your Email"
        const text= `<p>Enter <b> ${otp}</b> to verify your Account</p>`
        const saltRounds = 10;
        const hashedOTP = await bcrypt.hash(otp, saltRounds);
        const newOTPVerification = await new UserOTPVerification({
          userId: _id,
          otp: hashedOTP,
          createdAt: Date.now(),
          expiresAt: Date.now() + 3600000,
        });
        await newOTPVerification.save();
        await sendEmail(mailid,subject,text);
      } catch (error) {
        console.log(error);
        throw new Error("Error adding user");
      }
    }
    sendOTPVerificationEmail(result);
    // @param(Object) userInput -- It is user input with all variables for  user model
  });
  return user;
};
module.exports = { addUser };

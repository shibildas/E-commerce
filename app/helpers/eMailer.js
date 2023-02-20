require("dotenv").config();
const nodemailer = require('nodemailer')

const sendEmail= async(mailId, subject, message)=>{
    try {
        const transporter = nodemailer.createTransport({
        host: process.env.HOST_SMTP,
        port: process.env.HOST_PORT,
        auth: {
          user: process.env.AUTH_EMAIL,
          pass: process.env.AUTH_PASS,
        }
        })

        await transporter.sendMail({
        from: process.env.AUTH_EMAIL,
          to: mailId,
          subject: subject,
          html:message,

        })
    } catch (error) {
        console.log(error,"email not sent");
        
    }
}

module.exports = sendEmail
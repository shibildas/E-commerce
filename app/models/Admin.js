const mongoose = require("mongoose");
const bcrypt = require("bcrypt");


const adminSchema = mongoose.Schema( {
    username: {
        type: String,
        minlength: [3, "Name can't be smaller than 3 characters"],
        maxlength: [64, "Name can't be greater than 64 characters"],
        required: [true, "Name is Required"],
      },
  
      isAdmin: {
        type: Boolean,
        default: true

      },
      password: {
        type: String,
        required: [true, "Password is must"],
      }
});

adminSchema.methods.checkPassword = async function (password) {
    const result = await bcrypt.compare(password, this.password);
    return result;
  };

const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin;

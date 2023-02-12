const mongoose = require("mongoose");
const uniqueValidator = require('mongoose-unique-validator');
categorySchema = new mongoose.Schema({
    brand:{
        type: String,
        required: true,
        unique: true,
        validate: {
          validator: async function(value) {
            value = value.toLowerCase();
            const doc = await this.model('Category').findOne({ brand: { $regex: new RegExp("^" + value + "$", "i") }  });
            return !doc;
          },
          message: 'Name already exists'
        }
      },
    listed:{
        type:Boolean,
        default:true
    },
    images:[{
        type:String,
        required:true
    }]
});
categorySchema.plugin(uniqueValidator);


const Category = mongoose.model("Category", categorySchema)

module.exports = Category
// categorySchema.path("brand").validate(async(brand)=>{
//     const categoryCount = await mongoose.models.Category.countDocuments({brand});
//     return!categoryCount;
// }, "Brand Already Exists")
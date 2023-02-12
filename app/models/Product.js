const mongoose = require("mongoose");
productSchema = new mongoose.Schema({
    brand:{
        type: mongoose.Schema.Types.ObjectId,ref:"Category",
        required:true,
        index:true
        
    },
    rim:{
        type:String,
        required:true
    },
    size:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    stock:{
        type:Number,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    status:{
        type:Boolean,
        default:true
    },
    image:[{
        type:String,
        required:true
    }]
})





const Product = mongoose.model("Product", productSchema)

module.exports = Product
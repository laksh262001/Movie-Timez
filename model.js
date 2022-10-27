const mongoose = require("mongoose");
const imageSchema = new mongoose.Schema({
    name: String,
    desc: String,
    price: Number,
    img:
    {
        data: Buffer,
        contentType: String
    }
});
module.exports = new mongoose.model('Image', imageSchema);
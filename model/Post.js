const mongoose = require("mongoose")

const schema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    text: {
        type: String,
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    }
})

module.exports = mongoose.model('Post', schema)
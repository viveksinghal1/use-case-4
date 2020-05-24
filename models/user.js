var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

const userSchema = mongoose.Schema({
    username: {type: String, unique: true, required: true},
    password: String,
    mobile: Number,
    address: String,
    gender: String,
    age: Number
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);
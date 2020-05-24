var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

const requestSchema = mongoose.Schema({
    token: String,
    status: String,
    owner: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        username: String
    },
    name: String,
    address: String,
    city: String,
    state: String,
    startDate: String,
    endDate: String,
    startTime: String,
    endTime: String,
    vehicle: String,
    vehicleno: String,
    persons: String
});

module.exports = mongoose.model("Request", requestSchema);
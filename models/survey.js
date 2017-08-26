var mongoose = require("mongoose");

var surveySchema = new mongoose.Schema({
    question: String,
    author:{
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    options:[
        {
            text: String,
            votes: Number
        }
    ],
    voterIP: [String]
})

module.exports = mongoose.model("Survey", surveySchema);
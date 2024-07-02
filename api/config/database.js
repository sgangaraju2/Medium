const mongoose = require("mongoose");
//connect to DB

const connectDB = async() => {
    try {
       await mongoose.connect("MongoDB URL- Security issue (Everyone will have there own db url");
        console.log("DB is connected");
    } catch (error) {
        console.log("DB connection is failed....", error.message);
        
    }
};

module.exports = connectDB;

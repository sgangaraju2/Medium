const mongoose = require("mongoose");
//connect to DB

const connectDB = async() => {
    try {
       await mongoose.connect("mongodb+srv://MAALTECK:w5AVQASXiqQsCUlQ@mern-medium-v1.eebfgfw.mongodb.net/mern-medium?retryWrites=true&w=majority&appName=mern-medium-v1");
        console.log("DB is connected");
    } catch (error) {
        console.log("DB connection is failed....", error.message);
        
    }
};

module.exports = connectDB;
const mongoose = require("mongoose");
//connect to DB

const connectDB = async() => {
    try {
       await mongoose.connect(process.env.MONGO_URL);
        console.log("DB is connected");
    } catch (error) {
        console.log("DB connection is failed....", error.message);
        
    }
};

module.exports = connectDB;
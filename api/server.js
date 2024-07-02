const http = require('http');
const express = require('express');

const usersRouter = require("./routes/users/usersRouter");

//db connect
//connectDB();
require('./config/database')();

//! Server 
const app = express();




//!Middlewares
app.use(express.json()); //Pass incoming data
// Routes
app.use('/api/v1/users',usersRouter);







// in future if you want to use real time chat using socket.io we need http so thats the reason to use it else we can use express
const server = http.createServer(app);

//? Start the server 
const PORT = process.env.PORT || 9080;
server.listen(PORT, console.log(`Server is running on port ${PORT}`));


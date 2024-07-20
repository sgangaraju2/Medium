const dotenv = require('dotenv');
dotenv.config();

const http = require('http');
const express = require('express');


const usersRouter = require("./routes/users/usersRouter");
const { notFound, globalErrHandler } = require('./middleware/globalErrorHandler');
console.log('Before requiring categoryRouter');
const categoryRouter = require("./routes/category/categoryRouter");
const postsRouter = require('./routes/post/postRouter');
const commentRouter = require('./routes/comment/commentRouter');




// console.log('After requiring categoryRouter');




//db connect
//connectDB();
require('./config/database')();



//! Server 
const app = express();
console.log(process.env.MYKEY);





//!Middlewares
app.use(express.json()); //Pass incoming data
// Routes
app.use('/api/v1/users',usersRouter);

app.use('/api/v1/categories',categoryRouter);


app.use('/api/v1/posts',postsRouter);
app.use('/api/v1/comments',commentRouter);

//!Not found middleware
app.use(notFound);


//!Error middleware
 app.use(globalErrHandler);




// in future if you want to use real time chat using socket.io we need http so thats the reason to use it else we can use express
const server = http.createServer(app);

//? Start the server 
const PORT = process.env.PORT || 9080;
server.listen(PORT, console.log(`Server is running on port ${PORT}`));


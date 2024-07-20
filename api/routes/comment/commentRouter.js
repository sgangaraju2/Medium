const express = require("express");
const {createComment, deleteComment, updateComment} = require("../../controllers/comments/comments");
const isLoggin = require("../../middleware/isLoggin");


const commentRouter = express.Router();

//create
commentRouter.post("/:postId", isLoggin, createComment);


//update
commentRouter.put("/:id", isLoggin, updateComment);


//delete
commentRouter.delete("/:id", isLoggin, deleteComment);


//Export 
module.exports = commentRouter; 
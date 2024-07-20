const express = require("express");
const isLoggin = require("../../middleware/isLoggin");
const { createPost, getPosts, getPost, updatePost,deletePost } = require("../../controllers/posts/posts");


const postsRouter = express.Router();

//create
postsRouter.post("/", isLoggin, createPost);

//getting all 
postsRouter.get("/", getPosts);

//single post 
postsRouter.get("/:id", getPost);

//update
postsRouter.put("/:id", isLoggin,updatePost);

//delete
postsRouter.delete("/:id", isLoggin,deletePost);



//Export 
module.exports = postsRouter; 
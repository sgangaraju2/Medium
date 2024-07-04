const express = require("express");
const {register,login, getProfile} = require('../../controllers/users/usersCtrl');
const isLoggin = require("../../middleware/isLoggin");

const usersRouter = express.Router();

//!Register
usersRouter.post("/register", register);

//*Login
usersRouter.post("/login", login);

//*Profile
usersRouter.get("/profile/", isLoggin, getProfile);

//Export 
module.exports = usersRouter; 









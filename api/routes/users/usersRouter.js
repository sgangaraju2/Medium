const express = require("express");
const {register,login, getProfile, blockUser, unblockUser, profileViewers, followingUser, unFollowingUser, forgotpassword, resetPassword} = require('../../controllers/users/usersCtrl');
const isLoggin = require("../../middleware/isLoggin");

const usersRouter = express.Router();

//!Register
usersRouter.post("/register", register);

//*Login
usersRouter.post("/login", login);

//*Profile
usersRouter.get("/profile/", isLoggin, getProfile);

//*Block User
usersRouter.put("/block/:userIdToBlock", isLoggin, blockUser);


//*unBlock User
usersRouter.put("/unblock/:userIdToUnBlock", isLoggin, unblockUser);


//*UNBLOCK
usersRouter.get("/profile-viewer/:userProfileId", isLoggin, profileViewers);


//*forgot-password
usersRouter.post("/forgot-password", forgotpassword);

//*reset-password
usersRouter.post("/reset-password/:resetToken", resetPassword);

//*Followers
usersRouter.put("/following/:userToFollowId", isLoggin, followingUser);

//*UnFollowing
usersRouter.put("/unfollowing/:userToUnFollowId", isLoggin, unFollowingUser);

//Export 
module.exports = usersRouter; 













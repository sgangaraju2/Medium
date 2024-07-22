const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const asynchHandler = require("express-async-handler");
const isLoggin = require("../../middleware/isLoggin");
const sendEmail = require("../../utils/sendEmail");


//@desc Register a new user
//@route POST /api/v1/users/register
//@access public

const User = require("../../model/User/User");
const generateToken = require("../../utils/generateToken");

exports.register = asynchHandler(async(req, res)=>{

    

        //get the details
        const {username, password, email} = req.body;

        //! Check if user exists
       const user = await User.findOne({username});
        if(user){
            throw new Error('User Already Exists');
        }

        //Register new user
   const newUser =     new User({
            username,
            email,
            password,
        });

        //!Hash Password
        const salt = await bcrypt.genSalt(10);
        newUser.password = await bcrypt.hash(password, salt);


        // save
        await newUser.save();

        res.status(201).json({
            status:'success',
            message:'User Registered Successfully',
            _id: newUser?._id,
            username: newUser?.username,
            email: newUser?.email,
            role: newUser?.role
        })
 
    
    
})



//@desc Login user
//@route POST /api/v1/users/login
//@access public

exports.login= asynchHandler(async(req,res)=>{
    
        //? get login details
        const { username, password } = req.body;
        //! Check if exists
        const user = await User.findOne({ username });
        if (!user) {
          throw new Error("Invalid login credentials");
        }
        //compare the hashed password with the one the request
        const isMatched = await bcrypt.compare(password, user?.password);
        if (!isMatched) {
    throw new Error("Invalid login credentials");
  }
          //Update the last login
  user.lastLogin = new Date();
  res.json({
    status: "success",
    email:user?.email,
    _id:user?._id,
    username: user?.username,
    role: user?.role,
    token: generateToken(user),
  });
})

//@desc  Get profile
//@route GET /api/v1/users/public-profile/:userId
//@access Public

exports.getProfile = asynchHandler(async (req,res, next) => {
    //trigger custom error

    // const myErr = new Error('my custom error');
    // return next(myErr);

    // console.log(req.userAuth);
        //! get user id from params
        const id =req.userAuth._id;
        const user = await User.findById(id);

        console.log(user);
        res.json({
            status: "success",
            message: "Profile Fetched",
            data:"user data",
            user,
        });
})


//@desc Block user
//@route POST /api/v1/users/block/:userIdToBlock
//@access Private 

exports.blockUser = asynchHandler(async (req, res) => {
  //* Find the user to be blocked
  const userIdToBlock = req.params.userIdToBlock;
  const userToBlock = await User.findById(userIdToBlock);
  if (!userToBlock) {
    throw new Error("User to block not found");
  }
  // ! user who is blocking
  const userBlocking = req.userAuth._id;
  // check if user is blocking him/herself
  if (userIdToBlock.toString() === userBlocking.toString()) {
    throw new Error("Cannot block yourself");
  }
  //find the current user
  const currentUser = await User.findById(userBlocking);
  //? Check if user already blocked
  if (currentUser?.blockedUsers?.includes(userIdToBlock)) {
    throw new Error("User already blocked");
  }
  //push the user to be blocked in the array of the current user
  currentUser.blockedUsers.push(userIdToBlock);
  await currentUser.save();
  res.json({
    message: "User blocked successfully",
    status: "success",
  });
});

//@desc   unBlock user
//@route  PUT /api/v1/users/unblock/:userIdToUnBlock
//@access Private

exports.unblockUser = asynchHandler(async (req, res) => {
  //* Find the user to be unblocked
  const userIdToUnBlock = req.params.userIdToUnBlock;
  const userToUnBlock = await User.findById(userIdToUnBlock);
  if (!userToUnBlock) {
    throw new Error("User to be unblock not found");
  }
  //find the current user
  const userUnBlocking = req.userAuth._id;
  const currentUser = await User.findById(userUnBlocking);

  //check if user is blocked before unblocking
  if (!currentUser.blockedUsers.includes(userIdToUnBlock)) {
    throw new Error("User not block");
  }
  //remove the user from the current user blocked users array
  currentUser.blockedUsers = currentUser.blockedUsers.filter(
    (id) => id.toString() !== userIdToUnBlock.toString()
  );
  //resave the current user
  await currentUser.save();
  res.json({
    status: "success",
    message: "User unblocked successfully",
  });
});


//@desc   who view my profile
//@route  GET /api/v1/users/profile-viewer/:userProfileId
//@access Private

exports.profileViewers = asynchHandler(async (req, res) => {
  //* Find that we want to view his profile
  const userProfileId = req.params.userProfileId;

  const userProfile = await User.findById(userProfileId);
  if (!userProfile) {
    throw new Error("User to view his profile not found");
  }

  //find the current user
  const currentUserId = req.userAuth._id;
  //? Check if user already viewed the profile
  if (userProfile?.profileViewers?.includes(currentUserId)) {
    throw new Error("You have already viewed this profile");
  }
  //push the user current user id into the user profile
  userProfile.profileViewers.push(currentUserId);
  await userProfile.save();
  res.json({
    message: "You have successfully viewed his/her profile",
    status: "success",
  });
});

//@desc   Follwing user
//@route  PUT /api/v1/users/following/:userIdToFollow
//@access Private

exports.followingUser = asynchHandler(async (req, res) => {
  //Find the current user
  const currentUserId = req.userAuth._id;
  //! Find the user to follow
  const userToFollowId = req.params.userToFollowId;
  //Avoid user following himself
  if (currentUserId.toString() === userToFollowId.toString()) {
    throw new Error("You cannot follow yourself");
  }
  //Push the usertofolowID into the current user following field
  await User.findByIdAndUpdate(
    currentUserId,
    {
      $addToSet: { following: userToFollowId },
    },
    {
      new: true,
    }
  );
  //Push the currentUserId into the user to follow followers field
  await User.findByIdAndUpdate(
    userToFollowId,
    {
      $addToSet: { followers: currentUserId },
    },
    {
      new: true,
    }
  );
  //send the response
  res.json({
    status: "success",
    message: "You have followed the user successfully",
  });
});

//@desc   UnFollwing user
//@route  PUT /api/v1/users/unfollowing/:userIdToUnFollow
//@access Private

exports.unFollowingUser = asynchHandler(async (req, res) => {
  //Find the current user
  const currentUserId = req.userAuth._id;
  //! Find the user to unfollow
  const userToUnFollowId = req.params.userToUnFollowId;

  //Avoid user unfollowing himself
  if (currentUserId.toString() === userToUnFollowId.toString()) {
    throw new Error("You cannot unfollow yourself");
  }
  //Remove the usertoUnffolowID from the current user following field
  await User.findByIdAndUpdate(
    currentUserId,
    {
      $pull: { following: userToUnFollowId },
    },
    {
      new: true,
    }
  );
  //Remove the currentUserId from the user to unfollow followers field
  await User.findByIdAndUpdate(
    userToUnFollowId,
    {
      $pull: { followers: currentUserId },
    },
    {
      new: true,
    }
  );
  //send the response
  res.json({
    status: "success",
    message: "You have unfollowed the user successfully",
  });
});

// @route   POST /api/v1/users/forgot-password
// @desc   Forgot password
// @access  Public

exports.forgotpassword = asynchHandler(async (req, res) => {
  const { email } = req.body;
  //Find the email in our db
  const userFound = await User.findOne({ email });
  if (!userFound) {
    throw new Error("There's No Email In Our System");
  }
  //Create token
  const resetToken = await userFound.generatePasswordResetToken();
  //resave the user
  await userFound.save();

  //send email
  sendEmail(email, resetToken);
  res.status(200).json({ message: "Password reset email sent", resetToken });
});


// @route   POST /api/v1/users/reset-password/:resetToken
// @desc   Reset password
// @access  Public

exports.resetPassword = asynchHandler(async (req, res) => {
  //Get the id/token from email /params
  const { resetToken } = req.params;
  const { password } = req.body;
  //Convert the token to actual token that has been saved in the db
  const cryptoToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  //find the user by the crypto token
  const userFound = await User.findOne({
    passwordResetToken: cryptoToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!userFound) {
    throw new Error("Password reset token is invalid or has expired");
  }
  //Update the user password
  const salt = await bcrypt.genSalt(10);
  userFound.password = await bcrypt.hash(password, salt);
  userFound.passwordResetExpires = undefined;
  userFound.passwordResetToken = undefined;
  //resave the user
  await userFound.save();
  res.status(200).json({ message: "Password reset successfully" });
});


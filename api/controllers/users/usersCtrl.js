const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const asynchHandler = require("express-async-handler");
const isLoggin = require("../../middleware/isLoggin");

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




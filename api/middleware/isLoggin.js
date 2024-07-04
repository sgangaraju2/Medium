const jwt = require("jsonwebtoken");
const User = require("../model/User/User");
const isLoggin =  (req, res, next) =>{
    console.log(req.headers);
    
    //*Get token from header

    const token = req.headers.authorization?.split(" ")[1];
    console.log(token);

    //? Verify the token decoded is nothing but the actual user
     jwt.verify(token, process.env.JWT_KEY, async (err, decoded) =>{
        //add user ti req obj 
       
        //get the user id 
        const userId = decoded?.user?.id;

        

        const user = await User.findById(userId).select('username email role _id');

      

        //save user into req obj


        req.userAuth = user;


         

         if (err) {
            const err = new Error('Token expired/Invalid');
             
             next(err);
            
           } else {
             //! save the user
             //* send the user

                next();
             
           }

     });
   

};


module.exports = isLoggin;


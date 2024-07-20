const asyncHandler = require("express-async-handler");
const Category = require("../../model/Category/Category");
const Post = require("../../model/Post/Post");
const User = require("../../model/User/User");

//@desc  Create a post
//@route POST /api/v1/post
//@access Private
exports.createPost = asyncHandler(async (req, res) => {
    //! Find the user/chec if user account is verified
    const userFound = await User.findById(req.userAuth._id);
    if (!userFound) {
      throw new Error("User Not found");
    }
    // if (!userFound?.isVerified) {
    //   throw new Error("Action denied, your account is not verified");
    // }
    //Get the payload
    const { title, content, categoryId } = req.body;
    //chech if post exists
    const postFound = await Post.findOne({ title });
    if (postFound) {
      throw new Error("Post aleady exists");
    }
    //Create post
    const post = await Post.create({
      title,
      content,
      category: categoryId,
      author: req?.userAuth?._id,
      
    });
    //!Associate post to user
    await User.findByIdAndUpdate(
      req?.userAuth?._id,
      {
        $push: { posts: post._id },
      },
      {
        new: true,
      }
    );
  
    //* Push post into category
    await Category.findByIdAndUpdate(
      req?.userAuth?._id,
      {
        $push: { posts: post._id },
      },
      {
        new: true,
      }
    );
    //? send the response
    res.json({
      status: "scuccess",
      message: "Post Succesfully created",
      post,
    });
  });



//@desc  Get all posts
//@route GET /api/v1/posts
//@access Public

exports.getPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find({}).populate('comments');
  res.status(201).json({
    status: "success",
    message: "Posts successfully fetched",
    posts,
  });
});


//@desc  Get single post
//@route GET /api/v1/posts/:id
//@access Public

exports.getPost = asyncHandler(async (req, res) => {
  const post = await Post.findbyId(req.params.id);
  res.status(201).json({
    status: "success",
    message: "Posts successfully fetched",
    post,
  });
});

  //@desc  Delete Post
//@route DELETE /api/v1/posts/:id
//@access Private

exports.deletePost = asyncHandler(async (req, res) => {
  await Post.findByIdAndDelete(req.params.id);
  res.status(201).json({
    status: "success",
    message: "Post successfully deleted",
  });
});

//@desc  update Post
//@route PUT /api/v1/posts/:id
//@access Private

exports.updatePost = asyncHandler(async (req, res) => {
  const post = await Post.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );
  res.status(201).json({
    status: "success",
    message: "Post successfully updated",
    post,
  });
});



// exports.getPosts = asyncHandler(async (req, res) => {
//   // !find all users who have blocked the logged-in user
//   const loggedInUserId = req.userAuth?._id;
//   //get current time
//   const currentTime = new Date();
//   const usersBlockingLoggedInuser = await User.find({
//     blockedUsers: loggedInUserId,
//   });
//   // Extract the IDs of users who have blocked the logged-in user
//   const blockingUsersIds = usersBlockingLoggedInuser?.map((user) => user?._id);
//   //! Get the category, searchterm from request
//   const category = req.query.category;
//   const searchTerm = req.query.searchTerm;
//   //query
//   let query = {
//     author: { $nin: blockingUsersIds },
//     $or: [
//       {
//         shedduledPublished: { $lte: currentTime },
//         shedduledPublished: null,
//       },
//     ],
//   };
//   //! check if category/searchterm is specified, then add to the query
//   if (category) {
//     query.category = category;
//   }
//   if (searchTerm) {
//     query.title = { $regex: searchTerm, $options: "i" };
//   }
//   //Pagination parameters from request

//   const page = parseInt(req.query.page, 10) || 1;
//   const limit = parseInt(req.query.limit, 10) || 5;
//   const startIndex = (page - 1) * limit;
//   const endIndex = page * limit;
//   const total = await Post.countDocuments(query);

//   const posts = await Post.find(query)
//     .populate({
//       path: "author",
//       model: "User",
//       select: "email role username",
//     })
//     .populate("category")
//     .skip(startIndex)
//     .limit(limit)
//     .sort({ createdAt: -1 });
//   // Pagination result
//   const pagination = {};
//   if (endIndex < total) {
//     pagination.next = {
//       page: page + 1,
//       limit,
//     };
//   }

//   if (startIndex > 0) {
//     pagination.prev = {
//       page: page - 1,
//       limit,
//     };
//   }

//   res.status(201).json({
//     status: "success",
//     message: "Posts successfully fetched",
//     pagination,
//     posts,
//   });
// });
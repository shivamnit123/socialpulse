import Post from "../models/postModel.js";
import User from "../models/usermodel.js";
import { v2 as cloudinary } from "cloudinary";
const createPost = async (req, res) => {
    try {
        const { postedBy, text } = req.body;
        let { img } = req.body;

        if (!postedBy || !text) {    // for posting two fields required
            return res.status(400).json({ error: "Postedby and text fields are required" });
        }

        // before posting check user------
        const user = await User.findById(postedBy);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        /// if user is trying to create someone post then it is unauthorized------------
        if (user._id.toString() !== req.user._id.toString()) {
            return res.status(401).json({ error: "Unauthorized to create post" });
        }

        //post text length
        const maxLength = 500;
        if (text.length > maxLength) {
            return res.status(400).json({ error: `Text must be less than ${maxLength} characters` });
        }

        if (img) {
            const uploadedResponse = await cloudinary.uploader.upload(img);
            img = uploadedResponse.secure_url;
        }

        const newPost = new Post({ postedBy, text, img });   // create data in database------
        await newPost.save();  // save in data base

        res.status(201).json(newPost);
    } catch (err) {
        res.status(500).json({ error: err.message });
        console.log(err);
    }
};

// to get the post of someone we need only one thing that is post id and that id comes from re.params(url)

const getPost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        res.status(200).json(post);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// to delete the post we just know post id which comes from requested url-------------------- 

const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);  //fetch post id from req . params-----
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        // only that user will delete this post who are the owner of the post-----otherwise they are unauthorized-------------
        if (post.postedBy.toString() !== req.user._id.toString()) {   // objects the esliye unko string me convert kiya
            return res.status(401).json({ error: "Unauthorized to delete post" });
        }
        // delete image from cloudinary
        if (post.img) {
            const imgId = post.img.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(imgId);
        }

        //// delete it
        await Post.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: "Post deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// for like and unlike post we need post id from req url-----
const likeUnlikePost = async (req, res) => {
    try {
        const { id: postId } = req.params;   // fetch post id and just give name postId for understanding-------
        const userId = req.user._id;       // fetch user id 

        const post = await Post.findById(postId);  // find post by using post id in database--------------

        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        const userLikedPost = post.likes.includes(userId);      // lets u like the post then add that user id who likes the post-----

        if (userLikedPost) {
            // Unlike post ----- if(user unlike the post then remove user id (jo pahle user ne post like kiya tha)) likes is aarray contains user ids
            await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
            res.status(200).json({ message: "Post unliked successfully" });
        } else {
            // Like post ----- if(user likes the post simply push user id in it)
            post.likes.push(userId);
            await post.save();   /// save the updated data---------------------------
            res.status(200).json({ message: "Post liked successfully" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/// for commenting on a post we need post, post id ------
const replyToPost = async (req, res) => {
    // need a text mesage,profile pic user id user name------see post model we have replies array of object-----
    try {
        const { text } = req.body;
        const postId = req.params.id;    // fetch post id from req url----
        const userId = req.user._id;    // fetch user id from database------
        const userProfilePic = req.user.profilePic;
        const username = req.user.username;

        if (!text) {
            return res.status(400).json({ error: "Text field is required" });
        }
        // check if the post is present or not----------

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        // destructured all values and push them into replies object  which are in the post model------

        const reply = { userId, text, userProfilePic, username };

        post.replies.push(reply);
        // save the databsse-------
        await post.save();

        res.status(200).json(reply);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// to get feed post we need users id--------
// supppose i am the current user and i want  all my followings user posts to show on my screen-----------------------
const getFeedPosts = async (req, res) => {
    try {
        // first we get user id from databsse----------
        const userId = req.user._id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        //  get list of user that the current user follows------------------------
        const following = user.following;
        // now we just need to find the post where the posted by field in the following array-----
        const feedPosts = await Post.find({ postedBy: { $in: following } }).sort({ createdAt: -1 }); // here i sort in createdAt-1 b/c i want
        // thos posts recommended first who are created latest----
        res.status(200).json(feedPosts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getUserPosts = async (req, res) => {
    const { username } = req.params;
    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const posts = await Post.find({ postedBy: user._id }).sort({ createdAt: -1 });

        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


export { createPost, getPost, deletePost, likeUnlikePost, replyToPost, getFeedPosts, getUserPosts };
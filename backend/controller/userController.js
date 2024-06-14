import User from "../models/usermodel.js";
import Post from "../models/postmodel.js";
import bcrypt from "bcryptjs";
import generateTokenAndSetCookie from "../utils/helper/generateTokenAndSetCookie.js";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
const getUserProfile = async (req, res) => {
    // We will fetch user profile either with username or userId
    // query is either username or userId
    // const { query } = req.params;
    const { query } = req.params;

    try {
        let user;
        // if query is userId
        if (mongoose.Types.ObjectId.isValid(query)) {
            user = await User.findOne({ _id: query }).select("-password").select("-updatedAt");
        } else {
            // query is username
            user = await User.findOne({ username: query }).select("-password").select("-updatedAt");
        }

        if (!user) return res.status(404).json({ error: "User not found" });

        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
        console.log("Error in getUserProfile: ", err.message);
    }
};


const signupUser = async (req, res) => {
    try {
        const { name, email, username, password } = req.body;
        const user = await User.findOne({ $or: [{ email }, { username }] });

        if (user) {
            return res.status(400).json({ error: "User already exists" });
        }

        //A salt is a random string that is added to the password before hashing to ensure that even if two users have the same password, their hashed passwords will be different.
        const salt = await bcrypt.genSalt(10); //This number represents the cost factor, which controls how much time is needed to calculate a single hash. for more security purpose
        const hashedPassword = await bcrypt.hash(password, salt); // This function hashes the given password using the previously generated salt. The salt ensures that the hash is unique even if the same password is used multiple times.

        // create a database..and add all inputs in it.
        const newUser = new User({
            name,
            email,
            username,
            password: hashedPassword,
        });
        await newUser.save();

        // after creating data base... generate tokens-----

        if (newUser) {
            generateTokenAndSetCookie(newUser._id, res);  // this id comes from mongodb database

            res.status(201).json({
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                username: newUser.username,
                bio: newUser.bio,
                profilePic: newUser.profilePic
            });
        } else {
            res.status(400).json({ error: "Invalid user data" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
        console.log("Error in signupUser: ", err.message);
    }
};

const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });   // check username in database if it is exist then check password---
        const isPasswordCorrect = await bcrypt.compare(password, user?.password || "");  // if user is not find then its pasword is undefined so thats why here i write || " "

        if (!user || !isPasswordCorrect) return res.status(400).json({ error: "Invalid username or password" });

        if (user.isFrozen) {
            user.isFrozen = false;
            await user.save();
        }

        generateTokenAndSetCookie(user._id, res);

        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            username: user.username,
            bio: user.bio,
            profilePic: user.profilePic,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
        console.log("Error in loginUser: ", error.message);
    }
};

const logoutUser = (req, res) => {
    //  for logout we have to do just 2 things first remove coookie 
    try {
        res.cookie("jwt", "", { maxAge: 1 });
        res.status(200).json({ message: "User logged out successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
        console.log("Error in signupUser: ", err.message);
    }
};


const followUnFollowUser = async (req, res) => {
    try {
        const { id } = req.params; // get id from the req url i.e. from userRoute /follow:id----
        const userToModify = await User.findById(id);  // find the user by user id --------
        const currentUser = await User.findById(req.user._id); // check for current user id get id from database------------

        // if params id which the current user wants to follow are equal then send error-----

        if (id === req.user._id.toString())  // in request the user id is present in object format..so we convert it into string
            return res.status(400).json({ error: "You cannot follow/unfollow yourself" });

        // if user is not found-----

        if (!userToModify || !currentUser) return res.status(400).json({ error: "User not found" });

        // now if params id and current user id both diffrent then current user easily follow or unfollow the users

        const isFollowing = currentUser.following.includes(id);  // follow the user------


        if (isFollowing) {
            // Unfollow user
            await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } }); // modify followed user follower by removing current user id
            await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } }); //modify currentUser following by removing id of followed user
            res.status(200).json({ message: "User unfollowed successfully" });
        } else {
            // Follow user-----------------------------  just opposite---------from unfollow user-----take scenario of shivam and takla
            await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
            await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });
            res.status(200).json({ message: "User followed successfully" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
        console.log("Error in followUnFollowUser: ", err.message);
    }
};

// update user profile-----------

const updateUser = async (req, res) => {
    // fetch updated values from request body----
    const { name, email, username, password, bio } = req.body;
    const userId = req.user._id;   // take user id

    let { profilePic } = req.body;

    try {
        let user = await User.findById(userId);  // find user in database from given user id
        if (!user) return res.status(400).json({ error: "User not found" });

        // req.user._id is an object so thats why we convert it into string------

        if (req.params.id !== userId.toString())
            return res.status(400).json({ error: "You cannot update other user's profile" });

        // update password---------
        if (password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            user.password = hashedPassword;
        }

        if (profilePic) {
            if (user.profilePic) {
                await cloudinary.uploader.destroy(user.profilePic.split("/").pop().split(".")[0]);
            }

            const uploadedResponse = await cloudinary.uploader.upload(profilePic);
            profilePic = uploadedResponse.secure_url;
        }

        user.name = name || user.name;
        user.email = email || user.email;
        user.username = username || user.username;
        user.profilePic = profilePic || user.profilePic;
        user.bio = bio || user.bio;

        // save user data in database--------

        user = await user.save();

        // Find all posts that this user replied and update username and userProfilePic fields
        // when i changed my username ..i want my username will updated every where ..where my prev username present--like in comment or reply
        await Post.updateMany(
            { "replies.userId": userId },   //each replies contai user id
            {
                $set: {  //mongoose has set syntax for setting or updating 
                    "replies.$[reply].username": user.username,
                    "replies.$[reply].userProfilePic": user.profilePic,  //updat profile pic also-----
                },
            },
            { arrayFilters: [{ "reply.userId": userId }] } // fill the place holder([reply])---
        );

        //password should be null in response
        user.password = null;

        res.status(200).json({ message: "Profile Updated Succefully", user });
    } catch (err) {
        res.status(500).json({ error: err.message });
        console.log("Error in updateUser: ", err.message);
    }
};

const getSuggestedUsers = async (req, res) => {
    try {
        // exclude the current user from suggested users array and exclude users that current user is already following
        const userId = req.user._id;
        // first we try to find the user that we followed------then this is going to give us an array
        const usersFollowedByYou = await User.findById(userId).select("following");
        //now next we fetch the 10 random user from the database---------but check userid is not equal to actual user----
        const users = await User.aggregate([
            {
                $match: {
                    _id: { $ne: userId },  //ne not equal
                },
            },
            {
                $sample: { size: 10 }, // 10 random users from database
            },
        ]);
        // now from 10 random users some users are already i followed so filter that user
        const filteredUsers = users.filter((user) => !usersFollowedByYou.following.includes(user._id));
        // after filter only take 4 users if it is present-----after filteration---
        const suggestedUsers = filteredUsers.slice(0, 5);
        // also make sure ensure that the suggested users i got..for each suggested user we set null in password
        suggestedUsers.forEach((user) => (user.password = null));

        res.status(200).json(suggestedUsers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// for freeze the account we need user id which is present on req body----
const freezeAccount = async (req, res) => {
    try {

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(400).json({ error: "User not found" });
        }
        // make frozen true in user database-----
        user.isFrozen = true;
        await user.save();  // save the database-----

        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export {
    signupUser,
    loginUser,
    logoutUser,
    followUnFollowUser,
    updateUser,
    getUserProfile,
    getSuggestedUsers,
    freezeAccount,
};
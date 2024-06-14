import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import { createPost, deletePost, getFeedPosts, getPost, getUserPosts, likeUnlikePost, replyToPost } from "../controller/postContoller.js";

const router = express.Router();


router.get("/feed", protectRoute, getFeedPosts);  // get list of users--------------------------
router.post("/create", protectRoute, createPost);  // if u aree not logged in then u will not create post---
router.get("/user/:username", getUserPosts);
router.get("/:id", getPost);   // use post id to get the post
router.delete("/:id", protectRoute, deletePost);  // if u aree not logged in then u will not delete post---
router.put("/like/:id", protectRoute, likeUnlikePost);  // if u aree not logged in then u will not like the post---
router.put("/reply/:id", protectRoute, replyToPost); // if u aree not logged in then u will not comment in the post---

export default router;
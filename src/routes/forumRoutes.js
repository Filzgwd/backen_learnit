const express = require("express");
const router = express.Router();

const forumController = require("../controllers/forumController");

const auth = require("../middlewares/authMiddleware");

router.post("/", auth, forumController.createPost);

router.get("/", auth, forumController.getAllPosts);

router.delete("/:id", auth, forumController.deletePost);

router.put("/:id", auth, forumController.updatePost);

module.exports = router;
const express = require("express");
const router = express.Router();

const commentController = require("../controllers/commentController");

const auth = require("../middlewares/authMiddleware");

router.post("/", auth, commentController.createComment);

router.get(
  "/post/:postId",
  commentController.getCommentsByPost
);

router.get("/:id", commentController.getCommentById);

router.put("/:id", auth, commentController.updateComment);

router.delete("/:id", auth, commentController.deleteComment);

module.exports = router; 
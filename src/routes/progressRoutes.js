const express = require("express");
const router = express.Router();

const controller = require("../controllers/progressController");

const auth = require("../middlewares/authMiddleware");

router.post("/complete", auth, controller.completeMaterial);

router.get("/me", auth, controller.getMyProgress);

router.get(
  "/category/:category_id",
  auth,
  controller.getProgressPercentage
);

module.exports = router;
const express = require("express");
const {
  getOthers,
  addFriend,
  getFriendsCsvData,
} = require("../controllers/friends.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/others", authMiddleware, getOthers);
router.post("/add", authMiddleware, addFriend);
router.get("/csv-data", authMiddleware, getFriendsCsvData);

module.exports = router;
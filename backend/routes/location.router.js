const express = require("express");
const {
  addLocation,
  getLocationCsvData,
  deleteLocation,
  editLocation,
  getUser,
} = require("../controllers/location.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");
const router = express.Router();

router.post("/add", authMiddleware, addLocation);
router.put("/edit", authMiddleware, editLocation);
router.delete("/delete", authMiddleware, deleteLocation);
router.get("/user/:username", getUser);
router.get("/csv-data", authMiddleware, getLocationCsvData);

module.exports = router;
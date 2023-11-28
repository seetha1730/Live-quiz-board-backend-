const express = require("express");
const router = express.Router();
const User = require("../models/User.model");

const fileUploader = require("../config/cloudinary.config");


router.get("/:userId", async (req, res) => {
    try {
      const userId = req.params.userId;
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      res.status(200).json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });
  
  router.put("/:userId",  fileUploader.single("image"), async (req, res) => {
    try {
      const userId = req.params.userId;
      const updatedProfile = req.body;

  
      // Check if a new image file was uploaded
      if (req.file) {
        updatedProfile.image = req.file.path; // Cloudinary provides the file path
      }
  
      const profile = await User.findOneAndUpdate({ _id: userId }, updatedProfile, { new: true });
      if (!profile) {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(200).json(profile);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  module.exports = router;
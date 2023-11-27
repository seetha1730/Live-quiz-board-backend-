const express = require("express");
const router = express.Router();
const Profile = require("../models/Profile.model");
router.put("/:userId", async (req, res) => {
    try {
      const userId = req.params.userId;
      const updatedProfile = req.body; 
  
      const profile = await Profile.findOneAndUpdate({ user: userId }, updatedProfile, { new: true });
  
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
  
      res.status(200).json(profile);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  module.exports = router;
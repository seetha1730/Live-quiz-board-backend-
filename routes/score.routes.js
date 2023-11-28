const express = require("express");
const router = express.Router();
const Score = require("../models/Score.model");
const User =require("../models/User.model")

//GET call forgot password
router.get("/scoreHistory", async (req, res, next) => {
    try {
        const scoreHistory = await Score.find({}).sort({ date: -1 });
        res.json(scoreHistory);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
      }
  });
  router.get("/scoreHistory/:userId", async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await User.findById(userId);
    
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
    
        // Assuming you have an email property in the User model
        const userEmail = user.email;
    
        // Query the Score model to get the history for the user's email
        const userScoreHistory = await Score.find({
          "players.email": userEmail,
        }).sort({ date: -1 });
    
        res.status(200).json(userScoreHistory);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
      }
  });
module.exports = router;
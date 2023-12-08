const express = require("express");
const router = express.Router();
const Feedback = require("../models/Feedback.model");

router.post('/user', async (req, res) => {
    try {
      const { game, player, feedbackText, rating } = req.body;
       console.log("feedback",req.body)

      const newFeedback = new Feedback({
        game,
        player,
        feedbackText,
        rating,
      });

  
      const savedFeedback = await newFeedback.save();
  
      res.status(201).json(savedFeedback);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  router.get('/all', async (req, res) => {
    try {
        
      const allFeedback = await Feedback.find();
      res.status(200).json(allFeedback);
     
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });


module.exports = router;
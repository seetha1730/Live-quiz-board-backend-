// questionAnswer.routes.js
const express = require("express");
const router = express.Router();
const QuestionAnswer = require("../models/QuestionAnswer.model");

// POST /question-answers/create - Create a new question answer
router.post("/create", async (req, res) => {
  const { category, questionText, options, correctOption } = req.body;

  try {
    const newQuestionAnswer = new QuestionAnswer({
      category,
      questionText,
      options,
      correctOption,
    });

    const savedQuestionAnswer = await newQuestionAnswer.save();
    res.status(201).json(savedQuestionAnswer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET /question-answers/all - Retrieve all question answers
router.get("/all", async (req, res) => {
  try {
    const questionAnswers = await QuestionAnswer.find();
    res.json(questionAnswers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.put("/:id/update", async (req, res) => {
    const { category, questionText, options, correctOption } = req.body;
  
    try {
      const updatedQuestionAnswer = await QuestionAnswer.findByIdAndUpdate(
        req.params.id,
        { category, questionText, options, correctOption },
        { new: true } // Return the updated document
      );
  
      res.json(updatedQuestionAnswer);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // DELETE /question-answers/:id/delete - Delete a question answer
router.delete("/:id/delete", async (req, res) => {
    try {
      const deletedQuestionAnswer = await QuestionAnswer.findByIdAndDelete(req.params.id);
  
      res.json(deletedQuestionAnswer);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
// Add more routes as needed for your application

module.exports = router;

const { Schema, model } = require("mongoose");

const quizSettingsSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Quiz title is required."],
    },
    description: {
      type: String,
      required: [true, "Quiz description is required."],
    },
    questions: {
      type: [{
        questionText: String,
        options: [String], // Assuming multiple-choice options as strings
        correctOption: Number, // Index of the correct option in the 'options' array
      }],
      required: [true, "At least one question is required."],
    },
    duration: {
      type: Number, // Duration of the quiz in minutes, for example
      required: [true, "Quiz duration is required."],
    },
   

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',  // Reference to the User model for the quiz creator
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const QuizSettings = model("QuizSettings", quizSettingsSchema);

module.exports = QuizSettings;

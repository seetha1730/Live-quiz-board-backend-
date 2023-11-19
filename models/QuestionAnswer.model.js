const { Schema, model } = require("mongoose");

const questionAnswerSchema = new Schema(
  {
    category: {
      type: String,
      required: [true, "Category is required."],
    },
    questionText: {
      type: String,
      required: [true, "Question text is required."],
    },
    options: {
      type: [String],
      required: [true, "At least one option is required."],
    },
    correctOption: {
      type: Number,
      required: [true, "Correct option index is required."],
    }
  },
  {
    timestamps: true,
  }
);

const QuestionAnswer = model("QuestionAnswer", questionAnswerSchema);

module.exports = QuestionAnswer;

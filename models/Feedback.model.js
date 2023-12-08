const { Schema, model } = require("mongoose");

// Rating sub-schema
const ratingSchema = new Schema({
  overall: {
    type: Number,
   
    min: 1,
    max: 5,
  },
  difficulty: {
    type: Number,
   
    min: 1,
    max: 5,
  },
  enjoyment: {
    type: Number,
   
    min: 1,
    max: 5,
  },
});

const feedbackSchema = new Schema(
  {
    game: {
      type: String,
      ref: 'Game', 
     
    },
    player: {
      type: String,
      ref: 'User',  
     
    },
    feedbackText: {
      type: String,
     
    },
    rating: ratingSchema,
  },
  {
    timestamps: true,
  }
);

const Feedback = model("Feedback", feedbackSchema);

module.exports = Feedback;

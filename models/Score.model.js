const mongoose = require("mongoose");

const scoreSchema = new mongoose.Schema({
  players: [
    {
      playerName: String,
      score: Number,
      rank: Number,
      email: String
    }
  ],

  date: {
    type: Date,
    default: Date.now,
  },
  roomName: {
    type: String,
  },
  creator: {
    type: String,
  }
});
const Score = mongoose.model("Score", scoreSchema);

module.exports = Score;
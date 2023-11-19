const { Schema, model } = require("mongoose");

const profileSchema = new Schema(
  {
    // Define fields for the profile
    firstName: {
      type: String,
      required: [true, "First name is required."],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required."],
    },
    age: {
      type: Number,
      required: [true, "Age is required."],
    },
    // Add more fields as needed for your application

    // Reference to a user (assuming a one-to-one relationship)
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',  // Reference to the User model
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Profile = model("Profile", profileSchema);

module.exports = Profile;

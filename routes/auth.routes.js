const express = require("express");
const router = express.Router();

// ℹ️ Handles password encryption
const bcrypt = require("bcrypt");

// ℹ️ Handles password encryption
const jwt = require("jsonwebtoken");

// Require the User model in order to interact with the database
const User = require("../models/User.model");
const uuid = require('uuid');
// Require necessary (isAuthenticated) middleware in order to control access to specific routes
const { isAuthenticated } = require("../middleware/jwt.middleware.js");

// How many rounds should bcrypt run the salt (default - 10 rounds)
const saltRounds = 10;
const globalUsersArray = []; 

const mailjet = require("node-mailjet").apiConnect(
  process.env.MAILJET_API_KEY,
  process.env.MAILJET_API_SECRET
);

sendGeneralMail = function (mail,sub, msg) {
  return mailjet.post("send", { version: "v3.1" }).request({
    Messages: [
      {
        From: {
          Name: process.env.NAME,
          Email: process.env.EMAIL,
        },
        To: [
          {
            Email: mail,
            Name: "name",
          },
        ],
        Subject: sub,
        TextPart: msg,
      },
    ],
  });
};
// POST /auth/signup  - Creates a new user in the database
router.post("/signup", (req, res, next) => {
  const { email, password, name, lastName, dateOfBirth, gender, phoneNumber } = req.body;


   // Check if required fields are provided as empty strings
   if (
    email === "" ||
    password === "" ||
    name === "" ||
    dateOfBirth === "" ||
    gender === "" ||
    phoneNumber === ""
  ) {
    res.status(400).json({ message: "Provide all required information." });
    return;
  }

  // This regular expression check that the email is of a valid format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ message: "Provide a valid email address." });
    return;
  }

  // // This regular expression checks password for special characters and minimum length
  // const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
  // if (!passwordRegex.test(password)) {
  //   res.status(400).json({
  //     message:
  //       "Password must have at least 6 characters and contain at least one number, one lowercase and one uppercase letter.",
  //   });
  //   return;
  // }

  User.findOne({ email })
  .then((foundUser) => {
    if (foundUser) {
      res.status(400).json({ message: "User already exists." });
      return;
    }
  
    const salt = bcrypt.genSaltSync(saltRounds);
    const hashedPassword = bcrypt.hashSync(password, salt);
  
    return User.create({
      email,
      password: hashedPassword,
      name,
      lastName,
      dateOfBirth,
      gender,
      phoneNumber,
    
    });
  })
  .then((createdUser) => {
    const { email, name, _id } = createdUser;
    const user = { email, name, _id };
    res.status(201).json({ user });
  })
  .catch((err) => next(err));
  });

// POST  /auth/login - Verifies email and password and returns a JWT
router.post("/login", (req, res, next) => {
  const { email, password } = req.body;

  // Check if email or password are provided as empty string
  if (email === "" || password === "") {
    res.status(400).json({ message: "Provide email and password." });
    return;
  }

  // Check the users collection if a user with the same email exists
  User.findOne({ email })
    .then((foundUser) => {
      if (!foundUser) {
        // If the user is not found, send an error response
        res.status(401).json({ message: "User not found." });
        return;
      }

      // Compare the provided password with the one saved in the database
      const passwordCorrect = bcrypt.compareSync(password, foundUser.password);

      if (passwordCorrect) {
        // Deconstruct the user object to omit the password
        const { _id, email, name ,image} = foundUser;

        // Create an object that will be set as the token payload
        const payload = { _id, email, name,image };

        // Create a JSON Web Token and sign it
        const authToken = jwt.sign(payload, process.env.TOKEN_SECRET, {
          algorithm: "HS256",
          expiresIn: "6h",
        });

        // Send the token as the response
        res.status(200).json({ authToken: authToken });
      } else {
        res.status(401).json({ message: "Unable to authenticate the user" });
      }
    })
    .catch((err) => next(err)); // In this case, we send error handling to the error handling middleware.
});

//GET  /auth/verify  -  Used to verify JWT stored on the client
router.get("/verify", isAuthenticated, (req, res, next) => {
  // If JWT token is valid the payload gets decoded by the
  // isAuthenticated middleware and is made available on `req.payload`


  // Send back the token payload object containing the user data
  res.status(200).json(req.payload);
});

module.exports = router;

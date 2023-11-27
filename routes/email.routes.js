const express = require("express");
const router = express.Router();
const saltRounds = 10;

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require("bcrypt");

const generateResetToken = () => {
  return crypto.randomBytes(20).toString('hex');
};




const User = require("../models/User.model");
const { isAuthenticated } = require("../middleware/jwt.middleware.js");
const { appendFileSync } = require("fs");

const mailjet = require("node-mailjet").apiConnect(
  process.env.MAILJET_API_KEY,
  process.env.MAILJET_API_SECRET
);

//GET call forgot password
router.get("/forgot-password", (req, res, next) => {
  res.status(400).json();
});

sendResetPasswordEmail = async (email, resetToken) => {
  const resetLink = `http://localhost:5173/reset-password?token=${resetToken}&email=${email}`;

  try {
    await mailjet.post('send', { version: 'v3.1' }).request({
      Messages: [
        {
          From: {
            Name: process.env.NAME,
            Email: process.env.EMAIL,
          },
          To: [
            {
              Email: email,
              Name: "name",
            },
          ],
          Subject: "Reset Your Password",
          TextPart: `Click this link to reset your password: ${resetLink}`,
          HTMLPart: `<h2>Click this link to reset your password: <a href="${resetLink}">${resetLink}</a></h2>`,
        },
      ],
    });
  } catch (err) {
    console.error("Error sending email:", err.statusCode);
    throw err;
  }
};

// POST call forgot password
router.post("/forgot-password", async (req, res, next) => {
  const { email, name } = req.body;


  try {
    const user = await User.findOne({ email: email });
    if (user) {
      user.resetPasswordToken = generateResetToken();
      user.resetPasswordExpires = Date.now() + 3600000; // Token expires in 1 hour
      await user.save();
    }

    await sendResetPasswordEmail(email, user.resetPasswordToken);

    res.json({
      notification: "Please check your email for the reset password link.",
    });
  } catch (error) {
    console.error("Error in forgot-password route:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
router.get("/reset-password", (req, res, next) => {
  res.status(400).json();
});
// POST call reset password
router.post("/reset-password", async (req, res, next) => {
    try {

      const newPassword = req.body.password;
        const email = req.body.email;

        console.log('User body:', req.body);


      if (!newPassword || !email) {
        return res.sendStatus(400);
    }

            const user = await User.findOne({ email: email });
            if (!user) {
                return res.status(400).json({ error: "User not found." });
            }

            const salt = bcrypt.genSaltSync(saltRounds);
            const hashedPassword = bcrypt.hashSync(newPassword, salt);

            await User.findByIdAndUpdate(user._id, { password: hashedPassword });

            res.json({ message: 'Password reset successful, you can now login with the new password' });
       
    } 
    catch (e) {
        console.log(e);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


module.exports = router;

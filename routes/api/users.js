const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {} = require("express-validator");
const User = require('../../models/User')
const { check, validationResult } = require("express-validator");



// @route:   GET api/users
// @desc:    Test route
// @access:  Public
router.get("/", (req, res) => res.send("User Route"));

// @route:   POST api/Users
// @desc:    Register User
// @access:  Public
router.post(
  "/",
  [
    check("name", "Name is required").not().isEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check(
      "password",
      "Please enter a password with 6 or more characters"
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    // check if there are any validation errors
    //  if errors occurs below variable will be an array of those errors
    const errors = validationResult(req);

    // we check to see if there are errors in errors array
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // testing info being sent
    // return res.send(req.body)

    //Destructure needed information
    const { name, email, password } = req.body;

    try {
  // searching database for user with specific email
      let user = await User.findOne({ email });
 //  if user exists send error message
      if (user) {
        res.status(400).json({ errors: [{ msg: 'User Already Exists' }] });
      }
      
 // if no user, create one with data from req.body
      user = new User({
        name,
        email,
        password
      });

// create a salt
    const salt = await bcrypt.genSalt(10)

    user.password = await bcrypt.hash(password, salt)
// save user to DB
    await user.save()

// create jwt payload
    const payload = {
      user: {
        id: user.id
      }
    }

// create, sign, and send jwt token
    jwt.sign(
      payload, 
      process.env.jwtSecret, 
      {expiresIn: 3600000},
      (err, token) => {
        if (err) throw err;
        res.json ({token});

      }
    )
  
    } catch (err) {
      console.error(err.message);
      res.status(500).send("server Error");
    }
  }
);

module.exports = router;

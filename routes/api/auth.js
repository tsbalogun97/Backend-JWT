const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');

// @route:   GET api/auth
// @desc:    Test route
// @access:  Public
// router.get('/', (req, res) => res.send('Auth Route'));

// @route:   GET api/auth
// @desc:    Get User Data
// @access:  Private
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    //return user to DB
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route:   POST api/auth
// @desc:    Log in and authenticate user
// @access:  Public
router.post(
  '/',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password Required').isLength({ min: 6 }).not().isEmpty(),
  ],
  async (req, res) => {
    //Checking in for validation errors
    const errors = validationResult(req);

    //If errors exist respond with
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // return res.send(req.body)

    const { email, password } = req.body;

    try {
      //Searching database for user with specific email
      let user = await User.findOne({ email });

      //If user doesnt exist exists send error message
      if (!user) {
        res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
      }

      //Create a JWT
      const payload = {
        user: {
          id: user.id,
          name: user.name,
        },
      };

      jwt.sign(
        payload,
        process.env.jwtSecret,
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Sever Error');
    }
  }
);

module.exports = router;
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Login route
router.post('/login', async (req, res) => {
  try {
    const { password } = req.body;
    
    // Find all users and check password match
    const users = await User.find({});
    let matchedUser = null;
    
    for (const user of users) {
      const isMatch = await user.comparePassword(password);
      if (isMatch) {
        matchedUser = user;
        break;
      }
    }

    if (!matchedUser) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // Update last login
    matchedUser.lastLogin = Date.now();
    await matchedUser.save();

    const token = jwt.sign(
      { id: matchedUser._id, role: matchedUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: matchedUser._id,
        username: matchedUser.username,
        role: matchedUser.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify token route
router.get('/verify', auth, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        username: req.user.username,
        role: req.user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 
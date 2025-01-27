const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

router.get('/search', auth, async (req, res) => {
  try {
    const { term } = req.query;
    const searchQuery = term
      ? {
          $and: [
            {
              $or: [
                { username: { $regex: term, $options: 'i' } },
                { email: { $regex: term, $options: 'i' } }
              ]
            },
            { _id: { $ne: req.userId } }
          ]
        }
      : { _id: { $ne: req.userId } };

    const users = await User.find(searchQuery)
      .select('-password')
      .limit(20);

    const formattedUsers = users.map(user => ({
      id: user._id,
      username: user.username,
      email: user.email
    }));

    res.json(formattedUsers);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const Post = require('../models/Post'); // Adjust the path to your Post model

// Route to fetch all posts
router.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 }); // Fetch all posts sorted by creation date
    res.status(200).json(posts); // Return posts as JSON
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' }); // Return error as JSON
  }
});

module.exports = router;

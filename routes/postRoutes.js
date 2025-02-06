const express = require('express');
const Post = require('../models/Post');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Create Post
router.post('/', authMiddleware, async (req, res) => {
    try {
        const newPost = new Post({ user: req.user.id, title: req.body.title, content: req.body.content });
        await newPost.save();
        res.status(201).json(newPost);
    } catch (error) {
        res.status(500).json({ message: "Error creating post" });
    }
});

//  Get All Posts
router.get('/', authMiddleware, async (req, res) => {
    const posts = await Post.find().populate('user', 'username email');
    res.json(posts);
});

// Get Single Post
router.get('/:id', authMiddleware, async (req, res) => {
    const post = await Post.findById(req.params.id);
    res.json(post);
});

// Update Post
router.put('/:id', authMiddleware, async (req, res) => {
    const post = await Post.findById(req.params.id);
    if (post.user.toString() !== req.user.id) {
        return res.status(403).json({ message: "Not authorized" });
    }
    post.title = req.body.title || post.title;
    post.content = req.body.content || post.content;
    await post.save();
    res.json(post);
});

//  Delete Post
router.delete('/:id', authMiddleware, async (req, res) => {
    const post = await Post.findById(req.params.id);
    if (post.user.toString() !== req.user.id) {
        return res.status(403).json({ message: "Not authorized" });
    }
    await post.deleteOne();
    res.json({ message: "Post deleted" });
});

module.exports = router;

const Post = require('../models/Post');

exports.createPost = async (req, res) => {
    try {
        const { title, content, tags, status } = req.body;
        const newPost = new Post({ user: req.user.id, title, content, tags, status });
        await newPost.save();
        res.status(201).json(newPost);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getUserPosts = async (req, res) => {
    const posts = await Post.find({ user: req.user.id });
    res.json(posts);
};

exports.updatePost = async (req, res) => {
    const post = await Post.findById(req.params.id);
    if (post.user.toString() !== req.user.id) return res.status(401).json({ message: 'Unauthorized' });

    Object.assign(post, req.body);
    await post.save();
    res.json(post);
};

exports.deletePost = async (req, res) => {
    const post = await Post.findById(req.params.id);
    if (post.user.toString() !== req.user.id) return res.status(401).json({ message: 'Unauthorized' });

    await post.deleteOne();
    res.json({ message: 'Post deleted' });
};

const express = require('express');
const authMiddleware = require("../middleware/authMiddleware")
const BlogModal = require('../modal/BlogModal');
const { default: mongoose } = require('mongoose');
const router = express.Router();


// api for show like dislike details for public user

// create-post

router.post('/create-post', authMiddleware, async (req, res) => {
    try {
        const userData = req.user;
        const { title, content } = req.body;

        if (!title || title.length < 5) {
            return res.status(400).json({ error: 'Title is required and must be at least 5 characters long' });
        }
        if (!content || content.length < 10) {
            return res.status(400).json({ error: 'Content is required and must be at least 10 characters long' });
        }

        const newBlog = new BlogModal({
            title,
            content,
            author: userData.id
        })
        const saveBlog = await newBlog.save()
        return res.status(201).json({ message: "Data saved", data: saveBlog })

    } catch (error) {

    }
})



//Update post
router.put('/update-post/:id', authMiddleware, async (req, res) => {
    try {
        const userData = req.user;
        const { id } = req.params;
        const { title, content } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).json({ message: 'Invalid Blog Id' });

        if (!title || title.length < 5) {
            return res.status(400).json({ error: 'Title is required and must be at least 5 characters long' });
        }
        if (!content || content.length < 10) {
            return res.status(400).json({ error: 'Content is required and must be at least 10 characters long' });
        }

        const blog = await BlogModal.findOne({ _id: id, author: userData.id });
        if (!blog) {
            return res.status(404).json({ message: 'Blog post not found or you do not have permission to update this post' });
        }

        blog.title = title;
        blog.content = content;
        // blog.updatedAt = new Date();

        const updateBlog = await blog.save();

        return res.status(200).json({ message: "Blog update successfully", data: updateBlog })

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'An error occurred while updating the blog post' });
    }
})


router.post('/my-posts', authMiddleware, async (req, res) => {
    try {
        const userData = req.user;
        const blogs = await BlogModal.find({ author: userData.id })
        if (blogs.length == 0) return res.status(404).json({ message: 'No blogs found for this user' });
        return res.status(200).json(blogs);

    } catch (error) {

    }
})

router.get('/delete-post/:id', authMiddleware, async (req, res) => {
    try {
        const userData = req.user;
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).json({ message: 'Invalid Blog Id' });

        const blog = await BlogModal.findOne({ _id: id, author: userData.id })

        if (!blog) {
            return res.status(404).json({ message: 'Blog post not found!' });
        }

        await BlogModal.findByIdAndDelete(id)

        return res.status(200).json({ message: 'Blog post deleted successfully' });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'An error occurred while deleting the blog post' });

    }
})


//this if for public
router.get('/blogs', async (req, res) => {
    try {
        // const blogs = await BlogModal.find();
        const blogs = await BlogModal.find().populate('author', 'name'); // Populate the 'author' field with 'name'
        if (blogs.length == 0) return res.status(404).json({ message: 'No blogs found' });
        return res.status(200).json(blogs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

router.get('/blogs/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const blog = await BlogModal.findById(id).populate('author', 'name');;
        if (!blog) return res.status(404).json({ message: 'Blog post not found' });
        return res.status(200).json(blog);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})



module.exports = router
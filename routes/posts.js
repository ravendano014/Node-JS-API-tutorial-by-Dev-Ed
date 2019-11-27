const router = require("express").Router()
const verifyToken = require('./verifyToken')
const Post = require('../model/Post')
const Joi = require("@hapi/joi")

// GET List of posts
router.get('/', verifyToken, async (request, response) => {
    try {
        const posts = await Post.find().limit(10)

        response.json(posts)
    } catch (error) {
        response.status(400).json(error)
    }
})

// GET Specific post by id
router.get('/:postId', verifyToken, async (request, response) => {
    try {
        const post = await Post.findById(request.params.postId)

        response.json(post)
    } catch (error) {
        response.status(400).json(error)
    }
})

const postSchema = Joi.object({
    title: Joi.string().min(6).required(),
    text: Joi.string()
})

// PATCH A post by id
router.patch('/:postId', verifyToken, async (request, response) => {
    // Validate with Joi
    const { error } = postSchema.validate(request.body)
    if (error) {
        return response.status(400).json(error)
    }

    try {
        const post = await Post.updateOne(
            {
                _id: request.params.postId
            },
            {
                $set: { title: request.body.title },
                $set: { text: request.body.text }
            }
        )

        response.json(post)
    } catch (error) {
        response.status(400).json(error)
    }
})

router.post('/create', verifyToken, async (request, response) => {
    // Validate with Joi
    const { error } = postSchema.validate(request.body)
    if (error) {
        return response.status(400).json(error)
    }

    // Get new post data
    const post = new Post({
        title: request.body.title,
        text: request.body.text
    })

    // Send to Mongo and report any errors.
    try {
        const savedPost = await post.save()

        response.json({ created: savedPost })
    } catch (error) {
        response.status(400).json(error)
    }
})

// DELETE Specific post by id
router.delete('/:postId', verifyToken, async (request, response) => {
    try {
        const removed = await Post.remove({ _id: request.params.postId })

        response.json(removed)
    } catch (error) {
        response.status(400).json(error)
    }
})

module.exports = router
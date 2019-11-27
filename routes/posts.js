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
        response.status(400).send(error)
    }
})

// GET Specific post by id
router.get('/:postId', verifyToken, async (request, response) => {
    try {
        const post = await Post.findById(request.params.postId)

        response.json(post)
    } catch (error) {
        response.status(400).send(error)
    }
})

// PATCH A post
router.patch('/:postId', verifyToken, async (request, response) => {
    // TODO Joi validation

    try {
        const post = await Post.updateOne(
            {
                _id: request.params.postId
            },
            {
                $set: {title: request.body.title},
                $set: {text: request.body.text}
            }
        )

        response.json(post)
    } catch (error) {
        response.status(400).send(error)
    }
})

// DELETE Specific post by id
router.delete('/:postId', verifyToken, async (request, response) => {
    try {
        const removed = await Post.remove({ _id: request.params.postId })

        response.json(removed)
    } catch (error) {
        response.status(400).send(error)
    }
})

const postSchema = Joi.object({
    title: Joi.string().min(6).required(),
    text: Joi.string()
})

router.post('/create', verifyToken, async (request, response) => {
    // Validate with Joi
    const { error } = postSchema.validate(request.body)
    if (error) {
        return response.status(400).send(error.details[0].message)
    }

    // Get new post data
    const post = new Post({
        title: request.body.title,
        text: request.body.text
    })

    // Send to Mongo and report any errors.
    try {
        const savedPost = await post.save()

        response.send({ created: savedPost })
    } catch (error) {
        response.status(400).send(error)
    }
})

router.get('/whoami', verifyToken, (request, response) => {
    response.send(request.user)
})

router.get('/whoami-detailed', verifyToken, (request, response) => {
    const query = { username: request.user.username }

    /* Notice: according to the Mongoose docs, you cannot get a document from a Query. You must use a callback. */
    // Another notice: it's probably better to store the _id in the JWT, since it's easier to query w. Mongoose.
    User.findOne(query, (error, object) => {
        response.send(object)
    })

    /* Security reminder: don't send back password salts, like above. */
})

module.exports = router
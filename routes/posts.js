const router = require("express").Router()
const verifyToken = require('./verifyToken')
const User = require('../model/User')

router.get('/', verifyToken, (request, response) => {
    response.json({
        posts: {
            title: "My first post",
            description: "Random locked data"
        }
    })
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
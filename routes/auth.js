const router = require("express").Router()
const User = require("../model/User")
const Joi = require('@hapi/joi')
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

// Keep this updated with the model.
const registerSchema = Joi.object({
    username: Joi.string()
        .min(6)
        .required(),
    email: Joi.string()
        .min(6)
        .required()
        .email(),
    password: Joi.string()
        .min(6)
        .required()
})

router.post('/register', async (request, response) => {
    // Validate with Joi
    const { error } = registerSchema.validate(request.body)
    if (error) {
        return response.status(400).send(error.details[0].message)
    }

    // Salt and hash
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(request.body.password, salt)

    // Get user data
    const user = new User({
        username: request.body.username,
        email: request.body.email,
        password: hashedPassword
    })

    // Send to Mongo and report any errors.
    try {
        const savedUser = await user.save()

        // Sending the salt is dangerous. Don't send the entire object.

        response.send({ username: savedUser.username })
    } catch (error) {
        response.status(400).send(error)
    }
})

// Not much point of this?
const loginSchema = Joi.object({
    username: Joi.string()
        .min(6)
        .required(),
    password: Joi.string()
        .min(6)
        .required()
})

router.post('/login', async (request, response) => {
    const { error } = loginSchema.validate(request.body)
    if (error) {
        return response.status(400).send(error.details[0].message)
    }

    // Checking if the username exists
    const user = await User.findOne({ username: request.body.username })
    if (!user) {
        return response.status(400).send("Wrong username or password.")
    }

    // Check for matching passwords
    const correctPassword = await bcrypt.compare(request.body.password, user.password)
    if (!correctPassword) {
        return response.status(400).send("Wrong username or password.")
    }

    // OK login. Note that Dev Ed passes the user ID. 
    const token = jwt.sign(
        { username: user.username },
        process.env.TOKEN_SECRET
    )

    /* The point of JWTs is that they're unique to the properties in the object (: */
    /* Send a header with auth-token for authentication */

    response.header('auth-token', token).send(token)
})

module.exports = router
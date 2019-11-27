const router = require("express").Router()
const User = require("../model/User")
const Joi = require('@hapi/joi')
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

// Keep this updated with the model/form
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
        return response.status(400).json(error)
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

        // Security warning: don't send the entire object as it contains the salt and could be cracked.
        response.json({ username: savedUser.username })
    } catch (error) {
        response.status(400).json(error)
    }
})

router.post('/login', async (request, response) => {
    // Checking if the username exists
    const user = await User.findOne({ username: request.body.username })
    if (!user) {
        // Security warning: Don't tell the client what specifically was wrong.
        return response.status(400).json({message: "Wrong username or password."})
    }

    // Check for matching passwords
    const correctPassword = await bcrypt.compare(request.body.password, user.password)
    if (!correctPassword) {
        return response.status(400).json({message: "Wrong username or password."})
    }

    // OK login. Note that Dev Ed passes the user ID. 
    const token = jwt.sign(
        { username: user.username },
        process.env.TOKEN_SECRET
    )

    /* The point of JWTs is that they're unique to the properties in the object (: */
    /* Send a header with auth-token for authentication */

    response.header('auth-token', token).json({"auth-token": token})
})

module.exports = router
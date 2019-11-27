const jwt = require("jsonwebtoken")

module.exports = function(request, response, next) {
    const token = request.header("auth-token")
    if (!token) {
        return response.status(401).json({message: "Access Denied"})
    }

    try {
        const verified = jwt.verify(token, process.env.TOKEN_SECRET)
        request.user = verified // The username, remember?
        next() // Go to next middleware
    } catch (err) {
        response.status(400).json({message: "Access Denied"})
    }
}
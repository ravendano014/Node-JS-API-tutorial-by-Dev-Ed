const express = require("express")
const mongoose = require("mongoose")
const dotenv = require("dotenv")
const postRoute = require("./routes/posts")

const app = express()
dotenv.config()

// Connect to db
mongoose.connect(
    process.env.DB_CONNECT,
    { useNewUrlParser: true, useUnifiedTopology: true },
    () => {
        console.log("DB up and running!")
    })

// Middleware
app.use(express.json())

// Routes
const authRoute = require("./routes/auth")

// Route middlewares
app.use('/api/user', authRoute)
app.use('/api/posts', postRoute)

app.listen(8000, () => console.log('Server up and running!'))
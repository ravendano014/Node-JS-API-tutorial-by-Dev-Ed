const express = require("express")
const mongoose = require("mongoose")
const dotenv = require("dotenv")
const cors = require("cors")

const app = express()
dotenv.config()

// Connect to db
mongoose.set('useCreateIndex', true)
mongoose.connect(process.env.DB_CONNECT, { useNewUrlParser: true, useUnifiedTopology: true })

// Middleware
app.use(express.json())
app.use(cors())

// Routes
const authRoute = require("./routes/auth")
const postRoute = require("./routes/posts")

// Route middlewares
app.use('/api/user', authRoute)
app.use('/api/posts', postRoute)

app.listen(8000)
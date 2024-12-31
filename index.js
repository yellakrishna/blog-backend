const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")
require("dotenv").config();
const userRoute = require("./routes/userRoutes")
const cookieParser = require('cookie-parser')


const port = process.env.PORT
const app = express();
app.use(express.json())

app.use(cookieParser())

app.use(cors({
    origin:true,
    credentials:true
}))

const blogRoute = require('./routes/blogRoutes')
app.use('/user', userRoute)
app.use('/blog',blogRoute)

mongoose.connect(process.env.MONGO_URL)
.then(()=>console.log("DB is connected"))
.catch((err)=>console.log("DB is error",err))


app.listen(port,()=>{
    console.log(`server is running...port`)
})
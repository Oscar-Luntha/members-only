require("dotenv").config();
const express = require("express")
const path = require("node:path")
const indexRouter = require("./routes/indexRouter")
const pool = require("./db/pool")
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require('passport-local').Strategy;
const authRouter = require("./routes/authRouter")

const app = express()

app.set("views", path.join(__dirname, "views"))
app.set("view engine", "ejs")

app.use(session({ 
  secret: process.env.SESSION_SECRET, 
  resave: false, 
  saveUninitialized: false 
}));

app.use(express.urlencoded({extended: true}))
app.use("/", indexRouter)
app.use("/auth", authRouter)
const PORT = process.env.PORT;
app.listen(PORT, (error)=> {
    if(error){
        throw error;
    }
    console.log("app listening on port 3000")
})
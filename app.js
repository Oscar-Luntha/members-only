require("dotenv").config();
const express = require("express")
const app = express()
const path = require("node:path")
const indexRouter = require("./routes/indexRouter")

app.set("views", path.join(__dirname, "views"))
app.set("view engine", "ejs")
app.use(express.urlencoded({extended: true}))
app.use("/", indexRouter)
const PORT = process.env.PORT;
app.listen(PORT, (error)=> {
    if(error){
        throw error;
    }
    console.log("app listening on port 3000")
})
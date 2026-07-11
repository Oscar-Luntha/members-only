require("dotenv").config()
const {Pool} = require("pg")

module.exports = new Pool({
    host : process.env.host,
    user : process.env.user,
    database : process.env.database,
    password : process.env.password,
    port : process.env.port,
})
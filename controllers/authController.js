const pool = require("../db/pool")

function sign_upGet(req, res){
    res.render("sign-up")
}

async function sign_upPost(req, res, next){
    try {
        await pool.query("INSERT INTO users (firstname, lastname, username, password) VALUES ($1, $2, $3, $4)", [req.body.firstname, req.body.lastname, req.body.username, req.body.password])
    }catch(err){
        return next(err)
    }
}

function sign_inGet(req, res){
    res.render("sign-in")
}
module.exports = {
    sign_upGet,
    sign_inGet
}
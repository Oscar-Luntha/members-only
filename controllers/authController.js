const pool = require("../db/pool")
const { body, validationResult, matchedData } = require("express-validator");
const bcrypt = require("bcryptjs");

const validateSignUp = [
    body("firstname")
        .trim()
        .notEmpty().withMessage("First name is required.")
        .isAlpha().withMessage("First name must only contain letters."),
    
    body("lastname")
        .trim()
        .notEmpty().withMessage("Last name is required.")
        .isAlpha().withMessage("Last name must only contain letters."),
    
    body("username")
        .trim()
        .notEmpty().withMessage("Username is required.")
        .isAlphanumeric().withMessage("Username must only contain letters and numbers.")
        .isLength({ min: 3 }).withMessage("Username must be at least 3 characters long.")
        .custom(async (value) => {
            // Check if username already exists in the database
            const { rows } = await pool.query("SELECT * FROM users WHERE username = $1", [value]);
            if (rows.length > 0) {
                throw new Error("Username is already in use.");
            }
            return true;
        }),
    
    body("password")
        .notEmpty().withMessage("Password is required.")
        .isLength({ min: 6 }).withMessage("Password must be at least 6 characters long."),
    
    body("confirmpassword")
        .notEmpty().withMessage("Please confirm your password.")
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error("Passwords do not match.");
            }
            return true;
        })
];

function sign_upGet(req, res){
    res.render("sign-up")
}

async function sign_upPost(req, res, next){
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).render("sign-up", {
            errors: errors.array(),
            prevData : req.body
        })
    }
    try {
        await pool.query("INSERT INTO users (first_name, last_name, username, password) VALUES ($1, $2, $3, $4)", [req.body.firstname, req.body.lastname, req.body.username, req.body.password])
        res.redirect("/")
    
    }catch(err){
        return next(err)
    }
}

function sign_inGet(req, res){
    res.render("sign-in")
}
module.exports = {
    sign_upGet,
    sign_inGet,
    sign_upPost,
    validateSignUp
}
const {Router} =  require("express")
const authRouter = Router()
const authController = require("../controllers/authController")
const passport = require("passport")

authRouter.post("/sign-in", passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/",
    failureMessage: true, // This puts the error message into req.session.messages
  })
)
authRouter.get("/sign-up", authController.sign_upGet)
authRouter.get("/sign-in", authController.sign_inGet)
authRouter.post("/sign-up", authController.validateSignUp ,authController.sign_upPost)
module.exports = authRouter
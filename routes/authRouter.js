const {Router} =  require("express")
const authRouter = Router()
const authController = require("../controllers/authController")

authRouter.get("/sign-up", authController.sign_upGet)
authRouter.get("/sign-in", authController.sign_inGet)

module.exports = authRouter
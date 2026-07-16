const { Router } = require("express");
const clubhouseRouter = Router();
const clubhouseController = require("../controllers/clubhouseController");
const { isAuth } = require("../middleware/authMiddleware");

clubhouseRouter.get("/create", isAuth, clubhouseController.createClubhouseGet);
clubhouseRouter.post("/create", isAuth, clubhouseController.validateClubhouse, clubhouseController.createClubhousePost);

// New Routes
clubhouseRouter.get("/explore", isAuth, clubhouseController.exploreClubhousesGet);
clubhouseRouter.post("/join", isAuth, clubhouseController.joinClubhousePost);

module.exports = clubhouseRouter;
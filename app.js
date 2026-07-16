require("dotenv").config();
const express = require("express");
const path = require("node:path");
const indexRouter = require("./routes/indexRouter");
const pool = require("./db/pool");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require("bcryptjs");
const authRouter = require("./routes/authRouter");
const dashboardRouter = require("./routes/dashboardRouter");
const clubhouseRouter = require("./routes/clubhouseRouter"); 


const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// loading URL parser
app.use(express.urlencoded({ extended: true }));

// Session Middleware
app.use(session({ 
  secret: process.env.SESSION_SECRET, 
  resave: false, 
  saveUninitialized: false 
}));

// Initialize Passport and its Sessions
app.use(passport.initialize());
app.use(passport.session());

// Pass the authenticated user to EJS templates automatically
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const { rows } = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
      const user = rows[0];

      if (!user) {
        return done(null, false, { message: "Incorrect username" });
      }

      // Match using bcrypt.compare
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return done(null, false, { message: "Incorrect password" });
      }

      return done(null, user);
    } catch(err) {
      return done(err);
    }
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    const user = rows[0];
    done(null, user); // attaches user details to req.user
  } catch(err) {
    done(err);
  }
});

// Routes
app.use("/", indexRouter);
app.use("/auth", authRouter);
app.use("/dashboard", dashboardRouter); // Register dashboard route
app.use("/clubhouses", clubhouseRouter)
const PORT = process.env.PORT || 3000;
app.listen(PORT, (error) => {
    if(error){
        throw error;
    }
    console.log(`app listening on port ${PORT}`);
});
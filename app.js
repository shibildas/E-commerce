if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();}
const express = require("express");
const session = require("express-session");
const logger = require("morgan");
require("./config/dbConfig");
const MongoStore = require("connect-mongo")(session);
const mongoDbConnection = require("./config/dbConfig");
const passport = require("passport");
require("./config/authStrategies/localStrategy");
const expressLayouts = require("express-ejs-layouts");
const cookieParser = require("cookie-parser");
const indexRouter = require("./routes/index");
const adminRouter = require("./routes/admin");
const apphelper = require("./app/controllers/apphelper");
const app = express();

//clear Local cache
app.use(apphelper.clearCache);
//View Engines
app.set("view engine", "ejs");
app.set("views", __dirname + "/app/views");
app.set("layout", "layouts/layout");

//Middlewares

app.use(expressLayouts);
app.use(cookieParser(process.env.SECRET));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
    store: new MongoStore({ mongooseConnection: mongoDbConnection }),
  })//store session in DB
);
app.use(passport.initialize());//initialize passport
app.use(passport.session());
app.use(apphelper.userInViews);//to make user available for the views

app.locals.message = {}; // Used in displaying alert
app.locals.formData = {}; // For prefilling data on form validation
app.locals.errors = {}; // Form validation errors

app.use(express.static("public"));
app.use(logger("dev"));

// app.locals.title = 'Dr.Tyre'

// app.set('trust proxy', 1) // trust first proxy
//Routes

app.use("/", indexRouter);
app.use("/admin", adminRouter);

//404 handler

app.use(apphelper.errorhandler);

//500 handler
app.use(apphelper.devErrorHandler);

//Listening to server
let PORT = process.env.PORT;
app.listen(PORT, () =>
  console.log(`Server is Listening on http://localhost:${PORT}`)
);

module.exports = app

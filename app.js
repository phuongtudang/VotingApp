var express = require("express");
var app = express();
var mongoose = require("mongoose");
var methodOverride = require("method-override");
var bodyParser = require('body-parser'); 
var passport    = require("passport");
var LocalStrategy = require("passport-local");
var flash       = require("connect-flash");
var includes = require('array-includes');
var User        = require("./models/user");
var Survey  = require("./models/survey");
var Chart = require('chart.js');

//requiring routes
var indexRoutes      = require("./routes/index")

mongoose.connect("mongodb://localhost/votingapp1", function (err, db) {
    if (err) {
        console.log("Unable to connect to server", err);
    } else {
        console.log("Connected to server");
    }
});

app.set("view engine", "ejs");

app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json()); // to support JSON bodies
app.use(bodyParser.urlencoded({ extended: true })); // to support URL-encoded bodies

// PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "Phuong is cool",
    resave: false,
    saveUninitialized: false
}));
app.use(methodOverride("_method"));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use(function(req, res, next){
  res.locals.currentUser = req.user;
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});

app.use("/", indexRoutes);



app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Server is runnning!!");
})
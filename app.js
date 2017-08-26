var express = require("express");
var app = express();
var mongoose = require("mongoose");
var methodOverride = require("method-override");
var bodyParser = require('body-parser'); 
var passport    = require("passport");
var LocalStrategy = require("passport-local");
var flash       = require("connect-flash");
var includes = require('array-includes');
var TwitterStrategy = require('passport-twitter').Strategy;
var User        = require("./models/user");
var Survey  = require("./models/survey");
var Chart = require('chart.js');
var TWITTER_CONSUMER_KEY = "KXrmSSwSaZcpwmK2HI8SRgxay"
var TWITTER_CONSUMER_SECRET = "2D9jD0jtPDhwIvc4Jt6qVdtqX0ZhrNffjazj5xrzemoCyASUtu";

//requiring routes
var indexRoutes      = require("./routes/index")

// var url = "mongodb://localhost/votingapp1"
mongoose.connect("mongodb://phuong:phuong@ds159953.mlab.com:59953/votingapp", function (err, db) {
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

passport.use(new TwitterStrategy({
    consumerKey: TWITTER_CONSUMER_KEY,
    consumerSecret: TWITTER_CONSUMER_SECRET,
    callbackURL: "https://pongvoting.herokuapp.com/auth/twitter/callback"
    },
    function(token, tokenSecret, profile, done) {
        User.findOne({'twitter.id': profile.id }, function (err, user) {
            console.log(profile.id)
            if(err){
                return done(err);
            }
            if(user){
                done(null, user);
            } else{
                var user = new User();
                user.twitter.id = profile.id;
                user.username = profile.displayName;
                user.save(function(err){
                    if(err){
                        throw err;
                    } else{
                        done(null, user);
                    }
                })
            }
        });
    }
));


app.use(function(req, res, next){
  res.locals.currentUser = req.user;
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});

app.use("/", indexRoutes);


app.get('/auth/twitter',
  passport.authenticate('twitter'),
  function(req, res){
    // The request will be redirected to Twitter for authentication, so this
    // function will not be called.
  });

app.get('/auth/twitter/callback',
        passport.authenticate('twitter', {
            successRedirect : '/',
            failureRedirect : '/login'
        })
);


app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Server is runnning!!");
})
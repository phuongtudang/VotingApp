var express = require("express");
var router = express.Router();
var methodOverride = require("method-override");
var bodyParser = require('body-parser'); 
var passport = require("passport");
var User = require("../models/user");
var Survey = require('../models/survey');
var includes = require('array-includes');

function isLoggedIn (req, res, next) {
		if (req.isAuthenticated()) {
			return next();
		} else {
			res.redirect('/login');
		}
	}

router.get('/', function(req,res){
    Survey.find({}, function(err, allSurveys){
       if(err){
            console.log(err);
       } else {
            //console.log(allSurveys)
            res.render("index",{surveys:allSurveys});
       }
    });
});
	
// show register form
router.get('/register', function(req, res){
    res.render('register');
});

//handle sign up logic
router.post("/register", function(req, res){
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err);
            req.flash("error", err.message);
            return res.render("register", {"error": err.message});
        } else {
            passport.authenticate("local")(req, res, function(){
                res.redirect("/"); 
            });
        }
    });
});

// show login form
router.get("/login", function(req, res){
   res.render("login"); 
});

// handling login logic
router.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/",
        failureRedirect: "/login"
    }), function(req, res){
});

// log out logic route
router.get("/logout", function(req, res){
    req.logout();
    req.flash("success", "Logged you out!")
    res.redirect("/");
});

// new poll route
router.get('/new', isLoggedIn, function(req, res) {
    res.render('new')
});

router.post("/", isLoggedIn, function(req, res){
    var survey = new Survey();
    survey.question = req.body.question;
    var optionArr = []; 
    req.body.options.forEach(function(option){
        optionArr.push({
            text: option,
            votes: 0
        });
    });
    survey.options = optionArr;
    survey.author.id = req.user._id;
    survey.author.username = req.user.username;
    survey.save(function(err, post) {
        if (err){
            console.log(err)
        } else{
            req.flash("success", "Your survey added!")
            res.redirect('/');
        }
    });
});

// MY POLL ROUTE
router.get('/surveys', isLoggedIn, function(req, res) {
    Survey.find({"author.username": req.user.username}, function(err, surveys){
        if(err){
            console.log(err)
        } else{
            res.render('mysurveys', {surveys: surveys})
        }
    })
});
     
// show poll route
router.get('/:id', function(req, res){
    Survey.findById(req.params.id, function(err, foundSurvey){
        if(err){
            console.log(err);
            res.redirect('/')
        } else {
            res.render("answer", {survey: foundSurvey});
        }
    });
});

// post vote to poll router
function checkIP (req, res, next){
    Survey.findById(req.params.id, function(err, foundSurvey){
        if(err){
            console.log(err);
            res.redirect("/");
        } else{
            console.log(foundSurvey.voterIP);
            var arr = foundSurvey.voterIP;
            if(!includes(arr, req.headers["x-forwarded-for"])){
                console.log("good to go");
                return next();
            } else{
                console.log("IP found. Cant vote again!");
                req.flash("error", "You only can vote once!");
                res.redirect("back");
            }
        }    
    });    
}
    
router.put('/:id', checkIP, function(req, res){
    var IP = req.headers["x-forwarded-for"];
    var find = {"_id":req.params.id,"options.text":req.body.option};		
	var update = {$push:{"voterIP":req.headers["x-forwarded-for"]},$inc:{"options.$.votes":1}};
    Survey.findOneAndUpdate(find, update, function(err, updatedVote){
        if(err){
            console.log(err);
            res.redirect('/')
        } else {
            res.redirect("/" + req.params.id)
        }
    });
})
    
// DESTROY POLL ROUTE
router.delete('/:id', function(req, res){
    Survey.findByIdAndRemove(req.params.id, function(err){
        if(err){
            console.log(err);
            res.redirect('/')
        } else{
            req.flash("success", "Your survey deleted!");
            res.redirect('/')
        }
    });
});

module.exports = router;
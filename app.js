const express = require("express");
const app = express();
const mongoose = require("mongoose"),
passport = require("passport"),
localStrategy = require("passport-local"),
bodyParser = require("body-parser"),
flash = require("connect-flash"),
User = require("./models/user");
const Request = require("./models/request");
const dotenv = require("dotenv");

dotenv.config();

const url = "mongodb://localhost:27017/use_case_4";

mongoose
  .connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(() => {
    console.log("connected to local DB");
  })
  .catch(err => {
    console.log("ERROR: " + err.message);
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(__dirname + "/public"));
app.use(flash());
app.set("view engine", "ejs");

app.use(
    require("express-session")({
      name: "user-cookie",
      secret: "secret sentence for authentication",
      resave: false,
      saveUninitialized: false
    })
);
  
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error")[0];
    res.locals.success = req.flash("success")[0];
    next();
});

app.get("/", (req, res)=>{
    res.render("index");
});

app.post("/reguser", async (req, res)=>{
    try {
        if (req.body.password.trim().length <= 7) {
            req.flash("error", "Password Should be 8 Characters long");
            return res.redirect("/");
        }

        if (req.body.password!==req.body.cnfrmpswd) {
            req.flash("error", "Passwords do not match. Try again.");
            return res.redirect("/");
        }
        User.findOne({username: req.body.username}, async (err, result)=>{
            if (err) {
                req.flash("error", err.message);
                return res.redirect("/");
            } else if (result) {
                // console.log(result);
                req.flash("error", "username exists. try another one");
                return res.redirect("/");
            } else {
                let newUser = new User({
                    username: req.body.username,
                    age: req.body.age,
                    gender: req.body.gender,
                    mobile: req.body.mobile,
                    address: req.body.address
                });
    
                let user1 = await User.register(newUser, req.body.password);
                res.redirect("/login");
            }
        });
    } catch(err) {
        req.flash("error", err.message);
        return res.redirect("/");
    }
});

app.get("/login", (req, res)=>{
    res.render("login");
});

app.post("/login", passport.authenticate("local", {
        failureFlash: true,
        failureRedirect: "back"
    }),
    function(req, res) {
        req.flash("success", "Welcome " + req.user.username + "!!");
        res.redirect("/dashboard");
});

isLoggedIn =  function(req, res, next){
    if (req.isAuthenticated()){
        return next();
    }
    req.flash("error", "You need to be logged in to do that");
    res.redirect("/");
}

app.get("/dashboard", isLoggedIn, (req, res)=>{
    let states = ["Uttar Pradesh", "Madhya Pradesh", "TamilNadu", "Kerala", "Maharashtra",
    "Rajasthan"];
    res.render("applicant/index", {states});
});

app.post("/request", isLoggedIn, async (req, res)=>{
    try {
        let request = await Request.create(req.body.newReq);
        req.flash("success", "request created");
        res.redirect("/dashboard");
    } catch(err) {
        req.flash("error", err.message);
        res.redirect("/dashboard");
    }
});

app.listen(process.env.PORT || 3000, process.env.IP, () => {
    console.log("YelpCamp Server has started at port 3000");
});
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const _ = require("lodash");
const mongoose = require("mongoose");

const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(express.static('public'));

mongoose.connect("mongodb://localhost:27017/userDB");
const welcome = "Welcome to Movie Timez. Select your favourite movie and enjoy watching!";

const userSchema = new mongoose.Schema ({
    name: String,
    mobilenum: Number,
    email: String,
    password: String
});

const User = mongoose.model("User", userSchema);

app.get("/", function(req, res){
    res.render("home", {lines: welcome,
    });
  });

app.get('/signin',function(req,res){
    res.render('signin');
});

app.get('/register',function(req,res){
    res.render('register');
});

app.post("/register", function(req, res){
    const newUser = new User({
        name: req.body.name,
        mobile: req.body.mobilenum,
        email: req.body.email,
        password: req.body.password

    });
    newUser.save(function(err){
        if(err){
            console.log(err);
        } else {
            res.redirect('/');
        }
    });
});



app.listen(process.env.PORT || 3000, function(){
    console.log('Server has started and running at port 3000');
});

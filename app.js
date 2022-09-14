const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const _ = require("lodash");
const mongoose = require("mongoose");
var fs = require('fs');
var path = require('path');
require('dotenv/config');
const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(express.static('public'));

mongoose.connect("mongodb://localhost:27017/userDB");
const welcome = "Welcome to Movie Timez. Select your favourite movie and enjoy watching!";

// image schema starts here
// ref to image adding code https://www.geeksforgeeks.org/upload-and-retrieve-image-on-mongodb-using-mongoose/ 

app.use(bodyParser.json());
var multer = require('multer');
  
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now())
    }
});
  
var upload = multer({ storage: storage });
var imgModel = require('./model');
// image schema ends here

const userSchema = new mongoose.Schema ({
    name: String,
    mobilenum: Number,
    email: String,
    password: String
});

const User = mongoose.model("User", userSchema);

app.get("/", function(req, res){
    res.render("home", {lines: welcome,});
  });

app.get('/signin',function(req,res){
    res.render('signin');
});

app.get('/register',function(req,res){
    res.render('register');
});

app.get('/imagesPage', function(req, res){
    imgModel.find({}, (err, items) => {
        if (err) {
            console.log(err);
            res.status(500).send('An error occurred', err);
        }
        else {
            res.render('imagesPage', { items: items });
        }
    });
});
app.post('/imagesPage', upload.single('image'), function(req, res, next){
    var obj = {
        name: req.body.name,
        desc: req.body.desc,
        img: {
            data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
            contentType: 'image/png'
        }
    }
    imgModel.create(obj, (err, item) => {
        if (err) {
            console.log(err);
        }
        else {
            // item.save();
            res.redirect('/imagesPage');
        }
    });
});

app.post("/signin", function(req, res){
    const emailadd = req.body.email;
    const password = req.body.password;
    User.findOne({email: emailadd}, function(err, foundUser){
            if(err){
                console.log(err);
            }else{
                if(foundUser){
                    if(foundUser.password==password){
                        res.redirect("/");
                    }
                }
            }
        });
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

const alert = require('alert');
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const _ = require("lodash");
const mongoose = require("mongoose");
const passport = require("passport");
// const LocalStrategy = require("passport-local");
// const passportLocalMongoose = require("passport-local-mongoose");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
var fs = require('fs');
var path = require('path');
require('dotenv/config');
const app = express();
const http = require('http');
const Razorpay = require('razorpay');
const formidable = require('formidable');
const session = require('express-session');
app.use(session({
    resave: false,
    saveUninitialized: true,
    secret: 'SECRET' 
  }));
// Authentication started here
const { auth, requiresAuth } = require('express-openid-connect');
const config = {
    authRequired: false,
    auth0Logout: true,
    secret: process.env.SECRET,
    baseURL: process.env.BASE_URL,
    clientID: process.env.CLIENT_ID,
    issuerBaseURL: process.env.ISSUER_BASE_URL
  };
app.use(auth(config));

// Authentication stopped here


// modified code starts here

var logger = require('morgan');
var cookieParser = require('cookie-parser');
var routes = require('./routes/index');
var users = require('./routes/users');
app.use(cookieParser());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use('/', routes);
app.use('/users', users);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.static(path.join(__dirname, 'public')));
var router = express.Router();

/* GET home page. */
router.get('/seat', function(req, res, next) {
  res.render('seat', { title: 'Express' });
});
router.get('/seat', function(req, res, next) {
    res.send('respond with a resource');
});
module.exports = router;

// modified code stoped here

var userProfile;

app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(express.static('public'));



// mongoose.connect("mongodb://mongo:27017/movieDB");
const welcome = "Welcome to Movie Timez. Select your favourite movie and enjoy watching!";


// comment it down if you are using local database
mongoose.connect("mongodb+srv://"+process.env.MONGODB_USR+":"+process.env.MONGODB_PWD+"@cluster0.4aydr2o.mongodb.net/movieDB");

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
const { response } = require('express');
// image schema ends here

const userSchema = new mongoose.Schema ({
    name: String,
    mobilenum: Number,
    email: String,
    password: String
});

const User = mongoose.model("User", userSchema);

app.get("/", function(req, res){
    imgModel.find({}, (err, items) => {
        if (err) {
            console.log(err);
            res.status(500).send('An error occurred', err);
        }
        else {
            res.render('home', { items: items, lines: welcome,});
        }
    });
  });

app.get('/signin',function(req,res){
    res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out');
});

app.get('/profile', requiresAuth(), (req, res) => {
    res.send(JSON.stringify(req.oidc.user , null, 2));
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
        price: req.body.price,
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
            res.redirect('/');
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
                        res.redirect("/createOrder");
                    }
                }
                else{
                    alert('Invalid user');
                    res.redirect('/signin');
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
            res.redirect('/signin');
        }
    });
});

const postSchema = {
    email: String,
    title: String,
    content: String
};
const Post = mongoose.model("Post", postSchema);

app.get("/reviews", function(req, res){
    res.render("reviews");
  });

  app.get("/feedback", function(req, res){
    Post.find({}, function(err, posts){
        res.render("feedback",{posts: posts});
    });
  });
  
  app.post("/reviews", function(req, res){
    const post = new Post({
      email: req.body.postEmail,  
      title: req.body.postTitle,
      content: req.body.postBody
    });
  
    post.save(function(err){
        if (!err){
            res.redirect("/feedback");
        }
    });
  });
  
  app.get("/posts/:postId", function(req, res){

    const requestedTitleId = req.params.postId;

    Post.findOne({_id: requestedTitleId}, function(err, post){
        res.render("post", {
                      email:post.email,  
                      title:post.title,
                      content:post.content
    });
});
});

// Razorpay Integration statrs here
  const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });


const orderSchema = new mongoose.Schema({
    orderid: String,
});

const Orderid = mongoose.model("Order", orderSchema);

app.post('/createOrder', (req, res)=>{
	const {amount,currency,receipt, notes} = req.body;	
	razorpayInstance.orders.create({amount, currency, receipt, notes},
		(err, order)=>{
         const newOrder = new Orderid({
            orderid: order.id
         });
         newOrder.save();
		if(!err){
			// res.json(order.orderid);
            Orderid.find({}, function(err, result){
            res.render('payment',{ordid:result, amount:amount});
            });
        }
		else
			res.send(err);
		}
	)
});



app.get('/createOrder/:movie_name', (req, res)=>{
    req_title= req.params.movie_name;
    imgModel.find({name:req_title}, (err, items) => {
        if (err) {
            console.log(err);
            res.status(500).send('An error occurred', err);
        }
        else {
            res.render('createOrder', { items: items });
        }
    });
});

app.post("/api/payment/verify",(req,res)=>{

    let body=req.body.response.razorpay_order_id + "|" + req.body.response.razorpay_payment_id;
   
     var crypto = require("crypto");
     var expectedSignature = crypto.createHmac('sha256', 'BdGbp8nBieQuqD5QFTEcQLDT')
                                     .update(body.toString())
                                     .digest('hex');
                                     console.log("sig received " ,req.body.response.razorpay_signature);
                                     console.log("sig generated " ,expectedSignature);
     var response = {"signatureIsValid":"false"}
     if(expectedSignature === req.body.response.razorpay_signature)
      response={"signatureIsValid":"true"}
         res.send(response);
     });


app.get('/payment', function(req, res){
    Orderid.find({}, function(err, result){
        if(err)
        {
            console.log(err);
        } else {
            res.render("payment", {ordid:result});
        }
    });

});



app.get('/movie/:topic', function(req, res){
    const requestedTitle = req.params.topic;
    imgModel.find({name:requestedTitle}, (err, item) => {
        if (err) {
            console.log(err);
            res.status(500).send('An error occurred', err);

        }
        else {
            res.render("movie", {items:item});
        }
    });
});


app.get('/theater', function(req, res){
    res.render('theater');
});

app.get('/deletemovie', function(req, res){
    imgModel.find({}, (err, items) => {
        if (err) {
            console.log(err);
            res.status(500).send('An error occurred', err);
        }
        else {
            res.render('deletemovie', { items: items });
        }
    });
});

app.post('/deletemovie', function(req, res){
    imgModel.deleteOne({title: req.body.name}, function(err){
        if(err){
            console.log(err);
        } else{
            res.render('theater');
        }
    });
});

app.get('/updatemovie', function(req, res){
    imgModel.find({}, (err, items) => {
        if (err) {
            console.log(err);
            res.status(500).send('An error occurred', err);
        }
        else {
            res.render('updatemovie', { items: items });
        }
    });
});

app.post('/updatemovie', function(req, res){
    const title = req.body.name;
    const desc = req.body.desc;
    imgModel.updateOne({name: title}, {$set:{desc: req.body.desc}},
         function(err, result){
        if(err){
            console.log(err);
        } else{
            res.render('theater');
        }
    });
});

app.get('/pages/auth', function(req, res){
    res.render('pages/auth');
});

app.get('/success', (req, res) => res.render('theater', {user:userProfile}));
app.get('/pages/success', (req, res) => res.render('pages/success', {user:userProfile}));
app.get('/error', (req, res) => res.send("error logging in"));

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
passport.use(new GoogleStrategy({
    clientID: '959763275335-n0il3d5mn2lmc9714qo2gl14t6fc378b.apps.googleusercontent.com',
    clientSecret: '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',
    callbackURL: "http://localhost:3000/auth/google/callback",
    // access_type: 'online',
    // callbackURL: "https://immense-refuge-87281.herokuapp.com/pages/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, done) {
      userProfile=profile;
      return done(null, userProfile);
  }
));
 
app.get('/auth/google', 
  passport.authenticate('google', { scope : ['profile', 'email'] }));
 
app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/error' }),
  function(req, res) {
    // Successful authentication, redirect success.
    res.redirect('/success');
  });


const theatreloginSchema = new mongoose.Schema({
    name: String,
    mobilenum: Number,
    email: String,
    password: String,
    id: Number
});
const Theaterlogin = mongoose.model("Theaterlogin", theatreloginSchema);

app.get('/tlogin', function(req,res){
    res.render('tlogin');
});
app.post('/tlogin', function(req,res){
    const emailadd = req.body.email;
    const password = req.body.password;
    const id = req.body.id;
    Theaterlogin.findOne({email: emailadd}, function(err, foundUser){
            if(err){
                console.log(err);
                res.send('Not Valid User');
            }else{
                if(foundUser){
                    if((foundUser.password==password) & (foundUser.id==id)){
                        res.redirect("/theater");
                    }
                }else{
                    alert('Invalid user');
                    res.redirect('/tlogin');
                }
            }
        });
})
app.get('/tregister', function(req,res){
    var uniqueid = Math.random().toString().substr(2, 6);
    res.render('tregister',{uniqueid:uniqueid});
});

app.post('/tregister', function(req,res){
    const newTheaterlogin = new Theaterlogin({
        name: req.body.name,
        mobile: req.body.mobilenum,
        email: req.body.email,
        password: req.body.password,
        id: req.body.id
    });
    newTheaterlogin.save(function(err){
        if(err){
            console.log(err);
        } else {
            res.redirect('/tlogin');
        }
    });
});

app.get('/movieseat/:imagetitle', requiresAuth(), function(req,res){
   const req_title = req.params.imagetitle;
    imgModel.find({name:req_title}, (err, items) => {
        if (err) {
            console.log(err);
            res.status(500).send('An error occurred', err);
        }
        else {
            res.render('movieseat', { items: items });
        }
    });
});

app.listen(process.env.PORT || 3000, function(){
    console.log('Server has started and running at port 3000');
});

module.exports = app;
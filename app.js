const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const _ = require("lodash");
const mongoose = require("mongoose");
var fs = require('fs');
var path = require('path');
require('dotenv/config');
const app = express();
const http = require('http');
const Razorpay = require('razorpay');
const formidable = require('formidable');
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(express.static('public'));
mongoose.connect("mongodb://localhost:27017/movieDB");
const welcome = "Welcome to Movie Timez. Select your favourite movie and enjoy watching!";
// comment it down if you are using local database
// mongoose.connect("mongodb+srv://pushpak696:IxPw7a6XroFz1wv0@cluster0.4aydr2o.mongodb.net/movieDB");
// image schema starts here
// ref to image adding code https://www.geeksforgeeks.org/upload-and-retrieve-image-on-mongodb-using-mongoose/ 
let posts = [];
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
                        res.redirect("/seatBooking");
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
            res.redirect('/signin');
        }
    });
});

app.get('/seatBooking',function(req, res){
    res.render('seatBooking');

});
app.post('/seatBooking',function(req, res){
    const seatValue = req.body.name;
    
    console.log(seatValue);
});


app.get("/reviews", function(req, res){
    res.render("reviews");
  });
  
  app.get("/feedback", function(req, res){
    res.render("feedback", {posts:posts});
  });
  

  app.post("/reviews", function(req, res){
    
    const post = {
      email: req.body.postEmail,  
      title: req.body.postTitle,
      content: req.body.postBody
    };
  
    posts.push(post);
    res.redirect("/feedback");
  });
  
  app.get("/posts/:postName", function(req, res){
    const requestedTitle =_.lowerCase(req.params.postName);
  
    posts.forEach(function(post){
      const storedTitle = _.lowerCase(post.title);
  
      if (storedTitle === requestedTitle){
        res.render("post", {
          email:post.email,  
          title:post.title,
          content:post.content
        });
      }
    });
  });
 
// Razorpay Integration statrs here
  const razorpayInstance = new Razorpay({
    key_id: 'rzp_test_tGWpihUJ1HzHKv',
    key_secret: 'uJXQpLCYz2Ip3DGiVIa7yP5E',
  });

app.post('/createOrder', (req, res)=>{
	const {amount,currency,receipt, notes} = req.body;	
	razorpayInstance.orders.create({amount, currency, receipt, notes},
		(err, order)=>{
		if(!err){
			res.json(order);
        }
		else
			res.send(err);
		}
	)
});

app.get('/createOrder', (req, res)=>{
    res.render('createOrder');
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
    res.render('payment');
});
app.listen(process.env.PORT || 3000, function(){
    console.log('Server has started and running at port 3000');
});

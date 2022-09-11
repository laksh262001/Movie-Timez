const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', function(req,res){
    res.send("Hi Pushpak and Lakshmi");
})


app.listen(process.env.PORT || 3000, function(){
    console.log('Server has started and running at port 3000');
});

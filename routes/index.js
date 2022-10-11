var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/seat', function(req, res, next) {
  res.render('seat', { title: 'Express' });
});
router.get('/seatBooked', function(req, res, next) {
  res.render('seatBooked', { title: 'Express' });
});

module.exports = router;
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/', function (req, res) {
  console.log(req.body.name);
  console.log(req.body.email);
  console.log(req.body.goal);
  // res.render('the_template', { name: req.body.name });
});

module.exports = router;

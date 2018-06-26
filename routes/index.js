const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/', function (req, res) {
  res.render('sign-up', {
    name: req.body.name,
    email: req.body.email,
    goal: req.body.goal
  });
});

router.get('/sign-up', function(req, res) {
  res.render('/sign-up');
});

router.post('/sign-up', function (req, res) {
  console.log(req.body.name);
});

module.exports = router;

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passwordless = require('passwordless');
const User = mongoose.model('users');

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
  res.render('sign-up');
});

router.post('/sign-up', function (req, res) {

  const newUser = {
    name: req.body.name,
    email: req.body.user,
    goal: req.body.goal,
    category: req.body.category,
    gender: req.body.gender,
    age: req.body.age,
    timeZone: req.body.timezone
  }

  new User(newUser)
    .save();

  }, passwordless.requestToken(
    // Simply accept every user
    function(user, delivery, callback) {
      callback(null, user);
      // usually you would want something like:
      // User.find({email: user}, callback(ret) {
      // 		if(ret)
      // 			callback(null, ret.id)
      // 		else
      // 			callback(null, null)
      // })
    }));

router.post('/sendtoken',
  function(req, res, next) {
    const newUser = {
      name: req.body.name,
      email: req.body.user,
      goal: req.body.goal,
      category: req.body.category,
      gender: req.body.gender,
      age: req.body.age,
      timeZone: req.body.timezone
    }

    new User(newUser)
    .save();

    //next function baby
    next();
  },
	passwordless.requestToken(
		// Simply accept every user
		function(user, delivery, callback) {
			callback(null, user);
			// usually you would want something like:
			// User.find({email: user}, callback(ret) {
			// 		if(ret)
			// 			callback(null, ret.id)
			// 		else
			// 			callback(null, null)
			// })
		}),
	function(req, res) {
  		res.render('welcome');
});

router.get('/welcome', passwordless.restricted(), function(req, res) {
  res.render('welcome', { user: req.user });
});

module.exports = router;

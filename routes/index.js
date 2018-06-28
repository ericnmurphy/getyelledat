const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passwordless = require('passwordless');
const { body, validationResult } = require('express-validator/check');
const User = mongoose.model('users');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/', [
  body('name').not().isEmpty().withMessage('You have to enter a name, vro.').trim().escape(),
  body('user').isEmail().withMessage('Don\'t think that\'s a valid email 🤔').custom((value, {req}) => {
    return new Promise((resolve, reject) => {
      User.findOne({email:req.body.user}, function(err, user){
        if(err) {
          reject(new Error('Server Error'))
        }
        if(Boolean(user)) {
          reject(new Error(`E-mail already in use. If you've already signed up, you can go <a href="/login">here</a> to log in.`))
        }
        resolve(true)
      });
    });
  }).normalizeEmail(),
  body('goal').not().isEmpty().withMessage('What\'s your goal? You didn\'t enter one.').trim().escape()
], function (req, res) {

  const validationErrors = validationResult(req);
  let errors = [];
  if(!validationErrors.isEmpty()) {
    Object.keys(validationErrors.mapped()).forEach(field => {
      errors.push(validationErrors.mapped()[field]['msg']);
    });
  }

  if(errors.length){
    console.log(errors);
    res.render('', {
      errors: errors
    });
  } else {
    res.render('sign-up', {
      name: req.body.name,
      user: req.body.user,
      goal: req.body.goal
    });
  }
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
  		res.render('verify', {name: req.body.name, email: req.body.user});
});

router.get('/welcome', passwordless.restricted(), function(req, res) {
  res.render('welcome', { user: req.user });
});

module.exports = router;

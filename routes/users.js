const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passwordless = require('passwordless');
const { body, validationResult } = require('express-validator/check');
const User = mongoose.model('users');
const { ensureGuest } = require('../helpers/auth');

//GET login
router.get('/login', ensureGuest, function(req, res) {
  res.render('users/login');
});

//POST login
router.post('/login', [
  body('user').isEmail().withMessage('Enter a valid email.').custom((value, {req}) => {
    return new Promise((resolve, reject) => {
      User.findOne({email:req.body.user}, function(err, user){
        if(err) {
          reject(new Error(`Server error. I might have fucked something up, let me know at <a href="mailto:ericnmurphy@gmail.com">ericnmurphy@gmail.com</a> please`))
        }
        if(!Boolean(user)) {
          reject(new Error(`E-mail not registered. If you need to sign up, you can do so <a href="/">here</a>.`))
        }
        resolve(true)
      });
    });
  }).normalizeEmail()
],
  function(req, res, next) {
  const validationErrors = validationResult(req);
    let errors = [];
    if(!validationErrors.isEmpty()) {
      Object.keys(validationErrors.mapped()).forEach(field => {
        errors.push(validationErrors.mapped()[field]['msg']);
      });
    }

    if(errors.length){
      console.log(errors);
      res.render('users/login', {
        errors: errors
      });
    } else {
      next();
    }
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
  		res.render('users/verify', { register: false, email: req.body.user });
});

router.post('/verify', [
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
  body('goal').not().isEmpty().withMessage('What\'s your goal? You didn\'t enter one.').trim().escape(),
  body('category').not().isEmpty().withMessage('Please enter a category for your goal.'),
  body('gender').not().isEmpty().withMessage('Please enter a gender.'),
  body('age').not().isEmpty().withMessage('Please enter your age range.'),
  body('timezone').not().isEmpty().withMessage('Please enter a time zone.')
],
  function(req, res, next) {
  const validationErrors = validationResult(req);
    let errors = [];
    if(!validationErrors.isEmpty()) {
      Object.keys(validationErrors.mapped()).forEach(field => {
        errors.push(validationErrors.mapped()[field]['msg']);
      });
    }

    if(errors.length){
      console.log(errors);
      res.render('sign-up', {
        errors: errors,
        name: req.body.name,
        user: req.body.user,
        goal: req.body.goal,
        category: req.body.category,
        gender: req.body.gender,
        age: req.body.age,
        timezone: req.body.timezone
      });
    } else {
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
    }
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
  		res.render('users/verify', {register: true, name: req.body.name, email: req.body.user});
});

router.get('/sign-up', ensureGuest, function(req, res) {
  res.redirect('/');
});

router.get('/verify', ensureGuest, function(req, res) {
  res.redirect('/');
});

//GET logout
router.get('/logout', passwordless.logout(),
  function(req, res) {
    res.redirect('/');
});

module.exports = router;

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passwordless = require('passwordless');
const { body, validationResult } = require('express-validator/check');
const User = mongoose.model('users');
const { ensureGuest, ensureAuthenticated } = require('../helpers/auth');

// GET home page.
router.get('/', ensureGuest, function(req, res) {
  res.render('index');
});

// POST home page
router.post('/sign-up', [
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
    res.render('users/sign-up', {
      name: req.body.name,
      user: req.body.user,
      goal: req.body.goal
    });
  }
});

//GET dashboard
router.get('/dashboard', ensureAuthenticated, function(req, res) {
  res.render('dashboard');
});

module.exports = router;

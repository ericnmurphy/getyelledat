const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//create schema
const UserSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  goal: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  age: {
    type: String,
    required: true
  },
  gender: {
    type: String,
    required: true
  },
  timeZone: {
    type: String,
    required: true
  },
  joinDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  verified: {
    type: Boolean,
    default: false,
    required: true
  }
});

mongoose.model('users', UserSchema);
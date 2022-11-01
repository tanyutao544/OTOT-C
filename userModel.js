var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  admin: {
    type: Boolean,
    require: true,
  }
});

var User = (module.exports = mongoose.model('user', userSchema));
module.exports.get = function (callback, limit) {
  User.find(callback).limit(limit);
};

'use strict';

var db = require('./db.js');
var bcrypt = require('bcrypt');
var Q = require('q');
var SALT_FACTOR = 10;

db.User = db.Model.extend({
  tableName: 'users',
});

//accessing functions
module.exports = {
  create: function (userinfo) {
    var defer = Q.defer();

    if (!userinfo.username) {
      defer.reject('Username required.');
      return defer.promise;
    }

    if (!userinfo.password) {
      defer.reject('Password required.');
      return defer.promise;
    }

    //check if the username is taken
    db.User.where({ username: userinfo.username }).fetch().then(function (model) {

      if (model) {
        defer.reject('Username already exists.');
      }

    }).then(function () {

      //user does not exist, so we can create one
      console.log('before hashing ', userinfo.password);

      bcrypt.genSalt(SALT_FACTOR, function (err, salt) {
        if (err) {
          console.log('error in gensalt', err);
          defer.reject('Server error generating salt.');
        }

        bcrypt.hash(userinfo.password, salt, function (err, hash) {

          if (err) {
            console.log('error in hashing password ', err);
            defer.reject('Server error hasing password.');
          }

          userinfo.password = hash;

          console.log('hashed password', userinfo);
          new db.User(userinfo).save().then(function (model) {

            if (!model) {
              defer.reject('Server error.  User not saved.');
            }

            defer.resolve(model);
          });
        });
      });
    });

    return defer.promise;
  },

  read: function (userinfo) {
    return new db.User(userinfo).fetch().then(function (model) {
      if (!model) {
        console.log('user does not exist');
        return model;
      } else {
        console.log(model, 'user has been found');
        return model;
      }
    });
  },

  update: function (userinfo) {
    db.knex('users')
      .where({ username: userinfo.username })
      .update({ password:userinfo.password })
      .then(function () {
        console.log('Model has been updated');
      });
  },

  delete: function (userinfo) {
    return this.read(userinfo).then(function (model) {
      new db.User({ id: model.id }).destroy().then(function (model) {
        console.log(model, 'user has been deleted');
      });
    });
  },
};
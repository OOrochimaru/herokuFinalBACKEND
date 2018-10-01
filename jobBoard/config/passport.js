var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    //mongoose = require('mongoose'),
    User = require('../model/users/user');

passport.use(new LocalStrategy({
    usernameField: 'user[username]',
    passwordField: 'user[password]'
}, function(username, password, done){
    User.findOne({username: username}).then(function(user){
        if (!user || !user.comparePassword(password)) {
            return done(null, false, {errors: {'email or password': 'is invalid'}});
        }

        return done(null, user);
        }).catch(done);
}));
// dkfj
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var uniqueValidator = require('mongoose-unique-validator');
var JobModel = require('../job');
var jwt = require('jsonwebtoken');
//var bcrypt = require('bcrypt');
var secret = require('../../config').secret;
// var SALT_WORK_FACTOR = 10;
var passwordHash = require('password-hash');

var UserSchema = new Schema({
    username: {type:String, required: [true, 'can\'t be blank'], unique: true,
                    lowercase: true, match:[/^[a-zA-Z0-9]+$/, 'is invalid'] },
    email: {type: String, required:[true, "can't be blank"], unique:true, match:[/\S+@\S+\.\S+/]},
    password: {type: String, required: true},
    user: {type: String},
    number:{type:Number, required:true},
    currentLocation: {type: String},
    companyName: {type: String, },
        //required: function(){return this.role === 'employer'}},
    companyDescription: {type: String},
        // required: function(){return this.role === 'employer'}},
    paymentdetail: {
        //required: function(){return this.role === 'employer'},
        type: String
    },
    role:{type: String, default:'jobseeker'},
    userDetail:{
        qualification:{type: String,}, 
            //required: function(){return this.role === 'jobseeker'} },
        course: {type: String,},
            // required: function(){return this.role === 'jobseeker'}},
        completionDate:{type: Date},
            // required: function(){return this.role === 'jobseeker'} },
        technicalSkill: [{type: String}],
        currentCompany: {type: String},
        annualSalary: {type: Number},
        experiences: {type: String},
    },
    appliedJobs: [{type: Schema.Types.ObjectId, ref:'job'}],
    postedJobs: [{type: Schema.Types.ObjectId, ref: 'job'}],
    resume: {type:Buffer, contentType: String},
    profilePic: {type: Buffer, contentType: String},
    totalJobs: {type:Number, default:0},
    companyPictures: {type: Buffer,  contentType: String},
    isPremiumMember: {type: Boolean, default: false}
});

UserSchema.plugin(uniqueValidator, {message: 'is already taken'});
// UserSchema.pre('save', function(next) {
//     var user = this;

// // only hash the password if it has been modified (or is new)
// if (!user.isModified('password')) return next();

// // generate a salt
// bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
//     if (err) return next(err);

//     // hash the password using our new salt
//     bcrypt.hash(user.password, salt, function(err, hash) {
//         if (err) return next(err);

//         // override the cleartext password with the hashed one
//         user.password = hash;
//         next();
//     });
// });


// });

UserSchema.pre('save', function(next){
    var user = this;
    this.password = passwordHash.generate(this.password);
    next();
});
UserSchema.methods.comparePassword = function(candidatePassword){
    return passwordHash.verify(candidatePassword, this.password);

}

// UserSchema.methods.comparePassword = function(candidatePassword, cb) {
//     bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
//         if (err) return cb(err);
//         cb(null, isMatch);
//     });
// };


UserSchema.methods.updateJobCount = function(){
    var user = this;
    return JobModel.count({jobPublisher:{$in:[user._id]}}).then(function(count){
        user.totalJobs = count;
        return user.save();
    });
};

//generating token
UserSchema.methods.generatJWT = function(){
    var today = new Date();
    var exp = new Date(today);
    exp.setDate(today.getDate() + 60);
    return jwt.sign({
        id: this._id,
        username: this.username,
        exp: parseInt(exp.getTime() / 1000),
    }, secret);
};

UserSchema.methods.toAuthJSON =function(){
    return {
        _id: this._id,
        username: this.username,
        userlocation: this.currentLocation,
        company: this.companyName,
        number: this.number,
        email: this.email,
        appliedJobs: this.appliedJobs,
        postedJobs: this.postedJobs,
        role: this.role,
        token: this.generatJWT(),
    }
}

UserSchema.methods.toProfileJSONFor = function(){
    return {
        _id: this._id,
        username: this.username,
        userlocation: this.currentLocation,
        company: this.companyName,
        number: this.number,
        email: this.email,
        appliedJobs: this.appliedJobs,
        postedJobs: this.postedJobs,
        role: this.role,
    }
}

module.exports = mongoose.model('user', UserSchema);

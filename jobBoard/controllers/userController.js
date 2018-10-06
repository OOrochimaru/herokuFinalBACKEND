var passport = require('passport');
var UserModel = require('../model/users/user');
var JobModel = require('../model/job');
var async = require('async');
var mongoosePaginate = require('mongoose-paginate');

var IncomingFile = require('formidable').IncomingForm;


module.exports.uploadFile = function(req, res, next){
    var form = new IncomingFile();
    form.on('file', (field, file) => {

    });
    form.on('end', () => {
        res.json();
    })
    form.parse(req)
}

//checking logged in token
module.exports.user = function (req, res, next) {
    console.log("user logged in checked" + req.payload.id);
    if (req.payload.id !== null) {
        UserModel.findById({ _id: req.payload.id })
        .populate({'path':'appliedJobs'})
        .populate({'path':'postedJobs'})
        .then(function (user) {
            // console.log(user);
            if (!user) {
                return res.sendStatus(401);
            }
            if (user) {
                return res.json({ user: user.toAuthJSON() })
            }
        })
    }
}

//for job preview 
module.exports.getUser = function (req, res, next) {
    // console.log(req.params.id);
    if (req.params.id !== null) {
        UserModel.findById(req.params.id).then(function (user) {
            if (user) {
                console.log("******getuser")
                return res.json({ user: user.toProfileJSONFor() });
            }
        })
    }
}

//user detail and billing
module.exports.getUserDetails = function (req, res, next) {
    console.log("sdfjks" + req.params.username);
    if (req.params.username !== null) {
        UserModel.findOne({ username: req.params.username })
        .populate({'path':'appliedJobs'})
        .then(function (user) {
            if (user) {
                console.log("******getuser")
                console.log(user);
                return res.json({ user: user.toProfileJSONFor() });
            }
        })
    }
}




//checking existing username or email
module.exports.checkuser = function (req, res, next) {
    console.log(req.body.user);
    if (req.body.user != null) {
        console.log(req.body.user);
        UserModel.findOne({ email: req.body.user }).then(function (user) {
            console.log(user)
            if (!user) {
                console.log("user not found")
                return res.sendStatus(404);
            }
            return res.json({ user: user });

        })
    }
}

module.exports.register = function (req, res, next) {
    var user = new UserModel();
    console.log("register reached")
    // console.log("hello");

    user.username = req.body.user.fullname;
    user.email = req.body.user.email;
    user.password = req.body.user.password;
    user.number = req.body.user.number;
    user.currentLocation = req.body.user.currentLocation;
    user.role = req.body.user.userType;
    user.gender = req.body.user.gender;

    user.save().then(function () {
        // console.log("*******")
        return res.json({ user: user.toAuthJSON() });
    }).catch(next);

}


module.exports.login = function (req, res, next) {
    if (!req.body.user.username) {
        return res.status(422).json({ errors: { username: "can't be blank" } });
    }
    if (!req.body.user.password) {
        return res.status(422).json({ errors: { password: "can't be blank" } });
    }
    // console.log(req.body.user);
    passport.authenticate('local', { session: false }, function (err, user, info) {
        if (err) {
            console.log(err);
            return res.json({ err: err });
        }
        if (user) {
            console.log(user);
            user.token = user.generateJWT();
            return res.json({ user: user.toAuthJSON() });
        } else {
            console.log("password authenticate")
            return res.sendStatus(404);
        }
    })(req, res, next);
};

module.exports.loadUser = function (req, res, next, id) {
    console.log("parma id *************")
    UserModel.findOne({ _id: id }).then(function (user) {
        if (!user) { return res.sendStatus(404); }
        req.user = user;
        console.log(req.user+"*******************in param id")
        return next();
    }).catch(next);
};

module.exports.educationDetails = function (req, res, next) {
    UserModel.findById(req.payload.id).then(function (user) {
        user.userDetail.qualification = req.body.qualification;
        user.userDetail.course = req.body.course;
        user.userDetail.completionDate = req.body.completionDate;
        if (req.body.technicalSkill != null) {
            user.userDetail.technicalSkill = req.body.technicalSkill;
        };
        if (req.body.currentCompany != null) {
            user.userDetail.currentCompany = req.body.currentCompany;
        };
        if (req.body.annualSalary != null) {
            user.userDetail.annualSalary = req.body.annualSalary;
        };
        if (req.body.experiences != null) {
            user.userDetail.experiences = req.body.experiences;
        };

        //upload photo


        user.save().then(function () {
            return res.json({ user: user.toAuthJSON() });
        });
    });
};

module.exports.companyDetails = function (req, res, next) {
    UserModel.findById(req.payload.id).then(function (user) {
        user.companyName = req.body.companyName;
        user.companyDescription = req.body.companyDescription;
        user.role = "employer";
        user.save().then(function () {
            return res.json({ user: user.toAuthJSON() });
        });
    });
};


//show all resumes
module.exports.browseResumes = function (req, res, next) {


    UserModel.findById(req.params.id).then(function (user) {
        if (user.role === 'employer') {

            UserModel.find({ resume: { $exists: true } }).then(function (resumes) {
                // return res.json({resu: resumes});
                console.log(resumes.length);
                return res.json({
                    resumes: resumes.map(function (resume) {
                        // console.log(typeof resume);
                        return resume;
                    })
                });
            });
        } else {
            return res.json({ status: 404, message: 'login as Employer to see Resumes' })
        }
    });
};

//user dashboard
module.exports.userHome = function (req, res, next) {

    if (req.user.role === 'jobseeker' || req.user.role === 'employer') {
        JobModel.find({ isFeatured: true }).sort({ 'createdAt': -1 }).limit(3)
            .then(function (jobs) {
                if (!jobs) { return res.sendStatus(404); }
                return res.json(
                    {
                        jobs: jobs.map(function (job) {
                            return job.toJSONFor();
                        })
                    }
                )
            })
    }

    //old code

    // UserModel.findById(req.params.id).then(function (user) {
    //     if (user.role === 'jobseeker' || user.role === 'employer') {
    //         JobModel.find({ isFeatured: true }).sort({ 'createdAt': -1 }).limit(3).then(function (jobs) {
    //             if (!jobs) {
    //                 return res.json({ jobs: "", user: user })
    //             }
    //             return res.json({ jobs: jobs, user: user });
    //         })
    //     };
    // });
};





module.exports.searchResumes = function (req, res, next) {

    var search = {};
    if (req.query.location != null) {
        search.currentLocation = { "$regex": req.query.location }
    }
    if (req.query.name != null) {
        search.username = { '$regex': req.query.name };
    }
    return Promise.all([
        UserModel.find(search).exec()
    ]).then(function (results) {
        return res.json({
            resumes: results
        });
    });

};































var passport = require('passport');
var UserModel = require('../model/users/user');
var JobModel = require('../model/job');
var async = require('async');
var mongoosePaginate = require('mongoose-paginate');

//checking logged in token
module.exports.user = function (req, res, next) {
    console.log("user logged in checked"+req.payload.id);
    if (req.payload.id !== null) {
        UserModel.findById({ _id: req.payload.id }).then(function (user) {
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
module.exports.getUser = function(req, res, next){
    // console.log(req.params.id);
    if (req.params.id !== null) {
        UserModel.findById(req.params.id).then(function(user){
            if(user){
                console.log("******getuser")
                return res.json({user: user.toProfileJSONFor()});
            }
        })
    }
}

//user detail and billing
module.exports.getUserDetails = function(req, res, next){
    console.log("sdfjks"+req.params.username);
    if (req.params.username !== null) {
        UserModel.findOne({username : req.params.username}).then(function(user){
            if(user){
                console.log("******getuser")
                console.log(user);
                return res.json({user: user.toProfileJSONFor()});
            }
        })
    }
}



module.exports.homepage = function (req, res, next) {
    JobModel.find({ isFeatured: true }).populate({'path':'jobPublisher'}).sort({ 'createdAt': -1 }).limit(4).then(function (jobs) {
        console.log(jobs)
        return res.json({
            jobs: jobs.map(function (job) {
                
                return job.toJSONFor();
            })
        });
    });
    // return res.json({job: "job"});
};

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

module.exports.applyForJob = function(req, res, next){
    
    console.log(req.params.jobId);
    JobModel.findById(req.params.jobId).populate({'path':'jobPublisher'})
    .then(function(job){
        this.job.jobPublisher.push(req.payload.id);
        return job.toJSONFor();
    })
    // console.log(req.payload.id);
    return res.json({sdf: "hello"})
}

//showall jobs
module.exports.browseJobs = function (req, res, next) {
    var page = parseInt(req.query.pageno) | 0;
    var limit = 5;
    var offset = page * limit;

    JobModel.find({}).skip(offset).limit(limit).then(function (jobs) {
        if (jobs.length < 1) {
            return res.json({
                status: 404,
                message: 'Data Not Found'
            });
        }
        console.log('no found');
        return res.json({
            jobs: jobs.map(function (job) {
                return job.toJSONFor();
            })
        });
    })

    // JobModel.paginate({}, {
    //     sort:{
    //         createdAt: 1
    //     },
    //     page: 1, //numbering of pagee
    //     limit: 2, //8 items in one list
    //     offset: this.page * this.limit
    // }, function(err, results){
    //     if (err) {return next(err);}
    //     return res.json({current_page: parseInt(req.query.pageNo), jobs: results.docs, 
    //     num_of_pages: parseInt(results.total), job_data: results.docs[1]});
    // });
    // JobModel.find({}).sort('-createdAt').then(function(jobs){
    //     return res.json({jobs: jobs});
    // });
};

module.exports.getUserJobs = function(req, res, next){
    console.log(req.user.id);
    JobModel.find({jobPublisher: req.user.id}).then(function(jobs){
        if (jobs) {
            console.log("jobs found"+jobs)
            return res.json({jobs: jobs.map(function(job){
                    return job.toJSONFor();
            })})
        }else{
            return res.sendStatus(227);
        }
    })
    
}

module.exports.getJobPreview = function(req, res, next){
    console.log(req.params.jobId);
    JobModel.findById(req.params.jobId).populate({'path':'jobPublisher'}).then(function(job){
        console.log("---------888888888888888888888");
        console.log(job);
        return res.json({job: job.toJSONFor() });
    })
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
            return res.json({ err: err }); }
        if (user) {
            console.log(user);
            user.token = user.generateJWT;
            return res.json({ user: user.toAuthJSON() });
        } else {
            console.log("password authenticate")
            return res.sendStatus(404);
        }
    })(req, res, next);
};

module.exports.loadUser = function (req, res, next, id) {
    UserModel.findOne({ _id: id }).then(function (user) {
        if (!user) { return res.sendStatus(404); }
        req.user = user;
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

//search job
module.exports.searchjobs = function (req, res, next) {
    var search = {};
    console.log
    // if (req.query.name != null) {
    search.jobTitle = { "$regex": req.body.query.jobTitle, "$options":"i" };
    // }
    // if (req.query.location != null) {
    search.location = { '$regex': req.body.query.location,  "$options":"i" };
    // }
    // console.log(search)
    return Promise.all([
        JobModel.find(search).exec()
    ]).then(function (results) {
        console.log(results+"dsfsdf");
        // console.log(results);
        return res.json({ jobs: results[0]});
});
}

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
module.exports.addJobForm = function (req, res, next) {
};

module.exports.addJob = function (req, res, next) {
    request =  req.body.job
    if (req.user.role === 'employer') {
        
        var job = new JobModel();
        job.jobTitle = request.jobTitle;
        console.log(req.body);
        job.jobDescription.description = request.jobDescription;
        job.jobDescription.jobType = request.jobType;
        job.companyName = request.companyName;
        job.jobDescription.experience = request.experience;
        job.location = request.jobLocation;
        job.applicationMethod = request.applicationMethod;
        job.jobPublisher = req.user;
        job.isFeatured = function () { return req.user.isPremiumMember };
        job.save().then(function () {
            req.user.updateJobCount();
            return res.json({ job: job.toJSONFor() })
        }).catch(next);

    }

};

//job view and edit as well as counting/view jobs applicants 
module.exports.viewEditJob = function (req, res, next) {
    JobModel.findById(req.query.id).populate('jobPublisher')
        .populate('jobApplicants').then(function (job) {
            return res.json({ job: job });
        });
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































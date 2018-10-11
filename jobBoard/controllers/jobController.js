var JobModel = require('../model/job');
var UserModel = require('../model/users/user');


//homepage feature jobs fetching
module.exports.homepage = function (req, res, next) {
    JobModel.find({ isFeatured: true })
        // .populate({ 'path': 'jobPublisher' })
        .sort({ 'createdAt': -1 })
        .limit(4)
        .then(function (jobs) {
            return res.json({
                jobs: jobs.map(function (job) {
                    return job.FeaturedJobsJSON();
                })
            });
        });
};

//search job
module.exports.searchjobs = function (req, res, next) {
    var search = {};
    // if (req.query.name != null) {
    search.jobTitle = { "$regex": req.body.query.jobTitle, "$options": "i" };
    // }
    // if (req.query.location != null) {
    search.location = { '$regex': req.body.query.location, "$options": "i" };
    // }
    // console.log(search)
    return Promise.all([
        JobModel.find(search).exec()
    ]).then(function (results) {
        // console.log(results);
        return res.json({ jobs: results[0] });
    });
}

//get Employer jobslist
module.exports.getEmployerJobs = function (req, res, next) {
    console.log(req.user);
    UserModel.findById(req.user.id)
        .populate('postedJobs')
        .then(function (user) {
            if (user) {
                console.log(user.postedJobs);
                return res.json({

                    jobs: user.postedJobs
                })
            }
            else {
                return res.sendStatus(227);
            }
        })
}

//get user applied jobslist
module.exports.getUserJobs = function(req, res, next){
    console.log(req.user);
    UserModel.findById(req.user.id)
    .populate('appliedJobs')
    .exec(function(err, user){
        if (user) {
            console.log("----------------getuserjobs")
            
            console.log(user)
            return res.json({jobs: user.appliedJobs})
        }else{
            return res.sendStatus(227);
        }
    })
}

//adding jobs
module.exports.addJob = function (req, res, next) {
    request = req.body.job
    console.log(req.user);
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
        job.populate({ 'path': 'jobPublisher' }).save().then(function () {
            req.user.postedJobs.push(job);
            req.user.updateJobCount();
            return res.json({ job: job.toJSONFor() })
        }).catch(next);

    }

};

//info of job to be previewed
module.exports.getJobPreview = function (req, res, next) {
    JobModel.findById(req.params.jobId)
    .populate({ 'path': 'jobPublisher' })
    .then(function (job) {
        return res.json({ job: job.toJSONFor() });
    })
}




//apply for a particular job
module.exports.applyForJob = function (req, res, next) {

    // console.log(req.params.jobId);
    JobModel.findById(req.params.jobId)
    .populate({ 'path': 'jobPublisher' })
        .then(function (job) {
            UserModel.findById(req.payload.id).then(function (user) {
                // console.log("jobapplicant array", job.jobApplicants)
                // console.log("user id ", user.id)
                // console.log("job ", job)
                // console.log(job.jobApplicants.indexOf(user.id) > -1);
                if (job.jobApplicants.indexOf(user.id) <= -1 
                || job.jobApplicants.length === 0) {
                    job.jobApplicants.push(user);
                    job.save();
                    user.appliedJobs.push(job);
                    user.save();
                    return res.json({ job: job.toJSONFor() })
                }else{
                    return res.json({status: 201, job: "Already Applied"});
                }
            });
        })
}

//get applicants for particular job
module.exports.getApplicantsList = function(req, res, next){
    JobModel.findById(req.params.jobId)
    .populate('jobApplicants')
    .exec(function(err, job){
        if (job) {

            return res.json({
                jobApplicants: job.jobApplicants.map((jobApplicant)=>{
                    return  {
                        _id: jobApplicant._id,
                        username: jobApplicant.username,
                        location: jobApplicant.currentLocation,
                        company: jobApplicant.companyName,
                        number: jobApplicant.number,
                        email: jobApplicant.email,
                    }
                })
            })
        }
    })
    console.log("healelooo get appicants")
    // return res.json({hello: "hello"});
}

module.exports.getShortListedApplicants = function(req, res, next){
    JobModel.findById(req.params.jobId)
    .populate('shortlisted')
    .then(function(job){
        count = job.shortlisted.length;
        // return res.json({"h":'dfd'})
        if(count > 0){
        return res.json({shortlisted: job.shortlisted.map((shortlist) => {
                return {
                    count: count?count:0,
                    _id: shortlist._id,
                    username: shortlist.username,
                    location: shortlist.currentLocation,
                    company: shortlist.companyName,
                    number: shortlist.number,
                    email: shortlist.email,
                }
        })});
    }else{
        return res.sendStatus(404);
    }
    });

}

module.exports.shortListACandidate = function(req, res, next){
    id = req.params.jobId; 
    JobModel.findById(id)
    // .populate({'path': 'shortlisted'})
    // .populate('shortlisted')
    .then(function(job){
        UserModel.findOne({'username': req.body.applicant})
        // .populate("appliedJobs")
        .then(function(user){
            if (job.shortlisted.indexOf(user.id) <= -1 || job.shortlisted.length === 0 ) {
                job.shortlisted.push(user);
                job.save();
                return res.sendStatus({status: 200, data:"Added in the list"});
            }else{
                return res.json({status: 201, data: "Already in the array"})
            }
        });
    });
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
        return res.json({
            jobs: jobs.map(function (job) {
                return job.toJSONFor();
            })
        });
    })

};

//job view and edit as well as counting/view jobs applicants 
module.exports.viewEditJob = function (req, res, next) {
    JobModel.findById(req.query.id).populate('jobPublisher')
        .populate('jobApplicants').then(function (job) {
            return res.json({ job: job });
        });
};

//has user already applied for this job
module.exports.hasUserApplied = function (req, res, next) {
    UserModel.findById(req.payload.id).populate({ 'path': 'appliedJobs' }).then(function (user) {
        user.appliedJobs.forEach(job => {
            job._id
        })
    })
    return res.json({ sss: req.payload.id + req.params.jobId });
}
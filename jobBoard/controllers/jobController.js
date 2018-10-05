var JobModel = require('../model/job');
var UserModel = require('../model/users/user');


//search job
module.exports.searchjobs = function (req, res, next) {
    var search = {};
    console.log
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
        console.log(results + "dsfsdf");
        // console.log(results);
        return res.json({ jobs: results[0] });
    });
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
        job.populate({'path':'jobPublisher'}).save().then(function () {
            req.user.postedJobs.push(job);
            req.user.updateJobCount();
            return res.json({ job: job.toJSONFor() })
        }).catch(next);

    }

};

//info of job to be previewed
module.exports.getJobPreview = function (req, res, next) {
    console.log(req.params.jobId);
    JobModel.findById(req.params.jobId).populate({ 'path': 'jobPublisher' }).then(function (job) {
        console.log("---------888888888888888888888");
        console.log(job);
        return res.json({ job: job.toJSONFor() });
    })
}


//jobs of particular user
module.exports.getUserJobs = function (req, res, next) {
    console.log(req.user.id);
    JobModel.find({ jobPublisher: req.user.id }).then(function (jobs) {
        if (jobs) {
            console.log("jobs found" + jobs)
            return res.json({
                jobs: jobs.map(function (job) {
                    return job.toJSONFor();
                })
            })
        } else {
            return res.sendStatus(227);
        }
    })

}

//apply for a particular job
module.exports.applyForJob = function (req, res, next) {

    console.log(req.params.jobId);
    JobModel.findById(req.params.jobId).populate({ 'path': 'jobPublisher' })
        .then(function (job) {
            UserModel.findById(req.payload.id).then(function (user) {
                job.jobApplicants.push(user);
                job.save();
                user.appliedJobs.push(job);
                user.save();
                return res.json({ job: job.toJSONFor() })
            })
        })
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

};

//job view and edit as well as counting/view jobs applicants 
module.exports.viewEditJob = function (req, res, next) {
    JobModel.findById(req.query.id).populate('jobPublisher')
        .populate('jobApplicants').then(function (job) {
            return res.json({ job: job });
        });
};
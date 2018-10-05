var router = require('express')();
var auth = require('../auth');

//checking local storage for token 
router.get('/user', auth.required, require('../../controllers/userController').user);

//preloading user object on routes to the :id
router.param('id', require('../../controllers/userController').loadUser);

//checking wheather there is existing email or fullname
router.post('/checkuser', require('../../controllers/userController').checkuser);


//home page along with search and featured jobs
router.get('/', require('../../controllers/userController').homepage);

//get particular user for job preview detailing
router.get('/:id/getUser', require('../../controllers/userController').getUser);

//getting user detail for billing and details 
router.get('/:username/getUserDetails', require('../../controllers/userController').getUserDetails);

router.get('/:jobId', auth.required, require('../../controllers/jobController').applyForJob);

//get particular user's jobslist
router.get('/:id/getUserJobs', auth.required,require('../../controllers/jobController').getUserJobs);

//getting job preveiw for particular job
router.get('/:jobId/getJobPreview', require('../../controllers/jobController').getJobPreview);

//hoem page browse jobs without forms
router.get('/browsejobs', require('../../controllers/jobController').browseJobs);

//home page having browse jobs options
router.get('/:id/browsejobs', auth.required, require('../../controllers/jobController').browseJobs);

//browse all resumes
router.get('/:id/browseresumes', auth.required, require('../../controllers/userController').browseResumes);


//search a resume
router.post('/:id/searchresumes', auth.required, require('../../controllers/userController').searchResumes);

//search jobs
router.post('/searchjobs', require('../../controllers/jobController').searchjobs);

//login for both 
router.post('/login', require('../../controllers/userController').login);

//signing up
router.post('/register', require('../../controllers/userController').register);

//adding jobseeker education
router.post('/:id/register/education', auth.required, require('../../controllers/userController')
            .educationDetails);

//user home page
router.get('/:id/home', auth.required, require('../../controllers/userController').userHome);

// //route to adding job
// router.get('/:id/addJob', auth.required, require('../../controllers/userController').addJobForm);

//adding jobs
router.post('/:id/addJob', auth.required, require('../../controllers/jobController').addJob);

//editing job
router.get('/:id/editjob', auth.required, require('../../controllers/jobController').viewEditJob);


module.exports = router;

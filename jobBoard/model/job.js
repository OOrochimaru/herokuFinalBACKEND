var mongoose = require('mongoose');
//var slug = require('slug');
//var uniqueValidator = require('mongoose-unique-validator');
var mongoosePaginate = require('mongoose-paginate');
var Schema = mongoose.Schema;

var JobSchema = new Schema({
    // slug:{type:String, lowercase:true, unique:true},
    jobTitle: { type: String, required: true },
    location: { type: String },
    jobDescription: {
        catagory: {type: String},
        description: { type: String },
        jobType: { type: String, },
        experience: { type: String },
        publishedDate: { type: Date, default: Date.now },
        deadline: { type: Date },
    },
    isActive: { type: Boolean, default: function () { return (this.deadline - new Date()) > 0 } },
    jobApplicants: [{ type: Schema.Types.ObjectId, ref: 'user' }],
    jobPublisher: { type: Schema.Types.ObjectId, ref: 'user' },
    shortlisted: [{type: Schema.Types.ObjectId, ref: 'user'}],
    isFeatured: { type: Boolean, default: false },
    views: { type: Number }
}, { timestamps: true });

//JobSchema.plugin(uniqueValidator, {message:'is already taken'});
JobSchema.plugin(mongoosePaginate);
// JobSchema.pre('validate', function(next){
//     if (!this.slug) {
//         this.slugify();
//     }
//     next();
// });

// JobSchema.methods.slugify = function(title){
//     this.slug = slug(this.title)+'-' + (Math.random()*Math(36, 7)|0).toString(36);
// };
JobSchema.methods.toJSONFor = function () {
    return {
        //slug: this.slug,
        _id: this._id,
        jobTitle: this.jobTitle,
        description: this.jobDescription.description,
        qualification: this.jobDescription.qualification,
        // jobDescription: this.jobDescription,
        location: this.location,
        isActive: this.isActive,
        jobPublisher: this.jobPublisher.toJobPreviewJSON(),
        isFeatured: this.isFeatured,
    }
}

JobSchema.methods.FeaturedJobsJSON = function(){
    return {
        _id: this._id,
        jobTitle: this.jobTitle,
        location: this.location,
        jobType: this.jobDescription.jobType,
        publishedDate: this.jobDescription.publishedDate,
    }
}


JobSchema.method.AorPJobsJSON = function(){
    return {
        publisher: this.publisher,
        jobApplicants: this.jobApplicants.map(applicants => {
            return applicants;
        })
    }
}
JobSchema.method.shortlisted = function(){
    return {
        shortlisted: this.shortlisted.map(shortlisted => {
            return shortlisted;
        })
    }
}

module.exports = mongoose.model('job', JobSchema);
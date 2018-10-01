var mongoose = require('mongoose');
//var slug = require('slug');
//var uniqueValidator = require('mongoose-unique-validator');
var mongoosePaginate = require('mongoose-paginate');
var Schema = mongoose.Schema;

var JobSchema = new Schema({
    // slug:{type:String, lowercase:true, unique:true},
    jobTitle: { type: String, required: true },
    location: [{ type: String }],
    jobDescription: {
        description: { type: String },
        jobType: { type: String, },
        experience: { type: String },
        pulishedDate: { type: Date, default: Date.now },
        deadline: { type: Date },
    },
    isActive: { type: Boolean, default: function () { return (this.deadline - new Date()) > 0 } },
    jobApplicants: [{ type: Schema.Types.ObjectId, ref: 'user' }],
    jobPublisher: { type: Schema.Types.ObjectId, ref: 'user' },
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
        title: this.jobTitle,
        jobDescription: this.jobDescription,
        isActive: this.isActive,
        jobPublisher: this.jobPublisher,
        isFeatured: this.isFeatured,
    }
}



module.exports = mongoose.model('job', JobSchema);
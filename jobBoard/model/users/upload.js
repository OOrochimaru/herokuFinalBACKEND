var mongoose = require('mongoose');
//var slug = require('slug');
//var uniqueValidator = require('mongoose-unique-validator');
var mongoosePaginate = require('mongoose-paginate');
var Schema = mongoose.Schema;

var UploadSchema = new Schema({
    // slug:{type:String, lowercase:true, unique:true},
  file: {type: string}
});

module.exports = mongoose.model('upload', UploadSchema);
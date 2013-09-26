/**
 * Author: krasu
 * Date: 9/18/13
 * Time: 14:21 AM
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema

var RequestSchema = new Schema({
	user: {type: Schema.ObjectId, ref: 'User'},
	project: {type: Schema.ObjectId, ref: 'Project'},
	projectGitId: {type: String}
})

mongoose.model('Request', RequestSchema)
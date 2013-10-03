/**
 * Author: krasu
 * Date: 9/18/13
 * Time: 14:21 AM
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema

var RequestSchema = new Schema({
	supporter: {
		ref: {type: Schema.ObjectId, ref: 'User'},
		username: {type: String, trim: true },
		email: {type: String, trim: true },
		isAnon: Boolean,
        ip: {type: String, trim: true }
	},

	project: {
        ref: {type: Schema.ObjectId, ref: 'Project'},
		githubId: {type: Number},
		methodsSet: Boolean
	},

	maintainer: {
		user: {type: Schema.ObjectId, ref: 'User'},
		org: {type: Schema.ObjectId, ref: 'Organization'},
		name: {type: String, trim: true },
		email: {type: String, trim: true },
		notified: Boolean
	},

	createdAt: Date
})


RequestSchema.pre('save', function(next){
	if ( !this.created_at ) this.created_at = new Date;
	next();
});

mongoose.model('Request', RequestSchema)
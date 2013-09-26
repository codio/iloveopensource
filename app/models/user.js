/**
 * Author: krasu
 * Date: 8/4/13
 * Time: 3:45 PM
 */

var mongoose = require('mongoose')
var Schema = mongoose.Schema

var UserSchema = new Schema({
	username: { type: String, required: true, index: { unique: true }, trim: true },
	email: { type: String, match: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i, trim: true },
	avatar: String,
	admin: {type: Boolean, default: false},

	displayName: {type: String, trim: true},
	twitterName: {type: String, trim: true},
	github: {},
	provider: { type: String, default: '' },
	authToken: { type: String, default: '' },
	projectsUpdater: {
		updated: {type: Boolean},
		updating: {type: Boolean},
		status: {type: String, enum: ['error', 'success']},
		updatedAt: { type: Date }
	}
});

UserSchema.methods.register = function (callback) {
	this.save(function (error, user) {
		if (error) return callback(error)
		callback(error, user)
		require('../utils/update-user-projects')(user)
	})
}

UserSchema.post('save', function (doc) {
	var Project = mongoose.model('Project')
	Project.updateOwner(doc)
})

mongoose.model('User', UserSchema);
/**
 * Created with JetBrains PhpStorm.
 * User: krasu
 * Date: 8/13/13
 * Time: 8:06 AM
 */
var mongoose = require('mongoose'),
	_ = require('lodash'),
	Schema = mongoose.Schema,
	User = mongoose.model('User')

var ProjectSchema = new Schema({
	name: {type: String, required: true},
	githubId: {type: Number, required: true, index: { unique: true }},
	url: {type: String, required: true},
	fork: Boolean,
	owner: {
		githubId: {type: Number, required: true, index: true},
		username: {type: String, required: true},
		type: {type: String, required: true},
		user: {type: Schema.ObjectId, ref: 'User', index: true},
		url: String,
		gravatar: String,
		contributions: {}
	}
})

ProjectSchema.statics.createIfNotExists = function (data, cb) {
	var self = this
	this.findOne({'githubId': data.githubId}, function (err, project) {
		if (err) return cb('Failed to find project');

		if (project) return self.checkForOwner(project, cb)

		project = new Project(data);

		project.save(function (err) {
			if (err) return cb('Failed to create project')
			self.checkForOwner(project, cb)
		})
	})
}

ProjectSchema.statics.updateOwner = function (user, cb) {
	var data = {'owner.user': user._id}
	_.each(user.contributions, function (val, key) {
		data['owner.contributions.' + key] = val
	})

	this.update(
		{'owner.githubId': user.github.id },
		{ $set: data},
		{ multi: true },
		function (error, projects) {
			cb && cb(error, projects)
		})
}

ProjectSchema.statics.checkForOwner = function (project, cb) {
	if (project.owner.user) return cb(null, project)

	User.findOne({'github.id': project.owner.githubId}, function (err, user) {
		if (err) return cb('Failed to retrieve project owner')
		if (!user) return cb(null, project)

		project.owner.contributions = user.contributions
		project.owner.user = user._id

		project.save(function (error) {
			if (error) return cb('Failed to update project owner')
			cb(null, project)
		})
	})
}

mongoose.model('Project', ProjectSchema)
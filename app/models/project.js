/**
 * Author: krasu
 * Date: 8/13/13
 * Time: 8:06 AM
 */
var mongoose = require('mongoose'),
	sanitizer = require('sanitizer'),
	Schema = mongoose.Schema,
	User = mongoose.model('User'),
	emailRegExp = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i

var ProjectSchema = new Schema({
	githubId: {type: Number, required: true, index: { unique: true }},

	name: {type: String, required: true},
	url: {type: String, required: true},
	homepage: {type: String, trim: true},
	description: {type: String, trim: true},
	fork: Boolean,

	admins: [
		{type: Schema.ObjectId, ref: 'User', index: true}
	],

	owner: {
		user: {type: Schema.ObjectId, ref: 'User', index: true},
		org: {type: Schema.ObjectId, ref: 'Organization', index: true},
		githubId: {type: Number, required: true, index: true},
		username: {type: String, required: true},
		type: {type: String},
		url: String,
		gravatar: String
	},

	donateMethods: {
		gittip: {type: String, trim: true},
		paypal: {type: String, trim: true},
		flattr: {type: String, trim: true},
		other: {type: String, trim: true},
		emailMe: { type: String, trim: true },
		code: Boolean
	}
})

ProjectSchema.pre('validate', function (next, done) {
	var reg = /^https:\/\/www.paypal(objects)?.com\//
	var methods = this.donateMethods

	if (!methods) return next()

	if (methods.paypal) {
		methods.paypal = sanitizer.sanitize(methods.paypal, function (value) {
			return  value.match(reg) ? value : ''
		})
	}

	if (methods.other) {
		methods.other = sanitizer.sanitize(methods.other)
	}

	if (methods.emailMe && !methods.emailMe.match(emailRegExp)) {
		methods.emailMe = ''
	}

	next()
});

ProjectSchema.statics.parseGitHubData = function (repo) {
	!repo.owner && console.log(repo)
	return {
		githubId: repo.id,
		url: repo.html_url,
		name: repo.name,
		homepage: repo.homepage,
		description: repo.description,
		fork: repo.fork,
		owner: {
			githubId: repo.owner.id,
			username: repo.owner.login,
			url: 'https://github.com/' + repo.owner.login,
			type: repo.owner.type,
			gravatar: repo.owner.gravatar_id
		},
		admins: [],
		githubData: repo
	}
}

ProjectSchema.statics.createIfNotExists = function (data, cb) {
	var self = this

	this.findOne({'githubId': data.githubId}, function (err, project) {
		if (err) return cb('Failed to find project');

		if (project) return self.checkForOwner(project, cb)

		delete data._id
		self.create(data, function (err, newProject) {
			if (err) return cb('Failed to create project')

			self.checkForOwner(newProject, cb)
		})
	})
}

ProjectSchema.statics.updateOwner = function (user, cb) {
	var data = {'owner.user': user._id}

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

		project.owner.user = user._id

		project.save(function (error) {
			if (error) return cb('Failed to update project owner')
			cb(null, project)
		})
	})
}

mongoose.model('Project', ProjectSchema)
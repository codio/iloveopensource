/**
 * Author: krasu
 * Date: 8/13/13
 * Time: 8:06 AM
 */
var mongoose = require('mongoose'),
    PayPalRegExp = /^https:\/\/www.paypal(objects)?.com/,
    emailRegExp = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
    stripTagsRegExp = /<\/?[^>]+>/g,
    _ = require('lodash'),
    sanitizer = require('html-css-sanitizer'),
    Schema = mongoose.Schema,
    User = mongoose.model('User'),
    Organization = mongoose.model('Organization')

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

ProjectSchema.methods.hasDonateMethods = function () {
	return _(this.donateMethods.toObject()).values().compact().value().length > 0
}

ProjectSchema.methods.hasOwner = function () {
	return this.owner.user || this.owner.org
}

ProjectSchema.methods.getOwner = function (cb) {
	if (!this.hasOwner()) return cb()

	var search, self = this, isUser = this.owner.user

	if (isUser) {
		search = User.findById(this.owner.user)
	} else {
		search = Organization.findById(this.owner.org)
	}

	search.exec(function (error, owner) {
		if (error) return cb('Failed to get owner')
		cb(null, owner)
	})
}

ProjectSchema.pre('validate', function (next, done) {
    var methods = this.donateMethods,
        hasMethods = _(methods.toObject()).values().compact().value().length

    if (!hasMethods) return next()

    if (methods.paypal) {
        methods.paypal = sanitizer.sanitize(methods.paypal, function (value) {
            return  PayPalRegExp.test(value) ? value : ''
        })
    }

    if (methods.other) {
        methods.other = sanitizer.smartSanitize(methods.other)
    }

    if (methods.flattr) {
        methods.flattr = methods.flattr.replace(stripTagsRegExp, '')
    }

    if (methods.gittip) {
        methods.gittip = methods.gittip.replace(stripTagsRegExp, '')
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
	var self = this, query = {}

    if (data._id) query._id = data._id
    if (data.githubId) query.githubId = data.githubId

	this.findOne(query, function (err, project) {
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
	if (project.owner.user || project.owner.org) return cb(null, project)

	var search, field
	if (project.owner.type.toLowerCase() == 'user') {
		search = User.findOne({'github.id': project.owner.githubId})
		field = 'user'
	} else {
		search = Organization.findOne({githubId: project.owner.githubId})
		field = 'org'
	}

	search.exec(function (err, entry) {
		if (err) return cb('Failed to retrieve project owner')
		if (!entry) return cb(null, project)

		project.owner[field] = entry._id

		project.save(function (error) {
			if (error) return cb('Failed to update project owner')
			cb(null, project)
		})
	})
}

mongoose.model('Project', ProjectSchema)
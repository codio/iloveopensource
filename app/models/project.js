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
		githubId: {type: Number, required: true, index: { unique: true }},
		user: {type: Schema.ObjectId, ref: 'User'},
		username: {type: String, required: true},
		type: {type: String, required: true},
		url: String,
		gravatar: String,
		support: {}
	}
})

ProjectSchema.statics.updateOwner = function (user, cb) {
	var data = {'owner.user': user._id}
	_.each(user.support, function (val, key) {
		data['owner.support.' + key] = val
	})

	this.update(
		{'owner.githubId': user.github.id },
		{ $set: data},
		{ multi: true },
		function (error, projects) {
			cb && cb(error, projects)
		})
}

ProjectSchema.statics.bulkAdd = function (newRepos, cb) {
	this.create(newRepos, function (error) {
		var projects = [].slice.call(arguments, 1)
		cb(error, projects);
	})
}

ProjectSchema.statics.checkOwners = function (projects, cb) {
	var self = this
	var owners = _.compact(_.map(projects, function (project) {
		if (project.owner.user) return
		return project.owner.githubId
	}))

	if (!owners.length) return

	User.find({'github.id': { $in: owners}}, function(err, users) {
		if (err) return console.log(err)
		_.each(users, function(user) {
			self.updateOwner(user)
		})
	})

}

ProjectSchema.statics.checkForNew = function (repos, cb) {
	var self = this
	this.find({githubId: { $in: _.pluck(repos, 'githubId')}}, function (error, projects) {
		repos = updateRepoIds(projects, repos)

		var newRepos = _.filter(repos, function (repo) {
			return !repo._id
		})

		if (!newRepos.length) return cb(error, repos);

		self.bulkAdd(newRepos, function (err, newProjects) {
			repos = updateRepoIds(newProjects, repos)
			self.checkOwners(repos)
			return cb(error, repos);
		})
	})
}

var updateRepoIds = function (existing, cheking) {
	_.each(existing, function (project) {
		var repo = _.find(cheking, {githubId: project.githubId})
		if (repo) repo._id = project._id
	})

	return cheking
}

mongoose.model('Project', ProjectSchema)
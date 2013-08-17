/**
 * Created with JetBrains PhpStorm.
 * User: krasu
 * Date: 8/13/13
 * Time: 8:06 AM
 */
var mongoose = require('mongoose'),
	_ = require('lodash'),
	Schema = mongoose.Schema

var ProjectSchema = new Schema({
	name: {type: String, required: true},
	githubId: {type: Number, required: true, index: { unique: true }},
	url: {type: String, required: true},
	fork: Boolean,
	owner: {
		githubId: {type: Number, required: true, index: { unique: true }},
		username: {type: String, required: true},
		type: {type: String, required: true},
		url: String,
		gravatar: String
	}
})

ProjectSchema.statics.bulkAdd = function (newRepos, cb) {
	this.create(newRepos, function (error) {
		var projects = [].slice.call(arguments, 1)
		cb(error, projects);
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
			return cb(error, updateRepoIds(newProjects, repos));
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
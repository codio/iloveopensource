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
	url: {type: String, required: true, index: { unique: true }}
})

ProjectSchema.statics.bulkAdd = function(newRepos, cb) {
	this.create(newRepos, function (error, projects) {
		if (!_.isArray(projects)) projects = [projects]
		cb(error, projects);
	})
}
ProjectSchema.statics.checkForNew = function(repos, cb) {
	var self = this
	this.find({url: { $in: _.pluck(repos, 'url')}}, function (error, projects) {
		updateRepoIds(projects, repos)

		var newRepos = _.filter(repos, function (repo) {
			return !repo._id
		})

		if (!newRepos.length) return cb(error, repos);

		self.bulkAdd(newRepos, function(err, newProjects) {
			updateRepoIds(newProjects, repos)
			return cb(error, repos);
		})
	})
}

var updateRepoIds = function(existing, cheking) {
	_.each(existing, function (project) {
		_.find(cheking, {url: project.url})._id = project._id
	})

	return cheking
}

mongoose.model('Project', ProjectSchema)
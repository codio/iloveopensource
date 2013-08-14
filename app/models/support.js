/**
 * Created with JetBrains PhpStorm.
 * User: krasu
 * Date: 8/13/13
 * Time: 8:06 AM
 */
var mongoose = require('mongoose'),
	_ = require('lodash'),
	Project = mongoose.model('Project'),
	async = require('async'),
	Schema = mongoose.Schema

var SupportSchema = new Schema({
	user: {type: Schema.ObjectId, ref: 'User'},
	project: {type: Schema.ObjectId, ref: 'Project'},
	donating: {type: Boolean, default: false},
	supporting: {type: Boolean, default: false},
	contributing: {type: Boolean, default: false}
})

SupportSchema.statics.getSupportByUser = function (userId, callback) {
	var self = this
	this.find({user: userId}, function (error, supports) {
		async.map(supports, self.getProjectBySupport, function (err, result) {
			callback(null, result);
		});
	})
}

SupportSchema.statics.updateSupportByUser = function (userId, repos, cb) {
	var self = this
	var support = _.map(repos, function (repo) {
		return {
			user: userId,
			project: repo._id,
			contributing: repo.support.contributing === 'true',
			donating: repo.support.donating === 'true',
			supporting: repo.support.supporting === 'true'
		}
	})

	support = _.filter(support, function(entity) {
		return (entity.contributing || entity.donating || entity.supporting)
	})

	async.series([
		function (callback) {
			self.remove({user: userId}, function (error) {
				callback(error, true);
			})
		},
		function (callback) {
			if (!support.length) return callback(null, true);

			self.create(support, function (error) {
				callback(error, true);
			})
		}
	], cb)
}

SupportSchema.statics.getProjectBySupport = function (entity, callback) {
	Project.findById(entity.project, function (err, project) {
		var result = _.pick(project.toObject(), 'name', 'url')
		result.support = _.pick(entity.toObject(), 'contributing', 'supporting', 'donating')

		callback(null, result);
	});
}

SupportSchema.index({user: 1, project: 1}, {unique: true});
mongoose.model('Support', SupportSchema)
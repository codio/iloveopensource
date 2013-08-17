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
	this.find({user: userId}).populate('project').lean().exec(function (error, supports) {
		callback(error ? 'Failed to retrieve supporting projects' : null, supports);
	})
}

SupportSchema.statics.updateSupportByUser = function (userId, repos, cb) {
	var self = this
	var support = _.map(repos, function (repo) {
		return _.extend({
			user: userId,
			project: repo._id
		}, repo.support)
	})

	support = _.filter(support, function (entity) {
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

SupportSchema.index({user: 1, project: 1}, {unique: true});
mongoose.model('Support', SupportSchema)
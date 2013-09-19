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
	relatedTo: {type: Number, default: 0, index: true},

	donating: {type: Boolean, default: false},
	supporting: {type: Boolean, default: false},
	contributing: {type: Boolean, default: false}
})

SupportSchema.statics.isEmpty = function (data) {
	return (!data.contributing && !data.supporting && !data.donating)
}

SupportSchema.statics.updateSupport = function (userData, callback) {
	var query = {
		'project': userData.project,
		'user': userData.user
	}

	var data = {
		donating: userData.donating,
		supporting: userData.supporting,
		contributing: userData.contributing
	}

	if (_.isEmpty(data)) {
		return this.remove(query, function (err) {
			if (err) return callback('Failed to unset support')
			callback(null, {})
		})
	}

	this.findOneAndUpdate(query, { $set: data }, {upsert: true}, function (err, supporting) {
		if (err) return callback('Failed to update your support')
		callback(null, supporting)
	})
}

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
/**
 * Author: krasu
 * Date: 8/13/13
 * Time: 8:06 AM
 */
var mongoose = require('mongoose'),
	_ = require('lodash'),
	Project = mongoose.model('Project'),
	Organization = mongoose.model('Organization'),
	async = require('async'),
	Schema = mongoose.Schema

var SupportSchema = new Schema({
	byUser: {type: Schema.ObjectId, ref: 'User', index: true},
	byProject: {type: Schema.ObjectId, ref: 'Project', index: true},
	byOrganization: {type: Schema.ObjectId, ref: 'Project', index: true},

	project: {type: Schema.ObjectId, ref: 'Project'},

	type: { type: String, enum: ['user', 'organization', 'project'] },

	donating: {type: Boolean, default: false},
	supporting: {type: Boolean, default: false},
	contributing: {type: Boolean, default: false}
})

SupportSchema.statics.isEmpty = function (data) {
	return (!data.contributing && !data.supporting && !data.donating)
}

SupportSchema.statics.checkRights = function (currentUser, type, id, callback) {
	var self = this,
		ObjectId = mongoose.Types.ObjectId,
		query = { type: type },
		done = function (error, entry) {
			if (error) return callback('Server error')
			if (!entry) return callback('Nothing found')

			callback(null, entry, query)
		}

	if (_.isString(id)) {
		id = new ObjectId(id);
	}

	if (type == 'organization') {
		query.byOrganization = id
		Organization.findOne({ admins: currentUser._id}, done)
	} else if (type == 'project') {
		query.byProject = id
		Project.findOne({ $or: [
			{ admins: currentUser._id},
			{ 'owner.user': currentUser._id}
		]}, done)
	} else {
		query.byUser = id
		done(null, currentUser)
	}

}

SupportSchema.statics.getProjectList = function (currentUser, type, id, callback) {
	var self = this

	self.checkRights(currentUser, type, id, function (error, entry, query) {
		if (error) return callback('You have no rights to do this')

		self.find(query).populate('project').lean().exec(function (error, supports) {
			callback(error ? 'Failed to retrieve supporting projects' : null, supports);
		})
	})
}

SupportSchema.statics.updateEntry = function (currentUser, type, id, projectId, userData, callback) {
	var self = this,
		data = _.pick(userData, 'donating', 'supporting', 'contributing');

	self.checkRights(currentUser, type, id, function (error, entry, query) {
		if (error) return callback('You have no rights to do this')

		query.project = projectId

		self.findOne(query, function (err, support) {
			if (err) return callback('Failed to update your support')

			if (!support) {
				return self.create(_.merge({}, userData, query), callback)
			}

			_.merge(support, userData)

			if (self.isEmpty(support)) {
				return support.remove(callback)
			} else {
				return support.save(callback)
			}
		})
	})
}

SupportSchema.statics.removeEntry = function (currentUser, type, id, projectId, callback) {
	this.updateEntry(currentUser, type, id, projectId, {
		donating: false,
		supporting: false,
		contributing: false
	}, callback)
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

mongoose.model('Support', SupportSchema)
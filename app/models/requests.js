/**
 * Author: krasu
 * Date: 9/18/13
 * Time: 14:21 AM
 */
var mongoose = require('mongoose'),
	_ = require('lodash'),
	Schema = mongoose.Schema

var RequestSchema = new Schema({
	supporter: {
		ref: {type: Schema.ObjectId, ref: 'User'},
		username: {type: String, trim: true },
		email: {type: String, trim: true },
		isAnon: Boolean,
		ip: {type: String, trim: true }
	},

	project: {
		ref: {type: Schema.ObjectId, ref: 'Project'},
		githubId: {type: Number},
		methodsSet: Boolean,
		methodsSetAt: Date
	},

	maintainer: {
		user: {type: Schema.ObjectId, ref: 'User'},
		org: {type: Schema.ObjectId, ref: 'Organization'},
		name: {type: String, trim: true },
		email: {type: String, trim: true },
		notified: Boolean,
		notifiedAt: Date
	},

	createdAt: Date
})


RequestSchema.pre('save', function (next) {
	if (!this.created_at) this.created_at = new Date;
	if (this.maintainer) {
		if (this.maintainer.notified && !this.maintainer.notifiedAt) {
			this.maintainer.notifiedAt = new Date
		}
	}
	next();
});

RequestSchema.statics.request = function (user, project, ip, altEmail, cb) {
	var self = this
	var owner = project.owner.org || project.owner.user || {}
	var isAnon = !user
	var query = {'project.ref': project._id}
	var request = {
		supporter: {
			ref: user && user._id,
			username: user && user.username,
			email: user.email || altEmail,
			isAnon: isAnon,
			ip: ip
		},

		project: {
			ref: project._id,
			githubId: project.githubId,
			methodsSet: _(project.donateMethods.toObject()).values().compact().value().length > 0
		},

		maintainer: {
			user: project.owner.user && project.owner.user._id,
			org: project.owner.org && project.owner.org._id,
			name: project.owner.username,
			email: owner.email,
			notified: !!owner.email
		}
	}

	if (isAnon) {
		query['supporter.isAnon'] = true
		query['supporter.ip'] = ip
	} else {
		query['supporter.ref'] = user._id
	}

	this.findOne(query, function (error, entry) {
		if (error) return cb(error && 'Server error')
		if (entry) return cb(entry && 'You already sent request for this project')
		self.create(request, cb)
	})
}

mongoose.model('Request', RequestSchema)
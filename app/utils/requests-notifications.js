/**
 * Author: krasu
 * Date: 10/4/13
 * Time: 1:07 AM
 */
var mongoose = require('mongoose'),
	async = require('async'),
	cfg = require('../../config'),
	mailer = require('../utils/mailer')


module.exports.notifyRequesters = function (project, cb) {
	var Request = mongoose.model('Request')
	var owner = project.owner.org || project.owner.user || null

	Request
		.update(
		{
			$or: [
				{'project.ref': project._id},
				{'project.githubId': project.githubId}
			],
			satisfied: false
		},
		{
			'project.methodsSet': true,
			'project.methodsSetAt': new Date,
			satisfied: true
		})
		.exec(function (error, entries) {
			if (error) return cb('Failed to get requests for project')

			async.each(entries, function (entry, callback) {
				if (!entry.supporter.email) return callback(null)

				mailer.send('donate-request-satisfied',
					[
						'Your donate methods request for project',
						project.owner.username + ' / ' + project.name,
						'satisfied'
					].join(' '),
					entry.supporter.email,
					{
						project: project
					}, callback)
			}, cb)
		})
}

module.exports.notifySupport = function (request, project, user, cb) {
	var owner = project.owner.org || project.owner.user || null

	mailer.send('donate-request-support',
		['Donate methods request from',
			(user ? user.username : 'anonymous'),
			'for ',
			(owner ? 'maintaining' : 'unclaimed'),
			' project ',
			project.owner.username + ' / ' + project.name
		].join(' '),
		cfg.emails.to,
		{
			user: user,
			project: project,
			owner: owner
		}, cb)
}

module.exports.notifyMaintainer = function (request, project, user, cb) {
	mailer.send('donate-request-maintainer',
		['Donate methods request from',
			(user ? user.username : 'anonymous'),
			'for your project ',
			project.owner.username + ' / ' + project.name
		].join(' '),
		request.maintainer.email,
		{
			user: user,
			project: project
		}, cb)
}

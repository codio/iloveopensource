/**
 * Author: krasu
 * Date: 8/17/13
 * Time: 4:44 PM
 */
var _ = require('lodash'),
	mongoose = require('mongoose'),
	async = require('async'),

	git = require('../utils/git-request'),
	ensureAuthenticated = require('../utils/ensure-auth'),

	Project = mongoose.model('Project'),
	Organization = mongoose.model('Organization'),
	Support = mongoose.model('Support'),
	User = mongoose.model('User')

module.exports = function (app) {
	app.get('/supporter', ensureAuthenticated, function (req, res) {
		res.render('repo-editor', { user: req.user, activeTab: 'supporters' });
	});

	app.get('/supporter/github/*', ensureAuthenticated, function (req, res) {
		var path = req.params[0]
		if (!path) return res.send(500, 'wrong request')

		var params = {
			access_token: req.user.authToken,
			q: req.query.q || ''
		}

		async.waterfall([
			async.apply(git.requestRepos, path, params),
			function (repos, links, callback) {
				Project.find({
					githubId: { $in: _.pluck(repos, 'githubId') }
				}, function (err, projects) {
					if (err) return callback('failed to load repos');
					callback(null, projects, repos, links)
				})
			}
		], function (error, exists, repos, links) {
			if (error) return res.send(500, error)

			res.set(links);
			res.send(_.map(repos, function (repo) {
				return _.find(exists, {githubId: repo.githubId}) || repo
			}))
		})
	})

	app.get('/supporter/support/:type/:by', ensureAuthenticated, function (req, res) {
		Support.getProjectList(req.user, req.param('type'), req.param('by'), function (error, supports) {
			if (error) return res.send(400, 'Failed to retrieve your support');
			res.send(supports)
		})
	})

	app.get('/supporter/groups', ensureAuthenticated, function (req, res) {
		Project.find({ $or: [
			{
				'owner.user': req.user._id
			},
			{
				'admins': req.user._id
			}
		]}, function (error, projects) {
			if (error) return res.send(500, 'Failed to retrieve your projects')

			var orgs = _(_.map(projects, function (entry) {
				return entry.owner.org
			})).compact().uniq().value()

			async.parallel({
				orgs: function (callback) {
					Support.find({byOrganization: {$in: orgs}}, 'byOrganization').distinct('byOrganization', callback)
				},
				projects: function (callback) {
					Support.find({byProject: {$in: _.pluck(projects, '_id')}}, 'byProject').distinct('byProject', callback)
				},
				user: function (callback) {
					Support.findOne({byUser: req.user._id}, callback)
				}
			}, function (err, support) {
				if (err) return res.send(500, 'Failed to retrieve your projects')

				var owners = {}
				_.each(projects, function (entry) {
					var group = owners[entry.owner.githubId],
						project = _.clone(entry.toObject())

					if (!group) {
						group = owners[entry.owner.githubId] = _.clone(project.owner)
						group.repos = []

						if (entry.owner.type.toLowerCase() == 'user') {
							group.hasSupport = !!support.user
						} else {
							group.hasSupport = !!_.find(support.orgs, function (id) {
								return id.toString() == entry.owner.org.toString()
							})
						}
					}

					project.hasSupport = !!_.find(support.projects, function (id) {
						return id.toString() == entry._id.toString()
					})

					group.repos.push(project)
				})

				res.send(_.values(owners))
			})
		})
	})

	app.put('/supporter/support/:type/:by/[0-9]+', ensureAuthenticated, function (req, res) {
		if (!req.body) return res.send('empty request')


		Project.createIfNotExists(req.body, function (err, project) {
			if (err) return res.send(400, err);

			Support.updateEntry(req.user, req.param('type'), req.param('by'), project._id, req.body.support, function (error, supports) {
				if (error) return res.send(400, 'Failed to update your support');
				res.send(supports)
			})
		})
	})

	app.delete('/supporter/support/:type/:by/[0-9]+', ensureAuthenticated, function (req, res) {
		if (!req.body || !req.body.id) return res.send('empty request')

		Support.removeEntry(req.user, req.param('type'), req.param('by'), req.body.id, function (error, supports) {
			if (error) return res.send(400, 'Failed to remove your support');
			res.send('removed')
		})
	})
};
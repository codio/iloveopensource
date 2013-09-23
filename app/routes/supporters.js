/**
 * Author: krasu
 * Date: 8/17/13
 * Time: 4:44 PM
 */
var _ = require('lodash'),
	mongoose = require('mongoose'),
	async = require('async'),

	git = require('../utils/git-request'),
	io = require('../utils/socket.io'),
	ensureAuthenticated = require('../utils/ensure-auth'),

	Project = mongoose.model('Project'),
	Organization = mongoose.model('Organization'),
	Support = mongoose.model('Support'),
	User = mongoose.model('User')

module.exports = function (app) {
	app.get('/supporter', ensureAuthenticated, function (req, res) {
		res.render('repo-editor', { user: req.user });
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
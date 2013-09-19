/**
 * Created with JetBrains PhpStorm.
 * User: krasu
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
	app.get('/users/:username', function (req, res) {
		User.findOne({ 'username': req.param('username') }, function (err, user) {
			if (!user) return res.render('404');

			Support.getSupportByUser(user._id, function (error, supports) {
				res.render('account', {
					user: user,
					supports: supports
				});
			})
		})
	});

	app.get('/supporter', ensureAuthenticated, function (req, res) {
		res.render('repo-editor', { user: req.user });
	});

	app.get('/update-projects', ensureAuthenticated, function (req, res) {
		var timer = 'updating projects for ' + req.user.username
		var sessionId = req.query.sessionId
		console.time(timer)

		var socket = io().sockets.socket(sessionId)
		if (!sessionId || !socket) return res.send(500, 'wrong request')

		var task = require('../utils/update-user-projects')(req.user)

		res.send('starting')

		task.on('progress', function (desc) {
			socket.emit('progress', desc)
		})
		task.on('done', function () {
			socket.emit('done')
			console.timeEnd(timer)
		})

		task.on('error', function () {
			socket.emit('error', 'failed to update')
			console.timeEnd(timer)
		})
	});

	app.get('/maintainer', ensureAuthenticated, function (req, res) {
		res.render('maintainer-editor', { user: req.user });
	});

	app.get('/github-request/*', ensureAuthenticated, function (req, res) {
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

	app.get('/maintaining-projects', ensureAuthenticated, function (req, res) {
		Project.find({ $or: [
			{
				'owner.user': req.user._id
			},
			{
				'admins': req.user._id
			}
		]}).exec(function (error, repos) {
				if (error) return res.send(500, error)
				res.send(repos)
			})
	});

	app.patch('/maintaining-projects/:project', ensureAuthenticated, function (req, res) {
		var id = req.param('project'), data = req.body.donateMethods
		if (!id) return res.send(500, 'failed to update project settings')

		Project.findOneAndUpdate({_id: id}, {donateMethods: data}, function (error, project) {
			if (error) return res.send(500, 'failed to save project settings')
			res.send(project)
		})
	});

	app.get('/settings', ensureAuthenticated, function (req, res) {
		res.render('settings', { user: req.user, error: ''});
	});

	app.post('/settings/:field', ensureAuthenticated, function (req, res) {
		var field = req.param('field')

		if (_.indexOf(['email', 'twitterName'], field) == -1) {
			return res.send(400, 'Wrong field');
		}

		var data = {}
		data[field] = req.body.value

		User.findById(req.user._id, function (err, user) {
			if (err) return res.send(400, 'Failed to find user');

			user[field] = req.body.value

			user.save(function (error) {
				if (error) return res.send(400, 'Failed to update field');
				res.send(200, 'Field saved');
			})
		});
	});
};
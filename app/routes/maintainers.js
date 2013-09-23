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
	app.get('/maintainer', ensureAuthenticated, function (req, res) {
		res.render('maintainer-editor', { user: req.user });
	});

	app.get('/maintainer/projects', ensureAuthenticated, function (req, res) {
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

	app.get('/maintainer/projects/update', ensureAuthenticated, function (req, res) {
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

	app.patch('/maintainer/projects/:project', ensureAuthenticated, function (req, res) {
		var id = req.param('project'), data = req.body.donateMethods
		if (!id) return res.send(500, 'failed to update project settings')

		Project.findOneAndUpdate({_id: id}, {donateMethods: data}, function (error, project) {
			if (error) return res.send(500, 'failed to save project settings')
			res.send(project)
		})
	});
};
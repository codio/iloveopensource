/**
 * Created with JetBrains PhpStorm.
 * User: krasu
 * Date: 8/22/13
 * Time: 2:23 PM
 */
var cfg = require('../../config'),
	async = require('async'),
	_ = require('lodash'),
	ejs = require('ejs'),
	fs = require('fs'),
	path = require('path'),
	templatesDir = path.join(__dirname, '..', '/views/emails/'),
	ensureAuthenticated = require('../utils/ensure-auth'),
	mongoose = require('mongoose'),
	Project = mongoose.model('Project'),
	User = mongoose.model('User')

module.exports = function (app) {
	var templates = {}

	fs.readdir(templatesDir, function (err, files) {
		if (err) throw err;
		files.forEach(function (file) {
			fs.readFile(templatesDir + file, 'utf-8', function (err, data) {
				templates[file.replace('.ejs', '')] = data
			});
		});

		app.post('/emails/request-contribution/:projectId?', ensureAuthenticated, function (req, res) {
			var data = req.body.projectData || {}
			data._id = data._id || req.param('projectId')

			sendMessage(data,
				req.body.message,
				req.user,
				templates['request-contribution'],
				function (project) {
					return [
						'Contribution request from',
						req.user.username,
						'for your project ',
						project.owner.username + ' / ' + project.name
					].join(' ')
				},
				function (error, result) {
					if (error) {
						return res.send(400, 'Failed to send your email')
					}

					res.send('ok')
				})
		});

		app.post('/emails/comment-for-author/:projectId?', ensureAuthenticated, function (req, res) {
			var data = req.body.projectData || {}
			data._id = data._id || req.param('projectId')

			sendMessage(data,
				req.body.message,
				req.user,
				templates['comment-for-author'],
				function (project) {
					return [
						'Comment from',
						req.user.username,
						'for your project ',
						project.owner.username + ' / ' + project.name
					].join(' ')
				},
				function (error, result) {
					if (error) {
						return res.send(400, 'Failed to send your email')
					}

					res.send('ok')
				})
		});
	});
};

function sendMessage(project, message, currentUser, template, subjectCb, userCb) {
	if (!project || _.isEmpty(project)) return userCb('Wrong params')

	var projectId = project._id
	var mailOptions = {
		from: cfg.emails.from,
		to: cfg.emails.to
	}

	async.waterfall([
		function (cb) {
			if (projectId) return cb(null, true)
			Project.createIfNotExists(project, cb)
		},
		function (project, cb) {
			Project.findById(projectId || project._id).populate('owner.user').exec(cb)
		},
		function (project, cb) {
			mailOptions.subject = subjectCb(project)

			if (project.owner.user && project.owner.user.email) {
				mailOptions.to += ',' + project.owner.user.email
			}

			mailOptions.html = ejs.render(template, {
				serverUrl: 'http://' + cfg.hostname,
				user: currentUser,
				project: project,
				message: message
			})

			cb(null, mailOptions)
		},
		cfg.emails.transport.sendMail
	], userCb)
}
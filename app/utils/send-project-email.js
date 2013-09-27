/**
 * Author: krasu
 * Date: 9/27/13
 * Time: 4:00 PM
 */
var cfg = require('../../config'),
	async = require('async'),
	_ = require('lodash'),
	ejs = require('ejs'),
	fs = require('fs'),
	path = require('path'),
	templatesDir = path.join(__dirname, '..', '/views/emails/'),
	mongoose = require('mongoose'),
	Project = mongoose.model('Project'),
	User = mongoose.model('User'),
	templates = {}


fs.readdir(templatesDir, function (err, files) {
	if (err) throw err;
	files.forEach(function (file) {
		fs.readFile(templatesDir + file, 'utf-8', function (err, data) {
			templates[file.replace('.ejs', '')] = data
		});
	});
});

module.exports = function (projectData, message, currentUser, templateName, subjectCb, userCb) {
	if (!projectData || _.isEmpty(projectData)) return userCb('Wrong params')

	var projectId = projectData._id
	var mailOptions = {
		from: cfg.emails.from,
		to: cfg.emails.to
	}

	async.waterfall([
		function (cb) {
			if (projectId) return cb(null, true)
			Project.createIfNotExists(projectData, cb)
		},
		function (project, cb) {
			Project.findById(projectId || project._id).exec(cb)
		},
		function (project, cb) {
			mailOptions.subject = subjectCb && subjectCb(project)

			if (project.donateMethods.emailMe) {
				mailOptions.to += ',' + project.donateMethods.emailMe
			}

			mailOptions.html = ejs.render(templates[templateName], {
				serverUrl: cfg.fullUrl(),
				user: currentUser,
				project: project,
				message: message
			})

			cb(null, mailOptions)
		},
		cfg.emails.transport.sendMail
	], userCb)
}
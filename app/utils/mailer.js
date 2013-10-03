/**
 * Author: krasu
 * Date: 10/3/13
 * Time: 5:40 PM
 */
var cfg = require('../../config'),
	async = require('async'),
	_ = require('lodash'),
	ejs = require('ejs'),
	fs = require('fs'),
	templates = {}

module.exports.fillTemplates = function (dir, callback) {
	if (!_.isEmpty(templates)) return
	console.log('Reading email templates from', dir)

	fs.readdir(dir, function (err, files) {
		if (err) return callback(err);

		async.each(files, function (file, cb) {
			fs.readFile(dir + file, 'utf-8', function (err, data) {
				templates[file.replace('.ejs', '')] = data
				cb.apply(this, arguments)
			});
		}, callback);
	});
}

module.exports.send = function (templateName, subject, to, data, callback) {
	var template = templates[templateName]
	if (!template) return callback('No such template')

	cfg.emails.transport.sendMail({
		from: cfg.emails.from,
		subject: subject,
		to: to,
		html: ejs.render(template, _.merge(data, {siteUrl: cfg.fullUrl()}))
	}, function (error) {
		error && console.error(error)
		callback(error ? 'Failed to send email' : null)
	})
}
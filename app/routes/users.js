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
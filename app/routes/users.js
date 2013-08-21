/**
 * Created with JetBrains PhpStorm.
 * User: krasu
 * Date: 8/17/13
 * Time: 4:44 PM
 */
var _ = require('lodash'),
	mongoose = require('mongoose'),
	async = require('async'),
	ensureAuthenticated = require('../utils/ensure-auth')
Project = mongoose.model('Project'),
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

	app.get('/users/:username/editor', ensureAuthenticated, function (req, res) {
		res.render('repo-editor', { user: req.user });
	});

	app.get('/settings', ensureAuthenticated, function (req, res) {
		res.render('settings', { user: req.user, error: '' });
	});

	app.get('/widgets', ensureAuthenticated, function (req, res) {
		res.render('widgets', { user: req.user, error: '' });
	});

	app.post('/settings/:field', ensureAuthenticated, function (req, res) {
		var field = req.param('field').split('.')

		if (_.indexOf(['contributions', 'email', 'twitterName'], field[0]) == -1) {
			return res.send(400, 'Wrong field');
		}

		var data = {}
		data[field.join('.')] = req.body.value

		User.findById(req.user._id, function (err, user) {
			if (err) return res.send(400, 'Failed to find user');

			if (field.length > 1) {
				user.contributions[field[1]] = req.body.value
			} else {
				user[field[0]] = req.body.value
			}

			user.save(function (error) {
				if (error) return res.send(400, 'Failed to update field');
				res.send(200, 'Field saved');
			})
		});
	});
};
/**
 * Author: krasu
 * Date: 8/17/13
 * Time: 4:44 PM
 */
var _ = require('lodash'),
	mongoose = require('mongoose'),
	async = require('async'),
	ensureAuthenticated = require('../utils/ensure-auth'),

	Project = mongoose.model('Project'),
	Organization = mongoose.model('Organization'),
	Support = mongoose.model('Support'),
	User = mongoose.model('User')

module.exports = function (app) {
	app.get('/users/:username', function (req, res) {
		User.findOne({ 'username': req.param('username') }, function (err, user) {
			if (!user) return res.render('404');

			async.parallel({
				personalSupport: function (callback) {
					Support.find({byUser: user._id}).populate('project').exec(callback)
				},
				projects: function (callback) {
					Project.find({$or: [
						{'owner.user': user._id},
						{admins: user._id}
					]}, callback)
				},
				orgs: function (callback) {
					Organization.find({admins: user._id}, callback)
				}
			}, function (error, results) {
				if (error) return res.send(500, 'Server error, please try later')

				res.render('account', {
					user: user,
					projects: {
						personal: _.filter(results.projects, function (entry) {
							return (entry.owner.user + '') == (user._id + '')
						}),
						admin: _.filter(results.projects, function (entry) {
							return entry.owner.org
						})
					},
					orgs: results.orgs,
					support: {
						personal: results.personalSupport
					}
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
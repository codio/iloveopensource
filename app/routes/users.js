/**
 * Created with JetBrains PhpStorm.
 * User: krasu
 * Date: 8/17/13
 * Time: 4:44 PM
 */
var _ = require('lodash'),
	mongoose = require('mongoose'),
	async = require('async'),
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
					supports: supports,
					isCurrentUser: req.isAuthenticated() && req.user._id == user._id,
					isLoggedIn: req.isAuthenticated()
				});
			})
		})
	});

	app.get('/users/:username/editor', ensureAuthenticated, function (req, res) {
		Support.getSupportByUser(req.user._id, function (error, supports) {
			res.render('repo-editor', { user: req.user, supports: supports });
		})
	});

	app.get('/settings', ensureAuthenticated, function (req, res) {
		res.render('settings', { user: req.user, error: '' });
	});

	app.post('/settings/:field', ensureAuthenticated, function (req, res) {
		var field = req.param('field').split('.')

		if (_.indexOf(['support', 'email', 'twitterName'], field[0]) == -1) {
			return res.send(400, 'Wrong field');
		}

		if (field.length > 1 && _.indexOf(['gittip', 'paypal', 'code', 'other', 'emailMe'], field[1]) == -1) {
			return res.send(400, 'Wrong field');
		}

		var data = {}
		data[field.join('.')] = req.body.value

		User.findByIdAndUpdate(req.user._id, { $set: data}, function (err, user) {
			req.user = user
			if (err) return res.send(400, 'Failed to update field');
			res.send(200, 'Field saved');
		});
	});

	app.put('/save-projects', ensureAuthenticated, function (req, res) {
		var repos = req.body

		async.waterfall([
			function (callback) {
				Project.checkForNew(repos, callback)
			},
			function (projects, callback) {
				Support.updateSupportByUser(req.user._id, projects, callback)
			}
		], function (err, results) {
			if (err) return res.send(400, 'Unable to update packages')
			return res.send(200, repos)
		});
	});
};


function ensureAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}

	req.session.redirectUrl = req.url;
	res.redirect('/');
}

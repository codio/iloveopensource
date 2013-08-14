/*
 * GET home page.
 */

var passport = require('passport'),
	_ = require('lodash'),
	mongoose = require('mongoose'),
	async = require('async'),
	Project = mongoose.model('Project'),
	Support = mongoose.model('Support'),
	User = mongoose.model('User')

module.exports = function (app) {
	app.get('/auth/github', passport.authenticate('github'));

	app.get('/auth/github/callback', function (req, res, next) {
		passport.authenticate('github', function (err, user, info) {
			var redirectUrl = '/users/' + user.username;

			if (err) {
				return next(err);
			}

			if (!user) {
				return res.redirect('/');
			}

			if (req.session.redirectUrl) {
				redirectUrl = req.session.redirectUrl;
				req.session.redirectUrl = null;
			}

			req.logIn(user, function (err) {
				if (err) {
					return next(err);
				}
			});
			res.redirect(redirectUrl);
		})(req, res, next);
	});

	app.get('/logout', function (req, res) {
		req.logout();
		res.redirect('/');
	});

	app.get('/', function (req, res) {
		res.render('index', { user: req.user });
	});

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

	app.post('/save-projects', ensureAuthenticated, function (req, res) {
		var repos = !_.isArray(req.body.repos) ? [] : req.body.repos

		async.waterfall([
			function (callback) {
				Project.checkForNew(repos, callback)
			},
			function (projects, callback) {
				Support.updateSupportByUser(req.user._id, projects, callback)
			}
		], function (err, results) {
			if (err) return res.send(400, 'Unable to update packages')
			return res.send(200, 'done')
		});
	});

	function ensureAuthenticated(req, res, next) {
		if (req.isAuthenticated()) {
			return next();
		}

		req.session.redirectUrl = req.url;
		res.redirect('/');
	}
};

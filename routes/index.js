/*
 * GET home page.
 */

var passport = require('passport')

module.exports = function (app) {
	app.get('/auth/github', passport.authenticate('github'));

	app.get('/auth/github/callback', passport.authenticate('github', {
		failureRedirect: '/login',
		successRedirect: '/account'
	}));


	app.get('/logout', function (req, res) {
		req.logout();
		res.redirect('/');
	});
	app.get('/', function (req, res) {
		res.render('index', { user: req.user });
	});

	app.get('/account', ensureAuthenticated, function (req, res) {
		res.render('account', { user: req.user });
	});

	app.get('/login', function (req, res) {
		res.render('login', { user: req.user });
	});


	function ensureAuthenticated(req, res, next) {
		if (req.isAuthenticated()) {
			return next();
		}
		res.redirect('/login')
	}
};

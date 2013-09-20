var passport = require('passport')

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

	require('./users')(app)
	require('./supporters')(app)
	require('./maintainers')(app)
	require('./projects')(app)
	require('./emails')(app)
};

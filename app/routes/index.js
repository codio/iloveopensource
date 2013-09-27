var passport = require('passport')

module.exports = function (app) {
	app.get('/auth/github', passport.authenticate('github'));

	app.get('/auth/github/callback', function (req, res, next) {
		passport.authenticate('github', function (err, user, info) {
			if (err) return next(err);
			if (!user) return res.redirect('/');

			req.logIn(user, function (err) {
				if (err) return next(err);
				res.redirect(getRedirectUrl(req.session));
			});
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
	require('./organizations')(app)
	require('./projects')(app)
	require('./supporters')(app)
	require('./maintainers')(app)
	require('./service')(app)
};

function getRedirectUrl(session) {
	var redirectUrl = '/supporter/';
	if (session.redirectUrl) {
		redirectUrl = session.redirectUrl;
		session.redirectUrl = null;
	}

	return redirectUrl
}
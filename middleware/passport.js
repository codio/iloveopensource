/**
 * Created with JetBrains PhpStorm.
 * User: krasu
 * Date: 8/4/13
 * Time: 6:15 PM
 */
var passport = require('passport'),
	cfg = require('../config'),
	GitHubStrategy = require('passport-github').Strategy;

passport.serializeUser(function (user, done) {
	done(null, user);
});

passport.deserializeUser(function (obj, done) {
	done(null, obj);
});

var callbackUrl = 'http://' + cfg.hostname
if (cfg.github.usePort) {
	callbackUrl += ':' + cfg.port
}
callbackUrl += '/auth/github/callback'
console.log(callbackUrl)

passport.use(new GitHubStrategy({
		clientID: cfg.github.clientId,
		clientSecret: cfg.github.clientSecret,
		callbackURL: callbackUrl
	},
	function (accessToken, refreshToken, profile, done) {
		profile.accessToken = accessToken
		profile.avatar = profile._json.avatar_url
		profile.type = profile._json.type
		profile.url = profile._json.html_url

		delete profile._json
		delete profile.raw
		return done(null, profile);
	}
));

module.exports = passport
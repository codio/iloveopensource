/**
 * Author: krasu
 * Date: 8/4/13
 * Time: 6:15 PM
 */
var passport = require('passport'),
	cfg = require('../../config'),
	GitHubStrategy = require('passport-github').Strategy,
	mongoose = require('mongoose'),
    logger = require('winston'),
	User = mongoose.model('User')

passport.serializeUser(function (user, done) {
	done(null, user);
});

passport.deserializeUser(function (obj, done) {
	User.findOne({_id: obj._id}, function (err, user) {
		done(err, user);
	});
});

var callbackUrl = cfg.fullUrl() + '/auth/github/callback'
logger.info('GitHub callback url is', callbackUrl)

passport.use(new GitHubStrategy({
		clientID: cfg.github.clientId,
		clientSecret: cfg.github.clientSecret,
		callbackURL: callbackUrl
	},
	function (accessToken, refreshToken, profile, done) {
		User.findOneAndUpdate({ 'github.id': profile.id }, { $set: {authToken: accessToken}}, function (err, user) {
			if (user) return done(err, user)

			user = new User({
				name: profile.displayName,
				email: profile._json.email,
				username: profile.username,
				displayName: profile.username,
				provider: 'github',
				github: profile._json,
				type: profile._json.type,
				authToken: accessToken
			})

			user.register(function (err) {
				if (err) console.error(err)
				return done(err, user, true)
			})
		})
	}
));

module.exports = passport

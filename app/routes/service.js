/**
 * Author: krasu
 * Date: 9/20/13
 * Time: 7:04 PM
 */
var _ = require('lodash'),
	mongoose = require('mongoose'),
	async = require('async'),
	ensureAuthenticated = require('../utils/ensure-auth'),
	User = mongoose.model('User')

module.exports = function (app) {
	app.get('/service/projects/update/:username?', ensureAuthenticated, function (req, res) {
		if (!req.user.admin) return res.send('You should be admin')

		var query = {}
		if (req.param('username')) query['username'] = req.param('username')

		User.find(query, function (error, users) {
			if (error) return res.send(error)

			async.map(users, function (user, c) {
				var results = ['Updating repos for ' + user.username]
				var task = require('../utils/update-user-projects')(user)
					.then(function () {
						results.push('Done!')
						c(null, results)
					}, c, function (desc) {
						results.push(desc)
					});
				return results
			}, function (err, result) {
				if (err) return res.send(err)
				res.send(result)
			})
		})
	});
};

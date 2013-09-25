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
	app.get('/service/projects/update', ensureAuthenticated, function (req, res) {
		if (!req.user.admin) return res.send('You should be admin')

		User.find(function (error, users) {
			if (error) return res.send(error)

			async.map(users, function (user, c) {
				var task = require('../utils/update-user-projects')(user)
				var results = ['Updating repos for ' + user.username]

				task.on('progress', function (desc) {
					results.push(desc)
				})

				task.on('done', function () {
					results.push('Done!')
					c(null, results)
				})

				task.on('error', c)

			}, function (err, result) {
				if (err) return res.send(err)
				res.send(result)
			})
		})
	});
};

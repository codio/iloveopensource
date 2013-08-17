/**
 * Created with JetBrains PhpStorm.
 * User: krasu
 * Date: 8/17/13
 * Time: 11:09 PM
 */
var _ = require('lodash'),
	mongoose = require('mongoose'),
	User = mongoose.model('User')

module.exports = function (app) {
	app.post('/get-contributing-options', function (req, res) {
		if (!req.body.ids.length) return res.send('empty request')

		var githubIds = _.map(req.body.ids, function (id) {
			return (+id)
		})

		User.find({'github.id': { $in: githubIds }}, 'github.id support', function (err, users) {
			if (err) return res.send(400, 'Failed to retrieve users');

			res.send(users)
		})
	});
};

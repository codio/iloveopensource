/**
 * Author: krasu
 * Date: 9/23/13
 * Time: 1:41 PM
 */
var mongoose = require('mongoose'),
	async = require('async'),
	Organization = mongoose.model('Organization'),
	Project = mongoose.model('Project'),
	Support = mongoose.model('Support'),
	User = mongoose.model('User')

module.exports = function (app) {
	app.get('/orgs/:id', function (req, res) {
		Organization.findById(req.param('id')).populate('admins').exec(function (error, org) {
			if (error || !org) return res.send('400', 'There is no organization you looking for')


			async.parallel({
				support: function (callback) {
					Support.find({ byOrganization: org._id }).populate('project').exec(callback)
				},
				projects: function (callback) {
					Project.find({'owner.org': org._id}, callback)
				}
			}, function (error, results) {
				if (error) return res.send(500, 'Server error, please try later')

				res.render('organization', {
					org: org,
					projects: results.projects,
					support: results.support
				});
			})
		})
	});
};
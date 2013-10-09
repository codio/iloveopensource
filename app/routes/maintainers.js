/**
 * Author: krasu
 * Date: 8/17/13
 * Time: 4:44 PM
 */
var _ = require('lodash'),
	mongoose = require('mongoose'),
	ensureAuthenticated = require('../utils/ensure-auth'),
	projectsUpdater = require('../utils/update-user-projects'),

	Project = mongoose.model('Project'),
	Organization = mongoose.model('Organization'),
	Support = mongoose.model('Support'),
	Request = mongoose.model('Request'),
	User = mongoose.model('User')

module.exports = function (app) {
	app.get('/maintainer', ensureAuthenticated, function (req, res) {
		res.render('maintainer-editor', { user: req.user, activeTab: 'maintainers' });
	});

	app.get('/maintainer/projects/update', ensureAuthenticated, function (req, res) {
		!req.user.projectsUpdater.updating && projectsUpdater(req.user)
		res.send('started')
	})

	app.get('/maintainer/projects', ensureAuthenticated, function (req, res) {
		Project.find({ $or: [
			{
				'owner.user': req.user._id
			},
			{
				'admins': req.user._id
			}
		]}, function (error, repos) {
			if (error) return res.send(500, error)
			res.send(repos)
		})
	});

	app.patch('/maintainer/projects/:project', ensureAuthenticated, function (req, res) {
		var id = req.param('project'),
			data = req.body.donateMethods,
			wasEmpty
		if (!id) return res.send(500, 'failed to update project settings')

		Project.findById(id, function (error, entity) {
			if (error) return res.send(500, 'failed to save project settings')

			if (!entity.hasDonateMethods()) wasEmpty = true
			entity.donateMethods = data
			entity.save(function (err, project) {
				if (error) return res.send(500, 'failed to save project settings')

				if (wasEmpty) {
					Request.satisfy(project, function (error) {
						if (error) return res.send(500, 'failed to save project settings')
						res.send(entity)
					})
				} else {
					res.send(entity)
				}
			})
		})
	});
};
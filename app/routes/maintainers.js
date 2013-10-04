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
		var id = req.param('project'), data = req.body.donateMethods
		if (!id) return res.send(500, 'failed to update project settings')

		Project.findById(id, function (error, project) {
			if (error) return res.send(500, 'failed to save project settings')

            project.donateMethods = data
            project.save(function(err) {
                if (err) return res.send(500, 'failed to save project settings')
                res.send(project)
            })
		})
	});
};
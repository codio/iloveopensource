/**
 * Author: krasu
 * Date: 8/17/13
 * Time: 4:44 PM
 */
var _ = require('lodash'),
    mongoose = require('mongoose'),
    async = require('async'),
    ensureAuthenticated = require('../utils/ensure-auth'),
    Project = mongoose.model('Project'),
    Organization = mongoose.model('Organization'),
    Support = mongoose.model('Support'),
    Request = mongoose.model('Request'),
    User = mongoose.model('User')

module.exports = function (app) {
    app.get('/maintainer', ensureAuthenticated, function (req, res) {
        var callback = function () {
            res.render('maintainer-editor', { user: req.user, activeTab: 'maintainers' })
        }

        if (req.query.unsubscribe) {
            req.user.noMaintainerNotifications = true;
            req.user.save(callback)
        } else {
            callback()
        }
    });

    app.get('/maintainer/subscription/update', ensureAuthenticated, function (req, res) {
        req.user.noMaintainerNotifications = !req.user.noMaintainerNotifications;
        req.user.save(function(error) {
            if (error) res.send(500, 'Failed to update your subscription')
            res.send('ok')
        })
    });

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

        async.waterfall([
            function (callback) {
                Project.findById(id, function (error, project) {
                    if (error || !project) return callback('Can\'t find project')
                    callback(null, project)
                })
            },
            function (project, callback) {
                project.checkRights(req.user, callback)
            },
            function (project, callback) {
                if (!project.hasDonateMethods()) wasEmpty = true
                project.donateMethods = data
                project.save(function (error, project) {
                    if (error) return callback('Can\'t save project settings')
                    callback(null, project)
                })
            },
            function (project, callback) {
                if (!wasEmpty) return callback(null, project)

                Request.satisfy(project, function (error) {
                    if (error) return callback('Can\'t save project settings')
                    callback(null, project)
                })
            },
            function (project, callback) {
                if (req.user.statistics.becameMaintainerAt) return callback(null, project)

                req.user.statistics.becameMaintainerAt = new Date
                req.user.save(function (err) {
                    err && console.error(err);
                    res.set('Became-Maintainer', new Date);
                    callback(null, project)
                })
            }
        ], function (error, project) {
            if (error) return res.send(500, error)
            res.send(project)
        })
    });
};
/**
 * Author: krasu
 * Date: 8/17/13
 * Time: 11:09 PM
 */
var cfg = require('../../config'),
    _ = require('lodash'),
    async = require('async'),
    mongoose = require('mongoose'),
    ensureAuthenticated = require('../utils/ensure-auth'),
    mailer = require('../utils/mailer'),
    User = mongoose.model('User'),
    Support = mongoose.model('Support'),
    Project = mongoose.model('Project'),
    Request = mongoose.model('Request')


module.exports = function (app) {
    app.post('/projects/comment-for-author', function (req, res) {
        Project.createIfNotExists(req.body.projectData, function (error, project) {
            if (error) return res.send(500, 'Server error')
            if (!project.donateMethods.emailMe) return res.send(500, 'Author doesn\'t accepts comments')

            mailer.send('comment-for-author',
                ['Comment from',
                    (req.user ? req.user.username : 'anonymous'),
                    'for your project ',
                    project.owner.username + ' / ' + project.name
                ].join(' '),
                cfg.emails.to + ',' + project.donateMethods.emailMe,
                {
                    user: req.user,
                    project: project,
                    message: req.body.message
                },
                function (error) {
                    if (error) return res.send(500, 'Failed to send your email')

                    res.send('ok')
                })
        })
    });

    app.post('/projects/donate-request', function (req, res) {
        var data = req.body.projectData || {}
        data._id = req.body.project


        async.waterfall([
            function (callback) {
                Project.createIfNotExists(data, function (error, project) {
                    callback(error && 'Failed to find project', project)
                })
            },
            function (project, callback) {
                Request.request(req.user, project, req.realIP, req.body.email, callback)
            }
        ], function (error) {
            error && console.error(error)
            if (error) return res.send(500, error)
            res.send('Request accepted')
        })
    })

    app.post('/projects/donate-request/update-email', function (req, res) {
        var project = {
            _id: req.body.project,
            githubId: req.body.projectData && req.body.projectData.githubId
        }

        Request.updateRequesterEmail(req.user, project, req.realIP, req.body.email, function (error) {
            if (error) return res.send(500, 'Please enter valid email address')
            res.send('ok')
        })
    })

    app.get('/projects/:id', function (req, res) {
        if (!req.param('id')) return res.send(400, 'empty request')

        Project.findById(req.param('id'), function (err, project) {
            if (err) return res.send(400, err);

            Support.find({byProject: project._id}).populate('project')
                .exec(function (error, result) {
                    if (error) return res.send(500, err)

                    res.render('project', {
                        supporting: result,
                        project: project
                    })
                })
        })
    })

    app.get('/projects/:id/subscribe/:type(supporting|donating|contributing)/:state', ensureAuthenticated, function (req, res) {
        var type = req.param('type')
        var id = req.param('id')
        if (!type || !id) return res.send(500, 'empty request')

        var data = {}
        data[type] = req.param('state') == 'true'

        Project.findById(id, function (err) {
            if (err) return res.send(400, 'project not found');

            Support.updateEntry(req.user, 'user', req.user._id, id, data, function (err) {
                if (err) return res.send(500, 'Failed to update your support')
                res.send('ok')
            })
        })
    })
};

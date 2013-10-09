/**
 * Author: krasu
 * Date: 9/20/13
 * Time: 7:04 PM
 */
var _ = require('lodash'),
    mongoose = require('mongoose'),
    async = require('async'),
    ensureAuth = require('../utils/ensure-auth'),
    ensureAdmin = function (req, res, next) {
        ensureAuth(req, res, function () {
            if (!req.user.admin) return res.send(403, 'You should be admin')
            return next();
        })
    },
    RequsetsConverter = require('../utils/requests-converter'),
    Request = mongoose.model('Request'),
    Requester = mongoose.model('Requester'),
    Project = mongoose.model('Project'),
    User = mongoose.model('User')

module.exports = function (app) {
    app.get('/service/projects/update/:username?', ensureAdmin, function (req, res) {
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

    app.get('/service/requests/fix', ensureAdmin, function (req, res) {
        RequsetsConverter(function (error, result) {
            if (error) return res.send(error)
            res.send(result)
        })
    });

    app.get('/service/donation-requests', ensureAdmin, function (req, res) {
        res.render('service/donation-requests')
    });

    app.get('/service/requests', ensureAdmin, function (req, res) {
        var query = {}

//        query['project.methodsSet'] = req.query.methodsSet ? true : false
        query['maintainer.notified'] = req.query.notified ? true : false

        if (req.query.search) {
            var term = (req.query.search + '').toLowerCase().replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1")
            query['project.name'] = new RegExp(term, "i")
        }

        Request.find(query)
            .sort({updatedAt: -1})
            .populate('project.ref')
            .exec(function (error, requests) {
                if (error) return res.send(500, 'Failed to fetch requests')
                res.send(requests)
            })
    });

    app.put('/service/requests/:id', ensureAdmin, function (req, res) {
        Request.findById(req.param('id'), function (error, request) {
            if (error || !request) return res.send(500, 'Failed to fetch request')

            request.maintainer.email = req.body.maintainer.email
            request.save(function (err) {
                if (err) return res.send(500, 'Failed to update request')
                res.send(req.body)
            })
        })
    });

    app.get('/service/requests/:id/notify', ensureAdmin, function (req, res) {
        Request.findById(req.param('id')).populate('project.ref supporters').exec(function (error, request) {
            if (error || !request) return res.send(500, 'Failed to fetch request')

            request.supportNotifyMaintainer(function (err, request) {
                if (err) return res.send(500, 'Failed to notify maintainer')
                res.send(request)
            })
        })
    });

    app.get('/service/requests/:id/supporters', ensureAdmin, function (req, res) {
        Requester.find({request: req.param('id')})
            .populate('ref')
            .sort({_id: -1})
            .exec(function (error, supporters) {
                if (error) return res.send(500, 'Failed to fetch supporters')
                res.send(_.map(supporters, function (entry) {
                    var createdAt = entry._id.getTimestamp()
                    entry = entry.toObject()
                    entry.createdAt = createdAt
                    return entry
                }))
            })
    });
};


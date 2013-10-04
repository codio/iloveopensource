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
        Request.find({satisfied: false, 'maintainer.notified': false})
            .populate('project.ref')
            .exec(function (error, requests) {
                console.log(requests)
                if (error) return res.send(500, 'Failed to fetch requests')
                res.send(requests)
            })
    });
};


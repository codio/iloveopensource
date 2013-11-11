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
    User = mongoose.model('User')

module.exports = function (app) {

    app.get('/users/:username', function (req, res) {
        async.waterfall([
            function (callback) {
                User.findOne({ 'username': req.param('username') }).exec(callback)
            },
            function (user, callback) {
                if (!user) return callback(true);
                Organization.find({publicAdmins: user._id})
                    .exec(function(error, orgs) {
                        if (error) return callback(error)

                        user.orgs = orgs
                        callback(null, user)
                    })
            }
        ], function (err, user) {
            if (err) return res.send(404)

            async.parallel({
                personalSupport: function (callback) {
                    Support.find({byUser: user._id}).populate('project').exec(callback)
                },
                ownProjects: function (callback) {
                    Project.find({'owner.user': user._id}, callback)
                },
                adminProjects: function (callback) {
                    Project.find({
                        admins: user._id,
                        'owner.org': {$in: _.pluck(user.orgs, '_id')}
                    }, callback)
                }
            }, function (error, results) {
                if (error) return res.send(500, 'Server error, please try later')

                res.render('account', {
                    user: user,
                    projects: {
                        personal: results.ownProjects,
                        admin: results.adminProjects
                    },
                    orgs: user.orgs,
                    support: {
                        personal: results.personalSupport
                    }
                });
            })
        })

    })

    app.get('/settings', ensureAuthenticated, function (req, res) {
        res.render('settings', { user: req.user, error: ''});
    });

    app.post('/settings/:field', ensureAuthenticated, function (req, res) {
        var field = req.param('field')

        if (_.indexOf(['email', 'twitterName'], field) == -1) {
            return res.send(400, 'Wrong field');
        }

        var data = {}
        data[field] = req.body.value

        User.findById(req.user._id, function (err, user) {
            if (err) return res.send(400, 'Failed to find user');

            user[field] = req.body.value

            user.save(function (error) {
                if (error) return res.send(400, 'Failed to update field');
                res.send(200, 'Field saved');
            })
        });
    });
}
;
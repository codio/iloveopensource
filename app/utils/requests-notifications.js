/**
 * Author: krasu
 * Date: 10/4/13
 * Time: 1:07 AM
 */
var mongoose = require('mongoose'),
    _ = require('lodash'),
    async = require('async'),
    cfg = require('../../config'),
    mailer = require('../utils/mailer')


module.exports.notifyRequesters = function (project, cb) {
    var Request = mongoose.model('Request')
    Request.findOne({
        $or: [
            {'project.ref': project._id},
            {'project.githubId': project.githubId}
        ],
        satisfied: false
    }).populate('supporters').exec(function (error, request) {
            if (error) return cb('Failed to get requests for project')
            if (!request) return cb()

            async.each(request.supporters, function (entry, callback) {
                if (!entry.email) return callback(null)

                mailer.send('donate-request-satisfied',
                    [
                        'Your donate methods request for project',
                        project.owner.username + ' / ' + project.name,
                        'satisfied'
                    ].join(' '),
                    entry.email,
                    {
                        project: project
                    }, callback)
            }, function (err) {
                if (err) return cb('Failed to get requests for project')

                request.satisfied= true
                request.project.methodsSet= true
                request.project.methodsSetAt= new Date
                request.save(cb)
            })
        })
}

module.exports.notifySupport = function (request, project, user, cb) {
    var owner = project.owner.org || project.owner.user || null

    mailer.send('donate-request-support',
        ['Donate methods request from',
            (user ? user.username : 'anonymous'),
            'for ',
            (owner ? 'maintaining' : 'unclaimed'),
            ' project ',
            project.owner.username + ' / ' + project.name
        ].join(' '),
        cfg.emails.to,
        {
            user: user,
            project: project,
            owner: owner
        }, cb)
}

module.exports.notifyMaintainer = function (request, project, user, cb) {
    mailer.send('donate-request-maintainer',
        ['Donate methods request from',
            (user ? user.username : 'anonymous'),
            'for your project ',
            project.owner.username + ' / ' + project.name
        ].join(' '),
        request.maintainer.email,
        {
            user: user,
            project: project
        }, cb)
}

module.exports.supportNotifyMaintainer = function (request, cb) {
    var users = _.filter(request.supporters, function (entry) {
            return !entry.isAnon
        }),
        anons = _.filter(request.supporters, function (entry) {
            return entry.isAnon
        }),
        usersCount = users.length,
        anonsCount = anons.length

    mailer.send('donate-request-notify-maintainer',
        'Donate methods request from I Love Open Source for your project '
            + request.project.ref.owner.username + ' / ' + request.project.ref.name,
        request.maintainer.email,
        {
            request: request,
            project: request.project.ref,
            users: users,
            usersCount: usersCount,
            anonsCount: anonsCount,
            totalCount: usersCount + anonsCount
        },
        cb)
}

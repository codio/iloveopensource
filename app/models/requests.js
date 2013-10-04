/**
 * Author: krasu
 * Date: 9/18/13
 * Time: 14:21 AM
 */
var mongoose = require('mongoose'),
    async = require('async'),
    _ = require('lodash'),
    notifier = require('../utils/requests-notifications')
Schema = mongoose.Schema

var RequestSchema = new Schema({
    supporter: {
        ref: {type: Schema.ObjectId, ref: 'User'},
        username: {type: String, trim: true },
        email: {type: String, trim: true },
        isAnon: {type: Boolean, default: false},
        ip: {type: String, trim: true }
    },

    project: {
        ref: {type: Schema.ObjectId, ref: 'Project'},
        githubId: {type: Number},
        methodsSet: {type: Boolean, default: false},
        methodsSetAt: Date
    },

    maintainer: {
        user: {type: Schema.ObjectId, ref: 'User'},
        org: {type: Schema.ObjectId, ref: 'Organization'},
        name: {type: String, trim: true },
        email: {type: String, trim: true },
        notified: {type: Boolean, default: false},
        notifiedAt: Date
    },

    satisfied: {type: Boolean, default: false},
    createdAt: Date
})


RequestSchema.pre('save', function (next) {
    if (!this.created_at) this.created_at = new Date;
    if (this.maintainer) {
        if (this.maintainer.notified && !this.maintainer.notifiedAt) {
            this.maintainer.notifiedAt = new Date
        }
    }
    next();
});

RequestSchema.statics.satisfy = function (project, cb) {
    if (!project.hasDonateMethods()) return cb('No donate methods')
    notifier.notifyRequesters(project, cb)
}

RequestSchema.statics.request = function (user, project, ip, altEmail, cb) {
    var self = this
    var owner = project.hasOwner()
    var isAnon = !user
    var query = {'project.ref': project._id}
    var request = {
        supporter: {
            ref: user && user._id,
            username: user && user.username,
            email: (user && user.email) || altEmail,
            isAnon: isAnon,
            ip: ip
        },

        project: {
            ref: project._id,
            githubId: project.githubId,
            methodsSet: project.hasDonateMethods()
        },

        maintainer: {
            user: project.owner.user && project.owner.user._id,
            org: project.owner.org && project.owner.org._id,
            name: project.owner.username,
            notified: false
        }
    }

    if (isAnon) {
        query['supporter.isAnon'] = true
        query['supporter.ip'] = ip
    } else {
        query['supporter.ref'] = user._id
    }

    async.series([
        function (callback) {
            self.findOne(query, function (error, entry) {
                if (error) return callback(error && 'Server error')
                if (entry) return callback(entry && 'You already sent request for this project')
                callback()
            })
        },
        function (callback) {
            project.getOwner(function (error, owner) {
                if (error) return callback(error)

                if (owner) {
                    request.maintainer.email = owner.email
                    request.maintainer.notified = !!owner.email
                }
                callback()
            })
        }
    ], function (error) {
        if (error) return cb(error)

        async.parallel({
            saving: function (callback) {
                self.create(request, function (error, entry) {
                    if (error) return callback(error && 'Failed to save your request')
                    callback(null)
                })
            },
            notification: function (callback) {
                if (request.maintainer.email) {
                    notifier.notifyMaintainer(request, project, user, callback)
                } else {
                    notifier.notifySupport(request, project, user, callback)
                }
            }
        }, cb)
    })
}

mongoose.model('Request', RequestSchema)


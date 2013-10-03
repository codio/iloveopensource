/**
 * Author: krasu
 * Date: 10/3/13
 * Time: 10:20 PM
 */
var _ = require('lodash'),
    mongoose = require('mongoose'),
    async = require('async'),
    Request = mongoose.model('Request'),
    Project = mongoose.model('Project'),
    User = mongoose.model('User')

module.exports = RequestsConverter

function RequestsConverter(callback) {
    if (!(this instanceof RequestsConverter))
        return new RequestsConverter(callback);

    async.waterfall([
        this.fetch,
        this.update,
        this.save
    ], callback)
}

RequestsConverter.prototype.fetch = function (callback) {
    Request.find({supporter: {$exists: false}}, function (error, requests) {
        if (error) return callback(error)

        //removing duplicates
        var ids = []
        requests = _.compact(_.map(requests, function (entity) {
            entity = entity.toObject()

            var id
            if (entity.project instanceof mongoose.Types.ObjectId) {
                id = entity.project
                entity.projectId = entity.project
            } else {
                id = entity.projectGitId
            }

            id += (entity.user || entity._id)
            if (_.indexOf(ids, id) != -1) return

            ids.push(id)
            return entity
        }))

        callback(null, requests)
    })
}

RequestsConverter.prototype.update = function (requests, callback) {
    async.map(requests, function (entity, c) {
        async.parallel({
            project: function (cb) {
                var query = {}

                if (entity.projectId) {
                    query._id = entity.projectId
                } else {
                    query.githubId = entity.projectGitId
                }

                Project.findOne(query).populate(['owner.user', 'owner.org']).exec(cb)
            },
            user: function (cb) {
                if (!entity.user) return cb(null)
                User.findById(entity.user, cb)
            }
        }, function (err, results) {
            if (err) return c(err)
            if (!results.project) return c(null)

            var project = results.project
            var user = results.user
            var owner = project.owner.org || project.owner.user || {}

            c(null, {
                supporter: {
                    ref: user && user._id,
                    username: user && user.username,
                    email: user && user.email,
                    isAnon: !user
                },

                project: {
                    ref: project._id,
                    githubId: project.githubId,
                    name: project.owner.username + '/' + project.name,
                    methodsSet: _(project.donateMethods.toObject()).values().compact().value().length > 0
                },

                maintainer: {
                    user: project.owner.user && project.owner.user._id,
                    org: project.owner.org && project.owner.org._id,
                    name: project.owner.username,
                    email: owner.email,
                    notified: !!owner.email
                },

                _id: entity._id,
                createdAt: entity._id.getTimestamp()
            })
        })
    }, function (error, result) {
        if (error) return callback(error)

        var ids = []
        result = _.compact(_.map(_.compact(result), function (entity) {
            var id = entity.project.ref + (entity.user || entity._id)
            if (_.indexOf(ids, id) != -1) return

            ids.push(id)
            delete entity._id
            return entity
        }))

        callback(null, result)
    })
}
RequestsConverter.prototype.save = function (requests, callback) {
    async.parallel({
        removed: function (cb) {
            Request.remove({supporter: {$exists: false}}, cb)
        },
        created: function (cb) {
            Request.create(requests, cb)
        }
    }, callback)
}
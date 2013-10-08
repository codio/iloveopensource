/**
 * Author: krasu
 * Date: 10/3/13
 * Time: 10:20 PM
 */
var _ = require('lodash'),
    mongoose = require('mongoose'),
    moment = require('moment'),
    async = require('async'),
    Request = mongoose.model('Request'),
    Requester = mongoose.model('Requester'),
    Project = mongoose.model('Project'),
    User = mongoose.model('User')

module.exports = RequestsConverter

function RequestsConverter(callback) {
    if (!(this instanceof RequestsConverter))
        return new RequestsConverter(callback);

    async.series([
        _.bind(this.fetchRequests, this),
        _.bind(this.fetchProjects, this),
        _.bind(this.fetchUsers, this),
        _.bind(this.updateRequests, this),
        _.bind(this.updateSupporters, this),
        _.bind(this.cleanup, this)
    ], _.bind(function (error) {
        error && console.error(error)
        callback(error, {
            unhandledRequests: this.unhandledRequests,
            newRequests: this.newReqs,
            oldRequests: this.oldReqs
        })
    }, this))
}

RequestsConverter.prototype.cleanup = function (callback) {
    Request.remove({maintainer: {$exists: false}}, callback)
}

RequestsConverter.prototype.updateSupporters = function (callback) {
    var supporters = _.flatten(_.pluck(this.newReqs, 'supporters'))

    async.map(supporters, function (entry, cb) {
        entry.save(cb)
    }, callback)
}

RequestsConverter.prototype.updateRequests = function (callback) {
    this.prepareRequests()
    async.map(this.newReqs, function (req, cb) {
        req.req.save(function (error, request) {
            if (error) return cb(error);
            req.req = request
            req.supporters = _.map(req.supporters, function (entry) {
                entry.request = request._id
                return entry
            })
            cb(null, req)
        })
    }, callback)
}

RequestsConverter.prototype.fetchUsers = function (callback) {
    var self = this
    var ids = _.compact(_.uniq(_.map(self.oldReqs, function (entity) {
        return entity.user instanceof mongoose.Types.ObjectId && entity.user.toString()
    })))

    User.find({_id: {$in: ids}}, function (error, users) {
        self.users = {}
        _.each(users, function (user) {
            self.users[user._id.toString()] = user.toObject()
        })
        callback(error)
    })
}

RequestsConverter.prototype.fetchProjects = function (callback) {
    var self = this
    var projectIds = _.compact(_.uniq(_.map(self.oldReqs, function (entity) {
        return entity.project instanceof mongoose.Types.ObjectId && entity.project.toString()
    })))
    var gitHubIds = _.compact(_.uniq(_.map(self.oldReqs, function (entity) {
        return entity.projectGitId
    })))

    Project.find({$or: [
        {_id: {$in: projectIds}},
        {githubId: {$in: gitHubIds}},
    ]})
        .populate(['owner.user', 'owner.org'])
        .exec(function (error, projects) {
            self.checkUnhandled(gitHubIds)
            self.projects = projects
            callback(error)
        })
}

RequestsConverter.prototype.fetchRequests = function (callback) {
    var self = this
    Request.find({supporters: {$exists: false}}, function (error, requests) {
        self.oldReqs = _.map(requests, function (entity) {
            return entity.toObject()
        })
        callback(error)
    })
}

RequestsConverter.prototype.checkUnhandled = function (ghIds) {
    this.unhandledProjects = _.compact(_.map(ghIds, function (id) {
        var exists = _.find(this.projects, function (entry) {
            return entry.githubId == id
        })
        if (!exists) return id
    }, this))

    this.unhandledRequests = _.filter(this.oldReqs, function (entry) {
        return _.indexOf(this.unhandledProjects, entry.projectGitId) != -1
    })
}

RequestsConverter.prototype.prepareSupporters = function (reqs) {
    var users = {}
    return _.compact(_.map(reqs, function (entry) {
        var isAnon = !entry.user
        var userId = !isAnon && entry.user.toString()
        var supporter = new Requester({
            isAnon: isAnon,
            ip: '',
            _id: entry._id
        })

        if (!isAnon && this.users[userId]) {
            if (users[userId]) return
            users[userId] = true
            var user = this.users[userId]
            supporter.ref = user._id
            supporter.username = user.username
            supporter.email = user.email || ''
        }

        return supporter
    }, this))
}

RequestsConverter.prototype.getDates = function (reqs) {
    var dates = {
        createdAt: moment(),
        updatedAt: null
    }

    _.each(reqs, function (entry) {
        var time = moment(entry._id.getTimestamp())
        if (dates.createdAt.isAfter(time)) dates.createdAt = time
    })

    dates.updatedAt = dates.createdAt

    _.each(reqs, function (entry) {
        var time = moment(entry._id.getTimestamp())
        if (dates.updatedAt.isBefore(time)) dates.updatedAt = time
    })
    return dates
}


RequestsConverter.prototype.prepareRequests = function () {
    var self = this
    self.newReqs = _.map(self.projects, function (project) {
        var owner = project.owner.org || project.owner.user || {}

        var reqs = _.filter(self.oldReqs, function (request) {
            return request.project.toString() == project._id.toString() || request.projectGitId == project.githubId
        })

        var supporters = self.prepareSupporters(reqs)
        var dates = self.getDates(reqs)

        return {
            req: new Request({
                project: {
                    ref: project._id,
                    githubId: project.githubId,
                    name: project.owner.username + '/' + project.name,
                    methodsSet: project.hasDonateMethods()
                },

                maintainer: {
                    user: project.owner.user && project.owner.user._id,
                    org: project.owner.org && project.owner.org._id,
                    name: project.owner.username,
                    email: owner.email || '',
                    notified: !!owner.email
                },
                supporters: _.pluck(supporters, '_id'),
                satisfied: project.hasDonateMethods(),
                updatedAt: dates.updatedAt,
                createdAt: dates.createdAt
            }),
            supporters: supporters
        }
    })
}
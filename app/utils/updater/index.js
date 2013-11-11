/**
 * Author: krasu
 * Date: 9/19/13
 * Time: 11:20 AM
 */
var mongoose = require('mongoose'),
    async = require('async'),
    logger = require('winston'),
    io = require('../socket.io.js'),
    OrgsUpdater = require('./organizations.js'),
    ProjectsUpdater = require('./projects.js'),
    Q = require('q'),
    _ = require('lodash'),
    ioNamespace = '/projects-update/status'

function UserUpdater(user) {
    if (!(this instanceof UserUpdater))
        return new UserUpdater(user);

    this.user = user
    this.deferred = Q.defer();
    this.reqestParams = {
        access_token: this.user.authToken
    }

    this.user.projectsUpdater.updated = false
    this.user.projectsUpdater.updating = true
    this.user.save(_.bind(function () {
        this.init()
    }, this))

    return this.deferred.promise
}

UserUpdater.prototype.progress = function (desc) {
    this.deferred.notify(desc);
    io().of(ioNamespace).in(this.user._id).emit('progress', desc)
}

UserUpdater.prototype.finish = function () {
    var self = this
    this.updateUser('success', function () {
        io().of(ioNamespace).in(self.user._id).emit('done')
        self.deferred.resolve();
    })
}

UserUpdater.prototype.error = function (error) {
    var self = this
    logger.error(error.msg, error.error)
    this.updateUser('error', function () {
        io().of(ioNamespace).in(self.user._id).emit('error', error.msg)
        self.deferred.reject(error);
    })
}

UserUpdater.prototype.updateUser = function (status, callback) {
    this.user.projectsUpdater.updated = true
    this.user.projectsUpdater.updating = false
    this.user.projectsUpdater.updatedAt = new Date()
    this.user.projectsUpdater.status = status
    this.user.save(callback)
}

UserUpdater.prototype.init = function () {
    var self = this

    async.parallel({
        organizations: function (callback) {
            (new OrgsUpdater(self.user)).then(function (result) {
                callback(null, result)
            }, callback, _.bind(self.progress, self));
        },
        projects: function (callback) {
            (new ProjectsUpdater(self.user)).then(function (result) {
                callback(null, result)
            }, callback, _.bind(self.progress, self));
        }
    }, function (error, result) {
        if (error) return self.error(error)
        self.finish()
    })
}

module.exports = UserUpdater
/**
 * Created by krasu on 11/7/13.
 */
var git = require('./../git-request'),
    mongoose = require('mongoose'),
    async = require('async'),
    Q = require('q'),
    _ = require('lodash'),
    ProjectsUpdater = require('./projects.js'),
    Organization = mongoose.model('Organization'),
    Project = mongoose.model('Project')

function OrgsUpdater(user) {
    if (!(this instanceof OrgsUpdater))
        return new OrgsUpdater(user);

    this.user = user
    this.deferred = Q.defer();
    this.reqestParams = {
        access_token: this.user.authToken
    }

    this.fetch()

    return this.deferred.promise
}

OrgsUpdater.prototype.updateRefArray = function (refArray, add) {
    refArray = _.filter((refArray || []), function (id) {
        return this.user.id.toString() != id.toString()
    }, this)

    if (add) refArray.push(this.user._id)

    return refArray
}

OrgsUpdater.prototype.fetch = function () {
    var self = this

    git.request('user/orgs', self.reqestParams, function (err, data) {
        if (err) return self.deferred.reject({
            msg: 'GitHub Error',
            error: err
        })

        self.deferred.notify('Organizations list fetched')
        self.orgs = _.map(data, function (entry) {
            return Organization.parseGitHubData(entry)
        })

        self.sync()
    })
}

OrgsUpdater.prototype.sync = function () {
    var self = this

    async.parallel({
        clean: _.bind(self.cleanUp, self),
        orgs: function (callback) {
            async.map(self.orgs, function (entry, cb) {
                self.updateOrganization(entry, cb)
            }, callback)
        }
    }, function (error, results) {
        if (error) return self.deferred.reject(error)

        self.deferred.notify('Your organizations updated')
        self.deferred.resolve({
            stats: results
        })
    })
}

OrgsUpdater.prototype.updateOrganization = function (org, callback) {
    var self = this
    Organization.findOne({ githubId: org.githubId }, function (error, entry) {
        if (error) return callback(error);

        if (!entry) entry = new Organization(org)

        entry.save(function (err, savedEntry) {
            if (err) return callback(err);

            self.fetchOrganization(savedEntry, callback)
        })
    })
}

OrgsUpdater.prototype.fetchOrganization = function (org, cb) {
    var self = this

    async.parallel({
        isAdmin: function (callback) {
            var projectUpdater = new ProjectsUpdater(self.user, org)

            projectUpdater.then(function (result) {
                callback(null, result.isAdmin)
            }, callback, self.deferred.notify);
        },
        isPublic: function (callback) {
            git.request('orgs/' + org.name + '/public_members/' + self.user.username,
                self.reqestParams, function (err, data, headers, status) {
                    callback(null, !(status == 404 || err))
                })
        }
    }, function (error, result) {
        org.admins = self.updateRefArray(org.admins, result.isAdmin)
        org.publicAdmins = self.updateRefArray(org.publicAdmins, result.isPublic)
        org.save(cb)
    })
}

OrgsUpdater.prototype.cleanUp = function (callback) {
    var self = this

    Organization.find({
        githubId: {$nin: _.pluck(self.orgs, 'githubId')},
        admins: this.user._id
    }, function (error, entries) {
        if (error) return callback(error)

        var ids = _.pluck(entries, '_id')
        if (!ids.length) return callback()

        self.deferred.notify('We found some of your old organizations: ' + ids.length)

        async.parallel([
            function (cb) {
                Organization.update(
                    {_id: {$in: ids}},
                    { $pull: { admins: self.user._id}},
                    { multi: true },
                    function (error, removed) {
                        self.deferred.notify('Organizations from which removed admin rights: ' + removed)
                        cb.apply(this, arguments)
                    })
            },

            function (cb) {
                Project.update({
                        'owner.org': {$in: ids},
                        admins: self.user._id
                    },
                    { $pull: { admins: self.user._id}},
                    { multi: true },
                    function (error, removed) {
                        self.deferred.notify('Projects from which removed admin rights: ' + removed)
                        cb.apply(this, arguments)
                    })
            }
        ], callback)
    })
}


module.exports = OrgsUpdater
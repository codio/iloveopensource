/**
 * Created by krasu on 11/7/13.
 */
var git = require('./../git-request'),
    mongoose = require('mongoose'),
    logger = require('winston'),
    async = require('async'),
    Q = require('q'),
    _ = require('lodash'),
    Project = mongoose.model('Project')

function ProjectsUpdater(user, org) {
    if (!(this instanceof ProjectsUpdater))
        return new ProjectsUpdater(user, org);

    this.user = user
    this.org = org
    this.pages = 0

    this.deferred = Q.defer();
    this.reqestParams = {
        access_token: this.user.authToken
    }

    if (this.org) {
        this.msgBanner = '"' + this.org.name + '" projects'
    } else {
        this.msgBanner = 'projects you maintaining'
    }


    if (this.org) {
        this.fetchPage('orgs/' + org.name + '/repos')
    } else {
        this.reqestParams.type = 'owner'
        this.fetchPage('user/repos')
    }

    return this.deferred.promise
}

ProjectsUpdater.prototype.updateEntryAdmins = function (entry, add) {
    entry.admins = (entry.admins || [])
    entry.admins = _.filter(entry.admins, function (id) {
        return this.user.id.toString() != id.toString()
    }, this)

    if (add) entry.admins.push(this.user._id)

    return entry
}

ProjectsUpdater.prototype.fetchPage = function (url) {
    var self = this

    git.requestRepos(url, self.reqestParams, function (err, repos, links) {
        if (err) return self.deferred.reject({
            msg: 'GitHub Error',
            error: err
        })

        var msg = ['Fetched page', (++self.pages), 'of', self.msgBanner].join(' ')
        self.deferred.notify(msg)

        self.repos = _.union(self.repos, repos)

        if (links.next) {
            self.fetchPage(links.next)
        } else {
            self.deferred.notify('All pages fetched, started sync')
            self.sync()
        }
    })
}

ProjectsUpdater.prototype.sync = function () {
    var self = this,
        ownerGitHubId = self.org ? self.org.githubId : self.user.github.id,
        isAdmin = !self.org ? true : false

    var gitData = self.repos = _.map(self.repos, function (repo) {
        if (self.org) {
            repo.owner.org = self.org._id

            if (repo.githubData.permissions.admin) {
                isAdmin = true
                repo.admins = [self.user._id]
            }
        } else {
            repo.owner.user = self.user._id
        }

        return repo
    })

    Project.find({
        githubId: { $in: _.pluck(gitData, 'githubId')},
        'owner.githubId': ownerGitHubId
    }, function (error, entries) {
        if (error) return self.deferred.reject({
            msg: 'Projects sync error',
            error: error
        })

        var removed = _.filter(entries, function (entry) {
            return !_.find(gitData, {githubId: entry.githubId})
        })

        var created = _.filter(gitData, function (entry) {
            return !_.find(entries, {githubId: entry.githubId})
        })

        var updated = _.compact(_.map(gitData, function (repo) {
            var entry = _.find(entries, {githubId: repo.githubId})
            if (!entry) return

            entry = _.merge(entry, _.omit(repo, 'admins'))

            self.updateEntryAdmins(entry, _.find(repo.admins, function (v) {
                return v + '' == self.user._id + ''
            }))

            return entry
        }))

        async.parallel([
            function (callback) {
                Project.create(created, callback)
            },
            function (callback) {
                Project.remove({
                    githubId: { $in: _.pluck(removed, 'githubId')},
                    'owner.githubId': ownerGitHubId
                }, callback)
            },
            function (cb) {
                async.each(updated, function (entry, c) {
                    entry.save(c)
                }, cb)
            }
        ], function (err) {
            if (err) return self.deferred.reject({
                msg: 'Projects sync error',
                error: err
            })

            var msg = ['Sync of', self.msgBanner, 'completed'].join(' ')

            self.deferred.notify(msg)
            return self.deferred.resolve({
                updated: updated.length,
                created: created.length,
                removed: removed.length,
                isAdmin: isAdmin
            })
        })
    })
}

module.exports = ProjectsUpdater
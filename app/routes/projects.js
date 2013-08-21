/**
 * Created with JetBrains PhpStorm.
 * User: krasu
 * Date: 8/17/13
 * Time: 11:09 PM
 */
var _ = require('lodash'),
	https = require('https'),
	qs = require('querystring'),
	async = require('async'),
	mongoose = require('mongoose'),
	ensureAuthenticated = require('../utils/ensure-auth'),
	User = mongoose.model('User'),
	Support = mongoose.model('Support'),
	Project = mongoose.model('Project')


module.exports = function (app) {
	app.get('/projects/:id', function (req, res) {
		if (!req.param('id')) return res.send(400, 'empty request')

		Project.findById(req.param('id'), function (err, project) {
			if (err) return res.send(400, err);

			async.parallel({
				supporters: function (cb) {
					Support.find({project: project._id, supporting: true}).populate('user').exec(cb)
				},
				contributors: function (cb) {
					Support.find({project: project._id, contributing: true}).populate('user').exec(cb)
				},
				donators: function (cb) {
					Support.find({project: project._id, donating: true}).populate('user').exec(cb)
				}
			}, function (error, resuilt) {
				if (error) return res.send(500, err)

				res.render('project', {project: project, users: resuilt})
			})
		})
	})

	app.put('/user/projects/:id', ensureAuthenticated, function (req, res) {
		if (!req.body) return res.send('empty request')

		Project.createIfNotExists(req.body, function (err, project) {
			if (err) return res.send(400, err);

			Support.updateSupport(_.extend(req.body.support, {
				'project': project._id,
				'user': req.user._id
			}), function (err, supporting) {
				if (err) return res.send(400, err)

				project = project.toObject()
				project.support = supporting
				res.send(project)
			})
		})
	})

	app.delete('/user/projects/:id', ensureAuthenticated, function (req, res) {
		if (!req.body || !req.body.id) return res.send('empty request')

		Support.remove({
			'project': req.body.id,
			'user': req.user._id
		}, function (err, supporting) {
			if (err) return res.send(400, err)

			res.send('removed')
		})
	})

	app.post('/get-contributing-options', function (req, res) {
		if (!req.body.reposIds.length) return res.send('empty request')

		var result = {
			projects: [],
			owners: []
		}

		async.series([
			function (cb) {
				Project.find(
					{
						'githubId': { $in: _.map(req.body.reposIds, function (id) {
							return (+id)
						})}
					},
					'owner.githubId owner.contributions githubId _id owner.user')
					.exec(function (error, projects) {
						if (error) return cb(error)
						cb(null, true)
						result.projects = projects
					})
			},
			function (cb) {
				if (result.projects.length == req.body.reposIds.length) return cb(null, true)

				User.find(
					{
						'github.id': { $in: _.map(req.body.ownersIds, function (id) {
							return (+id)
						})},
						contributions: { $exists: 1 }
					},
					'github.id contributions')
					.exec(function (error, owners) {
						if (error) return cb(error)
						cb(null, true)
						result.owners = owners
					})
			}
		], function (error) {
			if (error) return res.send(500, 'Failed to retrieve projects')
			res.send(result)
		})
	});

	app.get('/git-request/*', ensureAuthenticated, function (req, res) {
		var path = req.params[0]
		if (!path) return res.send(500, 'wrong request')

		var params = {
			access_token: req.user.authToken,
			q: req.query.q || ''
		}

		var options = {
			hostname: 'api.github.com',
			port: 443,
			path: '/' + path + '?' + qs.stringify(params),
			method: 'GET',
			headers: {
				'Agent': 'octonode',
				'Accept': 'application/vnd.github.preview'
			}
		};

		var reqs = https.request(options, function (response) {
			var bodyParts = []
				, bytes = 0
			response.on("data", function (c) {
				bodyParts.push(c)
				bytes += c.length
			})
			response.on("end", function () {
				var body = new Buffer(bytes)
					, copied = 0
				bodyParts.forEach(function (b) {
					b.copy(body, copied, 0)
					copied += b.length
				})

				body = JSON.parse(body)
				var repos = body.items || body
				getGithubReposOwners(repos, function (err, data) {
					if (err) return res.send(500, 'failed to load repos');
					res.send(data);
				})

			});
		});

		reqs.end();

		reqs.on('error', function (e) {
			res.send(500, 'failed to request github api')
		});

	});
};

function getGithubReposOwners(repos, callback) {
	if (!repos || !repos.length) return callback(null, repos)

	var githubIds = _.map(repos, function (repo) {
		return repo.owner.id
	})

	githubIds = _(githubIds).unique().compact().value()

	if (!githubIds.length) return callback(null, repos)

	User.find(
		{'github.id': { $in: githubIds }, contributions: { $exists: 1 }},
		'github.id contributions',
		function (err, users) {
			if (err) return callback(err)

			_.each(users, function (user) {
				_.each(repos, function (repo) {
					if (repo.owner.id != user.github.id) return

					repo.contributions = user.contributions
				})
			})

			callback(err, repos)
		})
}
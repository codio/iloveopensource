/**
 * Created with JetBrains PhpStorm.
 * User: krasu
 * Date: 8/17/13
 * Time: 4:44 PM
 */
var _ = require('lodash'),
	mongoose = require('mongoose'),
	https = require('https'),
	qs = require('querystring'),
	async = require('async'),
	ensureAuthenticated = require('../utils/ensure-auth'),
	Project = mongoose.model('Project'),
	Support = mongoose.model('Support'),
	User = mongoose.model('User')

module.exports = function (app) {
	app.get('/users/:username', function (req, res) {
		User.findOne({ 'username': req.param('username') }, function (err, user) {
			if (!user) return res.render('404');

			Support.getSupportByUser(user._id, function (error, supports) {
				res.render('account', {
					user: user,
					supports: supports
				});
			})
		})
	});

	app.get('/supporter', ensureAuthenticated, function (req, res) {
		res.render('repo-editor', { user: req.user });
	});

	app.get('/maintainer', ensureAuthenticated, function (req, res) {
		res.render('maintainer-editor', { user: req.user });
	});

	app.get('/github-request/*', ensureAuthenticated, function (req, res) {
		var path = req.params[0]
		if (!path) return res.send(500, 'wrong request')

		var params = {
			access_token: req.user.authToken,
			q: req.query.q || ''
		}

		async.waterfall([
			function (callback) {
				repoRequester(path, params, callback)
			},
			function (repos, links, callback) {
				Project.find({
					githubId: { $in: _.pluck(repos, 'githubId') }
				}, function (err, projects) {
					if (err) return callback('failed to load repos');
					callback(null, projects, repos, links)
				})
			}
		], function (error, exists, repos, links) {
			if (error) return res.send(500, error)

			res.set(links);
			res.send(_.map(repos, function (repo) {
				return _.find(exists, {githubId: repo.githubId}) || repo
			}))
		})
	})

	app.get('/maintaining-projects', ensureAuthenticated, function (req, res) {
		var params = {
			access_token: req.user.authToken,
			type: 'owner'
		}, exists = [], notExists = [], repos

		async.series([
			function (callback) {
				repoRequester('user/repos', params, function (error, entries) {
					if (error) return callback(error)
					repos = _.map(entries, function (entry) {
						entry.owner.user = req.user._id
						return entry
					})
					callback(null, true)
				})
			},
			function (callback) {
				Project.find({
					githubId: { $in: _.pluck(repos, 'githubId') }
				}, function (err, projects) {
					if (err) return callback('failed to load repos');
					exists = projects
					callback(null, true)
				})
			},
			function (callback) {
				//create all new repos
				if (repos.length < exists.length) return callback(null, true)

				notExists = _.compact(_.map(repos, function (repo) {
					var exist = _.find(exists, {githubId: repo.githubId})
					if (!exist) return repo
					else return
				}))

				if (!notExists.length) return callback(null, true)

				Project.create(notExists, function (err) {
					if (err) return callback('failed to create projects');

					exists = _.union(exists, Array.prototype.slice.apply(arguments, [1]))
					callback(null, true)
				})
			}
		], function (error) {
			if (error) return res.send(500, error)
			res.send(exists)
		})
	});

	app.patch('/maintaining-projects/:project', ensureAuthenticated, function (req, res) {
		var id = req.param('project'), data = req.body.donateMethods
		if (!id) return res.send(500, 'failed to update project settings')

		Project.findOneAndUpdate({_id: id}, {donateMethods: data}, function (error, project) {
			if (error) return res.send(500, 'failed to save project settings')
			res.send(project)
		})
	});

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
};

function repoRequester(path, params, callback) {
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

	var request = https.request(options, function (response) {
		var linkHeader = response.headers['Link']
		var links = {};

		if (linkHeader) {
			var parts = response.headers['Link'].split(',');

			// Parse each part into a named link
			_.each(parts, function (p) {
				var section = p.split(';');
				if (section.length != 2) return

				var url = section[0].replace(/<(.*)>/, '$1').trim().replace('https://api.github.com/', '');
				var name = section[1].replace(/rel="(.*)"/, '$1').trim();
				links[name] = url;
			});
		}

		var bodyParts = [], bytes = 0

		response.on("data", function (c) {
			bodyParts.push(c)
			bytes += c.length
		})

		response.on("end", function () {
			var body = new Buffer(bytes), copied = 0

			bodyParts.forEach(function (b) {
				b.copy(body, copied, 0)
				copied += b.length
			})

			body = JSON.parse(body)

			var repos = _.map(body.items || body, function (repo) {
				repo = Project.parseGitHubData(repo)
				return repo
			})

			callback(null, repos, links)
		})
	})

	request.end();

	request.on('error', function (e) {
		callback('failed to request github api')
	});
}
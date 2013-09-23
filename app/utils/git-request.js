/**
 * Author: krasu
 * Date: 9/19/13
 * Time: 11:27 AM
 */

var _ = require('lodash'),
	mongoose = require('mongoose'),
	https = require('https'),
	qs = require('querystring'),
	Project = mongoose.model('Project')

module.exports.request = function (path, params, callback) {
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

			callback(null, JSON.parse(body), response.headers)
		})
	})

	request.end();

	request.on('error', function (e) {
		callback('failed to request github api')
	});
}

module.exports.requestRepos = function (path, params, callback) {
	module.exports.request(path, params, function (error, body, headers) {
		if (error) return callback(error)

		var linkHeader = headers['Link'],
			links = {}

		if (linkHeader) {
			var parts = linkHeader.split(',');

			// Parse each part into a named link
			_.each(parts, function (p) {
				var section = p.split(';');
				if (section.length != 2) return

				var url = section[0].replace(/<(.*)>/, '$1').trim().replace('https://api.github.com/', '');
				var name = section[1].replace(/rel="(.*)"/, '$1').trim();
				links[name] = url;
			});
		}

		var items = body.items || body
		if (!_.isArray(items)) items = [items]

		callback(null, _.map(items, function (repo) {
			repo = Project.parseGitHubData(repo)
			return repo
		}), links)
	});
}

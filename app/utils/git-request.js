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
            'User-Agent': 'ilos',
            'Agent': 'ilos',
            'Accept': 'application/vnd.github.preview'
        }
    };

    var request = https.request(options, function (response) {
        var bodyParts = [], bytes = 0

        if (Math.floor(response.statusCode / 100) === 5) {
            return callback('GitHub is currently not available. Please try later');
        }

        response.on("data", function (c) {
            bodyParts.push(c)
            bytes += c.length
        })

        response.on("end", function () {
            var body = new Buffer(bytes), copied = 0, status = response.statusCode

            bodyParts.forEach(function (b) {
                b.copy(body, copied, 0)
                copied += b.length
            })

            try {
                body = JSON.parse(body.toString() || '{}');
            } catch (err) {
                return callback('Failed to parse github response');
            }

            var errorStatuses = [422, 400, 401, 404, 403]
            if (body.message && _.indexOf(errorStatuses, status) != -1) {
                return callback('GitHub error: ' + body.message);
            }

            callback(null, body, response.headers, status)
        })
    })

    request.end();

    request.on('error', function (e) {
        callback('GitHub is currently not available. Please try later')
    });
}

module.exports.requestRepos = function (path, params, callback) {
    module.exports.request(path, params, function (error, body, headers) {
        if (error) return callback(error)

        var linkHeader = headers['Link'] || headers['link'],
            links = {}

        if (linkHeader) {
            var parts = linkHeader.split(',');

            // Parse each part into a named link
            _.each(parts, function (p) {
                var section = p.split(';');
                if (section.length != 2) return

                var url = section[0].replace(/<(.*)>/, '$1').trim().replace('https://api.github.com/', '');
                var name = section[1].replace(/rel="(.*)"/, '$1').trim().toLowerCase();
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

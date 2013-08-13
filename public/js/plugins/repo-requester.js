/**
 * Created with JetBrains PhpStorm.
 * User: krasu
 * Date: 8/13/13
 * Time: 1:28 AM
 */
define(function (require) {
	var store = require('plugins/storage').getNamespace('repo-selector')
	var toastr = require('toastr')
	var defaultSupport = {
		contributing: false,
		donating: false,
		supporting: false
	}

	var gitRequest = function (url, search) {
			var def = new $.Deferred(),
				request = $.ajax('https://api.github.com/' + url, {
					headers: {
						'Accept': 'application/vnd.github.preview'
					},
					dataType: 'json',
					data: {
						access_token: accessToken
					}
				})

			request.fail(function () {
				toastr.error('Failed to load your repos', 'Loading error!')
				def.reject('Failed to load your repos')
			})

			request.done(function (data, state, xhr) {
				def.resolve({
					repos: parseRepos(search ? data.items : data),
					linkMore: parseLinkHeader(xhr.getResponseHeader('Link'))
				})
			})

			return def
		},
		parseRepos = store().parseRepos = function (repos) {
			return _.map(repos, function (repo) {
				var exists = _.find(store().selected, {url: repo.url})
				var support = _.defaults(exists ? exists.support : {}, defaultSupport)

				return {
					name: repo.name,
					url: repo.html_url,
					support: support
				}
			})
		},
		parseLinkHeader = function (header) {
			if (!header || !header.length) return

			// Split parts by comma
			var parts = header.split(',');
			var links = {};
			// Parse each part into a named link
			_.each(parts, function (p) {
				var section = p.split(';');
				if (section.length != 2) return

				var url = section[0].replace(/<(.*)>/, '$1').trim().replace('https://api.github.com/', '');
				var name = section[1].replace(/rel="(.*)"/, '$1').trim();
				links[name] = url;
			});

			return links.next;
		}

	return gitRequest
})

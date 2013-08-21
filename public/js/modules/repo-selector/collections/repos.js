/**
 * Created with JetBrains PhpStorm.
 * User: krasu
 * Date: 8/13/13
 * Time: 6:26 PM
 */
define(function (require) {
	require('backbone')
	var store = require('store').getNamespace('repo-selector')
	var Repo = require('../models/repo')

	return Backbone.Collection.extend({
		model: Repo,
		url: function () {
			return 'https://api.github.com/' + this.path;
		},
		initialize: function (models, options) {
			options = options || {}
			options.path && (this.path = options.path)
			options.type && (this.type = options.type)
		},
		parse: function (res, req) {
			if (req && req.xhr) {
				this.parseLinkHeader(req.xhr.getResponseHeader('Link'))
			}

			return res
		},
		parseLinkHeader: function (header) { //TODO: test load more functionality
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

			this.hasMore = links.next;
		},
		fetch: function (options) {
			var self = this
			options || (options = {});
			options.headers = {
				'Accept': 'application/vnd.github.preview'
			}
			options.dataType = 'json'
			options.data = _.defaults({}, options.data, {
				access_token: accessToken
			})

			var request = Backbone.Collection.prototype.fetch.call(this, options);
			request.done(function (data) {
				var repos = data.items || data
				if (!_.isArray(repos)) repos = [repos]

				var ownersIds = _.unique(_.map(repos, function (el) {
					return el.owner.id
				}))

				var reposIds = _.unique(_.map(repos, function (el) {
					return el.id
				}))

				if (!ownersIds.length && !reposIds.length) {
					store().hub.trigger('repos-loaded', self, self.type)
					return
				}

				$.post('/get-contributing-options', {
					ownersIds: ownersIds,
					reposIds: reposIds
				})
					.done(function (resp) {
						_.each(resp.projects, function (el) {
							self.each(function (model) {
								if (model.id != el.githubId) return

								model.set('contributions', el.owner.contributions)
								model.get('owner').set('user', el.owner.user)
								model.set('_id', el._id)
							})
						})

						_.each(resp.owners, function (el) {
							self.each(function (model) {
								if (model.get('owner').get('user')) return
								if (model.get('owner').get('githubId') != el.github.id) return

								model.set('contributions', el.contributions)
								model.get('owner').set('user', el._id)
							})
						})


						self.trigger('repos-loaded')
						store().hub.trigger('repos-loaded', self, self.type)
					})
			})

			return request
		}
	})
})
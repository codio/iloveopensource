/**
 * Created with JetBrains PhpStorm.
 * User: krasu
 * Date: 8/13/13
 * Time: 1:29 AM
 */
define(function (require) {
	var Ractive = require('Ractive')
	var gitRequester = require('gitRepoRequester')
	var store = require('plugins/storage').getNamespace('repo-selector')

	return Ractive.extend({
		template: require('rv!templates/repo-selector/repo-list.html'),
		data: {
			repos: []
		},
		partials: {
			repo: require('rv!templates/repo-selector/repo-row.html')
		},
		init: function () {
			var self = this

			self.on('load-more', function () {
				gitRequester(self.get('linkMore')).done(function (data) {
					var repos = _.union(self.get('repos'), data.repos)

					self.set('repos', repos)
					self.set('linkMore', data.linkMore)
				})
			})

			self.on('toggle-support-all', function (event) {
				var el = $(event.node),
					type = el.data().type,
					support = !el.hasClass('active')

				el.toggleClass('active')

				_.each(self.get('repos'), function (repo, i) {
					this.setSupport(type, 'repos.' + i, support)
				}, this)
			})

			self.on('toggle-support', function (event) {
				var el = $(event.node),
					support = !event.context.support[el.data().type]

				this.setSupport(el.data().type, event.keypath, support)
			})
		},
		hasSupport: function (repo) {
			return _(repo.support).values().compact().value().length;
		},
		setSupport: function (type, keypath, support) {
			this.set(keypath + '.support.' + type, support)
			var repo = this.get(keypath),
				exists = _.findIndex(store().selected, {url: repo.url}),
				hasSupport = this.hasSupport(repo)

			if (exists === -1 && hasSupport) {
				store().selected.push(repo)
			} else if (exists !== -1 && !hasSupport) {
				store().selected = _.without(store().selected, repo)
				store().selectedView.set('repos', store().selected)
			} else if (exists !== -1 && hasSupport) {
				store().selectedView.set('repos.' + exists + '.support', repo.support)
			}
		}
	});
})
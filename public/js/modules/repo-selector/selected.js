/**
 * Created with JetBrains PhpStorm.
 * User: krasu
 * Date: 8/13/13
 * Time: 3:27 AM
 */
define(function (require) {
	var RepoList = require('modules/repo-selector/repo-list')
	var store = require('plugins/storage').getNamespace('repo-selector')
	store().selected = [];

	return RepoList.extend({
		template: require('rv!templates/repo-selector/selected.html'),
		data: {
			repos: store().selected
		},
		init: function () {
			var self = this

			self.on('toggle-support', function (event) {
				var el = $(event.node),
					support = !event.context.support[el.data().type]

				event.context.support[el.data().type] = support

				this.set(event.keypath, event.context)
				this.updateReposLists(event.context)
			})

			self.on('remove-repo', function (event) {
				_.each(event.context.support, function (el, key) {
					event.context.support[key] = false
				})

				store().selected = _.without(store().selected, event.context)
				this.set('repos', store().selected)
				this.updateReposLists(event.context)
			})
		},
		updateReposLists: function (repo) {
			_.each(store().repos, function (repoList, name) {
				var repos = repoList.get('repos')
				var exists = _.findIndex(repos, {url: repo.url})

				if (exists == -1) return
				repoList.set('repos.' + exists + '.support', repo.support)
			}, this)
		}
	});
})
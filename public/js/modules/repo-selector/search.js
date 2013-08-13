/**
 * Created with JetBrains PhpStorm.
 * User: krasu
 * Date: 8/13/13
 * Time: 2:54 AM
 */
define(function (require) {
	var toastr = require('toastr')
	var RepoList = require('modules/repo-selector/repo-list')
	var gitRequester = require('gitRepoRequester')
	var store = require('plugins/storage').getNamespace('repo-selector')

	return RepoList.extend({
		template: require('rv!templates/repo-selector/repo-search.html'),
		init: function () {
			RepoList.prototype.init.call(this, arguments)
			var self = this

			self.on('search', function (event) {
				var btn = $(event.node)
				if (btn.attr('disabled')) return
				if (!this.get('searchString')) return this.set('shortSearchString', true)

				$(event.node).button('loading')

				this.set('shortSearchString', this.get('searchString').toString().length < 5)
				if (this.get('shortSearchString')) return

				gitRequester('search/repositories?q=' + self.get('searchString'), true).done(function (data) {
					self.set('repos', data.repos)
					self.set('nothingFound', !data.repos.length)
					btn.button('reset')
				})
			})

			self.on('add', function () {
				if (!this.get('searchString')) return
				self.set('nothingFound', false)

				var url = this.get('searchString'),
					match = url.match(/^((https+:\/\/github.com\/)([^\/]+)\/([^\/]+)\/*)(.*)$/)

				if (!match) return toastr.warning('You have entered wrong URL')
				var repos = store().parseRepos([
					{
						name: match[4],
						url: match[1]
					}
				])

				self.set('repos', repos)
			})

			self.on('reset-search-string', function () {
				this.set('shortSearchString', false)
			})
		}
	});
})
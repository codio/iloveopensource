/**
 * Created with JetBrains PhpStorm.
 * User: krasu
 * Date: 8/13/13
 * Time: 2:54 AM
 */
define(function (require) {
	var toastr = require('toastr')
	var RepoList = require('./repo-list')
	var urlRegExp = /^((https+:\/\/github.com\/)([^\/]+)\/([^\/#]+)\/*)(.*)$/

	return RepoList.extend({
		minLength: 5,
		tpl: require('tpl!../templates/repo-search.html'),
		events: {
			'keyup .search-string': 'triggerSearch',
			'click .controls .support-type': 'toogleReposSupport',
			'focus .search-string': 'clearSearchString',
			'click .search': 'searchRepo',
			'click .add': 'addRepo'
		},
		triggerSearch: function (event) {
			if (event.which != 13) return
			var query = $.trim(this.$('.search-string').val())

			if (!query || query.length < this.minLength) return

			var match = query.match(urlRegExp)
			if (match) {
				this.addRepo()
			} else {
				this.searchRepo()
			}
		},
		clearSearchString: function () {
			this.$('.alert').hide()
		},
		addRepo: function () {
			var btn = this.$('.add'),
				query = $.trim(this.$('.search-string').val()),
				self = this

			if (!query) return

			if (btn.attr('disabled')) return
			btn.button('loading')

			var match = query.match(urlRegExp)

			if (!match) return toastr.warning('You have entered wrong URL')

			this.collection.fetchRepo(match[3], match[4])
				.done(function () {
					self.renderRepos()
				})
				.fail(function () {
					toastr.warning('Invalid Repo Url')
				})
				.always(function () {
					btn.button('reset')
				})
		},
		searchRepo: function () {
			var btn = this.$('.search'),
				query = $.trim(this.$('.search-string').val()),
				self = this

			if (btn.attr('disabled')) return

			if (query.length < this.minLength) return this.$('.alert').show()

			btn.button('loading')

			this.collection.fetch({
				data: {q: query}
			}).done(function () {
					self.renderRepos()
				})
				.fail(function () {
					toastr.warning('Failed search attempt')
				})
				.always(function () {
					btn.button('reset')
				})

		}
	});
})
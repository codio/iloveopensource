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
		tpl: require('tpl!../templates/repo-search.html'),
		events: {
			'click .controls .support-type': 'toogleReposSupport',
			'focus .search-string': 'clearSearchString',
			'click .search': 'searchRepo',
			'click .add': 'addRepo'
		},
		clearSearchString: function () {
			this.$('.alert').hide()
		},
		addRepo: function () {
			var query = $.trim(this.$('.search-string').val())

			if (!query) return

			var match = query.match(urlRegExp)

			if (!match) return toastr.warning('You have entered wrong URL')

			this.collection.reset([
				{
					name: match[4],
					url: match[1]
				}
			], {parse: true})
			this.renderRepos()
		},
		searchRepo: function (event) {
			var btn = $(event.target),
				query = $.trim(this.$('.search-string').val()),
				self = this

			if (btn.attr('disabled')) return

			if (query.length < 5) return this.$('.alert').show()

			btn.button('loading')

			this.collection.fetch({
				data: {q: query}
			}).done(function () {
					self.renderRepos()
				})
				.fail(function() {
					toastr.warning('Failed search attempt')
				})
				.always(function () {
					btn.button('reset')
				})

		}
	});
})
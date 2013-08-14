/**
 * Created with JetBrains PhpStorm.
 * User: krasu
 * Date: 8/13/13
 * Time: 1:29 AM
 */
define(function (require) {
	require('backbone')
	var store = require('plugins/storage').getNamespace('repo-selector')
	var RepoRow = require('modules/repo-selector/views/repo-row')

	return Backbone.View.extend({
		tpl: require('tpl!templates/repo-selector/repo-list.html'),
		events: {
			'click .controls .support-type': 'toogleReposSupport'
		},
		toogleReposSupport: function(event) {
			var el = $(event.currentTarget)
			el.toggleClass('active')

			_.invoke(this.repoRows, 'toggleSupportByType', el.data().type, el.hasClass('active'))
		},
		renderRepos: function() {
			var list = this.$('.repos-list')
			_.invoke(this.repoRows, 'remove')
			this.repoRows = []

			if (!this.collection.length) {
				return list.addClass('hidden')
			}

			this.collection.each(function (repo) {
				var view = new RepoRow({model: repo, isProject: this.isProjectList})
				this.repoRows.push(view)
				view.render()
			}, this)

			list.removeClass('hidden').append(_.pluck(this.repoRows, 'el'))
		},
		render: function () {
			this.$el.html(this.tpl({
				linkMore: this.collection.linkMore
			}))

			this.renderRepos()
			return this
		},
		initialize: function () {
			this.repoRows = []
		}
	});
})
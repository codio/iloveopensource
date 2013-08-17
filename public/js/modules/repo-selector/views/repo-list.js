/**
 * Created with JetBrains PhpStorm.
 * User: krasu
 * Date: 8/13/13
 * Time: 1:29 AM
 */
define(function (require) {
	require('backbone')
	var RepoRow = require('./repo-row')

	return Backbone.View.extend({
		tpl: require('tpl!../templates/repo-list.html'),
		events: {
			'click .load-more': 'loadMore',
			'click .controls .support-type': 'toogleReposSupport'
		},
		initialize: function () {
			this.repoRows = []
			this.listenTo(this.collection, 'sync', this.render)
		},
		loadMore: function () {
			var btn = this.$('.load-more')
			if (btn.attr('disabled')) return
			btn.button('loading')

			this.collection.path = this.collection.hasMore
			this.collection.fetch({remove: false})
		},
		toogleReposSupport: function (event) {
			var el = $(event.currentTarget)
			el.toggleClass('active')

			_.invoke(this.repoRows, 'toggleSupportByType', el.data().type, el.hasClass('active'))
		},
		renderRepos: function () {
			var list = this.$('.repos-list')
			_.invoke(this.repoRows, 'remove')
			this.repoRows = []

			if (!this.collection.length) {
				return list.addClass('hidden')
			}

			this.collection.each(function (repo) {
				var view = new RepoRow({model: repo})
				this.repoRows.push(view)
				view.render()
			}, this)

			list.removeClass('hidden').append(_.pluck(this.repoRows, 'el'))
		},
		render: function () {
			this.$el.html(this.tpl({
				hasMore: this.collection.hasMore
			}))

			this.checkIsEmpty && this.checkIsEmpty()
			this.renderRepos()
			this.$('[data-toggle="popover"]').popover({
				container: 'body',
				title: 'Note from Author',
				content: function () {
					return $(this).next().html()
				}
			})


			return this
		},
		checkIsEmpty: function () {
			var el = this.$('.is-empty.message')

			if (this.collection.length) {
				el.addClass('hidden')
			} else {
				el.removeClass('hidden')
			}
		}
	});
})
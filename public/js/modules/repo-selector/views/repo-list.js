/**
 * Created with JetBrains PhpStorm.
 * User: krasu
 * Date: 8/13/13
 * Time: 1:29 AM
 */
define(function (require) {
	require('backbone')

	return Backbone.View.extend({
		tpl: require('tpl!../templates/repo-list.html'),
		RepoRow: require('./repo-row'),
		events: {
			'click .load-more': 'loadMore',
			'click .controls .support-type': 'toogleReposSupport'
		},
		initialize: function () {
			this.listenTo(this.collection, 'repos-loaded', this.renderRepos)
			this.repoRows = []
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
				var view = new this.RepoRow({model: repo})
				this.repoRows.push(view)
				view.render()
			}, this)

			list.removeClass('hidden').append(_.pluck(this.repoRows, 'el'))
		},
		renderRepo: function (repo) {
			var list = this.$('.repos-list')
			var view = new this.RepoRow({model: repo})
			this.repoRows.push(view)
			view.render()

			list.removeClass('hidden').append(view.el)
		},
		render: function () {
			this.$el.html(this.tpl({
				hasMore: this.collection.hasMore
			}))

			this.checkIsEmpty()
			this.renderRepos()
			return this
		},
		checkIsEmpty: function () {
			var el = this.$('.is-empty.message'),
			 list = this.$('.repos-list')

			if (this.collection.length) {
				list.removeClass('hidden')
				el.addClass('hidden')
			} else {
				list.addClass('hidden')
				el.removeClass('hidden')
			}
		}
	});
})
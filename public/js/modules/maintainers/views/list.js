/**
 * Created with JetBrains PhpStorm.
 * User: krasu
 * Date: 9/17/13
 * Time: 1:46 PM
 */
define(function (require) {
	require('backbone')
	var store = require('store').getNamespace('maintainer')

	return Backbone.View.extend({
		tpl: require('tpl!../templates/list.html'),
		RepoRow: require('./project'),
		initialize: function () {
			this.repoRows = []
			this.collection = store().projects
		},
		renderRepos: function () {
			var list = this.$('.repos-list')
			_.invoke(this.repoRows, 'remove')
			this.repoRows = []

			this.checkIsEmpty()
			if (!this.collection.length) return

			this.collection.each(function (repo) {
				var view = new this.RepoRow({model: repo})
				this.repoRows.push(view)
				view.render()
			}, this)

			list.removeClass('hidden').append(_.pluck(this.repoRows, 'el'))
		},
		render: function () {
			this.$el.html(this.tpl())
			this.renderRepos()
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
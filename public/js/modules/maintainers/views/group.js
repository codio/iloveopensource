/**
 * Created with JetBrains PhpStorm.
 * User: krasu
 * Date: 9/17/13
 * Time: 1:46 PM
 */
define(function (require) {
	require('backbone')
	var tpl = require('tpl!../templates/group.html')
	var RepoRow = require('./project')

	return Backbone.View.extend({
		attributes: {
			'class': 'group'
		},
		events: {
			'click .group-header': 'collapse'
		},
		initialize: function () {
			this.repoRows = []
		},
		collapse: function() {
			this.$el.toggleClass('folded')
		},
		renderRepos: function () {
			var list = this.$('.projects')
			var repos = this.model.get('repos')
			_.invoke(this.repoRows, 'remove')
			this.repoRows = []

			if (!repos.length) return

			repos.each(function (repo) {
				var view = new RepoRow({model: repo})
				this.repoRows.push(view)
				view.render()
			}, this)

			list.removeClass('hidden').append(_.pluck(this.repoRows, 'el'))
		},
		render: function () {
			this.$el.html(tpl(this.model.toJSON()))
			this.renderRepos()
			return this
		},
		remove: function() {
			_.invoke(this.repoRows, 'remove')
			Backbone.View.prototype.remove.apply(this, arguments)
		}
	});
})
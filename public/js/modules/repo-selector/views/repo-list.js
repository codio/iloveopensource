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
			console.log(keypath + '.support.' + type, support)
			this.set(keypath + '.support.' + type, support)
			var repo = this.get(keypath),
				exists = _.find(store().selected, {url: repo.url}),
				hasSupport = this.hasSupport(repo)

			if (!exists && hasSupport) {
				store().selected.push(repo)
			} else if (exists && !hasSupport) {
				var z = _.clone(store().selected)
				z.splice(_.findIndex(store().selected, {url: repo.url}), 1)
				store().selectedView.set('repos', z)
			} else if (exists && hasSupport) {
				store().selectedView.set(
					'repos.' + _.findIndex(store().selected, {url: repo.url}) + '.support',
					repo.support
				)
			}
		}
	});
})
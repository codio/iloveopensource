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
		events: {
			'click .update-projects-info': 'updateProjects'
		},
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
		updateProjects: function (event) {
			var btn = $(event.currentTarget),
				log = btn.next('.log').empty()

			if (btn.prop('disabled')) return

			var socket = io.connect(window.location.origin)
			btn.button('loading')

			socket.on('progress', function (desc) {
				log.append('<p>' + desc + '</p>')
			})

			socket.on('error', function () {
				btn.button('reset')
				log.append('<p class="text-danger">Error appear during update, please try again</p>')
			})

			socket.on('done', function () {
				btn.html('Done!')
				log.empty()
				store().projects.fetch()
			})

			if (socket.socket.connected) {
				$.get('/update-projects', {sessionId: socket.socket.sessionid})
			} else {
				socket.on('connect', function () {
					$.get('/update-projects', {sessionId: socket.socket.sessionid})
				})
			}
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
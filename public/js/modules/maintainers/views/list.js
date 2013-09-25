/**
 * Author: krasu
 * Date: 9/17/13
 * Time: 1:46 PM
 */
define(function (require) {
	require('backbone')
	var store = require('store').getNamespace('maintainer')
	var io = require('socket.io')
	var tpl = require('tpl!../templates/list.html')
	var Group = require('./group')

	return Backbone.View.extend({
		events: {
			'click .update-projects-info': 'updateProjects'
		},
		initialize: function () {
			this.groups = []
			this.collection = store().projects
			this.listenTo(store().projects, 'sync', this.showProjects)
			this.listenTo(store().projects, 'request', this.showLoading)
		},
		showProjects: function () {
			this.$('.loading').hide()
			this.$('.content').slideDown()
			this.render()
		},
		showLoading: function () {
			this.$('.loading').show()
			this.$('.content').slideUp()
		},
		renderGroups: function () {
			var list = this.$('.repos-list')
			_.invoke(this.groups, 'remove')
			this.groups = []

			if (!this.collection.length) return

			this.collection.each(function (repo) {
				var view = new Group({model: repo})
				this.groups.push(view)
				view.render()
			}, this)

			list.removeClass('hidden').append(_.pluck(this.groups, 'el'))
		},
		render: function () {
			this.$('.content').html(tpl())
			this.renderGroups()
			this.checkIsEmpty()
			return this
		},
		updateProjects: function (event) {
			var btn = $(event.currentTarget),
				log = btn.next('.log').empty()

			if (btn.prop('disabled')) return

			var socket = io.connect(window.location.origin + '/projects-update')
			btn.button('loading')

			if (!socket.socket.connected && !socket.socket.connecting) {
				socket.socket.reconnect()
			}

			socket.on('progress', function (desc) {
				log.append('<p>' + desc + '</p>')
			})

			socket.on('error', function () {
				btn.button('reset')
				log.append('<p class="text-danger">An error occurred. Please try later.</p>')
				socket.socket.disconnect();
			})

			socket.on('done', function () {
				btn.html('Done!')
				log.empty()
				socket.socket.disconnect();
				store().projects.fetch()
			})
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
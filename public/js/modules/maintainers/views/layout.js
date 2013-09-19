/**
 * Created with JetBrains PhpStorm.
 * User: krasu
 * Date: 9/17/13
 * Time: 8:34 AM
 */
define(function (require) {
	require('backbone')

	var io = require('socket.io')
	var ProjectList = require('./list')
	var store = require('store').getNamespace('maintainer')

	return Backbone.View.extend({
		initialize: function () {
			this.listenTo(store().projects, 'fetched', this.showProjects)
			this.listenTo(store().projects, 'fetching', this.showLoading)
		},
		showProjects: function () {
			console.log(arguments)
			this.$('.loading').hide()
			this.$('.content').slideDown()
			this.projects = this.projects || new ProjectList
			this.projects.render().$el.appendTo(this.$('.content'))
		},
		showLoading: function () {
			this.$('.loading').show()
			this.$('.content').slideUp()
		}
	});
})